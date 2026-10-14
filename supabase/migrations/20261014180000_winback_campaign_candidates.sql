-- One-off win-back: everyone who tried MacWall or opened a checkout before
-- p_before and never bought. Sent by send-app-update-emails (audience
-- "winback"), logged in macwall_app_update_emails like the release mails.

alter table public.macwall_app_update_emails
  drop constraint macwall_app_update_emails_audience_check;
alter table public.macwall_app_update_emails
  add constraint macwall_app_update_emails_audience_check
  check (audience in ('customer', 'trial', 'winback'));

create function public.macwall_winback_candidates(
  p_campaign text, p_before timestamptz, p_limit integer
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
    -- Trials count once the 24-hour trial is over.
    select lower(trim(email)) as e, trial_started_at as at from public.macwall_trial_leads
      where trial_started_at + interval '24 hours' <= now()
    union all select lower(trim(customer_email)), created_at from public.macwall_checkout_recovery_queue
      where customer_email is not null
    union all select lower(trim(customer_email)), created_at from public.macwall_payment_recovery_emails
      where customer_email is not null
    union all select lower(trim(customer_email)), created_at from public.macwall_licenses
      where status <> 'active' and customer_email is not null
  ),
  pool as (
    select e, min(at) as first_seen from seen
    where e like '%@%'
    group by e
    having min(at) < p_before
  )
  select p.e from pool p
  where p.e not in (select e from buyers where e is not null)
    and p.e not in (select e from opted_out where e is not null)
    and not exists (
      select 1 from public.macwall_app_update_emails m
      where m.campaign = p_campaign and m.email = p.e
    )
  -- Most recent first: freshest addresses go out in the first batches.
  order by p.first_seen desc, p.e
  limit greatest(p_limit, 0);
$$;
revoke all on function public.macwall_winback_candidates(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.macwall_winback_candidates(text, timestamptz, integer) to service_role;
