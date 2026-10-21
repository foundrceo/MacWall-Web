-- stripe-license-email marks each delivery sent/failed after Resend answers.
-- Without UPDATE the ledger row stays 'pending' and the webhook returns 500.
grant update (delivery_status, sent_at, last_error)
  on public.macwall_stripe_license_emails to service_role;
