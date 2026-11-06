-- Black Friday for people outside India who opened a checkout, never bought
-- and never started a trial. Sent by send-app-update-emails (audience
-- "black_friday_checkout").

alter table public.macwall_app_update_emails
  drop constraint macwall_app_update_emails_audience_check;
alter table public.macwall_app_update_emails
  add constraint macwall_app_update_emails_audience_check
  check (audience in ('customer', 'trial', 'winback', 'diwali', 'black_friday', 'black_friday_checkout'));

create function public.macwall_black_friday_checkout_candidates(
  p_campaign text, p_limit integer
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
  excluded as (
    select lower(trim(email)) as e from public.macwall_email_suppressions
    union select lower(trim(email)) from public.macwall_trial_leads
    union select lower(trim(customer_email)) from public.macwall_licenses
      where visitor_country = 'IN' and customer_email is not null
    union select lower(trim(customer_email)) from public.macwall_checkout_recovery_queue
      where status = 'sent' and sent_at > now() - interval '20 hours' and customer_email is not null
    union select email from public.macwall_app_update_emails
      where campaign in ('black-friday-2026', 'diwali-2026')
         or (status = 'sent' and created_at > now() - interval '20 hours')
  ),
  seen as (
    select lower(trim(customer_email)) as e, created_at as at from public.macwall_licenses
      where customer_email like '%@%'
    union all select lower(trim(customer_email)), created_at from public.macwall_checkout_recovery_queue
      where customer_email like '%@%'
  ),
  pool as (select e, max(at) as last_seen from seen group by e)
  select p.e from pool p
  where p.e not in (select e from buyers where e is not null)
    and p.e not in (select e from excluded where e is not null)
    and not exists (
      select 1 from public.macwall_app_update_emails m
      where m.campaign = p_campaign and m.email = p.e
    )
  order by p.last_seen desc, p.e
  limit greatest(p_limit, 0);
$$;
revoke all on function public.macwall_black_friday_checkout_candidates(text, integer) from public, anon, authenticated;
grant execute on function public.macwall_black_friday_checkout_candidates(text, integer) to service_role;
