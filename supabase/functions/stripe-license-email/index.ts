import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@14.25.0"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function resendErrorMessage(resBody: unknown, fallback: string): string {
  if (typeof resBody !== "object" || resBody === null) return fallback
  const o = resBody as Record<string, unknown>
  if (typeof o.message === "string") return o.message
  if (Array.isArray(o.errors) && o.errors.length > 0) {
    const first = o.errors[0]
    if (typeof first === "string") return first
    if (typeof first === "object" && first !== null && "message" in first) {
      return String((first as { message: unknown }).message)
    }
  }
  return fallback
}

const TIKTOK_PIXEL_ID_FALLBACK = "D8LBEKRC77UAI2I7M6N0"
const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/"
const X_PIXEL_ID_FALLBACK = "qwcc0"
const X_CONVERSIONS_API_BASE_URL =
  "https://ads-api.x.com/12/measurement/conversions/"

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function sendTikTokPurchase(args: {
  email: string
  eventIdSeed: string
  amountUsd?: number | null
}): Promise<void> {
  const accessToken = Deno.env.get("TIKTOK_EVENTS_API_ACCESS_TOKEN")?.trim()
  const pixelCode =
    Deno.env.get("TIKTOK_PIXEL_ID")?.trim() || TIKTOK_PIXEL_ID_FALLBACK
  if (!accessToken || !pixelCode) return

  const parsedValue = Number.parseFloat(
    Deno.env.get("TIKTOK_PURCHASE_VALUE")?.trim() || "9.99"
  )
  const envFallback = Number.isFinite(parsedValue) ? parsedValue : 9.99
  const value =
    typeof args.amountUsd === "number" && Number.isFinite(args.amountUsd)
      ? args.amountUsd
      : envFallback
  const currency = Deno.env.get("TIKTOK_PURCHASE_CURRENCY")?.trim() || "USD"
  const testCode = Deno.env.get("TIKTOK_EVENTS_API_TEST_EVENT_CODE")?.trim()
  const siteUrl = (
    Deno.env.get("LICENSE_EMAIL_SITE_URL")?.trim() || "https://macwall.app"
  ).replace(/\/+$/, "")

  const user: Record<string, string> = {
    email: await sha256Hex(args.email.trim().toLowerCase()),
  }

  const properties = {
    contents: [
      {
        content_id: "macwall-pro",
        content_type: "product",
        content_name: "MacWall Pro",
        price: value,
        quantity: 1,
      },
    ],
    currency,
    value,
  }

  const eventTime = Math.floor(Date.now() / 1000)
  const data = ["CompletePayment", "Purchase", "PlaceAnOrder"].map((event) => ({
    event,
    event_time: eventTime,
    event_id: `${args.eventIdSeed}_${event}`,
    user,
    properties,
    page: { url: `${siteUrl}/thank-you` },
  }))

  const body: Record<string, unknown> = {
    event_source: "web",
    event_source_id: pixelCode,
    data,
  }
  if (testCode) body.test_event_code = testCode

  try {
    const res = await fetch(TIKTOK_EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    })
    const payload = (await res.json().catch(() => ({}))) as {
      code?: number
    }
    if (!res.ok || (payload.code != null && payload.code !== 0)) {
      console.error("[stripe-license-email] tiktok purchase failed", res.status)
    }
  } catch (e) {
    console.error(
      "[stripe-license-email] tiktok exception",
      e instanceof Error ? e.message : "error"
    )
  }
}

