import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { macwall, mailtoSupport } from "@/lib/macwall-site"

/** Partner commission rate shown on the affiliate landing page. */
export const AFFILIATE_COMMISSION_PERCENT = 40 as const

export const macwallAffiliateCopy = {
  pageTitle: "Affiliate Program",

  heroTitleLines: [
    `Earn ${AFFILIATE_COMMISSION_PERCENT}% on every sale`,
    "you refer to MacWall",
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

  ideasTitle: "Where your link works best",
  ideasLead:
    "You don't need a big audience. One good post with your link under it keeps earning for as long as people find it.",
  ideas: [
    {
      id: "reel",
      title: "A Reel or TikTok of your desktop",
      body: "Film your Mac with a live wallpaper running and put your link in your bio. Setup videos are what people share.",
    },
    {
      id: "bio",
      title: "Your bio link",
      body: "Add it to Linktree or your profile once. Every wallpaper video you post after that points to it.",
    },
    {
      id: "youtube",
      title: "YouTube descriptions",
      body: "Desk setup tours, Mac app roundups and macOS tips. Pin a comment with your link as well.",
    },
    {
      id: "written",
      title: "Posts, newsletters and communities",
      body: "A blog post, an X thread or a reply where someone asks for a live wallpaper app for Mac.",
    },
  ] as const,

  faqTitle: "Affiliate questions",
  faq: [
    {
      q: "Who can join?",
      a: "Anyone. It is free, there is no follower minimum, and you don't need to own Pro. Creators, reviewers and Mac communities are all welcome.",
    },
    {
      q: "How much do I earn?",
      a: `${AFFILIATE_COMMISSION_PERCENT}% of every ${macwall.name} Pro sale that comes through your link, worked out on the price the buyer pays.`,
    },
    {
      q: "How long does my link keep tracking someone?",
      a: `${AFFONSO_COOKIE_DURATION_DAYS} days. If someone clicks your link today and buys within ${AFFONSO_COOKIE_DURATION_DAYS} days on the same browser, the sale is yours.`,
    },
    {
      q: "How do I get paid?",
      a: "You add your payout details in the affiliate dashboard. Every click, sale and commission is listed there, along with what has been paid out.",
    },
    {
      q: "What happens if a sale is refunded?",
      a: "A refunded sale doesn't earn a commission. Everything else stays as it was.",
    },
    {
      q: "Can I buy through my own link?",
      a: "No. Purchases you make yourself don't count.",
    },
    {
      q: "Do I have to say it's an affiliate link?",
      a: "Yes. Tell your audience you earn from the link, for example with #ad or the platform's paid-partnership label. Most platforms and consumer laws require it.",
    },
    {
      q: "Is there anything I can't do?",
      a: `No spam, no fake reviews, and no ads that bid on the ${macwall.name} name. Accounts that break this are removed.`,
    },
  ] as const,

  bottomTitle: "Start earning with one link",
  bottomLead: `Free to join. ${AFFILIATE_COMMISSION_PERCENT}% of every sale you refer.`,

  contactHref: mailtoSupport,
  contactLabel: macwall.supportEmail,
} as const
