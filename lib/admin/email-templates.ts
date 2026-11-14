/**
 * Admin previews for every email MacWall sends. Each preview calls the same
 * builder the Supabase Edge Functions send with
 * (supabase/functions/_shared/), so what you see here is what goes out.
 * Sample data only; nothing is sent from the admin.
 */

import { buildLicenseEmail } from "@/supabase/functions/_shared/license-email-template"
import {
  buildLifecycleEmail,
  planLabelForOffer,
  type LifecycleEmailId,
} from "@/supabase/functions/_shared/lifecycle-emails"

export const EMAIL_APP_NAME = "MacWall"
export const EMAIL_SITE_URL = "https://macwall.app"
export const EMAIL_SUPPORT = "support@macwall.app"
/** Small optimized asset for mail, never the 1024×1024 marketing PNG. */
export const EMAIL_LOGO_URL = `${EMAIL_SITE_URL}/email/macwall-icon.png`
export const EMAIL_FROM_DISPLAY = "MacWall <licenses@macwall.app>"

export const SAMPLE_LICENSE_KEY = "MW-PRO3-K7X2-9M4Q-B1NW"

/**
 * - automatic: the system sends it when something happens (a purchase, a
 *   trial ending, an abandoned checkout).
 * - campaign: a one-off sale, sent by hand.
 */
export type AdminEmailGroup = "automatic" | "campaign"

export type AdminEmailTemplateId = "license" | LifecycleEmailId

export type AdminEmailTemplate = {
  id: AdminEmailTemplateId
  group: AdminEmailGroup
  label: string
  /** When it goes out and what it offers. */
  description: string
  subject: string
  /** Inbox preview line shown next to the subject. */
  preheader: string
  from: string
  trigger: string
  edgeFunction: string
  buildHtml: () => string
}

function licensePreview() {
  return buildLicenseEmail({
    appName: EMAIL_APP_NAME,
    licenseKey: SAMPLE_LICENSE_KEY,
    maxDevices: 3,
    siteUrl: EMAIL_SITE_URL,
    logoUrl: EMAIL_LOGO_URL,
    supportEmail: EMAIL_SUPPORT,
  })
}

function lifecyclePreview(id: LifecycleEmailId) {
  const recovery = id.startsWith("recovery")
  const download = id.startsWith("send_to_mac")
  return buildLifecycleEmail(id, {
    appName: EMAIL_APP_NAME,
    siteUrl: EMAIL_SITE_URL,
    logoUrl: EMAIL_LOGO_URL,
    supportEmail: EMAIL_SUPPORT,
    checkoutHref: download
      ? `${EMAIL_SITE_URL}/download/latest`
      : id === "reel_refund"
        ? `${EMAIL_SITE_URL}/creator`
        : `${EMAIL_SITE_URL}/pricing`,
    unsubscribeHref: `${EMAIL_SITE_URL}/unsubscribe/trial`,
    planLabel: recovery ? planLabelForOffer(EMAIL_APP_NAME, "permanent") : null,
    priceLabel: recovery ? "$12.99" : null,
  })
}

type LifecycleMeta = Pick<
  AdminEmailTemplate,
  "group" | "label" | "description" | "trigger" | "edgeFunction"
>

/** In sending order within each flow; the admin list keeps this order. */
const LIFECYCLE_META: Record<LifecycleEmailId, LifecycleMeta> = {
  send_to_mac: {
    group: "automatic",
    label: "Send to Mac: download link",
    description:
      "A phone or Windows visitor asked for the link to open on their Mac.",
    trigger: "Email form on the phone hero and wallpaper pages",
    edgeFunction: "send-to-mac",
  },
  send_to_mac_reminder: {
    group: "automatic",
    label: "Send to Mac: reminder",
    description:
      "24 hours after the link, skipped for buyers. The only reminder.",
    trigger: "Scheduled in Resend by send-to-mac",
    edgeFunction: "send-to-mac",
  },
  trial_ended: {
    group: "automatic",
    label: "Trial 1: trial ended",
    description: "When the 24-hour trial ends without a purchase. No discount.",
    trigger: "process-trial-ended-emails cron, at trial end",
    edgeFunction: "process-trial-ended-emails",
  },
  trial_offer: {
    group: "automatic",
    label: "Trial 2: 10% off",
    description: "6 hours after trial 1. The first discount: 10% for 24 hours.",
    trigger: "process-trial-ended-emails cron, +6 hours",
    edgeFunction: "process-trial-ended-emails",
  },
  trial_last_call: {
    group: "automatic",
    label: "Trial 3: last call",
    description: "6 days after trial 1. 20% for 24 hours. Final trial email.",
    trigger: "process-trial-ended-emails cron, +6 days",
    edgeFunction: "process-trial-ended-emails",
  },
  recovery_saved: {
    group: "automatic",
    label: "Checkout: checkout saved",
    description:
      "About 1 hour after an opened checkout expires unpaid. No discount; the only checkout email.",
    trigger: "Stripe checkout.session.expired (opened sessions only)",
    edgeFunction: "process-checkout-recovery",
  },
  black_friday_sale: {
    group: "campaign",
    label: "Black Friday: 30% until Dec 1",
    description:
      "One-off to trial users who never bought. BLACKFRIDAY rides on the checkout link, so it applies in every country.",
    trigger: "send-app-update-emails with audience black_friday",
    edgeFunction: "send-app-update-emails",
  },
  reel_refund: {
    group: "campaign",
    label: "Reel refund: after purchase",
    description:
      "About 90 minutes after a purchase. Money back for posting a Reel or TikTok.",
    trigger: "Scheduled in Resend by stripe-license-email",
    edgeFunction: "stripe-license-email",
  },
}

export const ADMIN_EMAIL_TEMPLATES: readonly AdminEmailTemplate[] = [
  {
    id: "license",
    group: "automatic",
    label: "License key",
    description:
      "Right after a paid checkout. Shown for Pro (3 Macs); Pro+ only changes the Mac count.",
    subject: licensePreview().subject,
    preheader: licensePreview().preheader,
    from: EMAIL_FROM_DISPLAY,
    trigger: "Stripe checkout.session.completed (paid)",
    edgeFunction: "stripe-license-email",
    buildHtml: () => licensePreview().html,
  },
  ...(Object.keys(LIFECYCLE_META) as LifecycleEmailId[]).map((id) => ({
    id,
    ...LIFECYCLE_META[id],
    subject: lifecyclePreview(id).subject,
    preheader: lifecyclePreview(id).preheader,
    from: EMAIL_FROM_DISPLAY,
    buildHtml: () => lifecyclePreview(id).html,
  })),
]
