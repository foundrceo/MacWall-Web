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
    downloadCta: "Download free",
    logoAlt: `${macwall.name} logo`,
  },
  hover: {
    exploreTitle: "Community & news",
    supportEmailTitle: "Get help",
    links: {
      discord: {
        label: "Discord server",
        title: "Chat with other MacWall users",
      },
      supportMail: {
        label: macwall.supportEmail,
        title: "Email us for help",
      },
    },
  },
  ribbon: {
    lineBeforeLink: `New: ${macwall.name} brings live Lock Screen and Screen Saver wallpapers to ${macwallLockScreenMacOSVersion}. Live desktop wallpapers run on ${macwallMinimumMacOSVersion}+. `,
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
      "Pick a wallpaper, click once, done. You get 1,000+ cinematic 4K loops, you can drop in your own videos, and it runs on every display without eating your battery. Free to try, then one payment to keep it.",
    paragraph1Lead: "Try it right here",
    paragraph1Rest:
      "This demo is the real app. Click any wallpaper to set it. That's the whole learning curve. Built natively for macOS, with hardware-decoded video on every display.",
    paragraph2Lead: "Stays out of your way",
    paragraph2Rest:
      "Run it all from the menu bar, drop in your own clips, and let it pause itself on battery, full screen, or heavy CPU. No account to create.",
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
    buyCta: "Get Pro",
    secondaryCta: "Get it free with a Reel",
    priceLine: `${macwall.pro.price} once, no subscription. Post a Reel and you can get all of it back.`,
  },
  gallery: {
    kicker: "Wallpapers",
    title: "Wallpapers you'll love",
    lead: "A growing collection of cinematic live wallpapers, hand-picked and tuned to run light.",
  },
  lockScreen: {
    kicker: "PRO",
    title: `Live Lock Screen & Screen Saver on ${macwallLockScreenMacOSVersion}`,
    strong: `Bring real video motion to your Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} and later. It uses Apple's own wallpaper system, so there are no extra installers or extensions.`,
    rest: "It's fully reversible: switch it off in Settings and your old look comes straight back. On supported macOS versions, Pro still unlocks the full catalog and desktop motion.",
    linkText: "Lock Screen requirements",
  },
  nativeMac: {
    title: "Built native for macOS, so you never notice it running",
    lead: "Written in Swift and Metal, tuned from Intel through M5. MacWall stays fast, quiet, and easy on the battery without getting in your way.",
    bullets: [
      "Smooth on every Mac from Intel to M5, with near-idle CPU and a small memory footprint.",
      "Reduce Quality on Battery",
      "Pause When App is Fullscreen",
      "Pause on High CPU Usage",
      "Retina Rendering shows wallpapers at full display resolution (2x). Turn it off to reduce GPU load. Changes apply the next time a wallpaper loads.",
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
    lead: `${macwall.name} keeps motion in the background, quick to start and quick to pause, so it never gets in the way of your work. Import your own videos, browse the catalog, and add Lock Screen clips with Pro.`,
    cards: [
      {
        title: "Your files stay on your Mac.",
        body: "Imports and favourites never leave your machine. There's no account wall to browse the catalog or play your own media.",
        accent: "violet",
      },
      {
        title: "No ads. No subscription.",
        body: "One payment unlocks the app. No banner ads, no monthly billing, no upsells later.",
        accent: "orange",
      },
      {
        title: "Pay once, or pay nothing.",
        body: `${macwall.pro.price} unlocks everything, forever. Or post a Reel about it and get up to 100% of that back.`,
        accent: "teal",
      },
    ] as const,
  },
  underFooter: {
    title: "Give your desktop something worth looking at.",
    body: `Download MacWall free. Pro is ${macwall.pro.price} once and it's yours for good, and one Reel can pay for the whole thing.`,
    cta: "Get Pro",
  },
  footer: {
    shopTitle: "Store",
    exploreTitle: "Explore",
    compareTitle: "Compare",
    categoriesTitle: "Wallpapers",
    connectTitle: "Connect",
    shop: {
      buy: "Get Pro",
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
      `${macwall.name} Pro is a one-time payment. See Pricing for current options. Post a Reel to qualify for up to 100% back.`,
      "You'll need a compatible Mac, a recent macOS build, and an internet connection for catalog sync, updates, and license checks.",
      `Pro features, Lock Screen motion, and catalog size can vary by region and macOS version. Pro covers up to ${macwall.maxLicensedMacs} Macs; Pro+ covers up to 5.`,
      `Using ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer.`,
    ],
  },
} as const
