import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { macwall, mailtoSupport } from "@/lib/macwall-site"

/** Partner commission rate shown on the affiliate landing page. */
export const AFFILIATE_COMMISSION_PERCENT = 40 as const

export const macwallAffiliateCopy = {
  pageTitle: "Affiliate Program",

  heroTitleLines: [
    "Get paid when you sleep",
    "with affiliate commissions",
  ] as const,
  heroLead: `Join MacWall affiliate program and earn ${AFFILIATE_COMMISSION_PERCENT}% commissions for every customer you refer.`,
  primaryCta: "Get your partner link",

  perks: [
    {
      id: "channels",
      before: "Drop one link on ",
      highlight: "YouTube, TikTok, or your newsletter",
      after: " to scale your digital presence",
    },
    {
      id: "commission",
      before: "Generate ",
      highlight: `${AFFILIATE_COMMISSION_PERCENT}% revenue on every Pro sale`,
      after: " you refer",
    },
    {
      id: "cookie",
      before: "",
      highlight: `${AFFONSO_COOKIE_DURATION_DAYS}-day tracking`,
      after: " so they don’t need to invest right away",
    },
    {
      id: "payouts",
      before: "Watch clicks and payouts in your ",
      highlight: "partner dashboard",
      after: " with clear earnings",
    },
  ] as const,

  socialProofTitle: "Live in three steps",
  secondaryCta: "Apply complimentary",

  steps: [
    {
      id: "01",
      title: "Apply in two minutes",
      body: "No community minimum. We welcome setup creators, reviewers, and Mac communities. Unlikely you'll hit a wall — just request access.",
      shaderId: "01",
    },
    {
      id: "02",
      title: "Grab your tracked link",
      body: "Copy your URL from the dashboard — bio, video description, or pinned comment. Enhance your online presence strategy.",
      shaderId: "02",
    },
    {
      id: "03",
      title: "Post & generate",
      body: "When someone elevates to Pro through you, commission is logged automatically. Help ideal clients discover MacWall — that's the advantage.",
      shaderId: "03",
    },
  ] as const,

  contactHref: mailtoSupport,
  contactLabel: macwall.supportEmail,
} as const
