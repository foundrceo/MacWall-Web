import { macwall } from "@/lib/macwall-site"

/** User-visible strings for marketing pages (`macwall-marketing/*`). */
export const macwallExactCopy = {
  header: {
    navOverview: "Overview",
    navBlog: "Blog",
    navSocials: "Community",
    navSupport: "Help",
    navPricing: "Pricing",
    downloadCta: "Get MacWall",
    logoAlt: `${macwall.name} logo`,
  },
  hover: {
    exploreTitle: "Community & news",
    supportEmailTitle: "Talk to us",
    links: {
      discord: {
        label: "Discord server",
        title: "Chat with other MacWall users",
      },
      supportMail: { label: macwall.supportEmail, title: "Email the team" },
    },
  },
  ribbon: {
    lineBeforeLink: `New: ${macwall.name} is the first app with live Lock Screen wallpaper working on the latest macOS beta, where other apps broke. `,
    linkText: `Get ${macwall.name}`,
  },
  interact: {
    kicker: "In the app",
    title: `${macwall.name} — live motion wallpapers for your Mac Desktop & Dock`,
    moreLink: "How licensing works",
    demoVideoAria: "Background preview loop",
    dockAria: `Focus ${macwall.name}`,
    /** When the demo window is closed — tap the faux menu-bar status chip to reopen (same chip as when open). */
    demoReopenMenubarAria: `Open ${macwall.name}`,
    /** Red stoplight in the faux window chrome. */
    demoCloseWindowAria: "Close demo window",
    menubarBrand: macwall.name,
    menubarStatus: "Works in background",
    heroLead:
      "Set a cinematic 4K wallpaper in one click. Curated catalog, your own clips, and a battery that barely notices. Pay once, own it forever.",
    paragraph1Lead: "Try it now",
    paragraph1Rest:
      "This demo is the real app. Click any wallpaper to set it. That's the entire learning curve. Native macOS design, smooth hardware-decoded playback.",
    paragraph2Lead: "Stays out of your way",
    paragraph2Rest:
      "Pause from the menu bar, import your own clips, and let it auto-pause on battery or full screen. Joined by 1,000+ Mac users, no account needed.",
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
    buyCta: "Buy Pro",
    secondaryCta: "Get 100% free",
    priceLine: `${macwall.pro.price} ${macwall.pro.suffix}. ${macwall.pro.headline}. Up to ${macwall.maxLicensedMacs} personal Macs.`,
  },
  gallery: {
    kicker: "Gallery",
    title: "Wallpapers you'll love",
    lead: "A growing collection of cinematic live wallpapers, curated for quality and performance.",
  },
  lockScreen: {
    kicker: "PRO",
    title: "Lock Screen live wallpaper on the latest macOS",
    strong:
      "Mirror high-quality motion to the Lock Screen where the OS allows it, without extra installers.",
    rest: "Setup stays reversible: turn it off anytime from Settings, and your previous look returns.",
    linkText: "Lock Screen requirements",
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
    lead: `${macwall.name} keeps motion in the background. Quick to launch, simple to pause, and respectful of focus. Import your own videos, browse the cloud catalog, and unlock Lock Screen clips with Pro.`,
    cards: [
      {
        title: "Your files stay offline.",
        body: "Imports and favorites live on your Mac. We do not ship an account wall for browsing the catalog or running your own media.",
        accent: "violet",
      },
      {
        title: "No ads. No subscription.",
        body: "One Pro purchase unlocks the app. No banner ads and no monthly billing.",
        accent: "orange",
      },
      {
        title: "Pay once for Pro.",
        body: `${macwall.pro.headline}. ${macwall.pro.price} ${macwall.pro.suffix} unlocks the current Pro feature set. No monthly fee.`,
        accent: "teal",
      },
    ] as const,
  },
  underFooter: {
    title: "Your desktop deserves better.",
    body: `Join 1,000+ Mac users running live wallpapers with ${macwall.name}. Pay once for Pro (${macwall.pro.price}, lifetime updates) and a single Reel can earn the whole thing back.`,
    cta: `Get Pro for ${macwall.pro.price}`,
  },
  footer: {
    shopTitle: "Shop",
    exploreTitle: "Explore",
    compareTitle: "Compare",
    categoriesTitle: "Wallpapers",
    connectTitle: "Connect",
    shop: {
      buy: "Buy Pro",
      pricing: "Pricing",
      download: "Download",
    },
    explore: {
      blog: "Blog",
      liveWallpaper: "Live Wallpaper for Mac",
      lockScreen: "Lock Screen Wallpaper",
    },
    legal: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    connect: {
      discord: "Discord Community",
    },
    org: {
      name: macwall.name,
      website: "macwall.app",
    },
    copyrightName: macwall.name,
    disclaimerBullets: [
      `${macwall.name} Pro is a one-time purchase. The price on this page reflects the current early-bird offer. Make a Reel to qualify for up to 100% back. See Pricing for details.`,
      "A compatible Mac, recent builds, and network access are required for catalog sync, updates, and online license checks.",
      `Pro features, Lock Screen motion, and catalog depth can differ by region and macOS version. Each personal license may be used on up to ${macwall.maxLicensedMacs} Macs you own.`,
      `Continued use of ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer.`,
    ],
  },
} as const
