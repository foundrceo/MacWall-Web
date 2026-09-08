import {
  macwall,
  mailtoReelRefund,
  macwallLockScreenMacOSVersion,
  macwallMacOSRequirementsHint,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSRequirement,
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

  plans: {
    pro: {
      title: "Pro",
      subtitle: "For everyday use on up to 3 Macs",
      badge: "Most Popular",
      badgeAlt: "47% off",
      featuresPrefix: "Includes:",
      ctaPermanent: "Get Pro",
    },
    proPlus: {
      title: "Pro+",
      subtitle: "For multi-Mac setups and studios",
      badge: "Multi-Mac",
      featuresPrefix: "Everything in Pro, plus:",
      cta: "Get Pro+",
    },
    reel: {
      title: "Get it for free",
      subtitle: "Post a Reel about your setup",
      price: "Up to 100% refunded",
      featuresPrefix: "How it works:",
      cta: "See how it works",
    },
  },

  heroTitle: "Pay once. Yours forever.",
  heroLead: "1,000+ cinematic 4K loops, your own videos, and hardware-decoded playback on every display. Lock Screen and Screen Saver video on macOS 26+.",

  reelRefundHook: {
    line: "Post a Reel, get up to 100% back",
    href: "/creator",
  },

  reelRefund: {
    badge: "Reel refund",
    title: "Post a Reel, get your money back",
    description:
      "Film your desktop, post it on Instagram or TikTok, and we refund you. Organic views only.",
    steps: [
      {
        icon: "video" as const,
        title: "Film your setup",
        body: `Record ${macwall.name} running on your Mac: your wallpaper, your desk, your setup. Short and natural works best.`,
      },
      {
        icon: "tag" as const,
        title: "Post and tag us",
        body: `Post it on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag}.`,
      },
      {
        icon: "views" as const,
        title: "Hit the view count",
        body: `${macwall.reelRefundHalfViews.toLocaleString()} views gets you 50% back. ${macwall.reelRefundFullViews.toLocaleString()} views gets you 100% back.`,
      },
      {
        icon: "email" as const,
        title: "Email us to claim",
        body: `Send ${macwall.reelRefundEmail} your Reel link, a screenshot of the views, and the email you paid with.`,
      },
    ],
    influencerTitle: "Got a big following?",
    finePrintLabel: "The fine print:",
    finePrint:
      "Post as many times as you like until one Reel hits 2,000 organic views. No bots, no paid promotion. We check the numbers and can decline suspicious claims. Refunds go back to the card you paid with. We can end this offer at any time.",
    cta: "Email us to claim your refund",
    ctaHref: mailtoReelRefund,
  },

  pro: {
    features: [
      "1,000+ live 4K wallpapers",
      "One payment, lifetime updates",
      "Live Lock Screen & Screen Saver (macOS 26+)",
      "Import your own videos",
      "Music Sync",
      "Multi-display, hardware decoded",
      "Pauses on battery and full screen",
    ],
  },

  proPlus: {
    features: [
      "Works on up to 5 Macs",
      "One license, switch Macs anytime",
      "Lower price per Mac on bigger packs",
    ],
  },

  multiMac: {
    title: "Got more than one Mac?",
    lead: "Cover several Macs for less per machine. Same Pro features, more devices.",
    offerLabel: "5 Macs, one payment",
    cta: "Get the 5-Mac license",
  },

  faqTitle: "Common questions",

  faq: [
    {
      q: "Is Pro a subscription?",
      a: "No. One payment, then it's yours. Updates stay free and there's no account to create.",
    },
    {
      q: "How does payment work?",
      a: "Checkout runs on Stripe. Your license key is emailed the moment payment clears. Keep that email for reinstalls or a new Mac.",
    },
    {
      q: "How many Macs can I use one license on?",
      a: "Pro covers 3 Macs. Pro+ covers 5, 10, 15, or 20 depending on the pack. Swapping machines? Unlink the old one in Settings → Devices and activate the new one.",
    },
    {
      q: "I'm on my phone. Can I still buy it?",
      a: `Yes. Buy on your phone and your license key is emailed straight away. Install ${macwall.name} on your Mac whenever you sit down at it.`,
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: `Live Lock Screen and Screen Saver need ${macwallLockScreenMacOSVersion} or later. Live desktop wallpapers work on ${macwallMinimumMacOSVersion} and up.`,
    },
    {
      q: "Which macOS versions are supported?",
      a: `${macwallMacOSRequirementsHint}. Apple silicon and Intel Macs both work.`,
    },
    {
      q: "Can I try it before I pay?",
      a: "Yes. Download MacWall free and run a selection of wallpapers on your desktop. Buy Pro when you want the full catalog, imports, and Lock Screen.",
    },
    {
      q: "How do I get my money back for posting a Reel?",
      a: `Buy Pro, post about ${macwall.name} on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag}, then email ${macwall.reelRefundEmail}. ${macwall.reelRefundHalfViews.toLocaleString()} views gets you half back, ${macwall.reelRefundFullViews.toLocaleString()} views gets you the full amount back.`,
    },
    {
      q: "Can I get a refund without posting a Reel?",
      a: `License keys are non-refundable once delivered. If something's genuinely wrong, like a double charge or the app not running on a supported macOS version, email ${macwall.supportEmail}.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks off.`,
    },
  ] as const,

  bottomTitle: "Unlock every wallpaper.",
  bottomDesc: "One payment. License emailed instantly.",
  bottomCtaPro: "Get Pro",
  bottomCtaReel: "Get it free with a Reel",

  socialProofLine: "1,000+ wallpapers · trusted by Mac users worldwide",
  socialProofRating: 5,

  cardFooter: {
    tryFreeLabel: "Free to try",
    macOSLabel: macwallMinimumMacOSRequirement.replace(/^Minimum /, ""),
    updatesLabel: "Lifetime updates",
  },

  trust: {
    checkoutLabel: "Secure Stripe checkout",
    checkoutDetail: "Powered by Stripe · SSL encrypted",
    deliveryLabel: "License emailed instantly",
    deliveryDetail: "Your license key arrives in seconds",
    guaranteeLabel: "1,000+ wallpapers",
    guaranteeDetail: "Full catalog unlocked with Pro",
    guaranteeHref: "/wallpapers",
    noSubLabel: "One payment, no subscription",
    noSubDetail: "Pay once · free updates forever",
    tryFreeLabel: "Try before you buy",
    tryFreeDetail: "Free download, pay when you want the full catalog",
    tryFreeHref: "/download",
  },

  reviews: {
    title: "What Mac users are saying",
    subtitle: "MacWall Pro users on Apple silicon and Intel Macs.",
    items: [
      {
        quote:
          "Battery barely moves with a 4K loop running. I set it once and forget it's there.",
        name: "James",
        context: "MacBook Pro M3 · Seattle",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Lock Screen video on Tahoe sold me. Paid once and that was it. No subscription emails.",
        name: "Priya",
        context: "MacBook Air M2 · London",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Threw my own drone clips in 4K onto an ultrawide. Pauses when I go full screen. Exactly what I wanted.",
        name: "Alex",
        context: "Mac Studio · Toronto",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Took about 30 seconds to set up. My desk-setup posts look way better with the wallpaper actually moving.",
        name: "Sofia",
        context: "MacBook Pro M4 · Barcelona",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "Cheaper than the other Mac wallpaper apps I tried, and I actually own it instead of renting it. Catalog's solid too.",
        name: "Marcus",
        context: "iMac M1 · Atlanta",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
      {
        quote:
          "CPU barely moves. I tried three apps before this one. MacWall is the only one still on my Mac mini.",
        name: "Daniel",
        context: "Mac mini M2 · Berlin",
        rating: 5,
        avatarSrc:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&fit=crop&crop=faces&auto=format&q=75",
      },
    ] satisfies readonly PricingReview[],
  },
} as const
