/**
 * Marketing lifecycle emails (trial + checkout recovery).
 *
 * Pure TypeScript with no runtime imports: used by the Supabase Edge
 * Functions that send the mail and by the admin preview in the Next app, so
 * both always show the same content.
 *
 * Sequences (each stops on purchase or unsubscribe):
 *   Trial:    trial_ended (at trial end, no discount) → trial_offer (+6h, 10% for 24h)
 *             → trial_last_call (day 6, 20% for 24h)
 *   Buyers:   reel_refund (about 90 minutes after purchase: money back for
 *             posting a Reel)
 *   Checkout: recovery_saved (~1h after abandoning, no discount; the only
 *             checkout email)
 *   One-off:  black_friday_sale (trial users, BLACKFRIDAY 30% until Dec 1 PT)
 *
 * Copy rules: plain words, no em dashes, one primary button, no fake urgency.
 * Every email renders through the shared layout in ./email-layout.ts.
 */

import {
  renderEmailHtml,
  renderEmailText,
  type EmailBrand,
  type EmailContent,
} from "./email-layout.ts"

export const LIFECYCLE_PROMO = {
  /** 10% off. No expiry on its own; the trial offer email limits its link
   *  to `TRIAL_OFFER_HOURS` with the checkout `until` param. */
  ten: { code: "WALL10", percent: "10%" },
  /** 20% off, enforced for 24h via the checkout `until` param. */
  twenty: { code: "R7N2WP8J", percent: "20%", validHours: 24 },
} as const

/** Reel refund handles. Keep these, and the view counts in the reel_refund
 *  email (10,000 and 20,000), in sync with `macwall.reelRefund*` in
 *  lib/macwall-site.ts (this file can't import from the Next app). */
const REEL = {
  hashtag: "#macwall",
  email: "discount@macwall.app",
} as const

/** How long the 10% link in the trial offer email (trial_offer) works. */
export const TRIAL_OFFER_HOURS = 24

/**
 * Black Friday sale (matches SITE_SALES "black-friday-2026" and the Stripe
 * code BLACKFRIDAY, which expires at the deadline). The email's checkout
 * link carries the code, so it applies in every country.
 */
export const BLACK_FRIDAY_SALE = {
  code: "BLACKFRIDAY",
  percent: "30%",
  deadline: "Dec 1, 11:59 PM PT",
  pro: { was: "$12.99", now: "$9.09" },
  proPlus: { was: "$19.99", now: "$13.99" },
} as const

export type LifecycleEmailId =
  | "trial_ended"
  | "trial_offer"
  | "reel_refund"
  | "trial_last_call"
  | "recovery_saved"
  | "send_to_mac"
  | "send_to_mac_reminder"
  | "black_friday_sale"

export type LifecycleEmailContext = {
  appName: string
  siteUrl: string
  logoUrl: string
  supportEmail: string
  /** Primary button target (checkout link with the promo already applied). */
  checkoutHref: string
  /** Signed unsubscribe page, when available. */
  unsubscribeHref: string | null
  /** Optional postal address for the footer (CAN-SPAM). */
  postalAddress?: string | null
  /** Recovery only: e.g. "MacWall Pro (3 Macs)". */
  planLabel?: string | null
  /** Recovery only: e.g. "₹441.50" or "$12.99". */
  priceLabel?: string | null
  /** `send_to_mac*` only: the wallpaper page they were looking at. */
  wallpaper?: { name: string; href: string } | null
  /** `black_friday_sale` only: opened a checkout but never tried the app. */
  checkoutOnly?: boolean | null
  /** The `utm_campaign` the sender puts on the button, when it is not the
   *  default for this email (one-off campaigns pass their campaign name). */
  utmCampaign?: string | null
}

export type LifecycleEmail = {
  subject: string
  preheader: string
  html: string
  text: string
}

/** Sits under the button of every email that asks for a purchase. */
const GUARANTEE = "One payment, not a subscription. 7-day money-back guarantee."

/**
 * UTM values for the links this file writes (the secondary link). They match
 * what the sending functions put on the main button, so every click from one
 * email lands in the same campaign.
 */
