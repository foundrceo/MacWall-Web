import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallCatalog,
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
    navFeatures: "Features",
    navChangelog: "What's new",
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
    chipTag: "New",
    chip: "Music Sync is here",
    chipHref: "#music-sync",
    title: "Cinematic 4K live wallpapers,",
    titleMuted: "built for Mac.",
    heroLead: `${macwallCatalog.liveCountLabel} wallpapers that move, on your desktop, Lock Screen and screen saver. A native app that decodes video in hardware and pauses behind full-screen apps.`,
  },
  pricing: {
    buyCta: "Get Pro",
    secondaryCta: "Get money back with a Reel",
    priceLine: `${macwall.pro.price} once, no subscription. Post a Reel and you can get all of it back.`,
  },
  underFooter: {
    title: "Your desktop is a minute away from moving.",
    lead: "Install the app, pick a wallpaper, set it. No account needed.",
  },
  landing: {
    catalogEyebrow: "Browse by genre",
    browseTitle: `${macwallCatalog.liveCountLabel} live wallpapers`,
    browseLead:
      "Anime, nature, cars, gaming, space. Preview here. Set in the app.",
    browseLink: "Open the gallery",
    categoriesLabel: `Browse ${macwallCatalog.liveCountLabel} wallpapers by category`,
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
    communityLead: "New clips land on TikTok. Setups and help live in Discord.",
    faqLead: "Licenses, macOS versions, and the Reel refund.",
    contactUs: "Contact us",
    closingMuted: "Free download. Pay once for Pro.",
    featureLockTitle: "Lock Screen",
    featureLockBody: `Live video on ${macwallLockScreenMacOSVersion}. Apple's wallpaper APIs. No extra installers.`,
    featureNativeTitle: "Native settings",
    featureNativeBody:
      "Swift and Metal. Intel through M5. These toggles live in the app.",
    featureNativeChips: [
      "Launch at login",
      "Pause on fullscreen",
      "Pause in Low Power Mode",
    ] as const,
    /** Three steps, to match the title. */
    steps: [
      {
        id: "download",
        title: "Install the app",
      },
      {
        id: "browse",
        title: "Pick a wallpaper",
      },
      {
        id: "set",
        title: "Click Set",
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
  /** Home page feature sections (every claim matches the app). */
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
    /** One section for the app's headline features; two only MacWall has. */
    showcase: {
      title: "One app. Every screen.",
      lead: "Desktop, Lock Screen and screen saver from one native Mac app, plus two things no other wallpaper app does.",
      exclusive: "Only on MacWall",
      music: {
        eyebrow: "Music Sync",
        title: "Your music, on your wallpaper",
        body: "Apple Music or Spotify turns your desktop into a visual made from the song's cover, moving on the beat.",
      },
      lockScreen: {
        eyebrow: "Lock Screen",
        title: "Lock Screen ready",
        body: `Lock Screen and screen saver play the same video from the same moment. ${macwallLockScreenMacOSVersion}.`,
      },
      bend: {
        eyebrow: "Bend",
        title: "Close the lid. Watch it fold.",
        body: "Bend follows your MacBook's lid angle and folds the desktop with it. Apple silicon MacBooks.",
      },
    },
    playback: {
      title: "Two ways to play",
      lead: "Pick one in Settings → Wallpaper → Playback. Switch any time.",
      modes: {
        system: {
          name: "MacWall Native",
          tag: "Recommended",
          body: "MacWall plays it through macOS, like Apple's own.",
          runsOn: "macOS 26",
        },
        app: {
          name: "MacWall Player",
          tag: "More control",
          body: "MacWall plays your desktop, with more settings.",
          runsOn: `${macwallMinimumMacOSVersion} and later`,
        },
      },
      /**
       * One line per moment, the same moments in both cards and in this
       * order, so the rows line up side by side.
       */
      rows: [
        {
          system: {
            ok: true,
            text: "Keeps playing after you quit MacWall or restart",
          },
          app: {
            ok: false,
            text: "Desktop waits for MacWall after a quit or restart",
          },
        },
        {
          system: {
            ok: true,
            text: "No MacWall CPU use once you quit the app",
          },
          app: { ok: false, text: "MacWall stays open to play your desktop" },
        },
        {
          system: {
            ok: true,
            text: "Lock Screen and screen saver match the desktop",
          },
          app: {
            ok: true,
            text: "A different Lock Screen wallpaper with Lock Screen Only",
          },
        },
        {
          system: { ok: true, text: "Sound plays on the Lock Screen" },
          app: { ok: false, text: "Sound is muted on the Lock Screen" },
        },
      ],
    },
  },
  footer: {
    /** Under the brand in the footer. */
    blurb: "Cinematic live wallpapers, built for Mac.",
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
    copyrightName: macwall.name,
    disclaimerBullets: [
      `${macwall.name} Pro is a one-time payment. See Pricing for current options. Post a Reel to qualify for up to 100% back.`,
      "You'll need a compatible Mac, a recent macOS build, and an internet connection for catalog sync, updates, and license checks.",
      `Pro features, Lock Screen motion, and catalog size can vary by region and macOS version. Pro covers up to ${macwall.maxLicensedMacs} Macs; Pro+ covers up to 5.`,
      `Using ${macwall.name} means you agree to the Terms of Service and Privacy Policy linked in the footer.`,
    ],
  },
} as const
