import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { macwall, mailtoSupport } from "@/lib/macwall-site"

/** Partner commission rate shown on the affiliate landing page. */
export const AFFILIATE_COMMISSION_PERCENT = 40 as const

export const macwallAffiliateCopy = {
  pageTitle: "Affiliate Program",

  heroTitleLines: [
    "Mac setups go high-reach.",
    "You should generate earnings.",
  ] as const,
  primaryCta: "Get your partner link",

  perks: [
    {
      id: "channels",
      before: "Drop one link on ",
      highlight: "YouTube, TikTok, or your newsletter",
      after: " — scale your digital presence",
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
      after: " — they don’t need to invest right away",
    },
    {
      id: "payouts",
      before: "Watch clicks and payouts in your ",
      highlight: "partner dashboard",
      after: " — allocate earnings with clarity",
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