const TRACKING: Record<LifecycleEmailId, { medium: string; campaign: string }> = {
  trial_ended: { medium: "trial", campaign: "trial_ended" },
  trial_offer: { medium: "trial", campaign: "trial_offer" },
  reel_refund: { medium: "customer", campaign: "reel_refund" },
  trial_last_call: { medium: "trial", campaign: "trial_last_call" },
  recovery_saved: { medium: "recovery", campaign: "recovery_r1" },
  send_to_mac: { medium: "send_to_mac", campaign: "send_to_mac" },
  send_to_mac_reminder: { medium: "send_to_mac", campaign: "send_to_mac_reminder" },
  black_friday_sale: { medium: "trial", campaign: "black_friday_sale" },
}

/** Adds UTM parameters to a link on our own site. */
function trackedLink(
  href: string,
  id: LifecycleEmailId,
  ctx: LifecycleEmailContext
): string {
  if (!href.startsWith(ctx.siteUrl) || href.includes("utm_source=")) return href
  const medium =
    id === "black_friday_sale" && ctx.checkoutOnly ? "recovery" : TRACKING[id].medium
  const campaign = ctx.utmCampaign?.trim() || TRACKING[id].campaign
  const [base, hash] = href.split("#")
  const query = `utm_source=email&utm_medium=${medium}&utm_campaign=${encodeURIComponent(campaign)}&utm_content=secondary_link`
  return `${base}${base.includes("?") ? "&" : "?"}${query}${hash ? `#${hash}` : ""}`
}

/**
 * Copy rules: say what happened, say what they get, one button. Two short
 * paragraphs at most; the code, plan or price goes in the info card, the
 * guarantee in the note, and help in the footer of every email.
 */
