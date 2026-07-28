import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { macwall, mailtoSupport } from "@/lib/macwall-site"

/** Partner commission rate shown on the affiliate landing page. */
export const AFFILIATE_COMMISSION_PERCENT = 40 as const

export const macwallAffiliateCopy = {
  pageTitle: "Affiliate Program",

  heroTitleLines: [
    "Mac setups go viral.",
    "You should get paid.",
  ] as const,
  primaryCta: "Get your partner link",

  perks: [
    {
      id: "channels",
      before: "Drop one link on ",
      highlight: "YouTube, TikTok, or your newsletter",
      after: "",
    },
    {
      id: "commission",
      before: "Earn ",
      highlight: `${AFFILIATE_COMMISSION_PERCENT}% on every Pro sale`,
      after: " you refer",
    },
    {
      id: "cookie",
      before: "",
      highlight: `${AFFONSO_COOKIE_DURATION_DAYS}-day tracking`,
      after: " — they don’t need to buy right away",
    },
    {
      id: "payouts",
      before: "Watch clicks and payouts in your ",
      highlight: "partner dashboard",
      after: "",
    },
  ] as const,

  socialProofTitle: "Live in three steps",
  secondaryCta: "Apply free",

  steps: [
    {
      id: "01",
      title: "Apply in two minutes",
      body: "No follower minimum. We welcome setup creators, reviewers, and Mac communities.",
      shaderId: "01",
    },
    {
      id: "02",
      title: "Grab your tracked link",
      body: "Copy your URL from the dashboard — bio, video description, or pinned comment.",
      shaderId: "02",
    },
    {
      id: "03",
      title: "Post & earn",
      body: "When someone upgrades to Pro through you, commission is logged automatically.",
      shaderId: "03",
    },
  ] as const,

  contactHref: mailtoSupport,
  contactLabel: macwall.supportEmail,
} as const
