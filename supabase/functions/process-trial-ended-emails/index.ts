import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

const ENQUEUE_LIMIT = 40
const SEND_LIMIT = 0
const SEND_GAP_MS = 800
const LADDER_20_AFTER_MS = 24 * 60 * 60 * 1000
const LADDER_30_AFTER_MS = 48 * 60 * 60 * 1000

const EMAIL_TRIAL_PROMO_CODE = "WALL10"
const EMAIL_TRIAL_PROMO_PERCENT = "10%"
const EMAIL_TRIAL_LADDER_20 = "R7N2WP8J"
const EMAIL_TRIAL_LADDER_30 = "B3H9KF5Q"

type TrialEndedStep = "ended" | "ladder_20" | "ladder_30"

type QueueRow = {
  id: number
  visitor_id: string
  email: string
  step: TrialEndedStep
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const FONT =
  "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace"
const textEncoder = new TextEncoder()

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

function cronUnsubscribeSecret(): string | null {
  return Deno.env.get("CRON_SECRET")?.trim() || null
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

async function signTrialUnsubscribeToken(
  email: string,
  secret: string
): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const payload = bytesToBase64Url(textEncoder.encode(normalized))
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(normalized)
  )
  return `${payload}.${bytesToBase64Url(new Uint8Array(sig))}`
}

async function unsubscribeUrlsFor(email: string): Promise<{
  page: string
  oneClick: string
} | null> {
  const secret = cronUnsubscribeSecret()
  if (!secret) return null
  const token = await signTrialUnsubscribeToken(email, secret)
  const encoded = encodeURIComponent(token)
  return {
    page: `${siteBaseUrl()}/unsubscribe/trial?t=${encoded}`,
    oneClick: `${siteBaseUrl()}/api/unsubscribe/trial?t=${encoded}`,
  }
}

function trialEndedPromo(step: TrialEndedStep): {
  code: string
  percent: string
  expiresHours: number | null
} {
  switch (step) {
    case "ended":
      return {
        code: EMAIL_TRIAL_PROMO_CODE,
        percent: EMAIL_TRIAL_PROMO_PERCENT,
        expiresHours: null,
      }
    case "ladder_20":
      return { code: EMAIL_TRIAL_LADDER_20, percent: "20%", expiresHours: 24 }
    case "ladder_30":
      return { code: EMAIL_TRIAL_LADDER_30, percent: "30%", expiresHours: 12 }
    default: {
      const _never: never = step
      return _never
    }
  }
}

function trialEndedCopy(
  step: TrialEndedStep,
  appName = "MacWall"
): {
  subject: string
  preheader: string
  headline: string
  body: string
  cta: string
  codeLabel: string
  codeHint: string
} {
  const promo = trialEndedPromo(step)
  switch (step) {
    case "ended":
      return {
        subject: `Your ${appName} Pro trial ended`,
        preheader: `The 24-hour Pro trial is over. ${promo.percent} off with ${promo.code}`,
        headline: "Your trial ended",
        body: `The 24-hour ${appName} Pro trial is over. Keep live wallpapers and Lock Screen with a one-time Pro license.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Auto-applied at checkout.`,
      }
    case "ladder_20":
      return {
        subject: `20% off ${appName} Pro for 24 hours`,
        preheader: `Code ${promo.code} expires in 24 hours`,
        headline: "20% off Pro",
        body: `Your ${appName} Pro trial ended. This 20% code lasts 24 hours.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Expires in 24 hours.`,
      }
    case "ladder_30":
      return {
        subject: `30% off ${appName} Pro for 12 hours`,
        preheader: `Code ${promo.code} expires in 12 hours`,
        headline: "30% off Pro",
        body: `Last mail about the trial. This 30% code lasts 12 hours.`,
        cta: "Get Pro",
        codeLabel: "Discount code",
        codeHint: `${promo.percent} off. Expires in 12 hours.`,
      }
    default: {
      const _never: never = step
      return _never
    }
  }
}

