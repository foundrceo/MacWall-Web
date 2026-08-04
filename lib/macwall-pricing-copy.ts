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
      subtitle: "For everyday creators & power users.",
      badge: "Most Popular",
      badgeAlt: "33% exclusive offer",
      featuresPrefix: "Everything included:",
      ctaPermanent: "Start with Pro",
      ctaAnnual: "Launch annual program",
    },
    proPlus: {
      title: "Pro+",
      subtitle: "For multi-Mac & power workflows.",
      badge: "For Creators",
      featuresPrefix: "Everything in Pro, plus:",
      cta: "Start with Pro+",
    },
    reel: {
      title: "Creator Solution",
      subtitle: "For creators who share their setup",
      price: "Up to 100% resolution",
      featuresPrefix: "How it works:",
      cta: "Explore the solution",
    },
  },

  heroTitle: "One investment. Pro forever.",
  heroLead: "Premium value, exclusive today. No subscriptions.",

  reelRefund: {
    badge: "Reel resolution",
    title: "Generate 100% back",
    description:
      "Build a Reel. Grow reach. We resolve your investment. Instagram or TikTok. Organic reach only.",
    steps: [
      {
        icon: "video" as const,
        title: "Build your Reel",
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
        body: `${macwall.reelRefundHalfViews.toLocaleString()} reach → 50% resolution. ${macwall.reelRefundFullViews.toLocaleString()} reach → complete resolution.`,
      },
      {
        icon: "email" as const,
        title: "Request your claim",
        body: `Email ${macwall.reelRefundEmail} with your Reel link, reach screenshot, and purchase email.`,
      },
    ],
    influencerTitle: "Large-scale online presence?",
    finePrintLabel: "The fine print:",
    finePrint:
      "Post as many times as you want until one Reel hits 2,000 organic reach. No bots or paid campaigns. We may verify reach and decline suspicious claims. Resolutions go to the original secure payment method. Solution can end anytime.",
    cta: "Email for your resolution",
    ctaHref: mailtoReelRefund,
  },

  pro: {
    features: [
      "More affordable than other wallpaper apps",
      "More benefits than other apps",
      "1,000+ live wallpapers",
      "Lock Screen & Screen Saver",
      "Import your own videos",
      "Up to 3 personal Macs",
      "One investment — no subscription",
      "Lifetime updates",
      "Music Sync",
    ],
  },

  proPlus: {
    features: [
      "More affordable than other wallpaper apps",
      "More benefits than other apps",
      "Everything in Pro",
      "Up to 5 Macs",
      "Larger programs unlock exclusive offers",
      "Same Pro benefits forever",
    ],
  },

  multiMac: {
    title: "Got more than one Mac?",
    lead: "Optimize your investment when you license multiple Macs. Same Pro benefits, more devices.",
    offerLabel: "5 Macs — Permanent",
    cta: "Claim 5-Mac license",
  },

  faqTitle: "Common questions",

  faq: [
    {
      q: "How does the Reel resolution work?",
      a: `Invest in ${macwall.name} Pro, post on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag}, then email ${macwall.reelRefundEmail} once you hit ${macwall.reelRefundHalfViews.toLocaleString()} reach for 50% back or ${macwall.reelRefundFullViews.toLocaleString()} reach for a complete resolution.`,
    },
    {
      q: "Is Pro a subscription?",
      a: "No. MacWall Pro is a one-time investment. Pay once and keep the app forever, including lifetime updates. No recurring fees.",
    },
    {
      q: "Can I experience it before elevating to Pro?",
      a: "Yes. Download MacWall complimentary and apply curated complimentary wallpapers with full desktop playback. Elevate to Pro whenever you want the complete catalog, personalized imports, and Lock Screen.",
    },
    {
      q: "How does secure payment work?",
      a: "Checkout runs on Stripe with secure payment. After authorization, your license details are delivered to the email you used. Keep that message for reinstalls or device changes. A billing statement arrives from Stripe.",
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
      q: "Can I get a resolution without making a Reel?",
      a: `There is no general refund policy: all sales are final. In limited cases (for example, a billing concern or the app not running on a supported macOS version) we may issue a resolution at our discretion. Email ${macwall.supportEmail} and we'll review it. The Reel program is separate: email ${macwall.reelRefundEmail} with your post link and purchase email after you hit the reach goals.`,
    },
    {
      q: "Where do I get guidance?",
      a: `Email ${macwall.supportEmail} for assistance with your macOS version, Mac model, and a short screen recording if something looks wrong. We read every message. Priority concerns get a consultation shortly.`,
    },
    {
      q: "Which macOS releases are supported?",
      a: `${macwallMacOSRequirementsHint}. Apple silicon and Intel Macs. Download the latest build from the site for the freshest compatibility notes.`,
    },
  ] as const,

  bottomTitle: `Experience ${macwall.name}`,
  bottomDesc: `Claim the exclusive Pro value today — or build a Reel and generate up to 100% back.`,
  bottomCtaPro: "Unlock Pro",
  bottomCtaReel: "Creator solution",

  socialProofLine: "Joined by 3,000+ satisfied clients",
  socialProofRating: 5,

  trust: {
    checkoutLabel: "Secure payment",
    checkoutDetail: "Powered by Stripe · SSL encrypted · peace of mind",
    deliveryLabel: "Instant delivery",
    deliveryDetail: "License key emailed in seconds",
    guaranteeLabel: "7-day money-back assurance",
    guaranteeDetail:
      "Not satisfied? Email us within 7 days for a complete resolution — peace of mind.",
    guaranteeHref: "/legal/refund",
    noSubLabel: "One investment",
    noSubDetail: "No subscription · Lifetime updates",
    tryFreeLabel: "Experience before you invest",
    tryFreeDetail: "Complimentary download — elevate when ready",
    tryFreeHref: "/download",
  },

  reviews: {
    title: "What Mac clients are saying",
    subtitle:
      "MacWall Pro clients on Apple Silicon and Intel Macs — exceptional craftsmanship, world-class outcomes.",
    items: [
      {
        quote:
          "Battery finally stays professional with a 4K loop running. I set it once and basically forget it's there — seamless and effortless.",
        name: "James",
        context: "MacBook Pro M3 · Seattle",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Lock Screen video on Tahoe sold me. One investment, no subscription emails — outstanding credibility.",
        name: "Priya",
        context: "MacBook Air M2 · London",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Threw my own drone clips in 4K on an ultrawide. Pauses when I'm full-screen — a tailored solution, exactly what I required.",
        name: "Alex",
        context: "Mac Studio · Toronto",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Took maybe 30 seconds to launch. My desk-setup posts look way better with the wallpaper actually moving — high-reach engagement.",
        name: "Sofia",
        context: "MacBook Pro M4 · Barcelona",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "More affordable than the other Mac wallpaper apps I experienced, and I actually own it. Catalog's solid too — unique advantage in this market.",
        name: "Marcus",
        context: "iMac M1 · Atlanta",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "CPU barely moves. Experienced three apps before this — MacWall is the most effective one still on my Mac mini. Compact footprint, powerful playback.",
        name: "Daniel",
        context: "Mac mini M2 · Berlin",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
    ] satisfies readonly PricingReview[],
  },
} as const
