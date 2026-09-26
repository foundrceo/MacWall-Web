/**
 * Transactional email HTML — admin preview source of truth.
 * Live trial-ended sends use `emails/trial-ended.tsx` via Resend.
 * License and recovery still send from the matching Edge Functions.
 */

import {
  appendEmailCheckoutUtm,
  trialEndedUtmCampaign,
  type EmailCheckoutUtmCampaign,
} from "@/lib/email/email-checkout-utm"
import {
  trialEndedCopy,
  trialEndedPlainText,
  trialEndedPromo,
  type TrialEndedEmailStep,
} from "@/lib/email/trial-ended-copy"

export const EMAIL_APP_NAME = "MacWall"
export const EMAIL_SITE_URL = "https://macwall.app"
export const EMAIL_SUPPORT = "support@macwall.app"
/** Small optimized asset for mail — never the 1024×1024 marketing PNG. */
export const EMAIL_LOGO_URL = `${EMAIL_SITE_URL}/email/macwall-icon.png`
export const EMAIL_FROM_DISPLAY = "MacWall <licenses@macwall.app>"

/** Stripe allowlisted promo — auto-applied via checkout `promo=` param. */
export const EMAIL_RECOVERY_PROMO_CODE = "WALL10"
export const EMAIL_RECOVERY_PROMO_PERCENT = "10%"

export const SAMPLE_LICENSE_KEY = "MW-PRO3-K7X2-9M4Q-B1NW"

/** Inbox subject — calm, clear, matches the email headline. */
export function licenseEmailSubject(appName = EMAIL_APP_NAME): string {
  return `Your ${appName} Pro license`
}

/**
 * Conversion subject — action hook (Claim…) so the inbox line pulls a click.
 * Code + product in the preheader.
 */
export function recoveryEmailSubject(appName = EMAIL_APP_NAME): string {
  return `Claim ${EMAIL_RECOVERY_PROMO_PERCENT} off ${appName} Pro`
}

/** Gmail preview line beside the subject. */
export function licenseEmailPreheader(appName = EMAIL_APP_NAME): string {
  return `Open ${appName} on your Mac to activate.`
}

export function recoveryEmailPreheader(): string {
  return `Code ${EMAIL_RECOVERY_PROMO_CODE} · tap to finish checkout`
}

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

function licenseEmailLinks(licenseKey: string): {
  activateHref: string
  deepLink: string
} {
  const encoded = encodeURIComponent(licenseKey)
  return {
    activateHref: `${EMAIL_SITE_URL}/activate?key=${encoded}`,
    deepLink: `macwall://activate?key=${encoded}`,
  }
}

function checkoutHref(
  promoCode?: string,
  untilUnix?: number,
  lead?: { email?: string | null; visitorId?: string | null },
  utm?: { medium: "recovery" | "trial_ended"; campaign: EmailCheckoutUtmCampaign }
): string {
  const base = `${EMAIL_SITE_URL}/api/checkout/create-session?offer=permanent`
  const params = new URLSearchParams()
  const code = promoCode?.trim()
  if (code) params.set("promo", code)
  if (untilUnix && untilUnix > 0) params.set("until", String(untilUnix))
  const email = lead?.email?.trim().toLowerCase()
  if (email) params.set("email", email)
  const visitorId = lead?.visitorId?.trim()
  if (visitorId) params.set("visitor_id", visitorId)
  if (utm) {
    appendEmailCheckoutUtm(params, utm)
  } else {
    appendEmailCheckoutUtm(params, { medium: "recovery", campaign: "wall10" })
  }
  const query = params.toString()
  return query ? `${base}&${query}` : base
}

export {
  EMAIL_TRIAL_LADDER_20,
  EMAIL_TRIAL_LADDER_30,
  EMAIL_TRIAL_PROMO_CODE,
  EMAIL_TRIAL_PROMO_PERCENT,
  trialEndedCopy,
  trialEndedPromo,
  type TrialEndedEmailStep,
} from "@/lib/email/trial-ended-copy"

export function trialEndedEmailSubject(
  step: TrialEndedEmailStep,
  appName = EMAIL_APP_NAME
): string {
  return trialEndedCopy(step, appName).subject
}

export function trialEndedEmailPreheader(step: TrialEndedEmailStep): string {
  return trialEndedCopy(step).preheader
}

