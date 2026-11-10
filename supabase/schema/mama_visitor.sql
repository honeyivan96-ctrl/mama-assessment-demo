begin;
alter table public.mama_codes add column if not exists source_kind text not null default 'individual' check(source_kind in ('individual','visitor'));
create table if not exists public.mama_shared_access(
 id integer primary key check(id=1),code_hash text not null,code_cipher jsonb not null,
 enabled boolean not null default true,quota integer not null default 3 check(quota=3),
 version integer not null default 1,changed bigint not null
);
create table if not exists public.mama_visitors(
 id text primary key check(id ~ '^[a-f0-9]{48}$'),browser_hash text not null unique check(browser_hash ~ '^[a-f0-9]{64}$'),
 code_id text not null unique references public.mama_codes(id),created bigint not null,last_seen bigint not null
);
create index if not exists mama_visitors_created_idx on public.mama_visitors(created desc);
alter table public.mama_shared_access enable row level security;
alter table public.mama_visitors enable row level security;
revoke all on public.mama_shared_access,public.mama_visitors from public,anon,authenticated;
grant select,insert,update,delete on public.mama_shared_access,public.mama_visitors to service_role;

create or replace function public.mama_shared_bootstrap(p_hash text,p_cipher jsonb,p_now bigint) returns jsonb
language plpgsql security invoker set search_path=public as $$
begin
 insert into mama_shared_access(id,code_hash,code_cipher,changed) values(1,p_hash,p_cipher,p_now) on conflict(id) do nothing;
 return(select to_jsonb(a) from mama_shared_access a where id=1);
end;$$;

create or replace function public.mama_visitor_auth(p_browser_hash text,p_id text,p_code_id text,p_code_hash text,p_now bigint,p_access_version integer) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare v mama_visitors%rowtype;c mama_codes%rowtype;a mama_shared_access%rowtype;
begin
 select * into a from mama_shared_access where id=1 for share;
 if not found or not a.enabled or a.version<>p_access_version then raise exception 'MAMA_SHARED_CHANGED';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_browser_hash,0));
 select * into v from mama_visitors where browser_hash=p_browser_hash;
 if not found then
  insert into mama_codes(id,code_hash,hint,label,created,business_code,delivery_status,source_kind)
  values(p_code_id,p_code_hash,'','浏览器独立测评权益',p_now,'U-'||upper(p_id),'sent','visitor');
  insert into mama_visitors(id,browser_hash,code_id,created,last_seen) values(p_id,p_browser_hash,p_code_id,p_now,p_now) returning * into v;
 else update mama_visitors set last_seen=p_now where id=v.id;
 end if;
 select * into c from mama_codes where id=v.code_id;
 if not c.active or c.deleted_at is not null or (c.expires_at is not null and c.expires_at<=p_now) then raise exception 'MAMA_CODE_DISABLED';end if;
 return jsonb_build_object('visitorId','U-'||upper(v.id),'code_id',c.id,'remaining',greatest(0,c.quota-c.used),'used',c.used,'quota',c.quota);
end;$$;

create or replace function public.mama_shared_update(p_actor text,p_expected integer,p_hash text,p_cipher jsonb,p_enabled boolean,p_key text,p_intent text,p_now bigint) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare a mama_shared_access%rowtype;r mama_admin_requests%rowtype;outcome jsonb;
begin
 if not exists(select 1 from mama_admin_sessions s join mama_admin_credentials c on c.id=1 and s.credential_version=c.version where s.token_hash=p_actor and s.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 insert into mama_admin_requests(key,action,target,intent_hash,created) values(p_key,'shared_access','entry',p_intent,p_now) on conflict(key) do nothing;
 select * into r from mama_admin_requests where key=p_key for update;
 if r.action<>'shared_access' or r.intent_hash<>p_intent then raise exception 'ADMIN_CONFLICT';end if;
 if r.result is not null then return r.result;end if;
 select * into a from mama_shared_access where id=1 for update;
 if a.version<>p_expected then raise exception 'ADMIN_CONFLICT';end if;
 update mama_shared_access set code_hash=p_hash,code_cipher=p_cipher,enabled=p_enabled,version=version+1,changed=p_now where id=1;
 outcome=jsonb_build_object('ok',true,'version',a.version+1);
 insert into mama_audit_logs(created,actor,action,target,reason,before_data,after_data,request_key) values(p_now,'管理员','shared_access','entry','更新统一测试码',jsonb_build_object('version',a.version,'enabled',a.enabled),jsonb_build_object('version',a.version+1,'enabled',p_enabled),p_key);
 update mama_admin_requests set result=outcome where key=p_key;
 return outcome;
end;$$;

create or replace function public.mama_visitor_list(p_actor text,p_filters jsonb,p_page integer,p_limit integer,p_now bigint) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare total bigint;rows jsonb;lim integer:=greatest(1,least(100,p_limit));page integer:=greatest(1,p_page);
begin
 if not exists(select 1 from mama_admin_sessions s join mama_admin_credentials c on c.id=1 and s.credential_version=c.version where s.token_hash=p_actor and s.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 with filtered as(select 'U-'||upper(v.id) as visitor_id,v.code_id,v.created,v.last_seen,c.used,c.quota,c.active,c.version,(select count(*) from mama_submissions s where s.code_id=v.code_id and s.valid) as valid_reports from mama_visitors v join mama_codes c on c.id=v.code_id where
 (coalesce(p_filters->>'q','')='' or ('U-'||upper(v.id)) ilike '%'||(p_filters->>'q')||'%') and
 (coalesce(p_filters->>'used','')='' or c.used=(p_filters->>'used')::int))
 select(select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,visitor_id limit lim offset(page-1)*lim)x),'[]') into total,rows;
 return jsonb_build_object('items',rows,'total',total,'page',page,'limit',lim);
end;$$;

revoke all on function public.mama_shared_bootstrap(text,jsonb,bigint),public.mama_visitor_auth(text,text,text,text,bigint,integer),public.mama_shared_update(text,integer,text,jsonb,boolean,text,text,bigint),public.mama_visitor_list(text,jsonb,integer,integer,bigint) from public,anon,authenticated;
grant execute on function public.mama_shared_bootstrap(text,jsonb,bigint),public.mama_visitor_auth(text,text,text,text,bigint,integer),public.mama_shared_update(text,integer,text,jsonb,boolean,text,text,bigint),public.mama_visitor_list(text,jsonb,integer,integer,bigint) to service_role;
commit;