function checkoutHref(promoCode?: string, untilUnix?: number): string {
  const base = `${siteBaseUrl()}/api/checkout/create-session?offer=permanent`
  const params = new URLSearchParams()
  const code = (promoCode ?? EMAIL_TRIAL_PROMO_CODE).trim()
  if (code) params.set("promo", code)
  if (untilUnix && untilUnix > 0) params.set("until", String(untilUnix))
  const query = params.toString()
  return query ? `${base}&${query}` : base
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

function trialHeadline(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td class="mw-pad" style="padding-left:26px;padding-right:26px;">
        <table role="presentation" cellspacing="0" width="100%" border="0" cellpadding="0" align="center" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-top:12px;padding-bottom:20px;">
              <h1 class="mw-headline" style="margin:0;font-family:${FONT};color:#111111;font-weight:600;font-size:40px;line-height:44px;letter-spacing:0.004em;text-align:center;">
                ${escapeHtml(text)}
              </h1>
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

function promoCodeBlock(code: string, hint: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td class="mw-pad" style="padding-left:26px;padding-right:26px;padding-bottom:28px;">
        <table role="presentation" cellspacing="0" width="100%" border="0" cellpadding="0" align="center" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:12px;">
          <tr>
            <td align="center" style="padding:22px 20px;">
              <p style="margin:0 0 8px 0;font-family:${FONT};font-size:12px;font-weight:400;letter-spacing:0.04em;text-transform:uppercase;color:#86868b;text-align:center;">
                Discount code
              </p>
              <p class="mw-key" style="margin:0;font-family:${MONO};font-size:22px;font-weight:600;letter-spacing:0.08em;line-height:1.4;color:#111111;text-align:center;word-break:break-all;">
                ${escapeHtml(code)}
              </p>
              <p style="margin:10px 0 0;font-family:${FONT};font-size:13px;line-height:18px;color:#86868b;text-align:center;">
                ${escapeHtml(hint)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
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

function buildTrialEndedEmailHtml(args: {
  step: TrialEndedStep
  appName: string
  checkoutHref: string
  unsubscribeHref: string | null
}): string {
  const copy = trialEndedCopy(args.step, args.appName)
  const promo = trialEndedPromo(args.step)
  const footnote = args.unsubscribeHref
    ? `Already paid? Ignore this email. <a href="${escapeHtml(args.unsubscribeHref)}" class="mw-link" style="color:#888888;text-decoration:underline;">Unsubscribe</a>`
    : `Already paid? Ignore this email.`

  const cardInner = `
    ${brandMark(args.appName)}
    ${trialHeadline(copy.headline)}
    ${bodyCopy(escapeHtml(copy.body))}
    ${promoCodeBlock(promo.code, copy.codeHint)}
    ${textLinkCta(args.checkoutHref, copy.cta)}
  `

  return emailShell({
    title: copy.subject,
    preheader: copy.preheader,
    cardInner,
    footnote,
  })
}

function buildTrialEndedEmailPlainText(args: {
  step: TrialEndedStep
  appName: string
  checkoutHref: string
  unsubscribeHref: string | null
}): string {
  const copy = trialEndedCopy(args.step, args.appName)
  const promo = trialEndedPromo(args.step)
  return (
    `${copy.headline}\n\n` +
    `${copy.body}\n\n` +
    `${copy.codeLabel}: ${promo.code}\n` +
    `${copy.codeHint}\n` +
    `${copy.cta}: ${args.checkoutHref}\n\n` +
    `Already paid? Ignore this email.\n` +
    (args.unsubscribeHref ? `Unsubscribe: ${args.unsubscribeHref}\n` : "") +
    `\nHelp: ${supportEmail()}`
  )
}

function parseStep(raw: string): TrialEndedStep | null {
  if (raw === "ended" || raw === "ladder_20" || raw === "ladder_30") return raw
  return null
}

async function markQueueRow(
  supabase: ReturnType<typeof createClient>,
  id: number,
  patch: Record<string, unknown>
): Promise<void> {
  await supabase
    .from("macwall_trial_ended_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
}

async function cancelPendingForVisitor(
  supabase: ReturnType<typeof createClient>,
  visitorId: string,
  skipReason: string
): Promise<void> {
  await supabase
    .from("macwall_trial_ended_queue")
    .update({
      status: "cancelled",
      skip_reason: skipReason,
      updated_at: new Date().toISOString(),
    })
    .eq("visitor_id", visitorId)
    .eq("status", "pending")
}

async function leadUnsubscribed(
  supabase: ReturnType<typeof createClient>,
  visitorId: string,
  email: string
): Promise<boolean> {
  const { data } = await supabase
    .from("macwall_trial_leads")
    .select("unsubscribed_at")
    .eq("visitor_id", visitorId)
    .maybeSingle()
  if (data?.unsubscribed_at) return true

  const { data: byEmail } = await supabase
    .from("macwall_trial_leads")
    .select("unsubscribed_at")
    .eq("email", email.trim().toLowerCase())
    .not("unsubscribed_at", "is", null)
    .limit(1)
  return Boolean(byEmail?.[0]?.unsubscribed_at)
}

async function enqueueLadderFollowUps(
  supabase: ReturnType<typeof createClient>,
  input: { visitorId: string; email: string; sentAtMs: number }
): Promise<void> {
  const now = Date.now()
  const age = now - input.sentAtMs
  const twentyAt =
    age >= LADDER_20_AFTER_MS
      ? new Date(now + 5 * 60 * 1000)
      : new Date(input.sentAtMs + LADDER_20_AFTER_MS)
  const thirtyAt =
    age >= LADDER_30_AFTER_MS
      ? new Date(now + 30 * 60 * 1000)
      : new Date(input.sentAtMs + LADDER_30_AFTER_MS)

  const rows = [
    { step: "ladder_20" as const, at: twentyAt.toISOString() },
    { step: "ladder_30" as const, at: thirtyAt.toISOString() },
  ]

  for (const follow of rows) {
    const { data: existing } = await supabase
      .from("macwall_trial_ended_queue")
      .select("id")
      .eq("visitor_id", input.visitorId)
      .eq("step", follow.step)
      .maybeSingle()
    if (existing) continue

    await supabase.from("macwall_trial_ended_queue").insert({
      visitor_id: input.visitorId,
      email: input.email,
      step: follow.step,
      scheduled_send_at: follow.at,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
  }
}

async function processQueueRow(args: {
  row: QueueRow
  supabase: ReturnType<typeof createClient>
  resendKey: string
  from: string
  appName: string
}): Promise<"sent" | "skipped" | "failed" | "rate_limited"> {
  const { row, supabase, resendKey, from, appName } = args
  const step = parseStep(row.step)
  if (!step) {
    await markQueueRow(supabase, row.id, {
      status: "skipped",
      skip_reason: "invalid_step",
    })
    return "skipped"
  }

  const email = row.email.trim().toLowerCase()
  if (!email) {
    await markQueueRow(supabase, row.id, {
      status: "skipped",
      skip_reason: "no_email",
    })
    return "skipped"
  }

  const { data: converted } = await supabase.rpc("macwall_email_converted", {
    p_email: email,
  })
  if (converted === true) {
    await cancelPendingForVisitor(supabase, row.visitor_id, "converted")
    await markQueueRow(supabase, row.id, {
      status: "cancelled",
      skip_reason: "converted",
    })
    return "skipped"
  }

  if (await leadUnsubscribed(supabase, row.visitor_id, email)) {
    await cancelPendingForVisitor(supabase, row.visitor_id, "unsubscribed")
    await markQueueRow(supabase, row.id, {
      status: "cancelled",
      skip_reason: "unsubscribed",
    })
    return "skipped"
  }

  const promo = trialEndedPromo(step)
  const untilUnix = promo.expiresHours
    ? Math.floor(Date.now() / 1000) + promo.expiresHours * 3600
    : undefined
  const href = checkoutHref(promo.code, untilUnix)
  const unsub = await unsubscribeUrlsFor(email)
  const html = buildTrialEndedEmailHtml({
    step,
    appName,
    checkoutHref: href,
    unsubscribeHref: unsub?.page ?? null,
  })
  const text = buildTrialEndedEmailPlainText({
    step,
    appName,
    checkoutHref: href,
    unsubscribeHref: unsub?.page ?? null,
  })

  const { error: insErr } = await supabase
    .from("macwall_trial_ended_emails")
    .insert({
      visitor_id: row.visitor_id,
      step,
      customer_email: email,
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
    console.error(
      "[process-trial-ended-emails] audit_insert_failed_continuing",
      insErr.message
    )
  }

  const headers: { name: string; value: string }[] = []
  if (unsub?.oneClick) {
    headers.push({ name: "List-Unsubscribe", value: `<${unsub.oneClick}>` })
    headers.push({
      name: "List-Unsubscribe-Post",
      value: "List-Unsubscribe=One-Click",
    })
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `trial-ended/${row.visitor_id}/${step}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: trialEndedCopy(step, appName).subject,
        html,
        text,
        headers: headers.length > 0 ? headers : undefined,
        tags: [
          { name: "category", value: "trial_ended" },
          { name: "step", value: step },
        ],
      }),
    })

    if (!res.ok) {
      await supabase
        .from("macwall_trial_ended_emails")
        .delete()
        .eq("visitor_id", row.visitor_id)
        .eq("step", step)
      console.error("[process-trial-ended-emails] resend_failed", res.status)
      if (res.status === 429) return "rate_limited"
      return "failed"
    }

    const body = (await res.json().catch(() => null)) as { id?: string } | null
    await markQueueRow(supabase, row.id, {
      status: "sent",
      sent_at: new Date().toISOString(),
      resend_id: body?.id ?? null,
    })
  } catch (e) {
    await supabase
      .from("macwall_trial_ended_emails")
      .delete()
      .eq("visitor_id", row.visitor_id)
      .eq("step", step)
    console.error(
      "[process-trial-ended-emails] resend_exception",
      e instanceof Error ? e.message : "error"
    )
    return "failed"
  }

  if (step === "ended") {
    await enqueueLadderFollowUps(supabase, {
      visitorId: row.visitor_id,
      email,
      sentAtMs: Date.now(),
    })
  }

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"

  if (!supabaseUrl || !supabaseServiceKey || !resendKey || !from) {
    return Response.json(
      { ok: false, error: "missing_config" },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: enqueued, error: enqueueError } = await supabase.rpc(
    "enqueue_macwall_trial_ended_emails",
    { p_limit: ENQUEUE_LIMIT }
  )
  if (enqueueError) {
    console.error(
      "[process-trial-ended-emails] enqueue_failed",
      enqueueError.message
    )
  }

  const now = new Date().toISOString()
  const { data: rows, error } = await supabase
    .from("macwall_trial_ended_queue")
    .select("id, visitor_id, email, step")
    .eq("status", "pending")
    .lte("scheduled_send_at", now)
    .order("scheduled_send_at", { ascending: true })
    .limit(SEND_LIMIT)

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  let failed = 0
  let rateLimited = false

  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow({
      row,
      supabase,
      resendKey,
      from,
      appName,
    })
    if (result === "sent") sent += 1
    else if (result === "skipped") skipped += 1
    else if (result === "rate_limited") {
      failed += 1
      rateLimited = true
      break
    } else failed += 1
    await sleep(SEND_GAP_MS)
  }

  return Response.json({
    ok: true,
    enqueued: typeof enqueued === "number" ? enqueued : 0,
    processed: (rows ?? []).length,
    sent,
    skipped,
    failed,
    rate_limited: rateLimited,
  })
})
