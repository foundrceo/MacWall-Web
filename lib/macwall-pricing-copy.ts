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
  avatarSrc?: string
}

export const macwallPricingCopy = {
  pageTitle: "Pricing",

  plans: {
    pro: {
      title: "Pro",
      subtitle: "For everyday use on up to 3 Macs",
      badge: "Most Popular",
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
      title: "Get paid back",
      subtitle: "Post a Reel about your setup, tagged #ad",
      price: "Up to 100% refunded",
      featuresPrefix: "How it works:",
      cta: "See how it works",
    },
  },

  heroTitle: "Pay once. Keep Pro.",
  heroLead: "Full catalog and updates. No subscription.",

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
        body: `Post it on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag} and #ad (or the paid-partnership label).`,
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
      "Post as many times as you like until one Reel hits 2,000 organic views. No bots, no paid promotion. Posts without #ad or a paid-partnership label don't qualify. We check the numbers and can decline suspicious claims. Refunds go back to the card you paid with. A 100% refund deactivates that license key, like any full refund. We can end this offer at any time.",
    cta: "Email us to claim your refund",
    ctaHref: mailtoReelRefund,
  },

  pro: {
    features: [
      "1,000+ live wallpapers, most in 4K",
      "Bend: close the lid, desktop folds",
      "Live Lock Screen & Screen Saver (macOS 26+)",
      "Import your own videos",
      "Music Sync",
      "Multi-display, hardware decoded",
      "Pauses behind full-screen apps",
      "One payment, lifetime updates",
    ],
  },

  proPlus: {
    features: [
      "Bend lid fold on every licensed Mac",
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

  faqTitle: "FAQ",

  faq: [
    {
      q: "What's the difference between Pro and Pro+?",
      a: "Only the number of Macs. Pro works on up to 3 Macs. Pro+ works on 5 or 10. Every feature is the same on both.",
    },
    {
      q: "Is it really a one-time payment?",
      a: "Yes. You pay once and keep Pro forever, including every future update. It's not a subscription and nothing renews.",
    },
    {
      q: "Where is my license key?",
      a: `We email it to the address you enter at checkout, usually within seconds. Check Spam or Promotions if you don't see it, or email ${macwall.supportEmail} with your receipt.`,
    },
    {
      q: "What can I do for free?",
      a: "Every download starts with a free 24-hour trial of everything. After the trial you can keep browsing the catalog. Setting live wallpapers, Lock Screen, and imports need Pro.",
    },
    {
      q: "I have 4 or 5 Macs. Which plan do I need?",
      a: "Pro+ with 5 Macs. If you're buying Pro, you can also add 2 more Macs right on the checkout page, which costs the same as Pro+.",
    },
    {
      q: "How do I move my license to a new Mac?",
      a: "On the old Mac, open Settings → MacWall Pro and click Unlink. Then activate the new Mac with the same key.",
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
      q: "How do I get my money back for posting a Reel?",
      a: `Buy Pro, post about ${macwall.name} on Instagram ${macwall.reelRefundInstagram} or TikTok ${macwall.reelRefundTiktok} with ${macwall.reelRefundHashtag} and #ad, then email ${macwall.reelRefundEmail}. ${macwall.reelRefundHalfViews.toLocaleString()} views gets you half back and your license stays active. ${macwall.reelRefundFullViews.toLocaleString()} views gets you the full amount back, and like any full refund, that license key is deactivated.`,
    },
    {
      q: "Can I get a refund without posting a Reel?",
      a: `Yes. Every license has a ${macwall.refundWindowDays}-day money-back guarantee, no reason needed. Email ${macwall.supportEmail} within ${macwall.refundWindowDays} days of purchase and we'll refund you in full.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks off.`,
    },
  ] as const,

  /** Questions support gets most (Jun–Oct 2026), answered as the app works today. */
  supportFaq: [
    {
      q: "Will I be charged when the free trial ends?",
      a: "No. The trial never asks for a card, so nothing is charged. It lasts 24 hours, once per Mac. After it ends you can still browse; live wallpapers need Pro.",
    },
    {
      q: "Do I need an account to use my license?",
      a: "No. There's no account or login. Click Activate in the license email on your Mac, or paste the key into Settings → MacWall Pro.",
    },
    {
      q: "Can the desktop and Lock Screen have different wallpapers?",
      a: "Yes, with MacWall App playback (Settings → Wallpaper → Playback): set your desktop wallpaper, then set another with Lock Screen Only. With System Wallpaper playback both show the same wallpaper.",
    },
    {
      q: "Does the wallpaper keep playing if I quit MacWall or restart?",
      a: "Yes, with System Wallpaper playback on macOS 26: macOS plays it itself, even after a restart. With MacWall App playback the desktop waits until MacWall opens again.",
    },
    {
      q: "Do wallpapers have sound?",
      a: "Some do; most are silent. Turn sound on from the player bar or the MacWall menu bar icon, and set the level in Settings → Sound.",
    },
    {
      q: "Why did my wallpaper stop moving?",
      a: "MacWall pauses behind full-screen apps, and, if you turn them on, in Low Power Mode or when your Mac is busy. Change these in Settings → Battery & Performance.",
    },
    {
      q: "Can I use a different wallpaper on each display?",
      a: "Yes. On a wallpaper's page, click the arrow next to Set Wallpaper and pick a display.",
    },
    {
      q: "I clicked Set Wallpaper and nothing changed. What now?",
      a: `Update to the latest ${macwall.name}, make sure it's in your Applications folder and opened from there, then set it again. If the message mentions System Wallpaper, one click switches to MacWall App playback. Still stuck? Use Help inside the app.`,
    },
    {
      q: "Will it slow down my Mac or drain the battery?",
      a: "Wallpapers are hardware-decoded and pause behind full-screen apps. You can also pause in Low Power Mode or when your Mac is busy, or lower quality on battery.",
    },
    {
      q: "Can I download the video files?",
      a: `No. Wallpapers stay inside ${macwall.name}. Each one downloads once, then plays offline.`,
    },
    {
      q: "Is there a Windows or iPad version?",
      a: `No. ${macwall.name} is made only for the Mac.`,
    },
    {
      q: "How do I remove MacWall?",
      a: "In the menu bar choose Stop Wallpaper, then Quit MacWall, then drag MacWall from Applications to the Trash. Your previous wallpaper comes back.",
    },
  ] as const,

  bottomTitle: "Unlock every wallpaper.",
  bottomDesc: "One payment. License emailed instantly.",
  bottomCtaPro: "Get Pro",
  bottomCtaReel: "Get money back with a Reel",


  cardFooter: {
    tryFreeLabel: "Free to try",
    macOSLabel: macwallMinimumMacOSRequirement.replace(/^Minimum /, ""),
    updatesLabel: "Lifetime updates",
  },

  trust: {
    checkoutLabel: "Secure checkout",
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
    eyebrow: "Trusted by Mac users",
    title: "What people say",
    subtitle: "From people who set it on their Mac.",
    items: [
      {
        quote:
          "Just got Virat's wallpaper and it's awesome. I really loved that one.",
        name: "Dev Sharma",
        context: "MacBook Air · M2",
        avatarSrc: "/reviews/dev-sharma.jpg",
      },
      {
        quote:
          "I love the app and the wallpapers. Just a request: add more anime like Toji and Pain.",
        name: "Lakshay",
        context: "Mac · M5",
        avatarSrc: "/reviews/lakshay.jpg",
      },
      {
        quote:
          "Thank you so much. Make a couple fight scenes and take all the time you need. Appreciated.",
        name: "Kranthi Kalyan",
        context: "MacBook Air · M4",
        avatarSrc: "/reviews/kranthi-kalyan.jpg",
      },
      {
        quote:
          "I want to share with the community as much as possible. I'll be submitting many videos over time.",
        name: "Dishan Shrestha",
        context: "MacBook Air · M1",
        avatarSrc: "/reviews/dishan-shrestha.jpg",
      },
    ] satisfies readonly PricingReview[],
  },
} as const

const pricingFaqByQuestion = new Map<string, { q: string; a: string }>(
  macwallPricingCopy.faq.map((item) => [item.q, item])
)
const supportFaqByQuestion = new Map<string, { q: string; a: string }>(
  macwallPricingCopy.supportFaq.map((item) => [item.q, item])
)

function faqItems(
  source: Map<string, { q: string; a: string }>,
  questions: readonly string[]
) {
  return questions.map((q) => {
    const item = source.get(q)
    if (!item) throw new Error(`Missing FAQ: ${q}`)
    return item
  })
}

/** Home page FAQ: what people ask support most, then buying questions. */
export const macwallHomeFaq: readonly { q: string; a: string }[] = [
  ...faqItems(pricingFaqByQuestion, [
    "What can I do for free?",
    "Is it really a one-time payment?",
  ]),
  ...faqItems(supportFaqByQuestion, [
    "Will I be charged when the free trial ends?",
  ]),
  ...faqItems(pricingFaqByQuestion, [
    "Where is my license key?",
  ]),
  ...faqItems(supportFaqByQuestion, [
    "Do I need an account to use my license?",
  ]),
  ...faqItems(pricingFaqByQuestion, [
    "What's the difference between Pro and Pro+?",
    "Does Lock Screen video work on every macOS version?",
  ]),
  ...faqItems(supportFaqByQuestion, [
    "Can the desktop and Lock Screen have different wallpapers?",
    "Does the wallpaper keep playing if I quit MacWall or restart?",
    "Do wallpapers have sound?",
    "Why did my wallpaper stop moving?",
    "Can I use a different wallpaper on each display?",
    "I clicked Set Wallpaper and nothing changed. What now?",
    "Will it slow down my Mac or drain the battery?",
    "Can I download the video files?",
    "Is there a Windows or iPad version?",
  ]),
  ...faqItems(pricingFaqByQuestion, [
    "How do I move my license to a new Mac?",
    "Can I get a refund without posting a Reel?",
    "How do I get my money back for posting a Reel?",
  ]),
  ...faqItems(supportFaqByQuestion, ["How do I remove MacWall?"]),
]

