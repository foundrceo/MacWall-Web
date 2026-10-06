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
    navCreator: "Reel Refund",
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
      "MacWall is a native Mac app for 4K live wallpapers. One tap sets your desktop, Lock Screen and screen saver the way macOS does. It pauses behind full-screen apps and stays out of your way. Free for 24 hours, no card.",
  },
  pricing: {
    buyCta: "Get Pro",
    secondaryCta: "Get money back with a Reel",
    priceLine: `${macwall.pro.price} once, no subscription. Post a Reel and you can get all of it back.`,
  },
  lockScreen: {
    kicker: "PRO",
    title: "Lock Screen ready",
    strong: `Native Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}. MacWall uses Apple's wallpaper system, so the Lock Screen plays the same video from the same moment, with sound.`,
    rest: "Turn it off in Settings and your old wallpaper comes back.",
    linkText: "Lock Screen requirements",
  },
  nativeMac: {
    title: "Smooth on every Mac",
    lead: "Written in Swift and Metal. Intel through M5. Near-idle CPU and a small memory footprint.",
    bullets: [
      "Pause behind full-screen apps",
      "Pause in Low Power Mode",
      "Pause when your Mac is busy",
      "Lower quality on battery",
    ] as const,
  },
  underFooter: {
    title: "Try MacWall Now",
  },
  landing: {
    catalogEyebrow: "Browse by genre",
    browseTitle: "800+ live wallpapers",
    browseLead: "Anime, nature, cars, gaming, space. Preview here. Set in the app.",
    browseLink: "Open the gallery",
    howEyebrow: "No account. No setup. About a minute.",
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
          title: "Your choice",
          body: "Turn it on in Settings → General → Bend. Needs an Apple silicon MacBook.",
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
    pillarsLead: "Near idle. Pauses when a full-screen app covers it.",
    featuresTitle: "One Mac app",
    featuresLead: "Desktop, Lock Screen and screen saver from one app. Built in Swift, made for macOS.",
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
        body: "Full-screen apps, Low Power Mode, or a busy Mac. The loop stops.",
      },
      {
        id: "set",
        title: "One tap",
        body: "Desktop, Lock Screen and screen saver, the way macOS does.",
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
        body: `Drag MacWall into Applications and open it from there. ${macwallMinimumMacOSVersion} or later.`,
        mark: "Free 24h",
      },
      {
        id: "browse",
        title: "Pick a wallpaper",
        body: "800+ in 9 categories. Preview here or in the app, or press ⌘K.",
        mark: "800+",
      },
      {
        id: "set",
        title: "Click Set",
        body: "It downloads once, then plays from your Mac. No internet needed.",
        mark: "Set",
      },
      {
        id: "menu",
        title: "Use the menu bar",
        body: "Play, pause, skip or stop without opening a window. ⌥⌘P.",
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
  /** Home page sections added for 4.0.9 (every claim matches the app). */
  home: {
    everything: {
      title: "Everything in the app",
      lead: "The small things that make it feel like part of macOS.",
      items: [
        {
          icon: "explore",
          title: "Home and Explore",
          body: "Recommended for you, 9 categories, and an Ultrawide filter.",
        },
        {
          icon: "set",
          title: "Set Wallpaper",
          body: "Shows Downloading, Applying, then On Your Mac. Right on the button.",
        },
        {
          icon: "search",
          title: "Search",
          body: "Like Spotlight. ⌘↩ sets the highlighted result.",
          shortcut: "⌘K",
        },
        {
          icon: "menubar",
          title: "Menu bar",
          body: "Play, pause, skip and sound without opening a window.",
          shortcut: "⌥⌘P",
        },
        {
          icon: "displays",
          title: "Every display",
          body: "One wallpaper everywhere, or a different one on each screen.",
        },
        {
          icon: "shuffle",
          title: "Shuffle and speed",
          body: "Shuffle every 15 minutes to a day. Play at 0.5× to 2×.",
        },
        {
          icon: "sound",
          title: "Sound",
          body: "Some wallpapers have sound. Turn it on from the player or the menu bar.",
        },
        {
          icon: "stills",
          title: "Stills",
          body: "Still images for your desktop, light on battery.",
        },
        {
          icon: "library",
          title: "Library",
          body: "Favorites, downloads, your own videos and uploads.",
        },
        {
          icon: "upload",
          title: "Bring your own",
          body: "Add your own videos with Pro, or share them with the community.",
          shortcut: "⌘N",
        },
        {
          icon: "share",
          title: "Share cards",
          body: "Any wallpaper as a card with a link and a QR code.",
        },
        {
          icon: "help",
          title: "Help in the app",
          body: "Instant answers, and a real person in chat when you need one.",
        },
      ] as const,
    },
    signature: {
      title: "Only on MacWall",
      lead: "Two things you won't find in another wallpaper app.",
      music: {
        eyebrow: "Music Sync",
        title: "Your music, on your wallpaper",
        body: `Apple Music or Spotify turns the desktop into a visual made from the song's cover, moving on the beat. Lock your Mac and a glass player or synced lyrics stay on screen (${macwallLockScreenMacOSVersion}).`,
      },
      bend: {
        eyebrow: "Bend",
        title: "Close the lid. Watch it fold.",
        body: "Bend reads your MacBook's lid angle and folds the desktop with it. Open it and everything snaps back. Apple silicon MacBooks; turn it on in Settings → General.",
      },
    },
    playback: {
      title: "Two ways to play",
      lead: "Pick one in Settings → Wallpaper → Playback. Switch any time.",
      switchLabel: "Show playback mode",
      momentLabel: "Moment",
      caption: "What each playback mode does",
      modes: {
        system: {
          name: "System Wallpaper",
          tag: "Recommended",
          body: "macOS plays your wallpaper itself, like one of its own.",
        },
        app: {
          name: "MacWall App",
          tag: "More control",
          body: "MacWall plays the desktop, behind your icons.",
        },
      },
      rows: [
        {
          icon: "power",
          moment: "You quit MacWall or restart",
          system: { ok: true, text: "Keeps playing" },
          app: { ok: false, text: "Desktop waits for MacWall" },
        },
        {
          icon: "lock",
          moment: "You lock your Mac",
          system: { ok: true, text: "Lock Screen and screen saver match the desktop" },
          app: { ok: true, text: "A different wallpaper on the Lock Screen" },
        },
        {
          icon: "sound",
          moment: "Sound on the Lock Screen",
          system: { ok: true, text: "Plays" },
          app: { ok: false, text: "Muted" },
        },
        {
          icon: "wallpaper",
          moment: "Separate Lock Screen wallpaper",
          system: { ok: false, text: "Same as the desktop" },
          app: { ok: true, text: "Yes" },
        },
        {
          icon: "macos",
          moment: "Your macOS",
          system: { ok: null, text: "macOS 26" },
          app: { ok: null, text: `${macwallMinimumMacOSVersion} and later` },
        },
      ],
    },
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
