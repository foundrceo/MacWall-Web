import {
  macwall,
  mailtoReelRefund,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export const macwallPricingCopy = {
  pageTitle: "Pricing",
  billingToggleLabel: "Choose billing",
  billingPermanent: "Permanent",
  billingAnnual: "Annual",

  plans: {
    free: {
      title: "Free",
      subtitle: "For exploring live wallpapers",
      price: "$0",
      featuresPrefix: "Includes:",
      cta: "Try MacWall",
    },
    pro: {
      title: "Pro",
      subtitle: "For your daily Mac setup",
      badge: "Popular",
      featuresPrefix: "Everything in Free, plus:",
      ctaPermanent: "Get Pro",
      ctaAnnual: "Start annual plan",
    },
    proPlus: {
      title: "Pro Plus",
      subtitle: "For desks, laptops, and studios",
      featuresPrefix: "Everything in Pro, plus:",
      cta: "Get Pro Plus",
    },
    reel: {
      title: "Reel Refund",
      subtitle: "For creators who share their setup",
      price: "Up to 100% back",
      featuresPrefix: "How it works:",
      cta: "Learn about Reels",
    },
  },

  heroKicker: "MacWall Pro",
  heroTitle: "Choose how you unlock live wallpapers.",
  heroLead:
    "One-time purchase or annual subscription — both unlock the full Pro app on up to 3 Macs.",

  reelRefund: {
    badge: "Reel refund",
    title: "Get 100% back",
    description:
      "Make a Reel. Get views. We pay you back. Instagram or TikTok. Organic views only.",
    steps: [
      {
        icon: "video" as const,
        title: "Create your Reel",
        body: `Film ${macwall.name} on your Mac — your setup, wallpaper, and vibe. Keep it short and natural.`,
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
    influencerTitle: "Bigger audience?",
    finePrintLabel: "The fine print:",
    finePrint:
      "Post as many times as you want until one Reel hits 2,000 organic views. No bots or paid promotion. We may verify views and decline suspicious claims. Refunds go to the original payment method. Offer can end anytime.",
    cta: "Email for your refund",
    ctaHref: mailtoReelRefund,
  },

  freeTrial: {
    features: [
      "6 starter live wallpapers",
      "Desktop playback & menu bar controls",
      "No card required",
      "Upgrade whenever you're ready",
    ],
  },

  pro: {
    features: [
      "Lifetime license, pay once",
      "Use on up to 3 personal Macs",
      "1,000+ live wallpapers in the cloud",
      `Lock Screen & Screen Saver (${macwallMinimumMacOSVersion}+)`,
      "Unlimited favorites and playlists",
      "Music Sync & menu bar controls",
    ],
  },

  proPlus: {
    features: [
      "Everything in Pro",
      "Use on up to 5 Macs",
      "Best value for creators & studios",
      "Lower per-Mac price",
      "Desk, laptop, and team setups",
      "Lifetime updates, no subscription",
    ],
  },

  annual: {
    line: "Need lower upfront cost?",
    detail:
      "Choose annual billing for up to 3 Macs and keep every Pro feature while subscribed.",
    cta: "Start annual plan",
    features: [
      "Full Pro access while subscribed",
      "Use on up to 3 personal Macs",
      "1,000+ live wallpapers in the cloud",
      `Lock Screen & Screen Saver (${macwallMinimumMacOSVersion}+)`,
      "Billed once per year",
      "Cancel before renewal anytime",
    ],
  },

  multiMac: {
    title: "Got more than one Mac?",
    lead: "One permanent key for five machines — better per-Mac value for desks, laptops, and studios.",
    offerLabel: "5 Macs — Permanent",
    cta: "Buy 5-Mac license",
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
  bottomCtaPro: "Get Pro",
  bottomCtaReel: "Get 100% free",
} as const
