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
    navLearn: "Learn",
    navCreator: "Want Free?",
    navSocials: "Community",
    navSupport: "Help",
    navPricing: "Pricing",
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
  interact: {
    chip: "Check: What's new",
    chipHref: "/changelog",
    title: "Cinematic 4K wallpapers. Built for Mac",
    titleMuted: "4K video on the desktop, Lock Screen, and Screen Saver.",
    heroLead:
      "MacWall is a native Mac app for 4K live wallpapers. One tap sets desktop and Lock Screen the way macOS does. It stays near idle and pauses when you unplug or go fullscreen. Free to try.",
  },
  pricing: {
    buyCta: "Get Pro",
    secondaryCta: "Get it free with a Reel",
    priceLine: `${macwall.pro.price} once, no subscription. Post a Reel and you can get all of it back.`,
  },
  lockScreen: {
    kicker: "PRO",
    title: "Lock Screen ready",
    strong: `Native Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}. MacWall uses Apple's wallpaper APIs. No extra installers, daemons, or overlays.`,
    rest: "Turn it off in Settings and your old wallpaper comes back.",
    linkText: "Lock Screen requirements",
  },
  nativeMac: {
    title: "Smooth on every Mac",
    lead: "Written in Swift and Metal. Intel through M5. Near-idle CPU and a small memory footprint.",
    bullets: [
      "Reduce Quality on Battery",
      "Pause When App is Fullscreen",
      "Pause on High CPU Usage",
      "Retina Rendering",
    ] as const,
  },
  underFooter: {
    title: "Try MacWall Now",
  },
  landing: {
    catalogEyebrow: "Browse by genre",
    browseTitle: "1,000+ live wallpapers",
    browseLead: "Anime, nature, cars, gaming, space. Preview here. Set in the app.",
    browseLink: "Open the gallery",
    howEyebrow: "How it works",
    howTitle: "Install, pick, and set",
    bend: {
      eyebrow: "Introducing Bend",
      title: "Close the lid. Watch the desktop fold.",
      lead: "Bend reads your MacBook lid angle and folds the screen with it. Soft blur, degree for degree. Open it again and everything snaps back.",
      points: [
        {
          title: "Lid sensor",
          body: "Follows the hinge angle on Apple silicon MacBooks.",
        },
        {
          title: "One still",
          body: "Grabs a desktop snapshot as you close. No recording stream.",
        },
        {
          title: "On device",
          body: "Frames stay in memory on your Mac. Nothing uploaded.",
        },
        {
          title: "On by default",
          body: "Needs an Apple silicon MacBook with a lid sensor.",
        },
      ] as const,
    },
    communityEyebrow: "Community",
    communityTitle: "See real Mac setups",
    communityMuted: "Discord and TikTok",
    communityLead:
      "New clips land on TikTok. Setups and help live in Discord.",
    faqLead: "Licenses, macOS versions, and the Reel refund.",
    contactUs: "Contact us",
    closingMuted: "Free download. Pay once for Pro.",
    pillarsTitle: "Quiet on the Mac",
    pillarsLead: "Near idle. Pauses when you unplug or go fullscreen.",
    featuresTitle: "One Mac app",
    featuresLead: "Set desktop and Lock Screen, then preview the catalog here.",
    featureLockTitle: "Lock Screen",
    featureLockBody: `Live video on ${macwallLockScreenMacOSVersion}. Apple's wallpaper APIs. No extra installers.`,
    featureNativeTitle: "Native settings",
    featureNativeBody: "Swift and Metal. Intel through M5. These toggles live in the app.",
    featureNativeChips: [
      "Launch at login",
      "Pause on fullscreen",
      "Pause on battery",
    ] as const,
    pillars: [
      {
        id: "idle",
        title: "Near idle",
        body: "CPU stays under one percent while 4K plays. No extra daemons.",
      },
      {
        id: "pause",
        title: "Pauses with you",
        body: "Battery, unplug, fullscreen, or high CPU. The loop stops.",
      },
      {
        id: "set",
        title: "One tap",
        body: "Sets the wallpaper the way macOS does. From the same app.",
      },
      {
        id: "loop",
        title: "Plays, then yields",
        body: "The file runs on the desktop, then gets out of the way.",
      },
    ] as const,
    steps: [
      {
        id: "download",
        title: "Install the app",
        body: `Free for Mac. ${macwallMinimumMacOSVersion} or later.`,
        mark: "Free",
      },
      {
        id: "browse",
        title: "Pick a wallpaper",
        body: "Preview in the app or on the web.",
        mark: "1,000+",
      },
      {
        id: "set",
        title: "Click Set",
        body: "Hardware-decoded video on the desktop.",
        mark: "Set",
      },
      {
        id: "menu",
        title: "Use the menu bar",
        body: "Pause, switch, or stop without opening a window.",
        mark: "Menu bar",
      },
    ] as const,
    genres: [
      "Anime",
      "Nature",
      "Cars",
      "Gaming",
      "Space",
      "Heroes",
      "Dark",
      "Abstract",
      "Others",
    ] as const,
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
