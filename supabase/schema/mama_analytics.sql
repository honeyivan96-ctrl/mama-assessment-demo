begin;
alter table public.mama_settings drop constraint if exists mama_settings_key_check;
alter table public.mama_settings add constraint mama_settings_key_check check(key in ('shop','contact','reward','stats_since'));
create table if not exists public.mama_home_views(
 event_id uuid primary key,
 created bigint not null check(created>0)
);
create index if not exists mama_home_views_created_idx on public.mama_home_views(created);
alter table public.mama_home_views enable row level security;
revoke all on public.mama_home_views from public,anon,authenticated;
grant select,insert,update,delete on public.mama_home_views to service_role;

create or replace function public.mama_record_home_view(p_event_id uuid,p_now bigint) returns jsonb
language plpgsql security invoker set search_path=public as $$
begin
 insert into mama_home_views(event_id,created) values(p_event_id,p_now) on conflict(event_id) do nothing;
 return jsonb_build_object('ok',true);
end;$$;

create or replace function public.mama_admin_dashboard(p_actor text,p_now bigint) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare since_ms bigint:=0;today_ms bigint:=((p_now+28800000)/86400000)*86400000-28800000;raw_since text;
begin
 if not exists(select 1 from mama_admin_sessions s join mama_admin_credentials c on c.id=1 and s.credential_version=c.version where s.token_hash=p_actor and s.expires>p_now) then raise exception 'ADMIN_UNAUTHORIZED';end if;
 select value into raw_since from mama_settings where key='stats_since';
 if raw_since ~ '^\d{1,16}$' then since_ms:=raw_since::bigint;end if;
 return jsonb_build_object(
 'since',since_ms,'todayStart',today_ms,
 'homeToday',(select count(*) from mama_home_views where created>=greatest(since_ms,today_ms) and created<=p_now),
 'homeTotal',(select count(*) from mama_home_views where created>=since_ms and created<=p_now),
 'ordersToday',(select count(*) from(select min(created) first_use from mama_submissions group by code_id)x where first_use>=greatest(since_ms,today_ms) and first_use<=p_now),
 'ordersTotal',(select count(*) from(select min(created) first_use from mama_submissions group by code_id)x where first_use>=since_ms and first_use<=p_now),
 'validToday',(select count(*) from mama_submissions where valid and created>=greatest(since_ms,today_ms) and created<=p_now),
 'validTotal',(select count(*) from mama_submissions where valid and created>=since_ms and created<=p_now),
 'typesToday',(select coalesce(jsonb_agg(x),'[]') from(select report_key as key,count(*) as count from mama_submissions where valid and created>=greatest(since_ms,today_ms) and created<=p_now group by report_key)x),
 'typesTotal',(select coalesce(jsonb_agg(x),'[]') from(select report_key as key,count(*) as count from mama_submissions where valid and created>=since_ms and created<=p_now group by report_key)x),
 'homeTrend',(select coalesce(jsonb_agg(x order by x.day),'[]') from(select day,count(v.event_id) as count from generate_series(today_ms-6*86400000::bigint,today_ms,86400000::bigint) as day left join mama_home_views v on v.created>=greatest(day,since_ms) and v.created<day+86400000 and v.created<=p_now group by day)x)
 );
end;$$;
revoke all on function public.mama_record_home_view(uuid,bigint) from public,anon,authenticated;
revoke all on function public.mama_admin_dashboard(text,bigint) from public,anon,authenticated;
grant execute on function public.mama_record_home_view(uuid,bigint),public.mama_admin_dashboard(text,bigint) to service_role;
commit;
