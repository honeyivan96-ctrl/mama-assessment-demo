begin;
create table if not exists public.mama_admin_upgrade_backup(id text primary key,created bigint not null,data jsonb not null);
insert into public.mama_admin_upgrade_backup values('admin3-20261102',(extract(epoch from now())*1000)::bigint,jsonb_build_object('codes',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from public.mama_codes c),'submissions',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from public.mama_submissions s),'results',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from public.mama_results r))) on conflict do nothing;
create table if not exists public.mama_batches(id text primary key,name text not null check(length(name) between 1 and 60),channel text not null default '' check(length(channel)<=60),note text not null default '' check(length(note)<=300),created bigint not null,version integer not null default 1);
alter table public.mama_codes add column if not exists business_code text;
alter table public.mama_codes add column if not exists aliases text[] not null default '{}';
alter table public.mama_codes add column if not exists batch_id text references public.mama_batches(id);
alter table public.mama_codes add column if not exists channel text not null default '';
alter table public.mama_codes add column if not exists note text not null default '';
alter table public.mama_codes add column if not exists order_ref text not null default '';
alter table public.mama_codes add column if not exists delivery_status text not null default 'unknown' check(delivery_status in ('unknown','unsent','sent'));
alter table public.mama_codes add column if not exists sent_at bigint;
alter table public.mama_codes add column if not exists expires_at bigint;
alter table public.mama_codes add column if not exists password_cipher jsonb;
alter table public.mama_codes add column if not exists deleted_at bigint;
alter table public.mama_codes add column if not exists replacement_for text references public.mama_codes(id);
alter table public.mama_codes add column if not exists version integer not null default 1;
update public.mama_codes set business_code='HIS-'||upper(left(id,20)) where business_code is null;
alter table public.mama_codes alter column business_code set not null;
create unique index if not exists mama_code_business_unique on public.mama_codes(lower(business_code));
alter table public.mama_codes drop constraint if exists mama_quota_check;
alter table public.mama_codes add constraint mama_quota_check check(quota between 1 and 1000 and used between 0 and quota);
alter table public.mama_submissions add column if not exists submission_no bigserial;
alter table public.mama_submissions add column if not exists ordinal integer;
alter table public.mama_submissions add column if not exists valid boolean not null default true;
alter table public.mama_submissions add column if not exists admin_note text not null default '';
alter table public.mama_submissions add column if not exists version integer not null default 1;
with ranked as(select result_id,row_number() over(partition by code_id order by created,result_id)::int as n from public.mama_submissions) update public.mama_submissions s set ordinal=r.n from ranked r where r.result_id=s.result_id and s.ordinal is null;
create unique index if not exists mama_submission_no_unique on public.mama_submissions(submission_no);
create unique index if not exists mama_submission_ordinal_unique on public.mama_submissions(code_id,ordinal);
alter table public.mama_results add column if not exists share_enabled boolean not null default true;
create table if not exists public.mama_report_versions(id bigserial primary key,result_id text not null references public.mama_results(id),revision integer not null,report jsonb not null,created bigint not null,reason text not null,published boolean not null default false,actor text not null default 'system',unique(result_id,revision));
create unique index if not exists mama_report_published_unique on public.mama_report_versions(result_id) where published;
insert into public.mama_report_versions(result_id,revision,report,created,reason,published) select id,0,report,created,'历史原始快照',false from public.mama_results on conflict(result_id,revision) do nothing;
create table if not exists public.mama_admin_credentials(id integer primary key check(id=1),verifier jsonb not null,version integer not null default 1,changed bigint not null);
alter table public.mama_admin_sessions add column if not exists credential_version integer not null default 1;
create table if not exists public.mama_audit_logs(id bigserial primary key,created bigint not null,actor text not null,action text not null,target text not null,reason text not null default '',before_data jsonb,after_data jsonb,request_key text);
create table if not exists public.mama_admin_requests(key text primary key,action text not null,target text not null,intent_hash text not null,result jsonb,created bigint not null);
create table if not exists public.mama_quota_events(id bigserial primary key,code_id text not null references public.mama_codes(id),delta integer not null,reason text not null,created bigint not null,request_key text not null unique);
create index if not exists mama_audit_time_idx on public.mama_audit_logs(created desc,id desc);
create index if not exists mama_report_result_idx on public.mama_report_versions(result_id,revision desc);
create index if not exists mama_code_batch_idx on public.mama_codes(batch_id,created desc);
create index if not exists mama_code_delivery_idx on public.mama_codes(delivery_status,created desc);
create index if not exists mama_code_channel_idx on public.mama_codes(channel);

