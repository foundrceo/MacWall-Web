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
  heroLead: `Join the MacWall affiliate program and earn ${AFFILIATE_COMMISSION_PERCENT}% of every sale you refer.`,
  primaryCta: "Get your affiliate link",

  perks: [
    {
      id: "channels",
      before: "Drop one link in ",
      highlight: "a YouTube description, a TikTok bio, or your newsletter",
      after: "",
    },
    {
      id: "commission",
      before: "Earn ",
      highlight: `${AFFILIATE_COMMISSION_PERCENT}% of every Pro sale`,
      after: " you refer",
    },
    {
      id: "cookie",
      before: "",
      highlight: `${AFFONSO_COOKIE_DURATION_DAYS}-day tracking`,
      after: ", so you still get paid if they buy later",
    },
    {
      id: "payouts",
      before: "See your clicks and payouts in the ",
      highlight: "affiliate dashboard",
      after: "",
    },
  ] as const,

  socialProofTitle: "Live in three steps",
  secondaryCta: "Apply for free",

  steps: [
    {
      id: "01",
      title: "Apply in two minutes",
      body: "No follower minimum. Setup creators, reviewers, and Mac communities are all welcome. Just request access.",
      shaderId: "01",
    },
    {
      id: "02",
      title: "Grab your tracked link",
      body: "Copy your link from the dashboard and put it wherever you post: bio, video description, or pinned comment.",
      shaderId: "02",
    },
    {
      id: "03",
      title: "Post and get paid",
      body: "When someone buys Pro through your link, the commission is logged automatically. No invoicing, no chasing.",
      shaderId: "03",
    },
  ] as const,

  contactHref: mailtoSupport,
  contactLabel: macwall.supportEmail,
} as const
