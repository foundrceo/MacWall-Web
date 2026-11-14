/**
 * The license email a buyer gets the moment Stripe confirms payment.
 *
 * Pure TypeScript with no runtime imports: stripe-license-email sends it and
 * the admin preview in the Next app renders the same function, so the two
 * cannot drift apart. Uses the shared layout in ./email-layout.ts.
 */

import {
  renderEmailHtml,
  renderEmailText,
  type EmailBrand,
  type EmailContent,
} from "./email-layout.ts"

export type LicenseEmailArgs = {
  appName: string
  /** Real sends: the buyer's key, never a sample. */
  licenseKey: string
  maxDevices: number
  siteUrl: string
  logoUrl: string
  supportEmail: string
}

export type LicenseEmail = {
  subject: string
  preheader: string
  html: string
  text: string
}

export function licenseEmailSubject(appName = "MacWall"): string {
  return `Your ${appName} Pro license`
}

/**
 * The button uses the https activate page, not the `macwall://` link: Gmail
 * and Outlook drop links with a custom scheme, which left those buyers with a
 * button that did nothing. The page opens the app and falls back to showing
 * the key. The plain-text part carries both links.
 */
function licenseEmailLinks(siteUrl: string, licenseKey: string) {
  const encoded = encodeURIComponent(licenseKey)
  return {
    activateHref: `${siteUrl.replace(/\/+$/, "")}/activate?key=${encoded}`,
    deepLink: `macwall://activate?key=${encoded}`,
  }
}

export function buildLicenseEmail(args: LicenseEmailArgs): LicenseEmail {
  const { appName, licenseKey, maxDevices } = args
  if (!licenseKey.trim()) {
    throw new Error("buildLicenseEmail: licenseKey required")
  }
  const { activateHref, deepLink } = licenseEmailLinks(args.siteUrl, licenseKey)
  const macs = maxDevices === 1 ? "1 Mac" : `up to ${maxDevices} Macs`

  const content: EmailContent = {
    subject: licenseEmailSubject(appName),
    preheader: `Your license key is inside. Activate ${appName} Pro on your Mac in one click.`,
    headline: `Your ${appName} Pro license`,
    paragraphs: [
      `Thanks for buying ${appName} Pro. Click the button on your Mac to activate, or paste the key into the app.`,
    ],
    info: [
      {
        label: "License key",
        value: licenseKey,
        hint: `Works on ${macs}`,
        mono: true,
      },
    ],
    button: { label: `Activate ${appName} Pro`, href: activateHref },
    note: "Keep this email. You'll need the key to activate another Mac.",
    reason: `You got this because you bought ${appName} Pro.`,
  }
  const brand: EmailBrand = {
    appName,
    siteUrl: args.siteUrl,
    logoUrl: args.logoUrl,
    supportEmail: args.supportEmail,
  }

  return {
    subject: content.subject,
    preheader: content.preheader,
    html: renderEmailHtml(content, brand),
    // The app link works when the mail is read as plain text on the Mac.
    text: `${renderEmailText(content, brand)}\nOpen in the app: ${deepLink}`,
  }
}
