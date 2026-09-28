/**
 * Marketing lifecycle emails (trial + checkout recovery).
 *
 * Pure TypeScript with no runtime imports: used by the Supabase Edge
 * Functions that send the mail and by the admin preview in the Next app, so
 * both always show the same content.
 *
 * Sequences (each stops on purchase or unsubscribe):
 *   Trial:    trial_ended (day 0, 10%) → trial_reminder (day 2, Reel refund)
 *             → trial_last_call (day 6, 20% for 48h)
 *   Checkout: recovery_saved (~1h after abandoning, no discount)
 *             → recovery_10 (day 1, 10%) → recovery_last_call (day 3, 20% for 48h)
 *
 * Copy rules: plain words, no em dashes, one primary button, no fake urgency.
 */

export const LIFECYCLE_PROMO = {
  /** 10% off, no expiry. */
  ten: { code: "WALL10", percent: "10%" },
  /** 20% off, enforced for 48h via the checkout `until` param. */
  twenty: { code: "R7N2WP8J", percent: "20%", validHours: 48 },
} as const

export type LifecycleEmailId =
  | "trial_ended"
  | "trial_reminder"
  | "trial_last_call"
  | "recovery_saved"
  | "recovery_10"
  | "recovery_last_call"

export type LifecycleEmailContext = {
  appName: string
  siteUrl: string
  logoUrl: string
  supportEmail: string
  /** Primary button target (checkout link with promo already applied). */
  checkoutHref: string
  /** Signed unsubscribe page, when available. */
  unsubscribeHref: string | null
  /** Optional postal address for the footer (CAN-SPAM). */
  postalAddress?: string | null
  /** Recovery only: e.g. "MacWall Pro (3 Macs)". */
  planLabel?: string | null
  /** Recovery only: e.g. "₹499" or "$12.99". */
  priceLabel?: string | null
}

export type LifecycleEmail = {
  subject: string
  preheader: string
  html: string
  text: string
}

type Copy = {
  subject: string
  preheader: string
  headline: string
  paragraphs: string[]
  /** Small summary line, e.g. plan and price. */
  summary?: string | null
  code?: { code: string; hint: string } | null
  button: string
  secondaryLink?: { label: string; href: string } | null
  ps?: string | null
  /** Why they are getting this mail (footer). */
  reason: string
}