/** Card: content → CTA → note → © → legal. */
function emailShell(args: {
  title: string
  preheader: string
  cardInner: string
  footnote: string
}): string {
  const { title, preheader, cardInner, footnote } = args
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
                      &copy; ${year} ${escapeHtml(EMAIL_APP_NAME)}. All rights reserved.
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

function brandMark(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td class="mw-pad" valign="top" align="center" style="padding:36px 26px 12px;text-align:center;">
        <img src="${escapeHtml(EMAIL_LOGO_URL)}" width="36" height="36" alt="${escapeHtml(EMAIL_APP_NAME)}" style="display:inline-block;width:36px;height:36px;border:0;border-radius:9px;">
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

export function buildLicenseEmailHtml(args: {
  appName?: string
  licenseKey?: string
  maxDevices?: number
}): string {
  const appName = args.appName ?? EMAIL_APP_NAME
  const licenseKey = args.licenseKey ?? SAMPLE_LICENSE_KEY
  const maxDevices = args.maxDevices ?? 3
  const macsLabel =
    maxDevices === 1 ? "Works on 1 Mac" : `Works on up to ${maxDevices} Macs`
  const { deepLink } = licenseEmailLinks(licenseKey)

  const cardInner = `
    ${brandMark()}
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
  })
}

export function buildPaymentRecoveryEmailHtml(args?: {
  appName?: string
  checkoutHref?: string
  promoCode?: string
  promoPercent?: string
}): string {
  const appName = args?.appName ?? EMAIL_APP_NAME
  const promoCode = args?.promoCode ?? EMAIL_RECOVERY_PROMO_CODE
  const promoPercent = args?.promoPercent ?? EMAIL_RECOVERY_PROMO_PERCENT
  const href =
    args?.checkoutHref ?? checkoutHref(promoCode)

  /**
   * Conversion flow (abandoned / failed / incomplete checkout):
   * 1) Offer in headline (not a yes/no question)
   * 2) One value line — no shame, no regional $
   * 3) Code as the gift (visual highlight)
   * 4) One CTA — promo already on the URL; code is backup + trust
   */
  const cardInner = `
    ${brandMark()}
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

export function buildLicenseEmailPlainText(args: {
  appName?: string
  licenseKey?: string
  maxDevices?: number
}): string {
  const appName = args.appName ?? EMAIL_APP_NAME
  const licenseKey = args.licenseKey ?? SAMPLE_LICENSE_KEY
  const maxDevices = args.maxDevices ?? 3
  const macsLabel = maxDevices === 1 ? "1 Mac" : `up to ${maxDevices} Macs`
  const { activateHref, deepLink } = licenseEmailLinks(licenseKey)
  return (
    `Your ${appName} Pro license\n\n` +
    `Thanks for purchasing ${appName} Pro. Open the app on your Mac to activate, or paste the key below.\n\n` +
    `License key (${macsLabel}): ${licenseKey}\n\n` +
    `Activate: ${deepLink}\n` +
    `Or: ${activateHref}\n\n` +
    `Help: ${EMAIL_SUPPORT}`
  )
}

export function buildRecoveryEmailPlainText(args?: {
  appName?: string
  checkoutHref?: string
  promoCode?: string
  promoPercent?: string
}): string {
  const appName = args?.appName ?? EMAIL_APP_NAME
  const promoCode = args?.promoCode ?? EMAIL_RECOVERY_PROMO_CODE
  const promoPercent = args?.promoPercent ?? EMAIL_RECOVERY_PROMO_PERCENT
  const href = args?.checkoutHref ?? checkoutHref(promoCode)
  return (
    `${promoPercent} off ${appName} Pro\n\n` +
    `Your checkout is still open. Unlock 1,000+ live wallpapers and Lock Screen with a one-time Pro license.\n\n` +
    `Code ${promoCode} (${promoPercent} off — auto-applied):\n${href}\n\n` +
    `Already paid? You can ignore this email.\n\n` +
    `Help: ${EMAIL_SUPPORT}`
  )
}

export function buildTrialEndedEmailHtml(args: {
  step: TrialEndedEmailStep
  appName?: string
  checkoutHref?: string
  unsubscribeHref?: string
}): string {
  const appName = args.appName ?? EMAIL_APP_NAME
  const copy = trialEndedCopy(args.step, appName)
  const promo = trialEndedPromo(args.step)
  const untilUnix = promo.expiresHours
    ? Math.floor(Date.now() / 1000) + promo.expiresHours * 3600
    : undefined
  const href =
    args.checkoutHref ??
    checkoutHref(promo.code, untilUnix, undefined, {
      medium: "trial_ended",
      campaign: trialEndedUtmCampaign(args.step),
    })
  const unsub = args.unsubscribeHref?.trim()
  const footnote = unsub
    ? `Already paid? Ignore this email. <a href="${escapeHtml(unsub)}" class="mw-link" style="color:#888888;text-decoration:underline;">Unsubscribe</a>`
    : `Already paid? Ignore this email.`

  const cardInner = `
    ${brandMark()}
    ${trialHeadline(copy.headline)}
    ${bodyCopy(escapeHtml(copy.body))}
    ${highlightBlock({
      label: copy.codeLabel,
      value: promo.code,
      hint: copy.codeHint,
    })}
    ${textLinkCta(href, copy.cta)}
  `

  return emailShell({
    title: copy.subject,
    preheader: copy.preheader,
    cardInner,
    footnote,
  })
}

export function buildTrialEndedEmailPlainText(args: {
  step: TrialEndedEmailStep
  appName?: string
  checkoutHref?: string
  unsubscribeHref?: string
}): string {
  const appName = args.appName ?? EMAIL_APP_NAME
  const promo = trialEndedPromo(args.step)
  const untilUnix = promo.expiresHours
    ? Math.floor(Date.now() / 1000) + promo.expiresHours * 3600
    : undefined
  const href =
    args.checkoutHref ??
    checkoutHref(promo.code, untilUnix, undefined, {
      medium: "trial_ended",
      campaign: trialEndedUtmCampaign(args.step),
    })
  return trialEndedPlainText({
    step: args.step,
    appName,
    checkoutHref: href,
    unsubscribeHref: args.unsubscribeHref,
    supportEmail: EMAIL_SUPPORT,
  })
}

export type AdminEmailTemplateId =
  | "license-1"
  | "license-3"
  | "license-5"
  | "checkout-recovery"
  | "trial-ended"
  | "trial-ended-20"
  | "trial-ended-30"

export type AdminEmailTemplate = {
  id: AdminEmailTemplateId
  label: string
  description: string
  subject: string
  from: string
  trigger: string
  edgeFunction: string
  tone: "green" | "blue" | "amber" | "violet"
  buildHtml: () => string
}

export const ADMIN_EMAIL_TEMPLATES: readonly AdminEmailTemplate[] = [
  {
    id: "license-1",
    label: "License key (1 Mac)",
    description: "Paid checkout — 1 Mac license.",
    subject: licenseEmailSubject(),
    from: EMAIL_FROM_DISPLAY,
    trigger: "Stripe checkout.session.completed (paid)",
    edgeFunction: "stripe-license-email",
    tone: "green",
    buildHtml: () => buildLicenseEmailHtml({ maxDevices: 1 }),
  },
  {
    id: "license-3",
    label: "License key (3 Macs)",
    description: "Paid checkout — default Pro (up to 3 Macs).",
    subject: licenseEmailSubject(),
    from: EMAIL_FROM_DISPLAY,
    trigger: "Stripe checkout.session.completed (paid)",
    edgeFunction: "stripe-license-email",
    tone: "green",
    buildHtml: () => buildLicenseEmailHtml({ maxDevices: 3 }),
  },
  {
    id: "license-5",
    label: "License key (5 Macs)",
    description: "Paid checkout — Pro+ multi-Mac pack.",
    subject: licenseEmailSubject(),
    from: EMAIL_FROM_DISPLAY,
    trigger: "Stripe checkout.session.completed (paid)",
    edgeFunction: "stripe-license-email",
    tone: "green",
    buildHtml: () => buildLicenseEmailHtml({ maxDevices: 5 }),
  },
  {
    id: "checkout-recovery",
    label: "Checkout recovery",
    description: `Abandoned / failed / incomplete checkout — ${EMAIL_RECOVERY_PROMO_PERCENT} off with ${EMAIL_RECOVERY_PROMO_CODE}.`,
    subject: recoveryEmailSubject(),
    from: EMAIL_FROM_DISPLAY,
    trigger: "process-checkout-recovery cron",
    edgeFunction: "process-checkout-recovery",
    tone: "amber",
    buildHtml: () => buildPaymentRecoveryEmailHtml(),
  },
  {
    id: "trial-ended",
    label: "Trial ended (10% off)",
    description:
      "Mail 1, 24h after trial start, only if they did not buy. Headline: Your trial ended. WALL10.",
    subject: trialEndedEmailSubject("ended"),
    from: EMAIL_FROM_DISPLAY,
    trigger: "process-trial-ended-emails cron, 24h after trial start",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
    buildHtml: () =>
      buildTrialEndedEmailHtml({
        step: "ended",
        unsubscribeHref: `${EMAIL_SITE_URL}/unsubscribe/trial`,
      }),
  },
  {
    id: "trial-ended-20",
    label: "Trial follow-up (20% off)",
    description: "Mail 2, 24h after mail 1. Headline: 20% off Pro. R7N2WP8J.",
    subject: trialEndedEmailSubject("ladder_20"),
    from: EMAIL_FROM_DISPLAY,
    trigger: "process-trial-ended-emails cron, 24h after first send",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
    buildHtml: () =>
      buildTrialEndedEmailHtml({
        step: "ladder_20",
        unsubscribeHref: `${EMAIL_SITE_URL}/unsubscribe/trial`,
      }),
  },
  {
    id: "trial-ended-30",
    label: "Trial follow-up (30% off)",
    description: "Mail 3, 48h after mail 1. Headline: 30% off Pro. B3H9KF5Q.",
    subject: trialEndedEmailSubject("ladder_30"),
    from: EMAIL_FROM_DISPLAY,
    trigger: "process-trial-ended-emails cron, 48h after first send",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
    buildHtml: () =>
      buildTrialEndedEmailHtml({
        step: "ladder_30",
        unsubscribeHref: `${EMAIL_SITE_URL}/unsubscribe/trial`,
      }),
  },
]