-- Allow the previous admin code generator to remain usable during rollout/rollback.
create or replace function public.mama_code_business_default() returns trigger language plpgsql security invoker set search_path=public as $$
begin if new.business_code is null then new.business_code='HIS-'||upper(left(new.id,20));end if;return new;end;$$;
drop trigger if exists mama_code_business_default on public.mama_codes;
create trigger mama_code_business_default before insert on public.mama_codes for each row execute function public.mama_code_business_default();

create or replace function public.mama_admin_bootstrap(p_verifier jsonb,p_now bigint) returns jsonb language plpgsql security invoker set search_path=public as $$
begin insert into mama_admin_credentials(id,verifier,changed) values(1,p_verifier,p_now) on conflict do nothing;return (select to_jsonb(c) from mama_admin_credentials c where id=1);end;$$;

create or replace function public.mama_admin_mutate(p_actor text,p_action text,p_target text,p_data jsonb,p_key text,p_now bigint,p_intent text) returns jsonb language plpgsql security invoker set search_path=public as $$
declare c mama_codes%rowtype;s mama_submissions%rowtype;b jsonb;a jsonb;outcome jsonb;req mama_admin_requests%rowtype;rec jsonb;ids jsonb:='[]';rev integer;cred mama_admin_credentials%rowtype;delta integer;
begin
 if not exists(select 1 from mama_admin_sessions x join mama_admin_credentials cr on cr.id=1 and x.credential_version=cr.version where x.token_hash=p_actor and x.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 if length(p_key)<16 or length(p_key)>100 then raise exception 'ADMIN_BAD_REQUEST';end if;
 insert into mama_admin_requests(key,action,target,intent_hash,created) values(p_key,p_action,p_target,p_intent,p_now) on conflict do nothing;
 select * into req from mama_admin_requests where key=p_key for update;
 if req.action<>p_action or req.target<>p_target or req.intent_hash<>p_intent then raise exception 'ADMIN_CONFLICT';end if;
 if req.result is not null then return req.result;end if;
 if p_action='generate' then
  if jsonb_array_length(p_data->'records') not between 1 and 100 then raise exception 'ADMIN_BAD_REQUEST';end if;
  if nullif(p_data->>'replacement_for','') is not null then
   select * into c from mama_codes where id=p_data->>'replacement_for' for update;if not found then raise exception 'ADMIN_NOT_FOUND';end if;
   if (p_data->>'expected')::int<>c.version then raise exception 'ADMIN_CONFLICT';end if;
   if (p_data->>'disable_old')::boolean then update mama_codes set active=false,version=version+1 where id=c.id;end if;
  end if;
  if p_data->'auto_batch' is not null then insert into mama_batches(id,name,channel,note,created) values(p_data->>'batch_id',p_data->'auto_batch'->>'name',coalesce(p_data->'auto_batch'->>'channel',''),'自动生成批次',p_now) on conflict(id) do nothing;end if;
  for rec in select value from jsonb_array_elements(p_data->'records') loop
   insert into mama_codes(id,code_hash,hint,label,created,business_code,batch_id,channel,note,order_ref,delivery_status,expires_at,password_cipher,replacement_for)
   values(rec->>'id',rec->>'code_hash',rec->>'hint',coalesce(p_data->>'label',''),p_now,rec->>'business_code',nullif(p_data->>'batch_id',''),coalesce(p_data->>'channel',''),coalesce(p_data->>'note',''),coalesce(p_data->>'order_ref',''),'unsent',(p_data->>'expires_at')::bigint,rec->'password_cipher',nullif(p_data->>'replacement_for',''));
   ids=ids||jsonb_build_array(rec->>'id');
  end loop;outcome=jsonb_build_object('ids',ids);a=jsonb_build_object('count',jsonb_array_length(ids),'replacement_for',p_data->>'replacement_for');
 elsif p_action='password' then
  select * into cred from mama_admin_credentials where id=1 for update;if cred.version<>(p_data->>'expected')::int then raise exception 'ADMIN_CONFLICT';end if;
  update mama_admin_credentials set verifier=p_data->'verifier',version=version+1,changed=p_now where id=1;
  delete from mama_admin_sessions where token_hash is not null;outcome=jsonb_build_object('ok',true,'reauthenticate',true);a=jsonb_build_object('sessionsRevoked',true);
 elsif p_action='logout_all' then delete from mama_admin_sessions where token_hash is not null;outcome=jsonb_build_object('ok',true);a=outcome;
 elsif p_action='batch_create' then
  insert into mama_batches(id,name,channel,note,created) values(p_target,p_data->>'name',coalesce(p_data->>'channel',''),coalesce(p_data->>'note',''),p_now);outcome=jsonb_build_object('id',p_target);a=p_data-'password';
 elsif p_action='batch_edit' then
  select to_jsonb(x) into b from mama_batches x where id=p_target for update;if b is null then raise exception 'ADMIN_NOT_FOUND';end if;if (b->>'version')::int<>(p_data->>'expected')::int then raise exception 'ADMIN_CONFLICT';end if;
  update mama_batches set name=p_data->>'name',channel=p_data->>'channel',note=p_data->>'note',version=version+1 where id=p_target returning to_jsonb(mama_batches.*) into a;outcome=jsonb_build_object('ok',true);
 elsif p_action in ('reveal','export_start','export_finish') then outcome=jsonb_build_object('ok',true,'id',p_key);a=p_data-'password';
 elsif p_action in ('metadata','delivery','status','quota','archive','restore') then
  select * into c from mama_codes where id=p_target for update;if not found then raise exception 'ADMIN_NOT_FOUND';end if;
  if c.version<>(p_data->>'expected')::int then raise exception 'ADMIN_CONFLICT';end if;
  if c.deleted_at is not null and p_action not in ('archive','restore') then raise exception 'ADMIN_CONFLICT';end if;
  b=to_jsonb(c)-'code_hash'-'password_cipher';
  if p_action='metadata' then
   update mama_codes set aliases=case when lower(business_code)<>lower(p_data->>'business_code') then array_append(aliases,business_code) else aliases end,business_code=p_data->>'business_code',batch_id=nullif(p_data->>'batch_id',''),channel=p_data->>'channel',note=p_data->>'note',order_ref=p_data->>'order_ref',expires_at=(p_data->>'expires_at')::bigint,version=version+1 where id=p_target;
  elsif p_action='delivery' then update mama_codes set delivery_status=p_data->>'delivery_status',sent_at=case when p_data->>'delivery_status'='sent' then coalesce((p_data->>'sent_at')::bigint,p_now) else null end,version=version+1 where id=p_target;
  elsif p_action='archive' then update mama_codes set deleted_at=coalesce(deleted_at,p_now),active=false,version=version+1 where id=p_target;
  elsif p_action='restore' then update mama_codes set deleted_at=null,active=false,version=version+1 where id=p_target;
  elsif p_action='status' then update mama_codes set active=(p_data->>'active')::boolean,version=version+1 where id=p_target;
  else delta=(p_data->>'delta')::int;if delta not between 1 and 20 then raise exception 'ADMIN_BAD_REQUEST';end if;
   insert into mama_quota_events(code_id,delta,reason,created,request_key) values(p_target,delta,p_data->>'reason',p_now,p_key);update mama_codes set quota=quota+delta,version=version+1 where id=p_target;
  end if;
  select to_jsonb(x)-'code_hash'-'password_cipher' into a from mama_codes x where id=p_target;outcome=jsonb_build_object('ok',true,'code',a);
 elsif p_action in ('note','void','share','publish') then
  select * into s from mama_submissions where result_id=p_target;if not found then raise exception 'ADMIN_NOT_FOUND';end if;
  select * into c from mama_codes where id=s.code_id for update;
  select * into s from mama_submissions where result_id=p_target for update;
  if s.version<>(p_data->>'expected')::int then raise exception 'ADMIN_CONFLICT';end if;
  b=jsonb_build_object('valid',s.valid,'note',s.admin_note,'version',s.version);
  if p_action='note' then update mama_submissions set admin_note=p_data->>'note',version=version+1 where result_id=p_target;
  elsif p_action='void' then
   if not s.valid then raise exception 'ADMIN_ALREADY_VOID';end if;
   update mama_submissions set valid=false,version=version+1 where result_id=p_target;
   if coalesce((p_data->>'refund')::boolean,false) then insert into mama_quota_events(code_id,delta,reason,created,request_key) values(c.id,1,p_data->>'reason',p_now,p_key);update mama_codes set quota=quota+1,version=version+1 where id=c.id;end if;
  elsif p_action='share' then update mama_results set share_enabled=(p_data->>'enabled')::boolean where id=p_target;update mama_submissions set version=version+1 where result_id=p_target;
  else
   select coalesce(max(revision),0)+1 into rev from mama_report_versions where result_id=p_target;
   update mama_report_versions set published=false where result_id=p_target and published;
   insert into mama_report_versions(result_id,revision,report,created,reason,published,actor) values(p_target,rev,p_data->'report',p_now,p_data->>'reason',true,'管理员');
   update mama_submissions set version=version+1 where result_id=p_target;
  end if;
  a=jsonb_build_object('valid',case when p_action='void' then false else s.valid end,'refund',p_data->'refund','revision',rev,'enabled',p_data->'enabled');outcome=jsonb_build_object('ok',true,'revision',rev);
 else raise exception 'ADMIN_BAD_REQUEST';end if;
 insert into mama_audit_logs(created,actor,action,target,reason,before_data,after_data,request_key) values(p_now,'管理员',p_action,p_target,coalesce(p_data->>'reason',''),b,a,p_key);
 update mama_admin_requests set result=outcome where key=p_key;return outcome;
exception when unique_violation then raise exception 'ADMIN_DUPLICATE';end;$$;

create or replace function public.mama_admin_list(p_actor text,p_entity text,p_filters jsonb,p_page integer,p_limit integer,p_now bigint) returns jsonb language plpgsql security invoker set search_path=public as $$
declare rows jsonb;total bigint;q text:=left(coalesce(p_filters->>'q',''),100);page integer:=greatest(1,p_page);lim integer:=least(100,greatest(1,p_limit));
begin
 if not exists(select 1 from mama_admin_sessions x join mama_admin_credentials cr on cr.id=1 and x.credential_version=cr.version where x.token_hash=p_actor and x.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 if p_entity='codes' then
  with filtered as(select c.id,c.business_code,c.aliases,c.hint,c.label,c.batch_id,c.channel,c.note,c.order_ref,c.delivery_status,c.sent_at,c.expires_at,c.used,c.quota,c.active,c.deleted_at,c.created,c.version,c.replacement_for,c.password_cipher is not null as recoverable,(select max(s.created) from mama_submissions s where s.code_id=c.id) as last_test,(select count(*) from mama_submissions s where s.code_id=c.id and not s.valid) as void_count,b.name as batch_name from mama_codes c left join mama_batches b on c.batch_id=b.id
   where c.source_kind='individual' and ((p_filters->>'state'='deleted' and c.deleted_at is not null) or (coalesce(p_filters->>'state','')<>'deleted' and c.deleted_at is null)) and (q='' or c.business_code ilike '%'||q||'%' or c.hint ilike '%'||q||'%' or c.order_ref ilike '%'||q||'%' or c.label ilike '%'||q||'%' or array_to_string(c.aliases,',') ilike '%'||q||'%' or c.code_hash=p_filters->>'password_hash')
   and (coalesce(p_filters->>'batch','')='' or c.batch_id=p_filters->>'batch' or (p_filters->>'batch'='_unassigned' and c.batch_id is null)) and (coalesce(p_filters->>'channel','')='' or c.channel=p_filters->>'channel')
   and (coalesce(p_filters->>'delivery','')='' or c.delivery_status=p_filters->>'delivery') and (coalesce(p_filters->>'used','')='' or c.used=(p_filters->>'used')::int)
   and (coalesce(p_filters->>'state','')='' or p_filters->>'state'='deleted' or (p_filters->>'state'='active' and c.active and c.used<c.quota and (c.expires_at is null or c.expires_at>p_now)) or (p_filters->>'state'='disabled' and not c.active) or (p_filters->>'state'='exhausted' and c.used>=c.quota) or (p_filters->>'state'='expired' and c.expires_at<=p_now))
   and (coalesce(p_filters->>'from','')='' or c.created>=(p_filters->>'from')::bigint) and (coalesce(p_filters->>'to','')='' or c.created<=(p_filters->>'to')::bigint))
  select (select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,id desc limit lim offset (page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='records' then
  with filtered as(select s.result_id,s.submission_no,s.ordinal,s.profile,s.question_version,s.report_key,s.created,s.valid,s.admin_note,s.version,s.code_id,jsonb_build_object('business_code',c.business_code,'hint',c.hint,'label',c.label,'batch_name',b.name,'channel',c.channel,'used',c.used,'quota',c.quota,'recoverable',c.password_cipher is not null) as code,(select v.report->>'key' from mama_report_versions v where v.result_id=s.result_id and v.published) as published_key from mama_submissions s join mama_codes c on c.id=s.code_id left join mama_batches b on b.id=c.batch_id
   where (q='' or c.business_code ilike '%'||q||'%' or array_to_string(c.aliases,',') ilike '%'||q||'%' or c.hint ilike '%'||q||'%' or s.result_id=q or s.submission_no::text=q or c.label ilike '%'||q||'%' or c.order_ref ilike '%'||q||'%' or c.code_hash=p_filters->>'password_hash')
   and (coalesce(p_filters->>'code_id','')='' or s.code_id=p_filters->>'code_id') and (coalesce(p_filters->>'batch','')='' or c.batch_id=p_filters->>'batch' or (p_filters->>'batch'='_unassigned' and c.batch_id is null)) and (coalesce(p_filters->>'channel','')='' or c.channel=p_filters->>'channel')
   and (coalesce(p_filters->>'type','')='' or s.report_key=p_filters->>'type') and (coalesce(p_filters->>'valid','')='' or s.valid=(p_filters->>'valid')::boolean) and (coalesce(p_filters->>'version','')='' or s.question_version=p_filters->>'version')
   and (coalesce(p_filters->>'from','')='' or s.created>=(p_filters->>'from')::bigint) and (coalesce(p_filters->>'to','')='' or s.created<=(p_filters->>'to')::bigint))
  select (select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,result_id desc limit lim offset (page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='logs' then
  with filtered as(select * from mama_audit_logs where(q='' or target ilike '%'||q||'%' or reason ilike '%'||q||'%') and(coalesce(p_filters->>'action','')='' or action=p_filters->>'action') and(coalesce(p_filters->>'from','')='' or created>=(p_filters->>'from')::bigint) and(coalesce(p_filters->>'to','')='' or created<=(p_filters->>'to')::bigint)) select(select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,id desc limit lim offset(page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='batches' then select count(*),coalesce(jsonb_agg(to_jsonb(b)),'[]') into total,rows from(select b.*,(select count(*) from mama_codes c where c.batch_id=b.id and c.deleted_at is null) as code_count,(select count(*) from mama_codes c where c.batch_id=b.id and c.deleted_at is null and c.used>0) as used_count from mama_batches b order by created desc limit 1000)b;
 elsif p_entity='stats' then
  return jsonb_build_object('codes',(select count(*) from mama_codes),'unsent',(select count(*) from mama_codes where delivery_status='unsent'),'sent_unused',(select count(*) from mama_codes where delivery_status='sent' and used=0),'used',(select count(*) from mama_codes where used>0),'exhausted',(select count(*) from mama_codes where used>=quota),'disabled',(select count(*) from mama_codes where not active),'unknown',(select count(*) from mama_codes where delivery_status='unknown'),'today',(select count(*) from mama_submissions where created>=(((p_now+28800000)/86400000)*86400000-28800000) and valid),'records',(select count(*) from mama_submissions),'valid_records',(select count(*) from mama_submissions where valid),'types',(select coalesce(jsonb_agg(t),'[]') from(select report_key as key,count(*) as count from mama_submissions where valid group by report_key)t),'trend',(select coalesce(jsonb_agg(t order by t.day),'[]') from(select ((created+28800000)/86400000)*86400000-28800000 as day,count(*) as count from mama_submissions where valid and created>=p_now-7*86400000 group by 1)t));
 else raise exception 'ADMIN_BAD_REQUEST';end if;
 return jsonb_build_object('items',rows,'total',total,'page',page,'limit',lim);
end;$$;

create or replace function public.mama_submission_snapshot() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.ordinal is null then select coalesce(max(ordinal),0)+1 into new.ordinal from mama_submissions where code_id=new.code_id;end if;
 return new;
end;$$;
drop trigger if exists mama_submission_number on public.mama_submissions;
create trigger mama_submission_number before insert on public.mama_submissions for each row execute function public.mama_submission_snapshot();
create or replace function public.mama_report_snapshot() returns trigger language plpgsql security invoker set search_path=public as $$
begin insert into mama_report_versions(result_id,revision,report,created,reason,published) select new.result_id,1,report,new.created,'提交时报告',true from mama_results where id=new.result_id;return new;end;$$;
drop trigger if exists mama_submission_report on public.mama_submissions;
create trigger mama_submission_report after insert on public.mama_submissions for each row execute function public.mama_report_snapshot();

-- Existing completion RPC keeps its locks and idempotency. Add expiry protection.
create or replace function public.mama_check_code_expiry() returns trigger language plpgsql security invoker set search_path=public as $$
begin if exists(select 1 from mama_codes where id=new.code_id and expires_at is not null and expires_at<=new.created) then raise exception 'MAMA_CODE_DISABLED';end if;return new;end;$$;
drop trigger if exists mama_submission_expiry on public.mama_submissions;
create trigger mama_submission_expiry before insert on public.mama_submissions for each row execute function public.mama_check_code_expiry();

do $$ declare t text;f record;begin
 foreach t in array array['mama_admin_upgrade_backup','mama_batches','mama_report_versions','mama_admin_credentials','mama_audit_logs','mama_admin_requests','mama_quota_events'] loop
 execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant select,insert,update,delete on public.%I to service_role',t);
 end loop;
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in('mama_admin_bootstrap','mama_admin_mutate','mama_admin_list','mama_submission_snapshot','mama_report_snapshot','mama_check_code_expiry','mama_code_business_default') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end;$$;
grant usage,select on sequence public.mama_submissions_submission_no_seq,public.mama_report_versions_id_seq,public.mama_audit_logs_id_seq,public.mama_quota_events_id_seq to service_role;
commit;
