-- One-off "earn with MacWall" email about the affiliate program. It goes to
-- everyone who gave us an address (trial users and buyers), so it needs its
-- own audience in the campaign log and its own candidate list.

alter table public.macwall_app_update_emails
  drop constraint macwall_app_update_emails_audience_check;
alter table public.macwall_app_update_emails
  add constraint macwall_app_update_emails_audience_check
  check (audience = any (array[
    'customer', 'trial', 'winback', 'diwali',
    'black_friday', 'black_friday_checkout', 'affiliate'
  ]));

-- Buyers first (they know the app best), then trial users, newest first.
-- Left out: suppressed and unsubscribed addresses, anyone mailed in the last
-- 20 hours, and anyone this campaign already reached.
create or replace function public.macwall_affiliate_campaign_candidates(
  p_campaign text,
  p_limit integer
)
returns table(email text, is_buyer boolean)
language sql
stable security definer
set search_path to ''
as $function$
  with buyers as (
    select lower(trim(customer_email)) as e, max(sent_at) as seen
    from public.macwall_stripe_license_emails
    where customer_email like '%@%'
    group by 1
  ),
  trials as (
    select lower(trim(email)) as e, max(trial_started_at) as seen
    from public.macwall_trial_leads
    where email like '%@%'
    group by 1
  ),
  excluded as (
    select lower(trim(email)) as e from public.macwall_email_suppressions
    union select lower(trim(email)) from public.macwall_trial_leads
      where unsubscribed_at is not null
    union select lower(trim(customer_email)) from public.macwall_checkout_recovery_queue
      where status = 'sent' and sent_at > now() - interval '20 hours' and customer_email is not null
    union select lower(trim(email)) from public.macwall_trial_ended_queue
      where status = 'sent' and sent_at > now() - interval '20 hours'
    union select email from public.macwall_app_update_emails
      where status = 'sent' and created_at > now() - interval '20 hours'
  ),
  pool as (
    select coalesce(b.e, t.e) as e,
           b.e is not null as is_buyer,
           greatest(b.seen, t.seen) as seen
    from buyers b
    full outer join trials t on t.e = b.e
  )
  select p.e, p.is_buyer from pool p
  where p.e not in (select e from excluded where e is not null)
    and not exists (
      select 1 from public.macwall_app_update_emails m
      where m.campaign = p_campaign and m.email = p.e
    )
  order by p.is_buyer desc, p.seen desc nulls last, p.e
  limit greatest(p_limit, 0);
$function$;

revoke all on function public.macwall_affiliate_campaign_candidates(text, integer) from public, anon, authenticated;
grant execute on function public.macwall_affiliate_campaign_candidates(text, integer) to service_role;