function copyFor(id: LifecycleEmailId, ctx: LifecycleEmailContext): Copy {
  const app = ctx.appName
  const plan = ctx.planLabel?.trim() || `${app} Pro`
  const ten = LIFECYCLE_PROMO.ten
  const twenty = LIFECYCLE_PROMO.twenty
  const trialReason = `You're getting this because you tried ${app} on your Mac.`
  const checkoutReason = `You're getting this because you started a checkout on ${hostOf(ctx.siteUrl)}.`

  switch (id) {
    case "trial_ended":
      return {
        subject: `Your ${app} trial has ended`,
        preheader: `Your wallpapers are still in the app. Here's ${ten.percent} off Pro.`,
        headline: "Your trial has ended",
        paragraphs: [
          `Thanks for trying ${app}. Your live wallpapers are paused now, but everything you picked is still in the app.`,
          "Pro turns them back on and unlocks the full catalog: 1,000+ live 4K wallpapers, the live Lock Screen on macOS 26, and your own videos as wallpapers.",
          "It's a single payment, not a subscription. Every future update is included, and one license covers up to 3 Macs.",
        ],
        code: {
          code: ten.code,
          hint: `${ten.percent} off, applied automatically with the button below.`,
        },
        button: `Get ${app} Pro`,
        ps: "Questions before you buy? Reply to this email and a real person will answer.",
        reason: trialReason,
      }
    case "trial_reminder":
      return {
        subject: `Want ${app} Pro for free?`,
        preheader: "Post one Reel of your desktop and get up to 100% of your money back.",
        headline: "Get Pro for free with a Reel",
        paragraphs: [
          `Here's a way to get ${app} Pro without paying for it.`,
          `Buy Pro, then post a short Reel or TikTok of ${app} running on your Mac with #macwall. At 2,000 views we refund half. At 20,000 views we refund all of it.`,
          `Your ${ten.percent} code still works too.`,
        ],
        code: {
          code: ten.code,
          hint: `${ten.percent} off, applied automatically with the button below.`,
        },
        button: `Get ${app} Pro`,
        secondaryLink: {
          label: "How the Reel refund works",
          href: `${ctx.siteUrl}/creator`,
        },
        reason: trialReason,
      }
    case "trial_last_call":
      return {
        subject: `Last reminder: ${twenty.percent} off ${app} Pro`,
        preheader: `${twenty.percent} off for the next 48 hours. This is the last email about your trial.`,
        headline: `${twenty.percent} off for 48 hours`,
        paragraphs: [
          "This is the last email we'll send about your trial.",
          `If ${app} isn't for you, no problem at all. If it is, here's ${twenty.percent} off Pro for the next 48 hours. One payment, yours forever, with free updates.`,
        ],
        code: {
          code: twenty.code,
          hint: `${twenty.percent} off for the next 48 hours, applied automatically.`,
        },
        button: `Get Pro for ${twenty.percent} off`,
        reason: trialReason,
      }
    case "recovery_saved":
      return {
        subject: `Your ${app} checkout`,
        preheader: `${plan} is saved for you. Finish in one tap.`,
        headline: "Your checkout is saved",
        paragraphs: [
          `You started buying ${plan} but didn't finish. You can pick up right where you left off.`,
          "Your license key arrives by email the moment you pay, and it's yours forever with free updates.",
          "If the payment didn't go through or something looked off, reply to this email and we'll help.",
        ],
        summary: summaryLine(plan, ctx.priceLabel),
        button: "Finish checkout",
        reason: checkoutReason,
      }
    case "recovery_10":
      return {
        subject: `${ten.percent} off your ${app} checkout`,
        preheader: `Your ${plan} checkout, now with ${ten.percent} off.`,
        headline: `Here's ${ten.percent} off`,
        paragraphs: [
          `Still thinking about ${plan}? Here's ${ten.percent} off to make it easier.`,
          "Pay once and keep it forever. No subscription, and every update is included.",
        ],
        summary: summaryLine(plan, ctx.priceLabel),
        code: {
          code: ten.code,
          hint: `${ten.percent} off, applied automatically with the button below.`,
        },
        button: `Finish checkout with ${ten.percent} off`,
        reason: checkoutReason,
      }
    case "recovery_last_call":
      return {
        subject: `Last reminder: ${twenty.percent} off ${app} Pro`,
        preheader: `${twenty.percent} off for the next 48 hours. This is the last email about your checkout.`,
        headline: `${twenty.percent} off for 48 hours`,
        paragraphs: [
          "This is the last email about your checkout.",
          `Here's ${twenty.percent} off ${plan} for the next 48 hours. After that, we'll leave you alone.`,
        ],
        summary: summaryLine(plan, ctx.priceLabel),
        code: {
          code: twenty.code,
          hint: `${twenty.percent} off for the next 48 hours, applied automatically.`,
        },
        button: `Finish checkout with ${twenty.percent} off`,
        reason: checkoutReason,
      }
  }
}

function summaryLine(plan: string, price?: string | null): string {
  return price ? `${plan} · ${price} · one-time payment` : `${plan} · one-time payment`
}

function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

