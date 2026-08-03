import {
  macwall,
  mailtoReelRefund,
  macwallLockScreenMacOSVersion,
  macwallMacOSRequirementsHint,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export type PricingReview = {
  quote: string
  name: string
  context: string
  rating: number
  /** Path under public/ — only use photos you have permission to publish. */
  avatarSrc?: string
}

export const macwallPricingCopy = {
  pageTitle: "Pricing",
  billingToggleLabel: "Choose billing",
  billingPermanent: "Permanent",
  billingAnnual: "Annual",

  plans: {
    pro: {
      title: "Pro",
      subtitle: "Limited price — pay once",
      badge: "Most Popular",
      badgeAlt: "33% off",
      featuresPrefix: "Includes:",
      ctaPermanent: "Get Pro",
      ctaAnnual: "Start annual plan",
    },
    proPlus: {
      title: "Pro+",
      subtitle: "5–20 Macs — bigger packs, bigger discount",
      badge: "40% off",
      featuresPrefix: "Everything in Pro, plus:",
      cta: "Get Pro+",
    },
    reel: {
      title: "Creator Offer",
      subtitle: "For creators who share their setup",
      price: "Up to 100% back",
      featuresPrefix: "How it works:",
      cta: "Learn about the offer",
    },
  },

  heroTitle: "Pay once. Pro forever.",
  heroLead: "Limited price. No subscriptions.",

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

  pro: {
    features: [
      "Cheaper than other wallpaper apps",
      "More features than other apps",
      "1,000+ live wallpapers",
      "Lock Screen & Screen Saver",
      "Import your own videos",
      "Up to 3 personal Macs",
      "Pay once — no subscription",
      "Lifetime updates",
      "Music Sync",
    ],
  },

  proPlus: {
    features: [
      "Cheaper than other wallpaper apps",
      "More features than other apps",
      "Everything in Pro",
      "Up to 5 Macs",
      "Bigger packs unlock bigger discounts",
      "Same Pro features forever",
    ],
  },

  multiMac: {
    title: "Got more than one Mac?",
    lead: "Save more when you license multiple Macs. Same Pro features, more devices.",
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
      a: "No. MacWall Pro is a one-time purchase. Pay once and keep the app forever, including lifetime updates. No recurring fees.",
    },
    {
      q: "Can I try before upgrading?",
      a: "Yes. Download MacWall free and apply curated free wallpapers with full desktop playback. Upgrade to Pro whenever you want the full catalog, custom imports, and Lock Screen.",
    },
    {
      q: "How does checkout work?",
      a: "Checkout runs on Stripe. After payment, your license details are delivered to the email you used. Keep that message for reinstalls or device changes.",
    },
    {
      q: "How many Macs can I use with one license?",
      a: "Pro covers up to 3 Macs. Need more? The 5-Mac permanent license covers up to 5. Replacing a Mac? Unlink the old machine in Settings → Devices, then activate the new one.",
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: `Live Lock Screen and Screen Saver wallpapers require ${macwallLockScreenMacOSVersion} or later, where Apple exposes the native wallpaper APIs. Desktop live wallpapers work on ${macwallMinimumMacOSVersion}+.`,
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
      a: `${macwallMacOSRequirementsHint}. Apple silicon and Intel Macs. Download the latest build from the site for the freshest compatibility notes.`,
    },
  ] as const,

  bottomTitle: `Try ${macwall.name}`,
  bottomDesc: `Claim the limited Pro price — or make a Reel and earn up to 100% back.`,
  bottomCtaPro: "Get Pro",
  bottomCtaReel: "Creator offer",

  socialProofLine: "Joined by 3,000+ happy users",
  socialProofRating: 5,

  trust: {
    checkoutLabel: "Secure checkout",
    checkoutDetail: "Powered by Stripe · SSL encrypted",
    deliveryLabel: "Instant delivery",
    deliveryDetail: "License key emailed in seconds",
    guaranteeLabel: "7-day money-back guarantee",
    guaranteeDetail: "Not satisfied? Email us within 7 days for a full refund.",
    guaranteeHref: "/legal/refund",
    noSubLabel: "Pay once",
    noSubDetail: "No subscription · Lifetime updates",
    tryFreeLabel: "Try before you buy",
    tryFreeDetail: "Download free — upgrade when ready",
    tryFreeHref: "/download",
  },

  reviews: {
    title: "What Mac users are saying",
    subtitle: "MacWall Pro users on Apple Silicon and Intel Macs.",
    items: [
      {
        quote:
          "Battery finally stays normal with a 4K loop running. I set it once and basically forget it's there.",
        name: "James",
        context: "MacBook Pro M3 · Seattle",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Lock Screen video on Tahoe sold me. One payment, no subscription emails — that's it.",
        name: "Priya",
        context: "MacBook Air M2 · London",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Threw my own drone clips in 4K on an ultrawide. Pauses when I'm full-screen — exactly what I needed.",
        name: "Alex",
        context: "Mac Studio · Toronto",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Took maybe 30 seconds to set up. My desk-setup posts look way better with the wallpaper actually moving.",
        name: "Sofia",
        context: "MacBook Pro M4 · Barcelona",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Cheaper than the other Mac wallpaper apps I tried, and I actually own it. Catalog's solid too.",
        name: "Marcus",
        context: "iMac M1 · Atlanta",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "CPU barely moves. Tried three apps before this — MacWall is the only one still on my Mac mini.",
        name: "Daniel",
        context: "Mac mini M2 · Berlin",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
    ] satisfies readonly PricingReview[],
  },
} as const
