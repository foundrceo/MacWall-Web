import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { macwall } from "@/lib/macwall-site"

/** Partner commission rate shown across the site. Keep the Affonso program
 *  and AFFILIATE.percent in supabase/functions/_shared/lifecycle-emails.ts
 *  on the same number. */
export const AFFILIATE_COMMISSION_PERCENT = 35 as const

/** List price of Pro in US dollars, used only for the earnings estimate. */
export const AFFILIATE_EXAMPLE_PRICE_USD = 12.99 as const

/** What one referred Pro sale earns at the list price, e.g. "$4.55". */
export const AFFILIATE_EXAMPLE_EARNING = `$${(
  (AFFILIATE_EXAMPLE_PRICE_USD * AFFILIATE_COMMISSION_PERCENT) /
  100
).toFixed(2)}`

export const macwallAffiliateCopy = {
  pageTitle: "Affiliate Program",
  navBadge: `Earn ${AFFILIATE_COMMISSION_PERCENT}%`,

  heroTitleLines: [
    `Earn ${AFFILIATE_COMMISSION_PERCENT}% every time`,
    `someone buys ${macwall.name}`,
  ] as const,
  heroLead:
    "Post a Reel, send your link to a friend, or drop it in your bio. When they buy, you get paid, even while you sleep.",
  /** One line for search results and link previews. */
  metaLead: `Join the ${macwall.name} affiliate program and earn ${AFFILIATE_COMMISSION_PERCENT}% of every sale you refer.`,
  primaryCta: "Get your free link",

  perks: [
    {
      id: "commission",
      before: "",
      highlight: `${AFFILIATE_COMMISSION_PERCENT}% of every Pro sale`,
      after: " that comes through your link",
    },
    {
      id: "channels",
      before: "One link for ",
      highlight: "your bio, your videos and your friends",
      after: "",
    },
    {
      id: "cookie",
      before: "",
      highlight: `${AFFONSO_COOKIE_DURATION_DAYS}-day tracking`,
      after: ", so you still get paid if they buy later",
    },
    {
      id: "payouts",
      before: "Free to join, with every click and sale in ",
      highlight: "your dashboard",
      after: "",
    },
  ] as const,

  waysTitle: "Three ways to earn",
  waysLead:
    "You don't need a big audience. Pick whichever fits you, or do all three with the same link.",
  ways: [
    {
      id: "reel",
      title: "Make a Reel",
      body: "Film your Mac with a live wallpaper running and put your link in your bio. Setup videos are what people share.",
      earn: "Every viewer who buys pays you",
    },
    {
      id: "friend",
      title: "Tell a friend",
      body: `Send your link to anyone with a Mac. When they buy ${macwall.name} Pro, ${AFFILIATE_COMMISSION_PERCENT}% of it is yours.`,
      earn: `About ${AFFILIATE_EXAMPLE_EARNING} for each friend`,
    },
    {
      id: "sleep",
      title: "Earn while you sleep",
      body: "Add your link to a YouTube description, a blog post or your bio once. It keeps working long after you post it.",
      earn: "No extra work after day one",
    },
  ] as const,

  socialProofTitle: "Live in three steps",
  secondaryCta: "Join for free",

  steps: [
    {
      id: "01",
      title: "Get your link",
      body: "Sign up in two minutes. It is free and there is no follower minimum.",
      shaderId: "01",
    },
    {
      id: "02",
      title: "Share it anywhere",
      body: "Bio, Reel, video description, group chat. Ready-made captions and images are waiting in your dashboard.",
      shaderId: "02",
    },
    {
      id: "03",
      title: "Get paid",
      body: "When someone buys Pro through your link, the commission is logged for you. No invoicing, no chasing.",
      shaderId: "03",
    },
  ] as const,

  estimateTitle: "See what you could earn",
  estimateLead:
    "Drag to pick how many people buy through your link each month.",
  estimateSalesLabel: "sales a month",
  estimateResultLabel: "a month",
  estimateNote: `An estimate, not a promise. Based on Pro at $${AFFILIATE_EXAMPLE_PRICE_USD}. You earn ${AFFILIATE_COMMISSION_PERCENT}% of what each buyer actually pays, so sale and regional prices earn less.`,

  faqTitle: "Affiliate questions",
  faq: [
    {
      q: "Is it really free?",
      a: "Yes. Joining costs nothing, there is no follower minimum, and you don't need to own Pro. Creators, reviewers, students and Mac communities are all welcome.",
    },
    {
      q: "How much do I earn?",
      a: `${AFFILIATE_COMMISSION_PERCENT}% of every ${macwall.name} Pro sale that comes through your link, worked out on the price the buyer pays. At the regular Pro price that is about ${AFFILIATE_EXAMPLE_EARNING} a sale.`,
    },
    {
      q: "Can I just share it with friends?",
      a: "Yes. Send your link in a message or a group chat. If they buy through it, you earn the same commission as from a video.",
    },
    {
      q: "How long does my link keep tracking someone?",
      a: `${AFFONSO_COOKIE_DURATION_DAYS} days. If someone clicks your link today and buys within ${AFFONSO_COOKIE_DURATION_DAYS} days on the same browser, the sale is yours.`,
    },
    {
      q: "How do I get paid?",
      a: "Payouts go out monthly once your balance reaches $50. A commission becomes payable 30 days after the sale. You add your payout details, such as PayPal or a bank transfer, in the affiliate dashboard, where every click, sale and payout is listed.",
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
      a: "Yes. Tell people you earn from the link, for example with #ad or the platform's paid-partnership label. Most platforms and consumer laws require it.",
    },
    {
      q: "Is there anything I can't do?",
      a: `No spam, no fake reviews, and no ads that bid on the ${macwall.name} name. Accounts that break this are removed.`,
    },
  ] as const,

  bottomTitle: "Your link can start earning today",
  bottomLead: `Free to join. ${AFFILIATE_COMMISSION_PERCENT}% of every sale you refer.`,
} as const
