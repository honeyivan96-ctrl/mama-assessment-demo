create table if not exists public.mama_submissions (
 result_id text primary key references public.mama_results(id) on delete cascade,
 code_id text not null references public.mama_codes(id),
 question_version text not null check(length(question_version) between 1 and 64),
 answers jsonb not null check(jsonb_typeof(answers)='array' and jsonb_array_length(answers)=10),
 profile jsonb not null check(jsonb_typeof(profile)='object'),
 context jsonb not null check(jsonb_typeof(context)='object'),
 question_snapshot jsonb not null check(jsonb_typeof(question_snapshot)='array' and jsonb_array_length(question_snapshot)=10),
 report_key text not null check(length(report_key) between 1 and 32),
 consent_version text not null check(length(consent_version) between 1 and 64),
 created bigint not null
);
alter table public.mama_submissions enable row level security;
revoke all on public.mama_submissions from public,anon,authenticated;
grant select,insert,update,delete on public.mama_submissions to service_role;
create index if not exists mama_submissions_created_idx on public.mama_submissions(created desc,result_id desc);
create index if not exists mama_submissions_code_idx on public.mama_submissions(code_id);
create or replace function public.mama_complete_v2(
 p_attempt_hash text,p_session_hash text,p_report jsonb,p_result_id text,p_answers jsonb,p_profile jsonb,p_context jsonb,p_questions jsonb,p_version text,p_consent_version text,p_now bigint
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare code_value text; code_row public.mama_codes%rowtype; attempt_row public.mama_attempts%rowtype;
begin
 select a.code_id into code_value from public.mama_attempts a where a.token_hash=p_attempt_hash and a.session_hash=p_session_hash;
 if code_value is null then raise exception 'MAMA_ATTEMPT_INVALID'; end if;
 select * into code_row from public.mama_codes c where c.id=code_value for update;
 if not code_row.active then raise exception 'MAMA_CODE_DISABLED'; end if;
 if not exists(select 1 from public.mama_sessions s where s.token_hash=p_session_hash and s.code_id=code_value and s.expires>p_now) then raise exception 'MAMA_SESSION_EXPIRED'; end if;
 select * into attempt_row from public.mama_attempts a where a.token_hash=p_attempt_hash and a.session_hash=p_session_hash for update;
 if attempt_row.result_id is not null then return jsonb_build_object('id',attempt_row.result_id,'remaining',code_row.quota-code_row.used); end if;
 if attempt_row.expires<=p_now then raise exception 'MAMA_ATTEMPT_EXPIRED'; end if;
 if code_row.used>=code_row.quota then raise exception 'MAMA_QUOTA_EXHAUSTED'; end if;
 insert into public.mama_results(id,report,created) values(p_result_id,p_report,p_now);
 insert into public.mama_submissions(result_id,code_id,question_version,answers,profile,context,question_snapshot,report_key,consent_version,created)
 values(p_result_id,code_value,p_version,p_answers,p_profile,p_context,p_questions,p_report->>'key',p_consent_version,p_now);
 update public.mama_codes set used=used+1 where id=code_value;
 update public.mama_attempts set result_id=p_result_id where token_hash=p_attempt_hash;
 return jsonb_build_object('id',p_result_id,'remaining',code_row.quota-code_row.used-1);
end; $$;
revoke all on function public.mama_complete_v2(text,text,jsonb,text,jsonb,jsonb,jsonb,jsonb,text,text,bigint) from public,anon,authenticated;
grant execute on function public.mama_complete_v2(text,text,jsonb,text,jsonb,jsonb,jsonb,jsonb,text,text,bigint) to service_role;
