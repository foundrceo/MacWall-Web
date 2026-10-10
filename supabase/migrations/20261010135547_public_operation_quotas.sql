create table public.macwall_public_operation_quotas (
  operation text not null,
  subject_hash text not null,
  window_start timestamptz not null,
  used integer not null check (used > 0),
  primary key (operation, subject_hash, window_start)
);
alter table public.macwall_public_operation_quotas enable row level security;
revoke all on public.macwall_public_operation_quotas from public, anon, authenticated;

create function public.consume_macwall_public_quota(
  p_operation text, p_subject_hash text, p_limit integer, p_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_start timestamptz; v_used integer;
begin
  if p_limit < 1 or p_limit > 100000 or p_window_seconds not in (60,3600,86400)
    or length(p_operation) > 64 or length(p_subject_hash) <> 64 then
    raise exception 'invalid_quota';
  end if;
  v_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.macwall_public_operation_quotas(operation,subject_hash,window_start,used)
    values(p_operation,p_subject_hash,v_start,1)
    on conflict (operation,subject_hash,window_start) do update
      set used = public.macwall_public_operation_quotas.used + 1
      where public.macwall_public_operation_quotas.used < p_limit
    returning used into v_used;
  return v_used is not null;
end;
$$;
revoke all on function public.consume_macwall_public_quota(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_macwall_public_quota(text,text,integer,integer) to service_role;
create index macwall_public_quota_expiry on public.macwall_public_operation_quotas(window_start);
select cron.schedule('macwall-public-quota-cleanup', '17 3 * * *',
  $$delete from public.macwall_public_operation_quotas where window_start < now() - interval '2 days'$$);
