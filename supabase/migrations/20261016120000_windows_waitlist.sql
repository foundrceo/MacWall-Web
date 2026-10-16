-- Paid Windows preorders. A row appears when Stripe confirms payment; no
-- license key is issued until the Windows app ships (license_key stays null).
create table public.macwall_windows_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'paid'
    check (status in ('paid', 'refunded', 'fulfilled')),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  amount_total integer,
  currency text,
  pricing_region text,
  visitor_country text,
  paid_at timestamptz not null default now(),
  confirmation_email_status text not null default 'pending'
    check (confirmation_email_status in ('pending', 'sent', 'failed')),
  confirmation_email_sent_at timestamptz,
  last_error text,
  -- Filled at launch, when the key is emailed.
  license_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index macwall_windows_waitlist_email_idx
  on public.macwall_windows_waitlist (lower(email));
create index macwall_windows_waitlist_paid_at_idx
  on public.macwall_windows_waitlist (paid_at);

alter table public.macwall_windows_waitlist enable row level security;
revoke all on public.macwall_windows_waitlist from public, anon, authenticated;
grant select, insert, update on public.macwall_windows_waitlist to service_role;
