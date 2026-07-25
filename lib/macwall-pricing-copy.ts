import {
  macwall,
  mailtoReelRefund,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export const macwallPricingCopy = {
  heroTitle: "Pricing. Wallpapers that truly live.",
  heroLead: `${macwall.name} gives you a permanent license key or an annual plan. Both unlock the full Pro app.`,

  reelRefund: {
    badge: "Reel refund",
    title: "Get 100% back",
    description:
      "Make a Reel. Get views. We pay you back. Instagram or TikTok. Organic views only.",
    steps: [
      {
        icon: "video" as const,
        title: "Create your Reel",
        body: `Film ${macwall.name} on your Mac, your setup, your wallpaper, your vibe.`,
      },
      {
        icon: "tag" as const,
        title: "Post and tag us",
        body: `Share on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok}, with ${macwall.reelRefundHashtag}.`,
      },
      {
        icon: "views" as const,
        title: "Hit the milestones",
        body: `${macwall.reelRefundHalfViews.toLocaleString()} views → 50% refund. ${macwall.reelRefundFullViews.toLocaleString()} views → full refund.`,
      },
      {
        icon: "email" as const,
        title: "Send your claim",
        body: `Email ${macwall.reelRefundEmail} with your Reel link, view screenshot, and purchase email.`,
      },
    ],
    influencerTitle: "Got a bigger audience?",
    finePrintLabel: "The fine print:",
    finePrint:
      "You can post as many Reels as you want until one hits 2,000 views, no cap on attempts. Views must be organic (no bots, no paid promotion). We reserve the right to verify view counts and decline suspicious activity. Refund is 50% of the purchase price, sent via the original payment method. Offer can be withdrawn at any time.",
    cta: "Email for your refund",
    ctaHref: mailtoReelRefund,
  },

  freeTrial: {
    features: [
      "6 starter live wallpapers to explore",
      "Desktop playback and menu bar controls",
      "No card required to begin",
      "Upgrade whenever you are ready",
    ],
  },

  pro: {
    features: [
      "Lifetime license, pay once",
      "Use on up to 3 personal Macs",
      "Cloud catalog with 1,000+ live wallpapers",
      `Live Lock Screen and Screen Saver (${macwallMinimumMacOSVersion}+)`,
      "Unlimited favorites and playlists",
      "Music Sync and menu bar quick controls",
    ],
  },

  proPlus: {
    features: [
      "Everything in Pro",
      "Use on up to 5 Macs",
      "Best value for creators and studios",
      "Lower per-Mac price than single licenses",
      "Perfect for desk + laptop + team setups",
      "Same lifetime updates, no subscription",
    ],
  },

  annual: {
    line: "Need lower upfront cost?",
    detail:
      "Choose annual billing for up to 3 Macs and keep every Pro feature while subscribed.",
    cta: "Start annual plan",
  },

  faqTitle: "Common questions",

  faq: [
    {
      q: "How does the Reel refund work?",
      a: `Buy ${macwall.name} Pro, post on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag}, then email ${macwall.reelRefundEmail} once you hit ${macwall.reelRefundHalfViews.toLocaleString()} views for 50% back or ${macwall.reelRefundFullViews.toLocaleString()} views for a full refund.`,
    },
    {
      q: "Is Pro a subscription?",
      a: "You choose. The permanent license is a single payment with no renewal. The annual plan renews once per year until canceled.",
    },
    {
      q: "How does checkout work?",
      a: "Checkout runs on Stripe. After payment, your license details are delivered to the email you used. Keep that message for reinstalls or device changes.",
    },
    {
      q: "How many Macs can I use with one license?",
      a: "The permanent and annual plans cover up to 3 Macs. Need more? The 5-Mac permanent license covers up to 5. Replacing a Mac? Unlink the old machine in Settings → Devices, then activate the new one.",
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: `Live Lock Screen and Screen Saver wallpapers require ${macwallMinimumMacOSVersion} or later, where Apple exposes the native wallpaper APIs.`,
    },
    {
      q: "Can I get a refund without making a Reel?",
      a: `There is no general refund policy: all sales are final. In limited cases (for example, a billing error or the app not running on a supported macOS version) we may issue a refund at our discretion. Email ${macwall.supportEmail} and we'll review it. The Reel program is separate: email ${macwall.reelRefundEmail} with your post link and purchase email after you hit the view targets.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks wrong. We read every message.`,
    },
    {
      q: "Which macOS releases are supported?",
      a: `MacWall runs on ${macwallMinimumMacOSVersion} or later on Apple silicon and Intel Macs. Download the latest build from the site for the freshest compatibility notes.`,
    },
  ] as const,

  bottomTitle: `Get ${macwall.name}`,
  bottomDesc: `Choose ${macwall.pro.price} permanent or ${macwall.annual.price} per year. Make a Reel and earn up to 100% back.`,
  bottomCtaPro: `Buy Pro for ${macwall.pro.price}`,
  bottomCtaReel: "Get 100% free",
} as const
