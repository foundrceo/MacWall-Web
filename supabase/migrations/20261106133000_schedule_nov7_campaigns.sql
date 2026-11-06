-- Wider India audience for the Diwali campaign, and a one-off schedule for
-- Nov 7, 04:00 IST (22:30 UTC on Nov 6).
--
-- India = checkout country IN, a trial whose Mac opened an Indian checkout,
-- or a Cashfree checkout. All three started a checkout, which is what the
-- email's footer says. Anyone already sent the Black Friday email is left out.

create or replace function public.macwall_country_candidates(
  p_campaign text, p_country text, p_limit integer
) returns table(email text) language sql stable security definer set search_path = '' as $$
  with buyers as (
    select lower(trim(customer_email)) as e from public.macwall_licenses
      where status = 'active' and customer_email is not null
    union select lower(trim(customer_email)) from public.macwall_stripe_license_emails
      where customer_email is not null
    union select lower(trim(customer_email)) from public.macwall_whop_license_emails
      where customer_email is not null
    union select lower(trim(customer_email)) from public.macwall_cashfree_license_emails
      where customer_email is not null
  ),
  opted_out as (
    select lower(trim(email)) as e from public.macwall_email_suppressions
    union select lower(trim(email)) from public.macwall_trial_leads where unsubscribed_at is not null
  ),
  seen as (
    select lower(trim(customer_email)) as e, created_at as at from public.macwall_licenses
      where visitor_country = upper(p_country) and customer_email like '%@%'
    union all select lower(trim(t.email)), l.created_at from public.macwall_trial_leads t
      join public.macwall_licenses l on l.checkout_visitor_id = t.visitor_id
      where l.visitor_country = upper(p_country) and t.email like '%@%'
    union all select lower(trim(customer_email)), created_at from public.macwall_licenses
      where upper(p_country) = 'IN' and cashfree_order_id is not null and customer_email like '%@%'
  ),
  pool as (select e, max(at) as last_seen from seen group by e)
  select p.e from pool p
  where p.e not in (select e from buyers where e is not null)
    and p.e not in (select e from opted_out where e is not null)
    and not exists (
      select 1 from public.macwall_app_update_emails m
      where m.email = p.e and (m.campaign = p_campaign or (m.campaign = 'black-friday-2026' and m.status = 'sent'))
    )
  order by p.last_seen desc, p.e
  limit greatest(p_limit, 0);
$$;

-- Calls the campaign sender from pg_cron. The secret is read from the
-- existing recovery job, so it is not copied anywhere new.
create function public.macwall_campaign_tick(p_payload jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  v_secret text;
begin
  select substring(command from $re$'x-cron-secret',\s*'([^']+)'$re$) into v_secret
    from cron.job where jobname = 'macwall-process-checkout-recovery';
  if v_secret is null then
    raise exception 'cron secret not found';
  end if;
  return net.http_post(
    url := 'https://pxoqpyroqzsawbwajvkr.supabase.co/functions/v1/send-app-update-emails',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := p_payload,
    timeout_milliseconds := 140000
  );
end;
$$;
revoke all on function public.macwall_campaign_tick(jsonb) from public, anon, authenticated;

select cron.schedule('macwall-nov7-diwali', '30 22 6 11 *',
  $job$select public.macwall_campaign_tick('{"campaign":"diwali-2026","audience":"diwali","from":"MacWall <hi@macwall.app>","limit":50}'::jsonb)$job$);
select cron.schedule('macwall-nov7-bf-a', '35-59/3 22 6 11 *',
  $job$select public.macwall_campaign_tick('{"campaign":"black-friday-2026","audience":"black_friday","from":"MacWall <hi@macwall.app>","limit":100}'::jsonb)$job$);
select cron.schedule('macwall-nov7-bf-b', '2-32/3 23 6 11 *',
  $job$select public.macwall_campaign_tick('{"campaign":"black-friday-2026","audience":"black_friday","from":"MacWall <hi@macwall.app>","limit":100}'::jsonb)$job$);
-- pg_cron has no year field: remove all of it so nothing repeats next year.
select cron.schedule('macwall-nov7-cleanup', '0 1 7 11 *',
  $job$select cron.unschedule(jobname) from cron.job where jobname like 'macwall-nov7-%'$job$);

-- Added Nov 6: run the rest of the Black Friday audience straight away, 100
-- every 2 minutes. The cleanup job above removes this one too.
select cron.schedule('macwall-nov7-bf-now', '*/2 * * * *',
  $job$select public.macwall_campaign_tick('{"campaign":"black-friday-2026","audience":"black_friday","from":"MacWall <hi@macwall.app>","limit":100}'::jsonb)$job$);
