-- One-off campaigns to one country (first: the India Diwali sale). Sent by
-- send-app-update-emails (audience "diwali"), logged in
-- macwall_app_update_emails like the other campaigns.
--
-- Country is only known from checkout (macwall_licenses.visitor_country),
-- so this is people from that country who opened a checkout and never
-- bought, minus anyone who opted out or already got this campaign.

alter table public.macwall_app_update_emails
  drop constraint macwall_app_update_emails_audience_check;
alter table public.macwall_app_update_emails
  add constraint macwall_app_update_emails_audience_check
  check (audience in ('customer', 'trial', 'winback', 'diwali'));

create function public.macwall_country_candidates(
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
  pool as (
    select lower(trim(customer_email)) as e, max(created_at) as last_seen
    from public.macwall_licenses
    where visitor_country = upper(p_country) and customer_email like '%@%'
    group by 1
  )
  select p.e from pool p
  where p.e not in (select e from buyers where e is not null)
    and p.e not in (select e from opted_out where e is not null)
    and not exists (
      select 1 from public.macwall_app_update_emails m
      where m.campaign = p_campaign and m.email = p.e
    )
  order by p.last_seen desc, p.e
  limit greatest(p_limit, 0);
$$;
revoke all on function public.macwall_country_candidates(text, text, integer) from public, anon, authenticated;
grant execute on function public.macwall_country_candidates(text, text, integer) to service_role;
