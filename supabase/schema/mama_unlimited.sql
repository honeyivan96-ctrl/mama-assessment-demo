begin;
alter table public.mama_codes add column if not exists unlimited boolean not null default false;
alter table public.mama_codes drop constraint if exists mama_quota_check;
alter table public.mama_codes add constraint mama_quota_check check(quota between 1 and 1000 and used>=0 and (unlimited or used<=quota));
CREATE OR REPLACE FUNCTION public.mama_complete_v2(p_attempt_hash text, p_session_hash text, p_report jsonb, p_result_id text, p_answers jsonb, p_profile jsonb, p_context jsonb, p_questions jsonb, p_version text, p_consent_version text, p_now bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare code_value text; code_row public.mama_codes%rowtype; attempt_row public.mama_attempts%rowtype;
begin
 select a.code_id into code_value from public.mama_attempts a where a.token_hash=p_attempt_hash and a.session_hash=p_session_hash;
 if code_value is null then raise exception 'MAMA_ATTEMPT_INVALID'; end if;
 select * into code_row from public.mama_codes c where c.id=code_value for update;
 if not code_row.active then raise exception 'MAMA_CODE_DISABLED'; end if;
 if not exists(select 1 from public.mama_sessions s where s.token_hash=p_session_hash and s.code_id=code_value and s.expires>p_now) then raise exception 'MAMA_SESSION_EXPIRED'; end if;
 select * into attempt_row from public.mama_attempts a where a.token_hash=p_attempt_hash and a.session_hash=p_session_hash for update;
 if attempt_row.result_id is not null then return jsonb_build_object('id',attempt_row.result_id,'remaining',case when code_row.unlimited then null else code_row.quota-code_row.used end,'unlimited',code_row.unlimited); end if;
 if attempt_row.expires<=p_now then raise exception 'MAMA_ATTEMPT_EXPIRED'; end if;
 if not code_row.unlimited and code_row.used>=code_row.quota then raise exception 'MAMA_QUOTA_EXHAUSTED'; end if;
 insert into public.mama_results(id,report,created) values(p_result_id,p_report,p_now);
 insert into public.mama_submissions(result_id,code_id,question_version,answers,profile,context,question_snapshot,report_key,consent_version,created)
 values(p_result_id,code_value,p_version,p_answers,p_profile,p_context,p_questions,p_report->>'key',p_consent_version,p_now);
 update public.mama_codes set used=used+1 where id=code_value;
 update public.mama_attempts set result_id=p_result_id where token_hash=p_attempt_hash;
 return jsonb_build_object('id',p_result_id,'remaining',case when code_row.unlimited then null else code_row.quota-code_row.used-1 end,'unlimited',code_row.unlimited);
end; $function$
;
CREATE OR REPLACE FUNCTION public.mama_admin_list(p_actor text, p_entity text, p_filters jsonb, p_page integer, p_limit integer, p_now bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare rows jsonb;total bigint;q text:=left(coalesce(p_filters->>'q',''),100);page integer:=greatest(1,p_page);lim integer:=least(100,greatest(1,p_limit));
begin
 if not exists(select 1 from mama_admin_sessions x join mama_admin_credentials cr on cr.id=1 and x.credential_version=cr.version where x.token_hash=p_actor and x.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 if p_entity='codes' then
  with filtered as(select c.id,c.business_code,c.aliases,c.hint,c.label,c.batch_id,c.channel,c.note,c.order_ref,c.delivery_status,c.sent_at,c.expires_at,c.used,c.quota,c.unlimited,c.active,c.deleted_at,c.created,c.version,c.replacement_for,c.password_cipher is not null as recoverable,(select max(s.created) from mama_submissions s where s.code_id=c.id) as last_test,(select count(*) from mama_submissions s where s.code_id=c.id and not s.valid) as void_count,b.name as batch_name from mama_codes c left join mama_batches b on c.batch_id=b.id
   where c.source_kind='individual' and ((p_filters->>'state'='deleted' and c.deleted_at is not null) or (coalesce(p_filters->>'state','')<>'deleted' and c.deleted_at is null)) and (q='' or c.business_code ilike '%'||q||'%' or c.hint ilike '%'||q||'%' or c.order_ref ilike '%'||q||'%' or c.label ilike '%'||q||'%' or array_to_string(c.aliases,',') ilike '%'||q||'%' or c.code_hash=p_filters->>'password_hash')
   and (coalesce(p_filters->>'batch','')='' or c.batch_id=p_filters->>'batch' or (p_filters->>'batch'='_unassigned' and c.batch_id is null)) and (coalesce(p_filters->>'channel','')='' or c.channel=p_filters->>'channel')
   and (coalesce(p_filters->>'delivery','')='' or c.delivery_status=p_filters->>'delivery') and (coalesce(p_filters->>'used','')='' or c.used=(p_filters->>'used')::int)
   and (coalesce(p_filters->>'state','')='' or p_filters->>'state'='deleted' or (p_filters->>'state'='active' and c.active and (c.unlimited or c.used<c.quota) and (c.expires_at is null or c.expires_at>p_now)) or (p_filters->>'state'='disabled' and not c.active) or (p_filters->>'state'='exhausted' and not c.unlimited and c.used>=c.quota) or (p_filters->>'state'='expired' and c.expires_at<=p_now))
   and (coalesce(p_filters->>'from','')='' or c.created>=(p_filters->>'from')::bigint) and (coalesce(p_filters->>'to','')='' or c.created<=(p_filters->>'to')::bigint))
  select (select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,id desc limit lim offset (page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='records' then
  with filtered as(select s.result_id,s.submission_no,s.ordinal,s.profile,s.question_version,s.report_key,s.created,s.valid,s.admin_note,s.version,s.code_id,jsonb_build_object('business_code',c.business_code,'hint',c.hint,'label',c.label,'batch_name',b.name,'channel',c.channel,'used',c.used,'quota',c.quota,'unlimited',c.unlimited,'recoverable',c.password_cipher is not null) as code,(select v.report->>'key' from mama_report_versions v where v.result_id=s.result_id and v.published) as published_key from mama_submissions s join mama_codes c on c.id=s.code_id left join mama_batches b on b.id=c.batch_id
   where (q='' or c.business_code ilike '%'||q||'%' or array_to_string(c.aliases,',') ilike '%'||q||'%' or c.hint ilike '%'||q||'%' or s.result_id=q or s.submission_no::text=q or c.label ilike '%'||q||'%' or c.order_ref ilike '%'||q||'%' or c.code_hash=p_filters->>'password_hash')
   and (coalesce(p_filters->>'code_id','')='' or s.code_id=p_filters->>'code_id') and (coalesce(p_filters->>'batch','')='' or c.batch_id=p_filters->>'batch' or (p_filters->>'batch'='_unassigned' and c.batch_id is null)) and (coalesce(p_filters->>'channel','')='' or c.channel=p_filters->>'channel')
   and (coalesce(p_filters->>'type','')='' or s.report_key=p_filters->>'type') and (coalesce(p_filters->>'valid','')='' or s.valid=(p_filters->>'valid')::boolean) and (coalesce(p_filters->>'version','')='' or s.question_version=p_filters->>'version')
   and (coalesce(p_filters->>'from','')='' or s.created>=(p_filters->>'from')::bigint) and (coalesce(p_filters->>'to','')='' or s.created<=(p_filters->>'to')::bigint))
  select (select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,result_id desc limit lim offset (page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='logs' then
  with filtered as(select * from mama_audit_logs where(q='' or target ilike '%'||q||'%' or reason ilike '%'||q||'%') and(coalesce(p_filters->>'action','')='' or action=p_filters->>'action') and(coalesce(p_filters->>'from','')='' or created>=(p_filters->>'from')::bigint) and(coalesce(p_filters->>'to','')='' or created<=(p_filters->>'to')::bigint)) select(select count(*) from filtered),coalesce((select jsonb_agg(to_jsonb(x)) from(select * from filtered order by created desc,id desc limit lim offset(page-1)*lim)x),'[]') into total,rows;
 elsif p_entity='batches' then select count(*),coalesce(jsonb_agg(to_jsonb(b)),'[]') into total,rows from(select b.*,(select count(*) from mama_codes c where c.batch_id=b.id and c.deleted_at is null) as code_count,(select count(*) from mama_codes c where c.batch_id=b.id and c.deleted_at is null and c.used>0) as used_count from mama_batches b order by created desc limit 1000)b;
 elsif p_entity='stats' then
  return jsonb_build_object('codes',(select count(*) from mama_codes),'unsent',(select count(*) from mama_codes where delivery_status='unsent'),'sent_unused',(select count(*) from mama_codes where delivery_status='sent' and used=0),'used',(select count(*) from mama_codes where used>0),'exhausted',(select count(*) from mama_codes where not unlimited and used>=quota),'disabled',(select count(*) from mama_codes where not active),'unknown',(select count(*) from mama_codes where delivery_status='unknown'),'today',(select count(*) from mama_submissions where created>=(((p_now+28800000)/86400000)*86400000-28800000) and valid),'records',(select count(*) from mama_submissions),'valid_records',(select count(*) from mama_submissions where valid),'types',(select coalesce(jsonb_agg(t),'[]') from(select report_key as key,count(*) as count from mama_submissions where valid group by report_key)t),'trend',(select coalesce(jsonb_agg(t order by t.day),'[]') from(select ((created+28800000)/86400000)*86400000-28800000 as day,count(*) as count from mama_submissions where valid and created>=p_now-7*86400000 group by 1)t));
 else raise exception 'ADMIN_BAD_REQUEST';end if;
 return jsonb_build_object('items',rows,'total',total,'page',page,'limit',lim);
end;$function$
;
commit;
