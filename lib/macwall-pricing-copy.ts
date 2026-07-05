import { macwall } from "@/lib/macwall-site"

/** Copy for `/pricing` — Wallper pricing layout (`Pro_*` CSS), MacWall product truth. */
export const macwallPricingCopy = {
  heroTitle: "One app. Free tier or Pro.",
  heroLead: `Use ${macwall.name} free with the core catalog, imports, and multi-display playback—then unlock Pro when you want Lock Screen video, deeper libraries, and premium drops. No subscription: Pro is a single purchase with lifetime updates for your licensed Macs.`,

  free: {
    badge: "Free",
    title: "For everyday desktops",
    price: "$0",
    tagline: "Everything you need to try motion wallpapers without paying.",
    cta: "Download for Mac",
    ctaAria: `Download ${macwall.name} for Mac`,
    features: macwall.freeFeatures.slice(0, 6),
  },

  pro: {
    badge: "Pro",
    title: "Lifetime license",
    priceLine: `${macwall.pro.price} ${macwall.pro.suffix}`,
    tagline: `${macwall.pro.headline}: Lock Screen video where macOS allows, richer catalog access, and upcoming Pro-only tools.`,
    cta: `Buy Pro — ${macwall.pro.price}`,
    ctaAria: `Buy ${macwall.name} Pro for ${macwall.pro.price}`,
    features: [
      ...macwall.pro.features,
      `Use on up to ${macwall.maxLicensedMacs} personal Macs`,
      "Lifetime updates with your license — no subscription",
      "Checkout via Whop — license delivered by email",
    ].slice(0, 6),
  },

  tech: [
    {
      title: "Native on macOS",
      body: "Built for menu bar control, Spaces, and multi-display layouts — with decoding paths that respect how macOS schedules work.",
    },
    {
      title: "Smart power",
      body: "Pause when you are on battery, when another app goes fullscreen, or when you just want silence — without hunting through dialogs.",
    },
    {
      title: "Privacy-first",
      body: "Imports and favorites stay on disk you control. Transparent choices about what syncs or downloads from the cloud.",
    },
  ] as const,

  faqTitle: "Questions? Answers.",

  faq: [
    {
      q: "What is included in the free tier?",
      a: `Browsing the catalog, saving favorites, importing your own videos, one hardware-backed player per display, and sensible pause rules — everything ${macwall.name} needs to be useful before you pay.`,
    },
    {
      q: "Is Pro a subscription?",
      a: "No. Pro is a one-time purchase for the current Pro feature set bundled with your license, including updates we ship for that generation of the product.",
    },
    {
      q: "How does checkout work?",
      a: "Checkout runs on Whop. After payment, your license details are delivered to the email you used — keep that message for reinstalls or device changes.",
    },
    {
      q: "How many Macs can I use with one Pro license?",
      a: `Each Pro license may be activated on up to ${macwall.maxLicensedMacs} personal Macs you own. Replace a machine by moving the seat from the old Mac to the new one in line with the terms you agree to at purchase.`,
    },
    {
      q: "Does Lock Screen video work on every macOS version?",
      a: "Lock Screen live wallpapers follow Apple’s platform gates. Where the OS does not expose APIs, Pro still unlocks catalog depth and other premium features documented on this site and in the app.",
    },
    {
      q: "Can I get a refund?",
      a: `Refund eligibility is described in our Terms of Service. If you are within the posted window and qualify, email ${macwall.supportEmail} with your order details.`,
    },
    {
      q: "Where do I get help?",
      a: `Email ${macwall.supportEmail} with your macOS version, Mac model, and a short screen recording if something looks wrong — we read every message.`,
    },
    {
      q: "Which macOS releases are supported?",
      a: "We target current and recent macOS versions on Apple silicon, and Intel where Apple still ships security updates for the OS. Grab the latest build from the site for the freshest compatibility notes.",
    },
  ] as const,

  bottomTitle: `Ready to try ${macwall.name}?`,
  bottomDesc: `Free tier first. Pro when you want it. Up to ${macwall.maxLicensedMacs} Macs with a personal Pro license.`,
  bottomCtaFree: "Download for Mac",
  bottomCtaPro: `Buy Pro — ${macwall.pro.price}`,
} as const
