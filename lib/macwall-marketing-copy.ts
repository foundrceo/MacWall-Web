import { macwall } from "@/lib/macwall-site"

/** User-visible strings for marketing pages (`macwall-marketing/*`). */
export const macwallExactCopy = {
  header: {
    navOverview: "Overview",
    navBlog: "Blog",
    navSocials: "Community",
    navSupport: "Help",
    navPricing: "Pricing",
    downloadCta: "Download for Mac",
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
    lineBeforeLink: `${macwall.name} is a native macOS app for motion wallpapers, built to stay quiet, efficient, and easy to control from the menu bar. `,
    linkText: `Open ${macwall.name}`,
  },
  interact: {
    kicker: "In the app",
    title: "Live motion Mac wallpapers for Desktop & Dock",
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
      "Curated motion wallpapers, your own clips, and menu bar controls. Built for macOS.",
    paragraph1Lead: "Explore",
    paragraph1Rest:
      "the chrome around the window: traffic-light controls, sidebar, and the top bar behave like a real Mac app. Video tiles loop with hardware decoding so previews stay smooth.",
    paragraph2Lead: "Controls",
    paragraph2Rest:
      "mirror what you get after install: launch from the Dock, pause from the menu bar, import your own clips, and hop between Home, Explore, and Library without leaving the window.",
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
    secondaryCta: "Save 50% with a Reel",
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
    title: "Ready when you are.",
    body: `${macwall.name} is for people who want their desk to feel alive, not noisy. Buy Pro once, install on your Mac, and make a Reel to earn up to 100% back.`,
    cta: `Buy Pro for ${macwall.pro.price}`,
  },
  footer: {
    disclaimerBullets: [
      `${macwall.name} Pro is a one-time purchase. The price on this page reflects the current early-bird offer. Make a Reel to qualify for up to 100% back — see Pricing for details.`,
      "A compatible Mac, recent builds, and network access are required for catalog sync, updates, and online license checks.",
      `Pro features, Lock Screen motion, and catalog depth can differ by region and macOS version. Each personal license may be used on up to ${macwall.maxLicensedMacs} Macs you own.`,
      `Continued use of ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer.`,
    ],
    shopTitle: "Shop and Learn",
    legalTitle: "Legal",
    supportTitle: "Support",
    communityTitle: "Community",
    resourcesTitle: "Resources",
    shop: {
      buy: "Buy Pro",
      pricing: "Pricing",
      download: "Download",
    },
    resources: {
      blog: "Blog",
      liveWallpaper: "Live Wallpaper for Mac",
      download: "Download MacWall",
      bestApp: "Best Wallpaper App",
    },
    legal: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    support: {
      email: "Email support",
    },
    community: {
      discord: "Discord",
    },
    org: {
      name: macwall.name,
      line1: `Help inbox: ${macwall.supportEmail}`,
      line2: macwall.website.replace(/^https?:\/\//, ""),
    },
    copyrightName: macwall.name,
  },
} as const