async function sendXPurchase(args: {
  email: string
  eventIdSeed: string
}): Promise<void> {
  const pixelToken = Deno.env.get("X_PIXEL_TOKEN")?.trim()
  const pixelId = Deno.env.get("X_PIXEL_ID")?.trim() || X_PIXEL_ID_FALLBACK
  if (!pixelToken || !pixelId) return

  const siteUrl = (
    Deno.env.get("LICENSE_EMAIL_SITE_URL")?.trim() || "https://macwall.app"
  ).replace(/\/+$/, "")

  const hashedEmail = await sha256Hex(args.email.trim().toLowerCase())
  const body = {
    conversions: [
      {
        conversion_time: new Date().toISOString(),
        event_id: `tw-${pixelId}-${args.eventIdSeed}`,
        event_source_url: `${siteUrl}/thank-you`,
        conversion_id: args.eventIdSeed,
        identifiers: [{ hashed_email: hashedEmail }],
      },
    ],
  }

  try {
    await fetch(`${X_CONVERSIONS_API_BASE_URL}${pixelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Pixel-Token": pixelToken,
      },
      body: JSON.stringify(body),
    })
  } catch {
    /* non-fatal */
  }
}

const FONT =
  "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace"

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

function licenseEmailSubject(appName = "MacWall"): string {
  return `Your ${appName} Pro license`
}

function licenseEmailPreheader(appName = "MacWall"): string {
  return `Open ${appName} on your Mac to activate.`
}

function licenseEmailLinks(licenseKey: string): {
  activateHref: string
  deepLink: string
} {
  const baseUrl = siteBaseUrl()
  const encoded = encodeURIComponent(licenseKey)
  return {
    activateHref: `${baseUrl}/activate?key=${encoded}`,
    deepLink: `macwall://activate?key=${encoded}`,
  }
}

function emailShell(args: {
  title: string
  preheader: string
  cardInner: string
  footnote: string
  appName: string
}): string {
  const { title, preheader, cardInner, footnote, appName } = args
  const year = new Date().getFullYear()

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

function licenseKeyBlock(licenseKey: string, macsLabel: string): string {
  return highlightBlock({
    label: "License key",
    value: licenseKey,
    hint: macsLabel,
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

/** Production path — licenseKey is required (never SAMPLE_LICENSE_KEY). */
function buildLicenseEmailHtml(args: {
  appName: string
  licenseKey: string
  maxDevices: number
}): string {
  const { appName, licenseKey, maxDevices } = args
  if (!licenseKey.trim()) {
    throw new Error("buildLicenseEmailHtml: licenseKey required")
  }
  const macsLabel =
    maxDevices === 1 ? "Works on 1 Mac" : `Works on up to ${maxDevices} Macs`
  const { deepLink } = licenseEmailLinks(licenseKey)

  const cardInner = `
    ${brandMark(appName)}
    ${headline(`Your ${escapeHtml(appName)}&nbsp;Pro license`)}
    ${bodyCopy(
      `Thanks for purchasing ${escapeHtml(appName)}&nbsp;Pro. Open the app on your Mac to activate, or paste the key below.`
    )}
    ${licenseKeyBlock(licenseKey, macsLabel)}
    ${textLinkCta(deepLink, `Activate ${escapeHtml(appName)} Pro`)}
  `

  return emailShell({
    title: licenseEmailSubject(appName),
    preheader: licenseEmailPreheader(appName),
    cardInner,
    footnote: `If you didn’t purchase ${escapeHtml(appName)}&nbsp;Pro, you can ignore this email.`,
    appName,
  })
}

function buildLicenseEmailPlainText(args: {
  appName: string
  licenseKey: string
  maxDevices: number
}): string {
  const { appName, licenseKey, maxDevices } = args
  if (!licenseKey.trim()) {
    throw new Error("buildLicenseEmailPlainText: licenseKey required")
  }
  const macsLabel = maxDevices === 1 ? "1 Mac" : `up to ${maxDevices} Macs`
  const { activateHref, deepLink } = licenseEmailLinks(licenseKey)
  const support = supportEmail()
  return (
    `Your ${appName} Pro license\n\n` +
    `Thanks for purchasing ${appName} Pro. Open the app on your Mac to activate, or paste the key below.\n\n` +
    `License key (${macsLabel}): ${licenseKey}\n\n` +
    `Activate: ${deepLink}\n` +
    `Or: ${activateHref}\n\n` +
    `Help: ${support}`
  )
}


const RECOVERY_DELAY_MINUTES = 5

function recoveryScheduledAt(): string {
  return new Date(Date.now() + RECOVERY_DELAY_MINUTES * 60 * 1000).toISOString()
}

function sessionCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const email =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    null
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

function licenseKeyFromSession(session: Stripe.Checkout.Session): string {
  return (
    session.metadata?.license_key?.trim() ||
    (typeof session.client_reference_id === "string"
      ? session.client_reference_id.trim()
      : "") ||
    ""
  )
}

async function enqueueCheckoutRecovery(args: {
  supabase: ReturnType<typeof createClient>
  checkoutSessionId: string
  licenseKey?: string | null
  customerEmail?: string | null
  paymentIntentId?: string | null
  reason: string
}): Promise<{ queued: boolean; skipped?: string }> {
  const { supabase, checkoutSessionId } = args

  const { data: existing } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select("status")
    .eq("checkout_session_id", checkoutSessionId)
    .maybeSingle()

  if (existing?.status === "sent" || existing?.status === "cancelled") {
    return { queued: false, skipped: existing.status }
  }

  const row = {
    checkout_session_id: checkoutSessionId,
    license_key: args.licenseKey?.trim() || null,
    customer_email: args.customerEmail?.trim() || null,
    payment_intent_id: args.paymentIntentId?.trim() || null,
    reason: args.reason,
    scheduled_send_at: recoveryScheduledAt(),
    status: "pending" as const,
    sent_at: null,
    skip_reason: null,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from("macwall_checkout_recovery_queue")
      .update(row)
      .eq("checkout_session_id", checkoutSessionId)
    if (error) {
      console.error(
        "[stripe-license-email] recovery_queue_update",
        error.message
      )
      return { queued: false, skipped: "update_failed" }
    }
  } else {
    const { error } = await supabase
      .from("macwall_checkout_recovery_queue")
      .insert(row)
    if (error) {
      console.error(
        "[stripe-license-email] recovery_queue_insert",
        error.message
      )
      return { queued: false, skipped: "insert_failed" }
    }
  }

  return { queued: true }
}

async function cancelCheckoutRecovery(
  supabase: ReturnType<typeof createClient>,
  checkoutSessionId: string
): Promise<void> {
  await supabase
    .from("macwall_checkout_recovery_queue")
    .update({
      status: "cancelled",
      skip_reason: "payment_completed",
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", checkoutSessionId)
    .eq("status", "pending")
}

async function handleCheckoutCompleted(args: {
  event: Stripe.Event
  session: Stripe.Checkout.Session
  supabase: ReturnType<typeof createClient>
  resendKey: string
  from: string
}): Promise<Response> {
  const { session, supabase, resendKey, from } = args

  if (session.payment_status !== "paid") {
    return Response.json({ ok: true, skipped: "not_paid" })
  }

  await cancelCheckoutRecovery(supabase, session.id)

  const licenseKey =
    session.metadata?.license_key?.trim() ||
    (typeof session.client_reference_id === "string"
      ? session.client_reference_id.trim()
      : "")

  const customerEmail =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    null

  if (!licenseKey) {
    return Response.json(
      { ok: false, error: "no_license_key" },
      { status: 422 }
    )
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return Response.json(
      { ok: false, error: "no_customer_email" },
      { status: 422 }
    )
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

  // Prefer the real offer metadata set at checkout time (offer_slug,
  // max_devices, billing_model, pricing_region — see
  // create-macwall-checkout-session.ts). Fall back to the legacy
  // plan_slug-derived guess only for old sessions created before those keys
  // existed.
  const rawPlanSlug = session.metadata?.plan_slug?.trim() || "pro"
  const planSlug =
    rawPlanSlug === "pro_plus" || rawPlanSlug === "pro_max" ? "pro_plus" : "pro"
  const metadataMaxDevices = Number.parseInt(
    session.metadata?.max_devices?.trim() ?? "",
    10
  )
  const maxDevices = [1, 2, 3, 5].includes(metadataMaxDevices)
    ? metadataMaxDevices
    : planSlug === "pro_plus"
      ? 5
      : 3
  const rawBillingModel = session.metadata?.billing_model?.trim()
  const billingModel =
    rawBillingModel === "annual" || rawBillingModel === "permanent"
      ? rawBillingModel
      : "permanent"

  const subscriptionId =
    billingModel === "annual" && typeof session.subscription === "string"
      ? session.subscription
      : null

  // Prefer checkout geo metadata; fall back to Stripe billing address country.
  const rawVisitorCountry =
    session.metadata?.visitor_country?.trim().toUpperCase() ||
    session.customer_details?.address?.country?.trim().toUpperCase() ||
    ""
  const visitorCountry =
    /^[A-Z]{2}$/.test(rawVisitorCountry) && rawVisitorCountry !== "XX"
      ? rawVisitorCountry
      : null

  const licenseUpdate: Record<string, unknown> = {
    status: "active",
    customer_email: customerEmail,
    stripe_payment_intent_id: paymentIntentId,
    activated_at: new Date().toISOString(),
    plan_slug: planSlug,
    max_devices: maxDevices,
    billing_model: billingModel,
    ...(subscriptionId ? { stripe_subscription_id: subscriptionId } : {}),
    ...(visitorCountry ? { visitor_country: visitorCountry } : {}),
  }

  let { error: licenseUpdateError } = await supabase
    .from("macwall_licenses")
    .update(licenseUpdate)
    .eq("license_key", licenseKey)

  if (licenseUpdateError?.message?.includes("visitor_country")) {
    const { visitor_country: _drop, ...withoutCountry } = licenseUpdate
    ;({ error: licenseUpdateError } = await supabase
      .from("macwall_licenses")
      .update(withoutCountry)
      .eq("license_key", licenseKey))
  }

  if (licenseUpdateError?.message?.includes("stripe_subscription_id")) {
    ;({ error: licenseUpdateError } = await supabase
      .from("macwall_licenses")
      .update({
        status: "active",
        customer_email: customerEmail,
        stripe_payment_intent_id: paymentIntentId,
        activated_at: new Date().toISOString(),
        plan_slug: planSlug,
        max_devices: maxDevices,
        billing_model: billingModel,
        ...(visitorCountry ? { visitor_country: visitorCountry } : {}),
      })
      .eq("license_key", licenseKey))
  }

  if (licenseUpdateError?.message?.includes("billing_model")) {
    ;({ error: licenseUpdateError } = await supabase
      .from("macwall_licenses")
      .update({
        status: "active",
        customer_email: customerEmail,
        stripe_payment_intent_id: paymentIntentId,
        activated_at: new Date().toISOString(),
        plan_slug: planSlug,
        max_devices: maxDevices,
        ...(visitorCountry ? { visitor_country: visitorCountry } : {}),
      })
      .eq("license_key", licenseKey))
  }

  if (licenseUpdateError?.message?.includes("plan_slug")) {
    ;({ error: licenseUpdateError } = await supabase
      .from("macwall_licenses")
      .update({
        status: "active",
        customer_email: customerEmail,
        stripe_payment_intent_id: paymentIntentId,
        activated_at: new Date().toISOString(),
        ...(visitorCountry ? { visitor_country: visitorCountry } : {}),
      })
      .eq("license_key", licenseKey))
  }

  if (licenseUpdateError) {
    console.error(
      "[stripe-license-email] license_activate_update",
      licenseUpdateError.message
    )
  }

  const { error: insErr } = await supabase
    .from("macwall_stripe_license_emails")
    .insert({
      webhook_event_id: args.event.id,
      checkout_session_id: session.id,
      license_key: licenseKey,
      customer_email: customerEmail,
    })

  if (insErr) {
    const code = (insErr as { code?: string }).code
    if (code === "23505") {
      return Response.json({ ok: true, duplicate: true })
    }
    return Response.json({ ok: false, error: insErr.message }, { status: 500 })
  }

  const amountUsd =
    typeof session.amount_total === "number" ? session.amount_total / 100 : null

  await sendTikTokPurchase({
    email: customerEmail,
    eventIdSeed: `stripe_${args.event.id}`,
    amountUsd,
  })

  await sendXPurchase({
    email: customerEmail,
    eventIdSeed: `stripe_${args.event.id}`,
  })

  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  const html = buildLicenseEmailHtml({ appName, licenseKey, maxDevices })
  const text = buildLicenseEmailPlainText({ appName, licenseKey, maxDevices })

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [customerEmail],
        subject: licenseEmailSubject(appName),
        html,
        text,
      }),
    })

    const resBody: unknown = await res.json().catch(() => ({}))
    if (!res.ok) {
      await supabase
        .from("macwall_stripe_license_emails")
        .delete()
        .eq("webhook_event_id", args.event.id)
      const msg = resendErrorMessage(resBody, res.statusText)
      return Response.json({ ok: false, error: msg }, { status: 502 })
    }
  } catch (e) {
    await supabase
      .from("macwall_stripe_license_emails")
      .delete()
      .eq("webhook_event_id", args.event.id)
    const msg = e instanceof Error ? e.message : "resend_error"
    return Response.json({ ok: false, error: msg }, { status: 502 })
  }

  return Response.json({ ok: true, emailed_to: customerEmail })
}

async function handlePaymentFailed(args: {
  event: Stripe.Event
  stripe: Stripe
  supabase: ReturnType<typeof createClient>
}): Promise<Response> {
  const paymentIntent = args.event.data.object as Stripe.PaymentIntent
  // Checkout Sessions usually leave receipt_email null — email is on the session.
  let email = paymentIntent.receipt_email?.trim() || null
  const reason = paymentIntent.last_payment_error?.message ?? "payment_failed"

  let checkoutSessionId: string | null = null
  let licenseKey: string | null =
    paymentIntent.metadata?.license_key?.trim() || null

  try {
    const sessions = await args.stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    })
    const session = sessions.data[0]
    if (session) {
      checkoutSessionId = session.id
      if (!licenseKey) licenseKey = licenseKeyFromSession(session) || null
      if (!email) email = sessionCustomerEmail(session)
    }
  } catch (e) {
    console.error(
      "[stripe-license-email] payment_failed_session_lookup",
      e instanceof Error ? e.message : "error"
    )
  }

  if (!checkoutSessionId) {
    return Response.json({ ok: true, skipped: "no_checkout_session" })
  }

  const result = await enqueueCheckoutRecovery({
    supabase: args.supabase,
    checkoutSessionId,
    licenseKey,
    customerEmail: email,
    paymentIntentId: paymentIntent.id,
    reason,
  })

  return Response.json({
    ok: true,
    recovery_queued: result.queued,
    checkout_session_id: checkoutSessionId,
    scheduled_in_minutes: RECOVERY_DELAY_MINUTES,
    ...(result.skipped ? { skipped: result.skipped } : {}),
  })
}

async function handleCheckoutSessionCreated(args: {
  session: Stripe.Checkout.Session
  supabase: ReturnType<typeof createClient>
}): Promise<Response> {
  const { session, supabase } = args
  const licenseKey = licenseKeyFromSession(session)
  const result = await enqueueCheckoutRecovery({
    supabase,
    checkoutSessionId: session.id,
    licenseKey: licenseKey || null,
    customerEmail: sessionCustomerEmail(session),
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    reason: "checkout_created",
  })

  return Response.json({
    ok: true,
    recovery_queued: result.queued,
    scheduled_in_minutes: RECOVERY_DELAY_MINUTES,
    ...(result.skipped ? { skipped: result.skipped } : {}),
  })
}

async function handleCheckoutSessionExpired(args: {
  session: Stripe.Checkout.Session
  supabase: ReturnType<typeof createClient>
}): Promise<Response> {
  const { session, supabase } = args
  const licenseKey = licenseKeyFromSession(session)
  const result = await enqueueCheckoutRecovery({
    supabase,
    checkoutSessionId: session.id,
    licenseKey: licenseKey || null,
    customerEmail: sessionCustomerEmail(session),
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    reason: "checkout_expired",
  })

  return Response.json({
    ok: true,
    recovery_queued: result.queued,
    scheduled_in_minutes: RECOVERY_DELAY_MINUTES,
    ...(result.skipped ? { skipped: result.skipped } : {}),
  })
}

const SUBSCRIPTION_ACTIVE_STATUSES = new Set(["active", "trialing"])

/**
 * Annual plans are only "working" while the Stripe subscription is active or
 * trialing. Any other status (past_due, unpaid, canceled, incomplete_expired,
 * paused) revokes access immediately — the license key stops verifying until
 * the customer renews and Stripe reports the subscription active again.
 */
async function handleSubscriptionStatusChange(args: {
  event: Stripe.Event
  subscription: Stripe.Subscription
  supabase: ReturnType<typeof createClient>
}): Promise<Response> {
  const { subscription, supabase } = args
  const licenseKey = subscription.metadata?.license_key?.trim() || null
  const isActive = SUBSCRIPTION_ACTIVE_STATUSES.has(subscription.status)

  let query = supabase
    .from("macwall_licenses")
    .update({
      status: isActive ? "active" : "expired",
      ...(isActive ? { activated_at: new Date().toISOString() } : {}),
    })
    .eq("billing_model", "annual")
    .in("status", ["active", "expired", "pending"])

  if (licenseKey) {
    query = query.eq("license_key", licenseKey)
  } else {
    query = query.eq("stripe_subscription_id", subscription.id)
  }

  const { data, error } = await query.select("license_key")

  if (error) {
    console.error(
      "[stripe-license-email] subscription_status_update_failed",
      error.message
    )
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  console.info(
    "[stripe-license-email] subscription_status_change",
    subscription.id,
    subscription.status,
    isActive ? "activated" : "expired",
    data?.map((row) => row.license_key).join(", ") || "no_match"
  )

  return Response.json({
    ok: true,
    subscription_status: subscription.status,
    license_status: isActive ? "active" : "expired",
    updated: data?.map((row) => row.license_key) ?? [],
    webhook_event_id: args.event.id,
  })
}

async function handleChargeRefunded(args: {
  event: Stripe.Event
  supabase: ReturnType<typeof createClient>
}): Promise<Response> {
  const charge = args.event.data.object as Stripe.Charge
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null)

  const isFullyRefunded =
    charge.refunded === true ||
    (typeof charge.amount === "number" &&
      typeof charge.amount_refunded === "number" &&
      charge.amount_refunded >= charge.amount)

  if (!isFullyRefunded) {
    return Response.json({ ok: true, skipped: "partial_refund" })
  }

  const licenseKeyFromMetadata = charge.metadata?.license_key?.trim() || null

  let updateQuery = args.supabase
    .from("macwall_licenses")
    .update({ status: "revoked" })
    .in("status", ["active", "pending"])

  if (licenseKeyFromMetadata) {
    updateQuery = updateQuery.eq("license_key", licenseKeyFromMetadata)
  } else if (paymentIntentId) {
    updateQuery = updateQuery.eq("stripe_payment_intent_id", paymentIntentId)
  } else {
    return Response.json({ ok: true, skipped: "no_lookup_key" })
  }

  const { data, error } = await updateQuery.select("license_key")

  if (error) {
    console.error("[stripe-license-email] revoke_failed", error.message)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  if (!data?.length) {
    return Response.json({ ok: true, skipped: "license_not_found" })
  }

  console.info(
    "[stripe-license-email] license_revoked",
    data.map((row) => row.license_key).join(", ")
  )

  return Response.json({
    ok: true,
    revoked: data.map((row) => row.license_key),
    webhook_event_id: args.event.id,
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { Allow: "POST, OPTIONS" },
    })
  }

  if (req.method !== "POST") {
    return new Response("POST webhooks only", { status: 405 })
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim()
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()

  if (
    !stripeSecret ||
    !webhookSecret ||
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

  let stripe: Stripe
  try {
    stripe = new Stripe(stripeSecret)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_init_failed"
    console.error("[stripe-license-email] stripe_init_failed", msg)
    return Response.json(
      { ok: false, error: "stripe_init_failed" },
      { status: 500 }
    )
  }

  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return Response.json({ ok: false, error: "no_signature" }, { status: 401 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid_signature"
    return Response.json(
      { ok: false, error: "invalid_signature", detail: msg },
      { status: 401 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (event.type === "checkout.session.created") {
    const session = event.data.object as Stripe.Checkout.Session
    return handleCheckoutSessionCreated({ session, supabase })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    return handleCheckoutCompleted({
      event,
      session,
      supabase,
      resendKey,
      from,
    })
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session
    return handleCheckoutSessionExpired({ session, supabase })
  }

  if (event.type === "payment_intent.payment_failed") {
    return handlePaymentFailed({ event, stripe, supabase })
  }

  if (event.type === "charge.refunded") {
    return handleChargeRefunded({ event, supabase })
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription
    return handleSubscriptionStatusChange({ event, subscription, supabase })
  }

  return Response.json({ ok: true, skipped: event.type })
})
