import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

/** User-visible strings for marketing pages (`macwall-marketing/*`). */
export const macwallMarketingCopy = {
  header: {
    navOverview: "Overview",
    navGallery: "Wallpapers",
    navBlog: "Blog",
    navSocials: "Community",
    navSupport: "Help",
    navPricing: "Pricing",
    navSubmit: "Submit",
    navAffiliate: "Affiliate",
    downloadCta: "Get MacWall",
    logoAlt: `${macwall.name} logo`,
  },
  hover: {
    exploreTitle: "Community & news",
    supportEmailTitle: "Request guidance",
    links: {
      discord: {
        label: "Discord server",
        title: "Join a discussion with other MacWall clients",
      },
      supportMail: {
        label: macwall.supportEmail,
        title: "Email for assistance",
      },
    },
  },
  ribbon: {
    lineBeforeLink: `Innovative: ${macwall.name} brings live Lock Screen and Screen Saver wallpapers to ${macwallLockScreenMacOSVersion}, working on the latest builds where the market needs improvement. Desktop wallpapers run on ${macwallMinimumMacOSVersion}+. `,
    linkText: `Get ${macwall.name}`,
  },
  interact: {
    kicker: "In the app",
    title: "Live 4K wallpapers for your Mac.",
    moreLink: "How licensing works",
    demoVideoAria: "Background preview loop",
    dockAria: `Focus ${macwall.name}`,
    /** When the demo window is closed — tap the faux menu-bar status chip to reopen (same chip as when open). */
    demoReopenMenubarAria: `Open ${macwall.name}`,
    /** Red stoplight in the faux window chrome. */
    demoCloseWindowAria: "Close demo window",
    menubarBrand: macwall.name,
    menubarStatus: "Runs in the menu bar",
    heroLead:
      "Set a cinematic live wallpaper in one click — seamless, effortless, streamlined. Curated cloud catalog, personalized clips, multi-display playback, and a battery that barely notices. One investment, own it forever.",
    paragraph1Lead: "Experience it today",
    paragraph1Rest:
      "This demo is the real app. Click any wallpaper to set it. That's the entire learning curve. Native macOS design with smooth, hardware-decoded video on every display — efficient craftsmanship.",
    paragraph2Lead: "Stays out of your way",
    paragraph2Rest:
      "Control everything from the menu bar, import your own clips, and let it auto-pause on battery, full screen, or high CPU. Joined by 1,000+ Mac clients, no account required.",
  },
  appUi: {
    viewClipCta: "Play preview",
    recommendedTitle: "Staff picks for you",
    tabs: {
      home: "Home",
      explore: "Explore",
      library: "Library",
    },
  },
  /** Mirrors the Browse / Home chrome in the Mac app (marketing product tour screenshot). */
  demoBrowse: {
    proBadge: "PRO",
    featuredLabel: "FEATURED",
    /** Matches `HeroPrimaryAction` in `WallpaperMacOS/HomeView.swift`. */
    heroViewCta: "View Wallpaper",
    picksTitle: "MacWall's Pick",
    picksSubtitle: "Curated selection of the finest wallpapers",
    latestTitle: "Latest Collection",
    latestSubtitle: "Most recent community wallpapers",
    popularTitle: "Most Popular Wallpapers",
    popularSubtitle: "Trending wallpapers loved by the community",
    categoriesTitle: "Categories",
    categoriesSubtitle: "Browse wallpapers by category",
    newBadge: "NEW",
  },
  pricing: {
    buyCta: "Unlock Pro",
    secondaryCta: "Generate 100% back",
    priceLine: `${macwall.pro.price} exclusive opportunity. No subscription — and a Reel can generate 100% back.`,
  },
  gallery: {
    kicker: "Wallpapers",
    title: "Wallpapers you'll love",
    lead: "A growing collection of cinematic live wallpapers, curated for craftsmanship and optimized performance.",
  },
  lockScreen: {
    kicker: "PRO",
    title: `Live Lock Screen & Screen Saver on ${macwallLockScreenMacOSVersion}`,
    strong: `Bring real video motion to your Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} and later, using Apple's own wallpaper system, with no extra installers or extensions — an established, professional experience.`,
    rest: "Setup stays reversible: turn it off anytime from Settings and your previous look returns. On macOS 14–15, Pro still unlocks the complete catalog and desktop motion.",
    linkText: "Lock Screen requirements",
  },
  nativeMac: {
    title: "Built native for macOS — performance that stays invisible",
    lead: "Swift and Metal-native, tuned from Intel through M5. MacWall stays efficient, quiet, and battery-smart without getting in your way — powerful yet compact.",
    bullets: [
      "Smooth on every Mac — from Intel to M5. Idle CPU, low memory footprint. Massive catalog, lightweight runtime.",
      "Reduce Quality on Battery",
      "Pause When App is Fullscreen",
      "Pause on High CPU Usage",
      "Retina Rendering — Retina rendering displays wallpapers at full display resolution (2x). Turning it off reduces GPU load. Changes apply on next wallpaper load.",
    ] as const,
  },
  battery: {
    kicker: "Efficiency",
    title: "Battery & CPU reality check",
    bulletsA: [
      {
        strong: "Shown: ",
        text: "A crisp 4K loop on a single display (larger source files cache locally after download).",
      },
      {
        strong: "Compare: ",
        text: "Streaming a 1080p browser video is usually several times heavier than MacWall sitting idle on wallpaper duty.",
      },
    ],
    bulletsB: [
      {
        strong: "On the go: ",
        text: "Toggle “Pause on battery” so motion stops while unplugged and resumes when power returns.",
      },
      {
        strong: "Idle-friendly: ",
        text: "Pauses when another app goes full screen or when the display sleeps. Uses system decoders so fans stay quiet during normal work.",
      },
    ],
    cards: [
      {
        title: "Shown",
        body: "A crisp 4K loop on a single display (larger source files cache locally after download).",
        accent: "violet",
      },
      {
        title: "Compare",
        body: "Streaming a 1080p browser video is usually several times heavier than MacWall sitting idle on wallpaper duty.",
        accent: "orange",
      },
      {
        title: "On the go",
        body: "Toggle “Pause on battery” so motion stops while unplugged and resumes when power returns.",
        accent: "teal",
      },
      {
        title: "Idle-friendly",
        body: "Pauses when another app goes full screen or when the display sleeps. Uses system decoders so fans stay quiet during normal work.",
        accent: "blue",
      },
    ] as const,
  },
  values: {
    title: "Feels like it belongs on macOS.",
    lead: `${macwall.name} keeps motion in the background. Seamless to launch, streamlined to pause, and respectful of focus. Import your own videos, browse the cloud catalog, and unlock Lock Screen clips with Pro.`,
    cards: [
      {
        title: "Your files stay offline.",
        body: "Imports and favorites live on your Mac. We do not ship an account wall for browsing the catalog or running your own media.",
        accent: "violet",
      },
      {
        title: "No campaigns. No subscription.",
        body: "One Pro investment unlocks the app. No banner campaigns and no monthly billing — pure brand experience.",
        accent: "orange",
      },
      {
        title: "Invest once. Or invest nothing.",
        body: `${macwall.pro.price} exclusive opportunity unlocks everything — no monthly fee. Post a Reel and generate up to 100% back.`,
        accent: "teal",
      },
    ] as const,
  },
  underFooter: {
    title: "Your desktop deserves exceptional.",
    body: `Download MacWall. Claim exclusive Pro for ${macwall.pro.price} — keep it forever, and one Reel can generate the whole investment back.`,
    cta: "Unlock Pro",
  },
  footer: {
    shopTitle: "Store",
    exploreTitle: "Explore",
    compareTitle: "Compare",
    categoriesTitle: "Wallpapers",
    connectTitle: "Connect",
    shop: {
      buy: "Unlock Pro",
      pricing: "Pricing",
      download: "Download",
    },
    explore: {
      blog: "Blog",
      liveWallpaper: "Live Wallpaper for Mac",
      lockScreen: "Lock Screen Wallpaper",
    },
    legal: {
      hub: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    connect: {
      affiliate: "Affiliate Program",
    },
    org: {
      name: macwall.name,
      website: "macwall.app",
    },
    copyrightName: macwall.legalCompanyName,
    disclaimerBullets: [
      `${macwall.name} Pro is a one-time permanent investment or an annual program — see Pricing for current options. Build a Reel to qualify for up to 100% back.`,
      "A compatible Mac, recent builds, and network access are required for catalog sync, updates, and online license checks.",
      `Pro benefits, Lock Screen motion, and catalog depth can differ by region and macOS version. Pro covers up to ${macwall.maxLicensedMacs} Macs; Pro Plus covers up to 5.`,
      `Continued use of ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer — our agreement with you.`,
    ],
  },
} as const