function contentFor(id: LifecycleEmailId, ctx: LifecycleEmailContext): EmailContent {
  const app = ctx.appName
  const plan = ctx.planLabel?.trim() || `${app} Pro`
  const ten = LIFECYCLE_PROMO.ten
  const twenty = LIFECYCLE_PROMO.twenty
  // Short enough to sit on one line with the Unsubscribe link, on a phone too.
  const trialReason = `You got this because you tried ${app}.`
  const checkoutReason = "You got this because you started a checkout."
  const sendToMacReason = "You got this because you asked for the link."

  const link = (label: string, href: string) => ({
    label,
    href: trackedLink(href, id, ctx),
  })
  const wallpaperLink = ctx.wallpaper
    ? link(`See “${ctx.wallpaper.name}”`, ctx.wallpaper.href)
    : null
  const codeRow = (code: string, hint: string) => ({
    label: "Your code",
    value: code,
    hint,
    mono: true,
  })
  // Most people first open a Send to Mac email on the phone they asked from,
  // where the button can't install anything: the steps say what to do and where.
  const installSteps = [
    {
      icon: `${ctx.siteUrl}/email/icon-laptop.png`,
      label: "Step 1",
      title: "Open this email on your Mac",
    },
    {
      icon: `${ctx.siteUrl}/email/icon-download.png`,
      label: "Step 2",
      title: `Download ${app} and drag it to Applications`,
    },
    {
      icon: `${ctx.siteUrl}/email/icon-sparkles.png`,
      label: "Step 3",
      title: "Pick a live wallpaper",
    },
  ]
  const base = {
    unsubscribeHref: ctx.unsubscribeHref,
  }
  const icon = (name: string) => `${ctx.siteUrl}/email/icon-${name}.png`

  switch (id) {
    case "black_friday_sale": {
      const b = BLACK_FRIDAY_SALE
      return {
        ...base,
        subject: `Black Friday: ${b.percent} off ${app} Pro`,
        preheader: `${app} Pro is ${b.pro.now} for Black Friday, paid once. Ends ${b.deadline}.`,
        headline: `Black Friday.|${b.percent} off Pro.`,
        // Day only: the exact hour is in the inbox preview line.
        lead: `${app} Pro and Pro+ are ${b.percent} off until ${b.deadline.split(",")[0]}.`,
        paragraphs: [
          ctx.checkoutOnly
            ? "Pro unlocks 1,000+ live wallpapers, the live Lock Screen on macOS 26, and your own videos as wallpapers."
            : `You tried ${app} on your Mac. Pro turns your live wallpapers back on and unlocks 1,000+ more.`,
        ],
        image: {
          src: `${ctx.siteUrl}/email/black-friday-hero.jpg`,
          width: 560,
          height: 364,
          alt: `A Mac desktop with a ${app} live wallpaper of a car at night`,
        },
        prices: [
          { plan: "Pro · 3 Macs", was: b.pro.was, now: b.pro.now, note: "one-time" },
          { plan: "Pro+ · 5 Macs", was: b.proPlus.was, now: b.proPlus.now, note: "one-time" },
        ],
        info: [codeRow(b.code, `${b.percent} off, applied automatically with the button below.`)],
        button: { label: `Get ${app} Pro`, href: ctx.checkoutHref },
        secondaryLink: link("Compare Pro and Pro+", `${ctx.siteUrl}/pricing`),
        note: GUARANTEE,
        reason: ctx.checkoutOnly ? checkoutReason : trialReason,
      }
    }
    case "send_to_mac":
      return {
        ...base,
        subject: `Your ${app} download link`,
        preheader: "Open this on your Mac to install. Every feature is free for 24 hours.",
        headline: `${app} for your Mac`,
        paragraphs: ["Here's your download link. Installing takes about a minute."],
        steps: installSteps,
        button: { label: `Download ${app}`, href: ctx.checkoutHref },
        secondaryLink: wallpaperLink,
        note: "Every feature is free for 24 hours. No card needed.",
        reason: sendToMacReason,
      }
    case "send_to_mac_reminder":
      return {
        ...base,
        subject: `Did ${app} make it to your Mac?`,
        preheader: "Your download link is still here. It takes about a minute.",
        headline: "Your download is waiting",
        paragraphs: [
          `You asked for the link yesterday. If ${app} isn't on your Mac yet, here it is again.`,
        ],
        steps: installSteps,
        button: { label: `Download ${app}`, href: ctx.checkoutHref },
        secondaryLink: wallpaperLink,
        note: "Free for 24 hours, no card needed. This is the only reminder.",
        reason: sendToMacReason,
      }
    case "trial_ended":
      return {
        ...base,
        subject: `Your ${app} trial has ended`,
        preheader: "Your wallpapers are saved. Pro turns them back on.",
        headline: "Your trial has ended",
        paragraphs: [
          "Your live wallpapers are paused. Everything you picked is still in the app, and Pro turns it back on.",
        ],
        // No discount here: the 10% code follows 6 hours later (trial_offer).
        stepsLayout: "cards",
        steps: [
          {
            icon: `${ctx.siteUrl}/email/icon-images.png`,
            title: "1,000+ live wallpapers",
          },
          {
            icon: `${ctx.siteUrl}/email/icon-lock-keyhole.png`,
            title: "Live Lock Screen on macOS 26",
          },
          {
            icon: `${ctx.siteUrl}/email/icon-film.png`,
            title: "Your own videos as wallpapers",
          },
          {
            icon: `${ctx.siteUrl}/email/icon-music.png`,
            title: "Music Sync with your songs",
          },
          {
            icon: `${ctx.siteUrl}/email/icon-laptop.png`,
            title: "Bend: folds with your MacBook lid",
          },
          {
            icon: `${ctx.siteUrl}/email/icon-monitor.png`,
            title: "Every display, synced or solo",
          },
        ],
        button: { label: `Get ${app} Pro`, href: ctx.checkoutHref },
        note: "Pay once for 3 Macs. 7-day money-back guarantee.",
        reason: trialReason,
      }
    // Trial 2, six hours on. They liked it enough to set wallpapers up, so
    // lead with what they lost, make the discount the hero, and show what
    // comes back.
    case "trial_offer":
      return {
        ...base,
        subject: `${ten.percent} off to turn your wallpapers back on`,
        preheader: `Everything you picked is still saved in ${app}. ${ten.percent} off for ${TRIAL_OFFER_HOURS} hours.`,
        headline: "Turn your wallpapers back on",
        paragraphs: [
          `Everything you picked is still saved in ${app}. Here's ${ten.percent} off Pro to bring it back, for the next ${TRIAL_OFFER_HOURS} hours.`,
        ],
        offer: {
          badge: `Ends in ${TRIAL_OFFER_HOURS} hours`,
          amount: `${ten.percent} off`,
          caption: `${app} Pro`,
          code: ten.code,
          hint: "applied automatically with the button below.",
        },
        steps: [
          { icon: icon("images"), title: "1,000+ live wallpapers, back on your desktop." },
          { icon: icon("lock-keyhole"), title: "Live Lock Screen on macOS 26." },
          { icon: icon("film"), title: "Your own videos as wallpapers." },
        ],
        button: { label: `Get Pro for ${ten.percent} off`, href: ctx.checkoutHref },
        note: "Pay once for 3 Macs. 7-day money-back guarantee.",
        reason: trialReason,
      }
    // Trial 3, the last one. The bigger number against the old one, a real
    // deadline, and the three things that take the risk out of buying.
    case "trial_last_call":
      return {
        ...base,
        subject: `Last reminder: ${twenty.percent} off ${app} Pro`,
        preheader: `${twenty.percent} off for 24 hours. This is the last email about your trial.`,
        headline: `Our best offer: ${twenty.percent} off`,
        paragraphs: [
          "This is the last email about your trial, so here is our best price. It ends 24 hours after this email.",
        ],
        offer: {
          badge: "Ends in 24 hours",
          was: `${ten.percent} off`,
          amount: `${twenty.percent} off`,
          caption: `${app} Pro`,
          code: twenty.code,
          hint: "applied automatically with the button below.",
        },
        steps: [
          { icon: icon("shield-check"), title: "Try it for 7 days. Not for you? Full refund." },
          { icon: icon("infinity"), title: "Pay once. No subscription, free updates." },
          { icon: icon("laptop"), title: "One license covers 3 Macs." },
        ],
        button: { label: `Get Pro for ${twenty.percent} off`, href: ctx.checkoutHref },
        note: "After this, we won't email you about your trial again.",
        reason: trialReason,
      }
    case "reel_refund":
      return {
        ...base,
        subject: `Get your ${app} Pro money back with a Reel`,
        preheader: "Post one short video of your desktop and get up to 100% back.",
        headline: "Get your money back with a Reel",
        paragraphs: [
          `Thanks for buying ${app} Pro. Post a short video of it on your Mac and we refund up to 100%.`,
        ],
        // Each step earns reach: the hashtag and the mention point viewers at
        // us, and a collab post also shows on our own Instagram page.
        steps: [
          {
            icon: icon("clapperboard"),
            label: "Step 1",
            title: `Post a Reel or TikTok of ${app} on your Mac`,
          },
          {
            icon: icon("hash"),
            label: "Step 2",
            title: `Add ${REEL.hashtag} and add us as a collab`,
          },
          {
            icon: icon("send"),
            label: "Step 3",
            title: `Email the link to ${REEL.email}`,
          },
        ],
        tiles: [
          {
            icon: icon("circle-dollar-sign"),
            label: "At 10,000 views",
            value: "50% back",
            hint: "You keep Pro.",
          },
          {
            icon: icon("circle-dollar-sign"),
            label: "At 20,000 views",
            value: "100% back",
            hint: "You keep Pro.",
          },
        ],
        button: { label: "See how it works", href: ctx.checkoutHref },
        reason: `You got this because you bought ${app} Pro.`,
      }
    // The only checkout email. They reached the payment page, so they want
    // it: remind them what they get, answer the doubts that stop a payment,
    // and offer help in case the payment itself failed.
    case "recovery_saved":
      return {
        ...base,
        subject: `Your ${app} checkout is saved`,
        preheader: `${plan} is one step away. Finish in a tap.`,
        headline: "Your checkout is saved",
        paragraphs: [
          `You were one step away from ${plan}. Pick up where you left off and it's yours in a minute.`,
        ],
        // No price here: what they get, then what takes the risk out.
        steps: [
          { icon: icon("images"), title: "1,000+ live wallpapers for your desktop." },
          { icon: icon("lock-keyhole"), title: "Live Lock Screen on macOS 26." },
          { icon: icon("film"), title: "Your own videos as wallpapers." },
          { icon: icon("key-round"), title: "Your license key arrives by email, seconds after you pay." },
          { icon: icon("shield-check"), title: "Try it for 7 days. Not for you? Full refund." },
          { icon: icon("infinity"), title: "Pay once and keep it. Free updates included." },
        ],
        button: { label: "Finish checkout", href: ctx.checkoutHref },
        note: "Payment didn't go through? Reply to this email and we'll help.",
        reason: checkoutReason,
      }
  }
}

export function buildLifecycleEmail(
  id: LifecycleEmailId,
  ctx: LifecycleEmailContext
): LifecycleEmail {
  const content = contentFor(id, ctx)
  const brand: EmailBrand = {
    appName: ctx.appName,
    siteUrl: ctx.siteUrl,
    logoUrl: ctx.logoUrl,
    supportEmail: ctx.supportEmail,
    postalAddress: ctx.postalAddress,
  }
  return {
    subject: content.subject,
    preheader: content.preheader,
    html: renderEmailHtml(content, brand),
    text: renderEmailText(content, brand),
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
