import { macwall } from "@/lib/macwall-site"

/** User-visible strings for marketing pages (`macwall-marketing/*`). */
export const macwallExactCopy = {
  header: {
    navOverview: "Overview",
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
    lineBeforeLink: `${macwall.name} is a native macOS app for motion wallpapers—built to stay quiet, efficient, and easy to control from the menu bar. `,
    linkText: `Open ${macwall.name}`,
  },
  interact: {
    kicker: "PRODUCT TOUR",
    title: "See how MacWall feels on your desktop",
    moreLink: "How licensing works",
    demoVideoAria: "Background preview loop",
    dockAria: `Focus ${macwall.name}`,
    /** When the demo window is closed — tap the faux menu-bar status chip to reopen (same chip as when open). */
    demoReopenMenubarAria: `Open ${macwall.name}`,
    /** Red stoplight in the faux window chrome. */
    demoCloseWindowAria: "Close demo window",
    menubarBrand: macwall.name,
    menubarStatus: "Works in background",
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
    picksSubtitle: "A fresh random sample every time your catalog refreshes",
  },
  pricing: {
    buyCta: "Buy",
    secondaryCta: "Get Discount",
    priceLine: `Only for ${macwall.pro.price}. ${macwall.pro.headline} · up to ${macwall.maxLicensedMacs} personal Macs.`,
  },
  highlights: {
    sectionTitle: "Why MacWall",
    linkSystem: "macOS 14+ (Sonoma or newer)",
    linkDisplays: "Privacy & licensing",
    slides: [
      "Motion wallpapers that feel at home on macOS—not a slideshow hack.",
      "Runs on Apple Silicon and Intel: one build, hardware-accelerated playback.",
      /* Hidden carousel panes (extra `Highlights_page-*` IDs exist in vendored CSS if re-enabled).
      "Different clips per display, or keep every screen in sync—you choose.",
      "Pause automatically on battery, in full screen, or when you are away—no constant babysitting.",
      */
    ] as const,
  },
  stats: {
    kicker: "BY THE NUMBERS",
    title: "What the app is built for",
    cards: [
      {
        value: `${macwall.pro.socialProofMembers}+`,
        strong: "People interested in Pro.",
        desc: "Early adopters who want Lock Screen video, exclusive catalog drops, and playlist tools.",
      },
      {
        value: "9+",
        strong: "Browsing lanes in Explore.",
        desc: `From ${macwall.categories.slice(0, 3).join(", ")} to niche moods—jump in without an account.`,
      },
      {
        value: "HW decode",
        strong: "One player per display.",
        desc: "Metal-friendly paths, pause-on-battery options, and calm CPU use during long sessions.",
      },
    ] as const,
  },
  lockScreen: {
    kicker: "PRO",
    title: "Lock Screen video (macOS 26+)",
    strong:
      "Mirror high-quality motion to the Lock Screen where the OS allows it—without weird installers.",
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
        strong: "",
        text: "Streaming a 1080p browser video is usually several times heavier than MacWall sitting idle on wallpaper duty.",
        highlight: true as const,
      },
      {
        strong: "On the go: ",
        text: "Toggle “Pause on battery” so motion stops while unplugged and resumes when power returns.",
      },
    ],
    bulletsB: [
      {
        strong: "Idle-friendly: ",
        text: "Pauses when another app goes full screen or when the display sleeps. Uses system decoders so fans stay quiet during normal work.",
      },
    ],
  },
  values: {
    title: "Feels like it belongs on macOS.",
    lead: `${macwall.name} keeps motion in the background—quick to launch, simple to pause, and respectful of focus. Import your own videos, lean on the cloud catalog, or unlock Pro for Lock Screen clips and deeper libraries.`,
    cards: [
      {
        title: "Your files stay offline.",
        body: "Imports and favorites live on your Mac. We do not ship an account wall for browsing the catalog or running your own media.",
      },
      {
        title: "No ads. No login for basics.",
        body: "Activate Pro when you want premium perks—there is no banner farm or forced signup just to preview wallpapers.",
      },
      {
        title: "Pay once for Pro.",
        body: `${macwall.pro.headline}: ${macwall.pro.price} ${macwall.pro.suffix} unlocks the current Pro feature set—no monthly rent.`,
      },
    ] as const,
  },
  underFooter: {
    title: "Ready when you are.",
    body: `${macwall.name} is for people who want their desk to feel alive—not noisy. Grab the build, try the free tier, and upgrade when you want Lock Screen video or the full Pro catalog.`,
    cta: `Download ${macwall.name}`,
  },
  footer: {
    disclaimerBullets: [
      `${macwall.name} includes a free tier plus optional Pro checkout—the figure on this page matches the current early-bird offer.`,
      "A compatible Mac, recent builds, and network access are required for catalog sync, updates, and online license checks.",
      `Pro features, Lock Screen motion, and catalog depth can differ by region and macOS version. Each personal license may be used on up to ${macwall.maxLicensedMacs} Macs you own.`,
      `Continued use of ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer.`,
    ],
    shopTitle: "Shop and Learn",
    legalTitle: "Legal",
    supportTitle: "Support",
    communityTitle: "Community",
    shop: {
      buy: "Buy Pro",
      pricing: "Pricing",
      download: "Download",
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

export const macwallDemoWallpapers = [
  {
    poster: "/video/posters/wallpaper1.jpg",
    webm: "/video/preview/wallpaper1.webm" as string | undefined,
    mp4Preview: "/video/preview/wallpaper1.mp4" as string | undefined,
    mp4Fallback: "/video/wallpaper1.mp4",
    activeDot: 0,
    category: "NATURE",
    name: "Coastal mist loop",
    meta: "3840×2160 · refreshed weekly · ~32 MB · 1:20",
    likes: "328",
  },
  {
    poster: "/video/posters/wallpaper2.jpg",
    webm: undefined,
    mp4Preview: "/video/preview/wallpaper2.mp4" as string | undefined,
    mp4Fallback: "/video/wallpaper2.mp4",
    activeDot: 1,
    category: "SPACE",
    name: "Orbital sunrise",
    meta: "3440×1440 · new this month · ~28 MB · 2:05",
    likes: "412",
  },
  {
    poster: "/video/posters/wallpaper3.jpg",
    webm: undefined,
    mp4Preview: "/video/preview/wallpaper3.mp4" as string | undefined,
    mp4Fallback: "/video/wallpaper3.mp4",
    activeDot: 2,
    category: "ANIME",
    name: "Neon alley rain",
    meta: "2560×1440 · editor’s choice · ~18 MB · 0:55",
    likes: "597",
  },
  {
    poster: "/video/posters/wallpaper4.jpg",
    webm: undefined,
    mp4Preview: "/video/preview/wallpaper4.mp4" as string | undefined,
    mp4Fallback: "/video/wallpaper4.mp4",
    activeDot: 3,
    category: "CITY",
    name: "Midnight express",
    meta: "3840×2160 · trending · ~45 MB · 3:02",
    likes: "264",
  },
  {
    poster: "/video/posters/wallpaper5.jpg",
    webm: undefined,
    mp4Preview: "/video/preview/wallpaper5.mp4" as string | undefined,
    mp4Fallback: "/video/wallpaper5.mp4",
    activeDot: 4,
    category: "SCI-FI",
    name: "Glass canyon flight",
    meta: "5120×2880 · heavy-weight hero · ~62 MB · 1:48",
    likes: "189",
  },
] as const
