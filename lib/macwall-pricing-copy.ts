import { AFFONSO_COOKIE_DURATION_DAYS } from "@/lib/macwall-affiliate"
import { AFFILIATE_COMMISSION_PERCENT } from "@/lib/macwall-affiliate-copy"
import {
  macwall,
  macwallBatteryPolicy,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSRequirement,
  macwallCatalog,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"
import {
  formatPriceCents,
  proPriceFor,
  type SaleAwarePrice,
} from "@/lib/pricing/sale-aware-price"

const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app
const battery = macwallBatteryPolicy

export type ReelRefundStepIcon = "video" | "tag" | "views" | "email"

export type PricingReview = {
  quote: string
  name: string
  context: string
  avatarSrc?: string
}

export const macwallPricingCopy = {
  pageTitle: "MacWall Pricing: One-Time License, No Subscription",
  /** The page's H1: names the brand and the query, not just a mood line. */
  heroH1: `${macwall.name} pricing: pay once, keep it`,

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
  },

  heroTitle: "Pay once. Keep Pro.",
  heroLead: "Full catalog and updates. No subscription.",

  affiliateHook: {
    title: `Earn ${AFFILIATE_COMMISSION_PERCENT}% on every sale you refer`,
    body: `Join the affiliate program and share one link. ${AFFONSO_COOKIE_DURATION_DAYS}-day tracking, free to join, no follower minimum.`,
    cta: "See how it works",
    href: "/affiliate",
  },

  pro: {
    features: [
      `${macwallCatalog.liveCountLabel} live wallpapers, most in 4K`,
      "Bend: close the lid, desktop folds",
      `Live Lock Screen & Screen Saver (${systemPlayback.minimumMacOS}+)`,
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
      a: `${macwallTrial.summary} After the trial you can keep browsing the catalog; setting live wallpapers and the Lock Screen need Pro.`,
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
      a: macwallSupportedMacOS.summary,
    },
    {
      q: "Can I get a refund?",
      a: `Yes. Every license has a ${macwall.refundWindowDays}-day money-back guarantee, no reason needed. Email ${macwall.supportEmail} within ${macwall.refundWindowDays} days of purchase and we'll refund you in full.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks off.`,
    },
  ] as const,

  /** Questions support gets most, answered as the app works today. */
  supportFaq: [
    {
      q: "Will I be charged when the free trial ends?",
      a: `No. The trial asks for your email address but never a card, so nothing is charged. It lasts ${macwallTrial.hours} hours, once per Mac. After it ends you can still browse; live wallpapers need Pro.`,
    },
    {
      q: "Do I need an account to use my license?",
      a: "No. There's no account or login. Click Activate in the license email on your Mac, or paste the key into Settings → MacWall Pro.",
    },
    {
      q: "Can the desktop and Lock Screen have different wallpapers?",
      a: `Yes, with ${appPlayback.setting} playback (${appPlayback.marketing}; choose it in ${macwallPlaybackModes.settingsPath}): set your desktop wallpaper, then open another one, click the arrow next to Set Wallpaper and choose Lock Screen Only. With ${systemPlayback.setting} playback (${systemPlayback.marketing}) the desktop, Lock Screen and screen saver show the same wallpaper.`,
    },
    {
      q: "Does the wallpaper keep playing if I quit MacWall or restart?",
      a: `Yes, with ${systemPlayback.setting} playback (${systemPlayback.marketing}) on ${systemPlayback.minimumMacOS} or later: macOS plays it itself, even after a restart, and ${systemPlayback.cpu}. With ${appPlayback.setting} playback (${appPlayback.marketing}) the desktop holds a still frame until MacWall opens again.`,
    },
    {
      q: "Do wallpapers have sound?",
      a: "Some do; most are silent. Turn sound on from the player bar or the MacWall menu bar icon, and set the level in Settings → Sound. MacWall remembers on or off for each wallpaper.",
    },
    {
      q: "Why did my wallpaper stop moving?",
      a: `MacWall pauses behind full-screen apps, and, if you turn them on, whenever your Mac is unplugged (${battery.pauseOnBattery.label}) or busy (${battery.pauseWhenBusy.label}). Change these in ${battery.settingsPath}.`,
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
      a: `Wallpapers are hardware-decoded and pause behind full-screen apps. You can also turn on ${battery.pauseOnBattery.label}, which ${battery.pauseOnBattery.detail}, ${battery.lowerQualityOnBattery.label}, or ${battery.pauseWhenBusy.label}.`,
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

  cardFooter: {
    tryFreeLabel: "Free to try",
    macOSLabel: macwallMinimumMacOSRequirement.replace(/^Minimum /, ""),
    updatesLabel: "Lifetime updates",
  },

  trust: {
    checkoutLabel: "Secure checkout",
    checkoutDetail: "Payments processed by Stripe · encrypted in transit",
    deliveryLabel: "License emailed instantly",
    deliveryDetail: "Your license key arrives in seconds",
    guaranteeLabel: `${macwallCatalog.liveCountLabel} wallpapers`,
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
    title: "Mac users, in their own words",
    subtitle: "Real messages from people running MacWall.",
    items: [
      {
        quote:
          "Hats off to you, man! I really loved it. Thank you so much, keep working like this.",
        name: "Dev Sharma",
        context: "MacBook Air · M2",
      },
      {
        quote: "Hey, I love the app and the wallpapers.",
        name: "Lakshay",
        context: "Mac · M5",
      },
      {
        quote: "Thank you so much. Take all the time you need. Appreciated.",
        name: "Kranthi Kalyan",
        context: "MacBook Air · M4",
      },
      {
        quote:
          "I want to share with the community as much as possible. I'll be submitting many videos over time.",
        name: "Dishan Shrestha",
        context: "MacBook Air · M1",
      },
      // From support chats; first names only for people who haven't been asked.
      {
        quote:
          "I like that the wallpaper still works when the app is closed. That's the best thing I like.",
        name: "Om",
        context: "MacBook Air · M5",
      },
      {
        quote: "All the wallpapers are good.",
        name: "Shreyas",
        context: "MacBook Air · M4",
      },
      {
        quote: "Good luck with your updates. Very excited.",
        name: "Sonit",
        context: "Mac · M5",
      },
    ] as readonly PricingReview[],
  },
} as const

/** "$9.09 (Black Friday, regular $12.99)", or "$12.99" outside a sale. */
function compactSalePrice(price: SaleAwarePrice): string {
  const current = formatPriceCents(price.currentCents)
  if (price.saleCents === null || !price.label) return current
  return `${current} (${price.label}, regular ${formatPriceCents(price.regularCents)})`
}

/**
 * The /pricing hero's price line, rendered on the server so crawlers and AI
 * tools read the price and the India price without running the client:
 * "Pro for 3 Macs: $12.99 once, or $4.99 in India. Prices in US dollars."
 * Sale-aware at render time (the sale-boundary cron revalidates /pricing).
 */
export function pricingHeroPriceLine(now: number = Date.now()): string {
  const pro = proPriceFor("default", now)
  const india = proPriceFor("india", now)
  return `Pro for ${pro.macs} Macs: ${compactSalePrice(pro)} once, or ${compactSalePrice(india)} in India. Prices in US dollars; nothing renews.`
}

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
  ...faqItems(pricingFaqByQuestion, ["Where is my license key?"]),
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
    "Can I get a refund?",
  ]),
  ...faqItems(supportFaqByQuestion, ["How do I remove MacWall?"]),
]
