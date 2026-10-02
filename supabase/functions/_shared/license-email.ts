import type { SupabaseClient } from "npm:@supabase/supabase-js@2.105.4"

/**
 * License email (Resend) and server-side purchase pixels for license
 * webhooks. Copied from stripe-license-email so the live Stripe function
 * stays untouched.
 */

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

export async function sendTikTokPurchase(args: {
  email: string
  eventIdSeed: string
  /** Major units in `currency` (e.g. 441.5 for ₹441.50, 12.99 for $12.99). */
  amount?: number | null
  currency?: string | null
}): Promise<void> {
  const accessToken = Deno.env.get("TIKTOK_EVENTS_API_ACCESS_TOKEN")?.trim()
  const pixelCode =
    Deno.env.get("TIKTOK_PIXEL_ID")?.trim() || TIKTOK_PIXEL_ID_FALLBACK
  if (!accessToken || !pixelCode) return

  const parsedValue = Number.parseFloat(
    Deno.env.get("TIKTOK_PURCHASE_VALUE")?.trim() || "12.99"
  )
  const envFallback = Number.isFinite(parsedValue) ? parsedValue : 12.99
  const hasAmount =
    typeof args.amount === "number" && Number.isFinite(args.amount)
  const value = hasAmount ? (args.amount as number) : envFallback
  // Report what the buyer paid, in the currency they paid (Adaptive Pricing).
  const currency =
    (hasAmount && args.currency?.trim().toUpperCase()) ||
    Deno.env.get("TIKTOK_PURCHASE_CURRENCY")?.trim() ||
    "USD"
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
      console.error("[license-email] tiktok purchase failed", res.status)
    }
  } catch (e) {
    console.error(
      "[license-email] tiktok exception",
      e instanceof Error ? e.message : "error"
    )
  }
}

export async function sendXPurchase(args: {
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

export function supportEmail(): string {
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


export async function cancelTrialEndedEmails(
  // deno-lint-ignore no-explicit-any
  supabase: SupabaseClient<any, "public", "public", any, any>,
  email: string
): Promise<void> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return
  const { error } = await supabase.rpc("cancel_macwall_trial_ended_emails", {
    p_email: normalized,
  })
  if (error) {
    console.error(
      "[license-email] trial_ended_cancel",
      error.message
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type ResendSendResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string; status: number; retryable: boolean }

export async function sendResendEmail(args: {
  resendKey: string
  from: string
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey: string
  maxAttempts?: number
}): Promise<ResendSendResult> {
  const maxAttempts = args.maxAttempts ?? 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": args.idempotencyKey,
          "User-Agent": "MacWall/1.0",
        },
        body: JSON.stringify({
          from: args.from,
          to: [args.to],
          // "Didn't get my key" replies land in support, not a dead inbox.
          reply_to: supportEmail(),
          subject: args.subject,
          html: args.html,
          text: args.text,
        }),
      })
      const resBody: unknown = await res.json().catch(() => ({}))
      if (res.ok) {
        const id =
          typeof resBody === "object" &&
          resBody !== null &&
          "id" in resBody &&
          typeof (resBody as { id: unknown }).id === "string"
            ? (resBody as { id: string }).id
            : null
        return { ok: true, id }
      }
      const retryable = res.status === 429 || res.status >= 500
      if (retryable && attempt < maxAttempts) {
        const retryAfterRaw = Number(res.headers.get("retry-after"))
        const waitMs =
          Number.isFinite(retryAfterRaw) && retryAfterRaw > 0
            ? Math.min(retryAfterRaw * 1000, 15_000)
            : Math.min(8_000, 700 * 2 ** (attempt - 1))
        console.error(
          "[license-email] resend_retry",
          res.status,
          `attempt ${attempt}/${maxAttempts}`
        )
        await sleep(waitMs)
        continue
      }
      return {
        ok: false,
        error: resendErrorMessage(resBody, `resend_${res.status}`),
        status: res.status,
        retryable,
      }
    } catch (e) {
      if (attempt < maxAttempts) {
        await sleep(Math.min(8_000, 700 * 2 ** (attempt - 1)))
        continue
      }
      return {
        ok: false,
        error: e instanceof Error ? e.message : "resend_error",
        status: 0,
        retryable: true,
      }
    }
  }
  return { ok: false, error: "resend_exhausted", status: 429, retryable: true }
}

export async function deliverLicenseEmail(args: {
  resendKey: string
  from: string
  appName: string
  to: string
  licenseKey: string
  maxDevices: number
  maxAttempts?: number
}): Promise<ResendSendResult> {
  const html = buildLicenseEmailHtml({
    appName: args.appName,
    licenseKey: args.licenseKey,
    maxDevices: args.maxDevices,
  })
  const text = buildLicenseEmailPlainText({
    appName: args.appName,
    licenseKey: args.licenseKey,
    maxDevices: args.maxDevices,
  })
  return sendResendEmail({
    resendKey: args.resendKey,
    from: args.from,
    to: args.to,
    subject: licenseEmailSubject(args.appName),
    html,
    text,
    idempotencyKey: `license/${args.licenseKey}`,
    maxAttempts: args.maxAttempts,
  })
}
