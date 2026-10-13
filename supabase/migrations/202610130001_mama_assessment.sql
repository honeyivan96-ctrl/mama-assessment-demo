-- A separate namespace of tables avoids collisions with other project apps.
create table public.mama_codes (
 id text primary key check (id ~ '^[a-f0-9]{48}$'),
 code_hash text not null unique check (code_hash ~ '^[a-f0-9]{64}$'),
 hint text not null, label text not null default '',
 used integer not null default 0, quota integer not null default 3,
 active boolean not null default true, created bigint not null,
 constraint mama_quota_check check (quota = 3 and used between 0 and quota),
 constraint mama_label_check check (length(label) <= 60)
);
create table public.mama_sessions (
 token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
 code_id text not null references public.mama_codes(id), expires bigint not null
);
create index mama_sessions_code_idx on public.mama_sessions(code_id);
create table public.mama_results (
 id text primary key check (id ~ '^[a-f0-9]{48}$'), report jsonb not null, created bigint not null
);
create table public.mama_attempts (
 token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
 session_hash text not null references public.mama_sessions(token_hash),
 code_id text not null references public.mama_codes(id),
 result_id text references public.mama_results(id), expires bigint not null
);
create table public.mama_admin_sessions (
 token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'), expires bigint not null
);
create table public.mama_settings (
 key text primary key check (key in ('shop','contact')), value text not null check (length(value) <= 300)
);
create table public.mama_rate_limits (
 key text primary key, count integer not null, expires bigint not null
);

-- Browsers never read these tables directly. Only the Edge Function's service
-- credential can operate on them. Public result viewing is an explicit API.
alter table public.mama_codes enable row level security;
alter table public.mama_sessions enable row level security;
alter table public.mama_attempts enable row level security;
alter table public.mama_results enable row level security;
alter table public.mama_admin_sessions enable row level security;
alter table public.mama_settings enable row level security;
alter table public.mama_rate_limits enable row level security;
revoke all on public.mama_codes,public.mama_sessions,public.mama_attempts,public.mama_results,public.mama_admin_sessions,public.mama_settings,public.mama_rate_limits from anon,authenticated;
grant all on public.mama_codes,public.mama_sessions,public.mama_attempts,public.mama_results,public.mama_admin_sessions,public.mama_settings,public.mama_rate_limits to service_role;

create function public.mama_complete(
 p_attempt_hash text, p_session_hash text, p_report jsonb, p_result_id text, p_now bigint
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare
 code_id_value text;
 code_row public.mama_codes%rowtype;
 attempt_row public.mama_attempts%rowtype;
begin
 -- Lock the code before the attempt. Every submission for a code uses this
 -- ordering, preventing overuse under concurrency and avoiding lock inversion.
 select a.code_id into code_id_value from public.mama_attempts a
   where a.token_hash=p_attempt_hash and a.session_hash=p_session_hash;
 if code_id_value is null then raise exception 'MAMA_ATTEMPT_INVALID'; end if;
 select * into code_row from public.mama_codes where id=code_id_value for update;
 if not code_row.active then raise exception 'MAMA_CODE_DISABLED'; end if;
 if not exists(select 1 from public.mama_sessions s where s.token_hash=p_session_hash and s.code_id=code_id_value and s.expires>p_now) then
   raise exception 'MAMA_SESSION_EXPIRED';
 end if;
 select * into attempt_row from public.mama_attempts where token_hash=p_attempt_hash and session_hash=p_session_hash for update;
 if attempt_row.result_id is not null then
   return jsonb_build_object('id',attempt_row.result_id,'remaining',code_row.quota-code_row.used);
 end if;
 if attempt_row.expires<=p_now then raise exception 'MAMA_ATTEMPT_EXPIRED'; end if;
 if code_row.used>=code_row.quota then raise exception 'MAMA_QUOTA_EXHAUSTED'; end if;
 insert into public.mama_results(id,report,created) values(p_result_id,p_report,p_now);
 update public.mama_codes set used=used+1 where id=code_id_value;
 update public.mama_attempts set result_id=p_result_id where token_hash=p_attempt_hash;
 return jsonb_build_object('id',p_result_id,'remaining',code_row.quota-code_row.used-1);
end;
$$;
revoke all on function public.mama_complete(text,text,jsonb,text,bigint) from public,anon,authenticated;
grant execute on function public.mama_complete(text,text,jsonb,text,bigint) to service_role;

create function public.mama_rate(p_key text,p_now bigint,p_expires bigint)
returns integer language plpgsql security invoker set search_path=public as $$
declare requests integer;
begin
 insert into public.mama_rate_limits(key,count,expires) values(p_key,1,p_expires)
 on conflict(key) do update set count=mama_rate_limits.count+1
 returning count into requests;
 delete from public.mama_rate_limits where expires<p_now;
 return requests;
end;
$$;
revoke all on function public.mama_rate(text,bigint,bigint) from public,anon,authenticated;
grant execute on function public.mama_rate(text,bigint,bigint) to service_role;
