import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@14.25.0"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

const MAX_NO_EMAIL_RETRIES = 6
const NO_EMAIL_RETRY_MINUTES = 30

/** Stripe allowlisted promo — auto-applied via checkout `promo=` param. */
const EMAIL_RECOVERY_PROMO_CODE = "WALL10"
const EMAIL_RECOVERY_PROMO_PERCENT = "10%"

const FONT =
  "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function siteBaseUrl(): string {
  const raw =
    Deno.env.get("LICENSE_EMAIL_SITE_URL")?.trim() || "https://macwall.app"
  return raw.replace(/\/+$/, "")
}

function supportEmail(): string {
  return Deno.env.get("LICENSE_EMAIL_SUPPORT")?.trim() || "support@macwall.app"
}

function logoUrl(): string {
  const fromEnv = Deno.env.get("LICENSE_EMAIL_LOGO_URL")?.trim()
  if (fromEnv) return fromEnv
  return `${siteBaseUrl()}/email/macwall-icon.png`
}

function checkoutHref(promoCode?: string): string {
  const base = `${siteBaseUrl()}/api/checkout/create-session?offer=permanent`
  const code = (promoCode ?? EMAIL_RECOVERY_PROMO_CODE).trim()
  if (!code) return base
  return `${base}&promo=${encodeURIComponent(code)}`
}

/** Prefer env checkout URL but always ensure WALL10 promo is present. */
function checkoutUrl(): string {
  const fromEnv = Deno.env.get("MACWALL_PRO_CHECKOUT_URL")?.trim()
  if (!fromEnv) return checkoutHref(EMAIL_RECOVERY_PROMO_CODE)
  if (/[?&]promo=/i.test(fromEnv)) return fromEnv
  const sep = fromEnv.includes("?") ? "&" : "?"
  return `${fromEnv}${sep}promo=${encodeURIComponent(EMAIL_RECOVERY_PROMO_CODE)}`
}