function renderHtml(copy: Copy, ctx: LifecycleEmailContext): string {
  const p = (text: string) =>
    `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:#333333;">${escapeHtml(text)}</p>`

  const summary = copy.summary
    ? `<p style="margin:0 0 20px;font-family:${FONT};font-size:14px;line-height:1.5;color:#111111;font-weight:600;">${escapeHtml(copy.summary)}</p>`
    : ""

  const code = copy.code
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 24px;">
  <tr><td style="background:#f5f5f7;border-radius:10px;padding:16px 18px;">
    <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;color:#6e6e73;">Your code</p>
    <p style="margin:0;font-family:${MONO};font-size:20px;font-weight:600;letter-spacing:0.06em;color:#111111;">${escapeHtml(copy.code.code)}</p>
    <p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:1.45;color:#6e6e73;">${escapeHtml(copy.code.hint)}</p>
  </td></tr>
</table>`
    : ""

  const button = `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;">
  <tr><td bgcolor="#0071e3" style="border-radius:980px;">
    <a href="${escapeHtml(ctx.checkoutHref)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:980px;">${escapeHtml(copy.button)}</a>
  </td></tr>
</table>`

  const secondary = copy.secondaryLink
    ? `<p style="margin:0 0 20px;font-family:${FONT};font-size:15px;line-height:1.5;"><a href="${escapeHtml(copy.secondaryLink.href)}" style="color:#0071e3;text-decoration:none;">${escapeHtml(copy.secondaryLink.label)} &rsaquo;</a></p>`
    : ""

  const ps = copy.ps
    ? `<p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.5;color:#6e6e73;">${escapeHtml(copy.ps)}</p>`
    : ""

  const unsubscribe = ctx.unsubscribeHref
    ? ` <a href="${escapeHtml(ctx.unsubscribeHref)}" style="color:#86868b;text-decoration:underline;">Unsubscribe</a>.`
    : ""
  const address = ctx.postalAddress?.trim()
    ? `<br>${escapeHtml(ctx.postalAddress.trim())}`
    : ""
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;">${escapeHtml(copy.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">
  <tr><td align="center" style="padding:32px 20px 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
      <tr><td style="padding:0 0 24px;">
        <img src="${escapeHtml(ctx.logoUrl)}" width="40" height="40" alt="${escapeHtml(ctx.appName)}" style="display:block;width:40px;height:40px;border:0;border-radius:10px;">
      </td></tr>
      <tr><td>
        <h1 style="margin:0 0 18px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:700;color:#111111;">${escapeHtml(copy.headline)}</h1>
        ${copy.paragraphs.map(p).join("\n        ")}
        ${summary}
        ${code}
        ${button}
        ${secondary}
        ${ps}
      </td></tr>
      <tr><td style="padding-top:28px;border-top:1px solid #e5e5ea;">
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:#86868b;">
          ${escapeHtml(copy.reason)}${unsubscribe}<br>
          Need help? <a href="mailto:${escapeHtml(ctx.supportEmail)}" style="color:#86868b;text-decoration:underline;">${escapeHtml(ctx.supportEmail)}</a>${address}<br>
          &copy; ${year} ${escapeHtml(ctx.appName)}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function renderText(copy: Copy, ctx: LifecycleEmailContext): string {
  const lines: string[] = [copy.headline, "", ...copy.paragraphs.flatMap((p) => [p, ""])]
  if (copy.summary) lines.push(copy.summary, "")
  if (copy.code) lines.push(`Your code: ${copy.code.code}`, copy.code.hint, "")
  lines.push(`${copy.button}: ${ctx.checkoutHref}`, "")
  if (copy.secondaryLink) {
    lines.push(`${copy.secondaryLink.label}: ${copy.secondaryLink.href}`, "")
  }
  if (copy.ps) lines.push(copy.ps, "")
  lines.push("--", copy.reason)
  if (ctx.unsubscribeHref) lines.push(`Unsubscribe: ${ctx.unsubscribeHref}`)
  lines.push(`Help: ${ctx.supportEmail}`)
  if (ctx.postalAddress?.trim()) lines.push(ctx.postalAddress.trim())
  return lines.join("\n")
}

export function buildLifecycleEmail(
  id: LifecycleEmailId,
  ctx: LifecycleEmailContext
): LifecycleEmail {
  const copy = copyFor(id, ctx)
  return {
    subject: copy.subject,
    preheader: copy.preheader,
    html: renderHtml(copy, ctx),
    text: renderText(copy, ctx),
  }
}

/** Plain-English label for a checkout offer slug. */
export function planLabelForOffer(
  appName: string,
  offerSlug: string | null | undefined,
  maxDevices?: number | null
): string {
  const macs = maxDevices && maxDevices > 0 ? maxDevices : null
  if (offerSlug === "permanent_5" || offerSlug === "permanent_10" || (macs && macs >= 5)) {
    return `${appName} Pro+ (${macs ?? 5} Macs)`
  }
  return `${appName} Pro (${macs ?? 3} Macs)`
}

/** Common address typos and throwaway patterns that always bounce. */
const TYPO_DOMAINS = new Set([
  "gmial.com", "gmai.com", "gamil.com", "gmail.co", "gmail.con", "gmal.com",
  "gnail.com", "gmaill.com", "hotmial.com", "hotmail.co", "hotmai.com",
  "yaho.com", "yahoo.co", "yahooo.com", "outlok.com", "outlook.co",
  "icloud.co", "iclod.com", "example.com", "test.com",
])

/** Cheap syntax + typo check before any DNS lookup. */
export function emailLooksDeliverable(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/.test(normalized)) return false
  const domain = normalized.split("@")[1] ?? ""
  return !TYPO_DOMAINS.has(domain)
}
