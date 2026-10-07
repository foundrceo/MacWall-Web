/**
 * Admin previews for every email. License mail mirrors the
 * stripe-license-email Edge Function; trial and checkout-recovery mail
 * render the exact templates the Edge Functions send
 * (supabase/functions/_shared/lifecycle-emails.ts).
 */

import {
  buildLifecycleEmail,
  planLabelForOffer,
  type LifecycleEmailId,
} from "@/supabase/functions/_shared/lifecycle-emails"

export const EMAIL_APP_NAME = "MacWall"
export const EMAIL_SITE_URL = "https://macwall.app"
export const EMAIL_SUPPORT = "support@macwall.app"
/** Small optimized asset for mail — never the 1024×1024 marketing PNG. */
export const EMAIL_LOGO_URL = `${EMAIL_SITE_URL}/email/macwall-icon.png`
export const EMAIL_FROM_DISPLAY = "MacWall <licenses@macwall.app>"

export const SAMPLE_LICENSE_KEY = "MW-PRO3-K7X2-9M4Q-B1NW"

/** Inbox subject — calm, clear, matches the email headline. */
export function licenseEmailSubject(appName = EMAIL_APP_NAME): string {
  return `Your ${appName} Pro license`
}

/** Gmail preview line beside the subject. */
export function licenseEmailPreheader(appName = EMAIL_APP_NAME): string {
  return `Open ${appName} on your Mac to activate.`
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

export type AdminEmailTemplateId =
  | "license-3"
  | "license-5"
  | "license-10"
  | LifecycleEmailId

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

function licenseTemplate(maxDevices: number, label: string): AdminEmailTemplate {
  return {
    id: `license-${maxDevices}` as AdminEmailTemplateId,
    label,
    description: `Paid checkout, ${maxDevices} Macs.`,
    subject: licenseEmailSubject(),
    from: EMAIL_FROM_DISPLAY,
    trigger: "Stripe checkout.session.completed (paid)",
    edgeFunction: "stripe-license-email",
    tone: "green",
    buildHtml: () => buildLicenseEmailHtml({ maxDevices }),
  }
}

function lifecyclePreview(id: LifecycleEmailId) {
  const recovery = id.startsWith("recovery")
  return buildLifecycleEmail(id, {
    appName: EMAIL_APP_NAME,
    siteUrl: EMAIL_SITE_URL,
    logoUrl: EMAIL_LOGO_URL,
    supportEmail: EMAIL_SUPPORT,
    checkoutHref: `${EMAIL_SITE_URL}/pricing`,
    unsubscribeHref: `${EMAIL_SITE_URL}/unsubscribe/trial`,
    planLabel: recovery ? planLabelForOffer(EMAIL_APP_NAME, "permanent") : null,
    priceLabel: recovery ? "$12.99" : null,
    updateVersion: id.startsWith("app_update") ? "4.0.7" : null,
    downloadHref: id.startsWith("app_update") ? `${EMAIL_SITE_URL}/download` : null,
  })
}

const LIFECYCLE_META: Record<
  LifecycleEmailId,
  { label: string; description: string; trigger: string; edgeFunction: string; tone: AdminEmailTemplate["tone"] }
> = {
  trial_ended: {
    label: "Trial 1: trial ended (10%)",
    description: "Sent when the 24-hour trial ends without a purchase. WALL10.",
    trigger: "process-trial-ended-emails cron, at trial end",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
  },
  trial_reminder: {
    label: "Trial 2: money back with a Reel",
    description: "2 days after trial 1. Reel refund angle, WALL10 still works.",
    trigger: "process-trial-ended-emails cron, +2 days",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
  },
  trial_last_call: {
    label: "Trial 3: last call (20%)",
    description: "6 days after trial 1. 20% for 48 hours, final email.",
    trigger: "process-trial-ended-emails cron, +6 days",
    edgeFunction: "process-trial-ended-emails",
    tone: "violet",
  },
  recovery_saved: {
    label: "Checkout 1: checkout saved",
    description: "About 1 hour after an opened checkout expires unpaid. No discount.",
    trigger: "Stripe checkout.session.expired (opened sessions only)",
    edgeFunction: "process-checkout-recovery",
    tone: "amber",
  },
  recovery_10: {
    label: "Checkout 2: 10% off",
    description: "1 day after checkout 1. WALL10.",
    trigger: "process-checkout-recovery cron, +1 day",
    edgeFunction: "process-checkout-recovery",
    tone: "amber",
  },
  recovery_last_call: {
    label: "Checkout 3: last call (20%)",
    description: "3 days after checkout 1. 20% for 48 hours, final email.",
    trigger: "process-checkout-recovery cron, +3 days",
    edgeFunction: "process-checkout-recovery",
    tone: "amber",
  },
  app_update_customer: {
    label: "App update: customers",
    description: "One-off per release: please update. Download button, no discount.",
    trigger: "send-app-update-emails, run by hand per release",
    edgeFunction: "send-app-update-emails",
    tone: "blue",
  },
  app_update_trial: {
    label: "App update: trial users",
    description: "One-off per release for trial users who never bought. No discount.",
    trigger: "send-app-update-emails, run by hand per release",
    edgeFunction: "send-app-update-emails",
    tone: "blue",
  },
  app_update_trial_offer: {
    label: "App update: trial users, 30% for 24h",
    description: "Release email with B3H9KF5Q, valid 24 hours from each send.",
    trigger: "send-app-update-emails with offer thirty_24h",
    edgeFunction: "send-app-update-emails",
    tone: "blue",
  },
  send_to_mac: {
    label: "Send to Mac: download link",
    description: "Phone or Windows visitor typed their email to get the link on their Mac.",
    trigger: "Email form on the phone hero and wallpaper pages",
    edgeFunction: "send-to-mac",
    tone: "green",
  },
  send_to_mac_reminder: {
    label: "Send to Mac: next-day reminder",
    description: "One reminder 24 hours after the link, skipped for buyers.",
    trigger: "Scheduled in Resend by send-to-mac",
    edgeFunction: "send-to-mac",
    tone: "green",
  },
}

export const ADMIN_EMAIL_TEMPLATES: readonly AdminEmailTemplate[] = [
  licenseTemplate(3, "License key (Pro, 3 Macs)"),
  licenseTemplate(5, "License key (Pro+, 5 Macs)"),
  licenseTemplate(10, "License key (Pro+, 10 Macs)"),
  ...(Object.keys(LIFECYCLE_META) as LifecycleEmailId[]).map((id) => ({
    id,
    ...LIFECYCLE_META[id],
    subject: lifecyclePreview(id).subject,
    from: EMAIL_FROM_DISPLAY,
    buildHtml: () => lifecyclePreview(id).html,
  })),
]