function parseRetryCount(reason: string | null): number {
  const match = reason?.match(/retry:(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function recoveryEmailSubject(appName = "MacWall"): string {
  return `Claim ${EMAIL_RECOVERY_PROMO_PERCENT} off ${appName} Pro`
}

function recoveryEmailPreheader(): string {
  return `Code ${EMAIL_RECOVERY_PROMO_CODE} · tap to finish checkout`
}

function emailShell(args: {
  title: string
  preheader: string
  cardInner: string
  footnote: string
}): string {
  const { title, preheader, cardInner, footnote } = args
  const year = new Date().getFullYear()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: #ffffff; }
    .mw-link { color: #0070c9; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .mw-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .mw-headline { font-size: 32px !important; line-height: 36px !important; }
      .mw-body { font-size: 16px !important; }
      .mw-key { font-size: 15px !important; }
      .mw-card-outer { padding-left: 12px !important; padding-right: 12px !important; }
      .mw-card { border-radius: 12px !important; }
      .mw-footer-pad { padding-left: 22px !important; padding-right: 22px !important; }
    }
  </style>
</head>
<body bgcolor="#ffffff" style="margin:0;padding:0;background-color:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#ffffff">
    <tr>
      <td class="mw-card-outer" bgcolor="#ffffff" style="padding-top:24px;padding-bottom:40px;padding-left:16px;padding-right:16px;" align="center">
        <!--[if mso]><table role="presentation" width="740" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" class="mw-card" style="max-width:740px;width:100%;margin:0 auto;border-radius:12px;overflow:hidden;background-color:#f5f5f7;">
          <tr>
            <td valign="top" align="center" bgcolor="#f5f5f7" style="background-color:#f5f5f7;">
              ${cardInner}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="mw-footer-pad" align="center" style="padding:20px 28px 28px;text-align:center;">
                    <p style="margin:0;padding:0;font-family:${FONT};color:#888888;font-size:11px;line-height:14px;text-align:center;">
                      ${footnote}
                    </p>
                    <p style="margin:0;padding:0;font-family:${FONT};color:#888888;font-size:11px;line-height:14px;text-align:center;">
                      &copy; ${year} ${escapeHtml(appName)}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

function brandMark(appName: string): string {
  const logo = logoUrl()
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td class="mw-pad" valign="top" align="center" style="padding:36px 26px 12px;text-align:center;">
        <img src="${escapeHtml(logo)}" width="36" height="36" alt="${escapeHtml(appName)}" style="display:inline-block;width:36px;height:36px;border:0;border-radius:9px;">
      </td>
    </tr>
  </table>`
}

function headline(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td class="mw-pad" style="padding-left:26px;padding-right:26px;">
        <table role="presentation" cellspacing="0" width="100%" border="0" cellpadding="0" align="center" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-top:12px;padding-bottom:20px;">
              <p class="mw-headline" style="margin:0;font-family:${FONT};color:#111111;font-weight:600;font-size:40px;line-height:44px;letter-spacing:0.004em;text-align:center;">
                ${text}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function bodyCopy(html: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td class="mw-pad" style="padding-left:26px;padding-right:26px;">
        <table role="presentation" cellspacing="0" width="100%" border="0" cellpadding="0" align="center" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-top:0;padding-bottom:28px;">
              <p class="mw-body" style="margin:0;font-family:${FONT};font-weight:400;font-size:17px;color:#333333;line-height:1.47059;letter-spacing:-0.022em;text-align:center;">
                ${html}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function highlightBlock(args: {
  label: string
  value: string
  hint: string
}): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td class="mw-pad" style="padding-left:26px;padding-right:26px;padding-bottom:28px;">
        <table role="presentation" cellspacing="0" width="100%" border="0" cellpadding="0" align="center" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:12px;">
          <tr>
            <td align="center" style="padding:22px 20px;">
              <p style="margin:0 0 8px 0;font-family:${FONT};font-size:12px;font-weight:400;letter-spacing:0.04em;text-transform:uppercase;color:#86868b;text-align:center;">
                ${escapeHtml(args.label)}
              </p>
              <p class="mw-key" style="margin:0;font-family:${MONO};font-size:22px;font-weight:600;letter-spacing:0.08em;line-height:1.4;color:#111111;text-align:center;word-break:break-all;">
                ${escapeHtml(args.value)}
              </p>
              <p style="margin:10px 0 0;font-family:${FONT};font-size:13px;line-height:18px;color:#86868b;text-align:center;">
                ${escapeHtml(args.hint)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function promoCodeBlock(code: string, percent: string): string {
  return highlightBlock({
    label: "Discount code",
    value: code,
    hint: `${percent} off · auto-applied when you continue`,
  })
}

function textLinkCta(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding-top:0;padding-bottom:0;">
        <p style="margin:0;font-family:${FONT};font-size:17px;line-height:26px;letter-spacing:-0.021em;font-weight:400;text-align:center;">
          <a href="${escapeHtml(href)}" class="mw-link" style="color:#0070c9;text-decoration:none;">${label}&nbsp;›</a>
        </p>
      </td>
    </tr>
  </table>`
}

function buildPaymentRecoveryEmailHtml(args: {
  appName: string
  checkoutHref: string
  promoCode?: string
  promoPercent?: string
}): string {
  const appName = args.appName
  const promoCode = args.promoCode ?? EMAIL_RECOVERY_PROMO_CODE
  const promoPercent = args.promoPercent ?? EMAIL_RECOVERY_PROMO_PERCENT
  const href = args.checkoutHref

  const cardInner = `
    ${brandMark(appName)}
    ${headline(`${escapeHtml(promoPercent)} off ${escapeHtml(appName)}&nbsp;Pro`)}
    ${bodyCopy(
      `Your checkout is still open. Unlock 1,000+ live wallpapers and Lock Screen with a one-time Pro license — not a subscription.`
    )}
    ${promoCodeBlock(promoCode, promoPercent)}
    ${textLinkCta(href, `Continue with ${escapeHtml(promoPercent)} off`)}
  `

  return emailShell({
    title: recoveryEmailSubject(appName),
    preheader: recoveryEmailPreheader(),
    cardInner,
    footnote: `Already paid? You can ignore this email.`,
  })
}

function buildRecoveryEmailPlainText(args: {
  appName: string
  checkoutHref: string
  promoCode?: string
  promoPercent?: string
}): string {
  const appName = args.appName
  const promoCode = args.promoCode ?? EMAIL_RECOVERY_PROMO_CODE
  const promoPercent = args.promoPercent ?? EMAIL_RECOVERY_PROMO_PERCENT
  const href = args.checkoutHref
  const support = supportEmail()
  return (
    `${promoPercent} off ${appName} Pro\n\n` +
    `Your checkout is still open. Unlock 1,000+ live wallpapers and Lock Screen with a one-time Pro license.\n\n` +
    `Code ${promoCode} (${promoPercent} off — auto-applied):\n${href}\n\n` +
    `Already paid? You can ignore this email.\n\n` +
    `Help: ${support}`
  )
}

function sessionEmail(session: Stripe.Checkout.Session): string | null {
  const email =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    null
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

type QueueRow = {
  id: number
  checkout_session_id: string
  license_key: string | null
  customer_email: string | null
  payment_intent_id: string | null
  reason: string | null
}

async function markQueueRow(
  supabase: ReturnType<typeof createClient>,
  id: number,
  patch: Record<string, unknown>
): Promise<void> {
  await supabase
    .from("macwall_checkout_recovery_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
}

async function processQueueRow(args: {
  row: QueueRow
  stripe: Stripe
  supabase: ReturnType<typeof createClient>
  resendKey: string
  from: string
  appName: string
}): Promise<"sent" | "skipped" | "failed" | "rescheduled"> {
  const { row, stripe, supabase, resendKey, from, appName } = args
  const checkoutHrefValue = checkoutUrl()

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(row.checkout_session_id)
  } catch (e) {
    console.error(
      "[process-checkout-recovery] session_retrieve_failed",
      row.checkout_session_id,
      e instanceof Error ? e.message : "error"
    )
    await markQueueRow(supabase, row.id, {
      status: "skipped",
      skip_reason: "session_not_found",
    })
    return "skipped"
  }

  if (session.payment_status === "paid" || session.status === "complete") {
    await markQueueRow(supabase, row.id, {
      status: "cancelled",
      skip_reason: "payment_completed",
    })
    return "skipped"
  }

  /**
   * Expired Checkout Sessions still get the conversion mail.
   * CTA opens a NEW session with WALL10 — it does not reuse the old session URL.
   * Skipping on `expired` previously dropped every `checkout.session.expired` queue row.
   */

  if (row.license_key) {
    const { data: lic } = await supabase
      .from("macwall_licenses")
      .select("status")
      .eq("license_key", row.license_key)
      .maybeSingle()

    if (lic?.status === "active") {
      await markQueueRow(supabase, row.id, {
        status: "cancelled",
        skip_reason: "license_active",
      })
      return "skipped"
    }
  }

  const email = row.customer_email?.trim() || sessionEmail(session)
  if (!email) {
    const retries = parseRetryCount(row.reason)
    if (retries >= MAX_NO_EMAIL_RETRIES) {
      await markQueueRow(supabase, row.id, {
        status: "skipped",
        skip_reason: "no_email",
      })
      return "skipped"
    }

    const nextRetry = retries + 1
    const scheduledAt = new Date(
      Date.now() + NO_EMAIL_RETRY_MINUTES * 60 * 1000
    ).toISOString()
    await markQueueRow(supabase, row.id, {
      status: "pending",
      scheduled_send_at: scheduledAt,
      reason: `checkout_started:retry:${nextRetry}`,
      skip_reason: null,
    })
    return "rescheduled"
  }

  const paymentIntentId =
    row.payment_intent_id ||
    (typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id) ||
    null

  const webhookEventId = `recovery_queue_${row.id}_${row.checkout_session_id}`

  const { error: insErr } = await supabase
    .from("macwall_payment_recovery_emails")
    .insert({
      webhook_event_id: webhookEventId,
      customer_email: email,
      payment_id: paymentIntentId,
      checkout_session_id: row.checkout_session_id,
      reason: row.reason,
    })

  if (insErr) {
    const code = (insErr as { code?: string }).code
    if (code === "23505") {
      await markQueueRow(supabase, row.id, {
        status: "skipped",
        skip_reason: "already_sent",
      })
      return "skipped"
    }
    console.error("[process-checkout-recovery] audit_insert_failed", insErr.message)
    return "failed"
  }

  const html = buildPaymentRecoveryEmailHtml({
    appName,
    checkoutHref: checkoutHrefValue,
    promoCode: EMAIL_RECOVERY_PROMO_CODE,
    promoPercent: EMAIL_RECOVERY_PROMO_PERCENT,
  })
  const text = buildRecoveryEmailPlainText({
    appName,
    checkoutHref: checkoutHrefValue,
    promoCode: EMAIL_RECOVERY_PROMO_CODE,
    promoPercent: EMAIL_RECOVERY_PROMO_PERCENT,
  })

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: recoveryEmailSubject(appName),
        html,
        text,
      }),
    })

    if (!res.ok) {
      await supabase
        .from("macwall_payment_recovery_emails")
        .delete()
        .eq("webhook_event_id", webhookEventId)
      console.error("[process-checkout-recovery] resend_failed", res.status)
      return "failed"
    }
  } catch (e) {
    await supabase
      .from("macwall_payment_recovery_emails")
      .delete()
      .eq("webhook_event_id", webhookEventId)
    console.error(
      "[process-checkout-recovery] resend_exception",
      e instanceof Error ? e.message : "error"
    )
    return "failed"
  }

  await markQueueRow(supabase, row.id, {
    status: "sent",
    sent_at: new Date().toISOString(),
    customer_email: email,
  })

  return "sent"
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { Allow: "POST, OPTIONS" },
    })
  }

  if (req.method !== "POST") {
    return new Response("POST only", { status: 405 })
  }

  const cronSecret = Deno.env.get("CRON_SECRET")?.trim()
  const authHeader = req.headers.get("authorization")?.trim()
  const cronHeader = req.headers.get("x-cron-secret")?.trim()

  const authorized =
    (cronSecret && cronHeader === cronSecret) ||
    (authHeader?.startsWith("Bearer ") &&
      authHeader.slice(7) === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim())

  if (!authorized) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"

  if (
    !stripeSecret ||
    !supabaseUrl ||
    !supabaseServiceKey ||
    !resendKey ||
    !from
  ) {
    return Response.json(
      { ok: false, error: "missing_config" },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecret)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = new Date().toISOString()
  const { data: rows, error } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select(
      "id, checkout_session_id, license_key, customer_email, payment_intent_id, reason"
    )
    .eq("status", "pending")
    .lte("scheduled_send_at", now)
    .order("scheduled_send_at", { ascending: true })
    .limit(25)

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  let failed = 0
  let rescheduled = 0

  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow({
      row,
      stripe,
      supabase,
      resendKey,
      from,
      appName,
    })
    if (result === "sent") sent++
    else if (result === "rescheduled") rescheduled++
    else if (result === "skipped") skipped++
    else failed++
  }

  return Response.json({
    ok: true,
    processed: (rows ?? []).length,
    sent,
    skipped,
    rescheduled,
    failed,
  })
})
