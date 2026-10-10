-- Retain historical delivery records without replaying historical customer emails.
alter table public.macwall_stripe_license_emails
  add column delivery_status text not null default 'legacy_unknown'
    check (delivery_status in ('pending', 'sent', 'failed', 'legacy_unknown')),
  add column last_error text;
alter table public.macwall_stripe_license_emails
  alter column delivery_status set default 'pending',
  alter column sent_at drop not null,
  alter column sent_at drop default;

-- A refund can arrive before checkout has bound its payment ID to a license.
create table public.macwall_refunded_stripe_payments (
  payment_intent_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.macwall_refunded_stripe_payments enable row level security;
revoke all on public.macwall_refunded_stripe_payments from public, anon, authenticated;
grant select, insert on public.macwall_refunded_stripe_payments to service_role;

-- Row locking serializes completion with refund updates. Only the server can call it.
create function public.activate_macwall_stripe_checkout(
  p_license_key text, p_checkout_session_id text, p_update jsonb
) returns text
language plpgsql security definer set search_path = '' as $$
declare v_license public.macwall_licenses%rowtype;
  v_payment_id text := nullif(p_update->>'stripe_payment_intent_id', '');
begin
  -- Both transitions take the same lock BEFORE locking the license row.
  if v_payment_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_payment_id, 0));
  end if;
  select * into v_license from public.macwall_licenses
    where license_key = p_license_key for update;
  if not found then raise exception 'license_not_found'; end if;
  if v_license.source <> 'stripe' or
     v_license.stripe_checkout_session_id is distinct from p_checkout_session_id then
    raise exception 'checkout_license_mismatch';
  end if;
  if v_payment_id is not null and exists (
    select 1 from public.macwall_refunded_stripe_payments where payment_intent_id = v_payment_id
  ) then
    update public.macwall_licenses set status = 'revoked' where id = v_license.id;
    return 'ineligible';
  end if;
  if v_license.status in ('revoked', 'expired', 'past_due') then
    return 'ineligible';
  end if;
  if v_license.status not in ('pending', 'active') then
    raise exception 'unexpected_license_state';
  end if;
  update public.macwall_licenses set
    status = 'active',
    customer_email = p_update->>'customer_email',
    stripe_payment_intent_id = p_update->>'stripe_payment_intent_id',
    activated_at = coalesce(activated_at, now()),
    plan_slug = p_update->>'plan_slug',
    max_devices = (p_update->>'max_devices')::integer,
    billing_model = p_update->>'billing_model',
    stripe_subscription_id = coalesce(p_update->>'stripe_subscription_id', stripe_subscription_id),
    visitor_country = coalesce(p_update->>'visitor_country', visitor_country)
  where id = v_license.id;
  return 'active';
end;
$$;
revoke all on function public.activate_macwall_stripe_checkout(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.activate_macwall_stripe_checkout(text,text,jsonb) to service_role;

create function public.record_macwall_stripe_refund(p_payment_intent_id text, p_license_key text)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if nullif(p_payment_intent_id, '') is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_payment_intent_id, 0));
    insert into public.macwall_refunded_stripe_payments(payment_intent_id)
      values (p_payment_intent_id) on conflict do nothing;
  elsif nullif(p_license_key, '') is null then
    raise exception 'refund_lookup_missing';
  end if;
  update public.macwall_licenses set status = 'revoked'
    where source = 'stripe' and status in ('active', 'pending', 'expired', 'past_due')
      and (stripe_payment_intent_id = p_payment_intent_id or license_key = p_license_key);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.record_macwall_stripe_refund(text,text) from public, anon, authenticated;
grant execute on function public.record_macwall_stripe_refund(text,text) to service_role;
