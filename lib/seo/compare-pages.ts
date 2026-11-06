import {
  macwall,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
} from "@/lib/macwall-site"
import {
  bestLiveWallpaperMacPage,
  livelyWallpaperMacPage,
  macwallVsBackdropPage,
  macwallVsWallspacePage,
  wallpaperEngineAlternativePage,
} from "@/lib/seo/landing-pages"
import {
  COMPARISONS_CHECKED_ISO,
  COMPARISONS_RECHECKED_ISO,
  COMPARISON_SOURCES,
  MACWALL_FACTS_NOTE,
  MACWALL_PLATFORMS,
  accessedLabel,
  comparisonTitleYear,
  macwallPriceFacts,
  salePricedPage,
  sourceItem,
  type MacwallPriceFacts,
} from "@/lib/seo/comparison-facts"
import type {
  ContentBlock,
  ContentTableBlock,
  SeoContentPage,
} from "@/lib/content/types"

/**
 * Competitor facts in this file were read on COMPARISONS_CHECKED_ISO, or on
 * COMPARISONS_RECHECKED_ISO where a Sources entry says so (US prices).
 * Re-check every source before changing a figure.
 */
export const COMPARE_CHECKED_ISO = COMPARISONS_RECHECKED_ISO
const CHECKED = accessedLabel(COMPARISONS_CHECKED_ISO)
const RECHECKED = accessedLabel(COMPARISONS_RECHECKED_ISO)

const S = COMPARISON_SOURCES

// ---------------------------------------------------------------------------
// /alternatives/24-hour-wallpaper
// ---------------------------------------------------------------------------

export const twentyFourHourWallpaperPage = salePricedPage((price) => ({
  slug: "24-hour-wallpaper",
  pathname: "/alternatives/24-hour-wallpaper",
  title: "24 Hour Wallpaper vs MacWall: Mac Apps Compared",
  headline: "24 Hour Wallpaper vs MacWall",
  description:
    "24 Hour Wallpaper changes with the time of day; MacWall plays looping video. Prices, macOS needs and features compared, with dated sources.",
  keywords: [
    "24 hour wallpaper",
    "24 hour wallpaper mac",
    "24 hour wallpaper alternative",
    "time of day wallpaper mac",
    "24 hour wallpaper vs macwall",
  ],
  publishedAt: "2026-10-27",
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**24 Hour Wallpaper and MacWall do different jobs.** 24 Hour Wallpaper, by Jetson Creative, shows wallpapers that change with the time of day at your location, using its own ProTime engine or Apple's Dynamic Desktop format, per its [Mac App Store page](${S.twentyFourHour}). MacWall plays looping video. Pick 24 Hour Wallpaper for a scene that shifts from morning to night, and MacWall for constant motion and a live Lock Screen. The three kinds of moving wallpaper are defined in [live vs dynamic vs aerial wallpapers](/learn/live-vs-dynamic-vs-aerial-wallpapers-mac).`,
    },
    {
      type: "table",
      columns: ["", "24 Hour Wallpaper", "MacWall"],
      rows: [
        ["Developer", "Jetson Creative LLC", "MacWall"],
        [
          "Price model",
          "Free download with in-app purchases: lifetime access to all wallpapers at $29.99 or $69.99 (two listings), single wallpapers $2.49, and a 14-day free trial",
          price.summary,
        ],
        [
          "Where to get it",
          "Mac App Store",
          "Direct download from macwall.app",
        ],
        ["Platforms", "macOS 15.0+", MACWALL_PLATFORMS],
        [
          "What changes",
          "The wallpaper follows the time of day at your location",
          "Looping video plays all the time",
        ],
        [
          "Free wallpapers",
          "8 free, 165 more by in-app purchase",
          "Full catalog for 24 hours, then Pro",
        ],
        [
          "Lock Screen",
          "Not stated",
          `Video, ${macwallLockScreenMacOSVersion} or later`,
        ],
        [
          "Rotation",
          "Shuffle on an interval you set",
          "Shuffle every 15 minutes to once a day, plus a time-of-day Day Schedule",
        ],
        [
          "Resolution",
          "5K or higher",
          `${macwallCatalog.liveCountLabel} curated loops, most in 4K`,
        ],
        [
          "Multiple displays",
          "Supported",
          "Different loop per display, or the same on all",
        ],
      ],
      caption: `24 Hour Wallpaper facts from its US Mac App Store page, accessed ${CHECKED}.`,
    },
    { type: "h2", text: "How they differ" },
    {
      type: "p",
      text: "A time-of-day wallpaper is mostly still. It changes slowly as the light outside changes, so you see a city at dawn in the morning and the same city lit up at night. 24 Hour Wallpaper is built around that idea: its listing describes wallpapers that follow the time of day where you are, at 5K or higher, across multiple monitors.",
    },
    {
      type: "p",
      text: `A live wallpaper is a video loop. Water moves, clouds drift, and the scene keeps moving whenever the desktop is visible. MacWall decodes the video in hardware, pauses it behind full-screen apps, and on ${macwallLockScreenMacOSVersion} or later can play it on the Lock Screen and as the Screen Saver. That costs more than a still image, so check Activity Monitor on your own Mac if battery life matters.`,
    },
    { type: "h2", text: "Pick 24 Hour Wallpaper if" },
    {
      type: "ul",
      items: [
        "You want a calm desktop that changes with the day instead of constant motion.",
        "You want to start free: 8 wallpapers are free, and the listing includes a 14-day free trial.",
        "You only want one or two scenes; single wallpapers are $2.49 each.",
        "You prefer to buy through the Mac App Store.",
        "You want 5K or higher images for a large display.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        "You want motion: every wallpaper is a looping video.",
        `You want a live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
        `You want the whole catalog for one price: ${price.proText} once for up to ${price.proMacs} Macs (${price.india} in India), against $29.99 or $69.99 for 24 Hour Wallpaper's lifetime options.`,
        "You want to import your own MP4, MOV and M4V clips (with Pro).",
        "You want Music Sync visuals from Apple Music and Spotify, or Bend on an Apple silicon MacBook.",
      ],
    },
    { type: "h2", text: "Can MacWall follow the time of day?" },
    {
      type: "p",
      text: "Partly. MacWall's Day Schedule picks a wallpaper by time of day, so you can run a bright loop in the morning and a darker one at night. It switches between whole loops; it does not shift the light within one image the way a time-of-day wallpaper does. If that gradual change is what you want, 24 Hour Wallpaper or Apple's own dynamic wallpapers are the better tools.",
    },
    { type: "h2", text: "The free option built into macOS" },
    {
      type: "p",
      text: `Before you pay for either app, try Apple's dynamic wallpapers. Apple says they "brighten and darken, based on the time of day for your current location" ([Apple Support](${S.appleChangeWallpaper})). Open System Settings, click Wallpaper, and pick one under Dynamic Wallpapers. The Appearance menu next to it offers Automatic, Dynamic, Light (Still) and Dark (Still) ([Apple Support](${S.appleWallpaperSettings})). 24 Hour Wallpaper adds 173 more scenes on top of those (8 free, 165 paid). For more on the difference, read [dynamic vs live wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac), or see [Dynamic Wallpaper Club vs MacWall](/alternatives/dynamic-wallpaper-club).`,
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("24 Hour Wallpaper on the Mac App Store", S.twentyFourHour),
        sourceItem(
          "Apple Support: Change your wallpaper on Mac",
          S.appleChangeWallpaper
        ),
        sourceItem(
          "Apple Support: Wallpaper settings on Mac",
          S.appleWallpaperSettings
        ),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is 24 Hour Wallpaper free?",
      answer:
        "The download is free and includes 8 wallpapers. The other 165 are in-app purchases, and the listing includes a 14-day free trial.",
    },
    {
      question: "How much does 24 Hour Wallpaper cost?",
      answer:
        "On the US Mac App Store, lifetime access to all wallpapers is listed at $29.99 and at $69.99 (two separate in-app purchases), and single wallpapers are $2.49 each.",
    },
    {
      question: "Is 24 Hour Wallpaper a live wallpaper?",
      answer:
        "Not in the video sense. Its wallpapers change with the time of day at your location rather than playing a looping video. MacWall and other live wallpaper apps play video.",
    },
    {
      question: "What macOS does 24 Hour Wallpaper need?",
      answer:
        "Its Mac App Store page lists macOS 15.0 or later, the same minimum as MacWall.",
    },
    {
      question: "Can MacWall change the wallpaper by time of day?",
      answer:
        "Yes, with Day Schedule, which picks a wallpaper by time of day. It switches between whole video loops rather than gradually changing the light in one scene.",
    },
  ],
}))

// ---------------------------------------------------------------------------
// /alternatives/plash
// ---------------------------------------------------------------------------

export const plashAlternativePage = salePricedPage((price) => ({
  slug: "plash",
  pathname: "/alternatives/plash",
  title: "Plash for Mac vs MacWall: Web or Video Wallpaper",
  headline: "Plash vs MacWall",
  description:
    "Plash makes a website your Mac wallpaper for free; MacWall plays looping video. Requirements, price and features compared with dated sources.",
  keywords: [
    "plash mac",
    "plash app",
    "plash alternative",
    "website as wallpaper mac",
    "plash vs macwall",
  ],
  publishedAt: "2026-10-27",
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Plash and MacWall put different things on your desktop.** Plash, a free app by Sindre Sorhus, makes any website your wallpaper, per [its site](${S.plashSite}). MacWall plays looping video from a curated catalog or your own files. If you want a dashboard, a live web page or a page you built yourself behind your windows, Plash is the better fit and costs nothing.`,
    },
    {
      type: "table",
      columns: ["", "Plash", "MacWall"],
      rows: [
        ["Developer", "Sindre Sorhus", "MacWall"],
        ["Price model", "Free; no in-app purchases listed", price.summary],
        [
          "Where to get it",
          "Mac App Store or the developer's site",
          "Direct download from macwall.app",
        ],
        [
          "Platforms",
          "App Store version: macOS 26.4+. Version from its site: macOS 26; older releases run on macOS 10.15+",
          MACWALL_PLATFORMS,
        ],
        ["What it shows", "Any website", "Looping video"],
        [
          "Lock Screen",
          "No, per its site",
          `Video, ${macwallLockScreenMacOSVersion} or later`,
        ],
        [
          "Customizing",
          "Custom CSS and JavaScript, auto-reload on an interval, Browsing Mode",
          "Import your own MP4, MOV and M4V clips with Pro",
        ],
        ["Automation", "Shortcuts and a URL scheme", "Menu bar controls"],
        [
          "Battery",
          "Can pause on battery",
          "Pauses behind full-screen apps; optional Pause on battery",
        ],
      ],
      caption: `Plash facts from sindresorhus.com/plash and its US Mac App Store page, accessed ${CHECKED}.`,
    },
    { type: "h2", text: "What Plash is good at" },
    {
      type: "p",
      text: "Plash turns a web page into the desktop background. That suits things a video cannot do: a live status dashboard, a calendar, a weather page, or a page you wrote yourself and style with custom CSS and JavaScript. It can reload the page on an interval, has a Browsing Mode, and can be scripted with Shortcuts or a URL scheme. It is free, and its Mac App Store listing shows no in-app purchases.",
    },
    {
      type: "p",
      text: "Its site also lists the limits: it shows one website at a time, and it does not cover the Lock Screen.",
    },
    { type: "h2", text: "What MacWall is good at" },
    {
      type: "p",
      text: `MacWall is built for video. It has ${macwallCatalog.liveCountLabel} curated live wallpapers, most in 4K, across categories such as anime, nature, cars and space, plays a different loop on each display or the same loop on all of them, and decodes video in hardware. On ${macwallLockScreenMacOSVersion} or later the same loop can play on the Lock Screen and as the Screen Saver. MacWall cannot show a website; it only plays video files.`,
    },
    { type: "h2", text: "Pick Plash if" },
    {
      type: "ul",
      items: [
        "You want a website, dashboard or your own HTML page as the wallpaper.",
        "You want something free.",
        "You like to script your setup with Shortcuts or a URL scheme.",
        "You are on macOS 26.4 or later, or you are happy to use an older release from the developer's site.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        "You want moving video, not a web page.",
        `You want motion on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
        "You are on macOS 15 Sequoia and the current Plash release needs a newer version.",
        `You are fine paying once: ${price.proText} for up to ${price.proMacs} Macs, after a free 24-hour trial.`,
      ],
    },
    { type: "h2", text: "Check your macOS version first" },
    {
      type: "p",
      text: "The current Plash on the Mac App Store needs macOS 26.4 or later, and the version on the developer's site needs macOS 26; the site says older releases run on macOS 10.15 and later. MacWall needs macOS 15 for desktop wallpapers and macOS 26 for the Lock Screen. Choose Apple menu > About This Mac to see your version.",
    },
    {
      type: "p",
      text: "Want other video wallpaper apps? See [the best live wallpaper apps for Mac](/best-live-wallpaper-mac) or [the best wallpaper apps for Mac](/compare).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Plash by Sindre Sorhus", S.plashSite),
        sourceItem("Plash on the Mac App Store", S.plashAppStore),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is Plash free?",
      answer:
        "Yes. Plash is free on the Mac App Store, and its listing shows no in-app purchases.",
    },
    {
      question: "What macOS does Plash need?",
      answer:
        "The Mac App Store version needs macOS 26.4 or later. The version on the developer's site needs macOS 26, and older releases run on macOS 10.15 and later.",
    },
    {
      question: "Does Plash work on the Lock Screen?",
      answer:
        "No. Its site says it does not support the Lock Screen. MacWall plays video on the Lock Screen on macOS 26 or later.",
    },
    {
      question: "Can MacWall show a website as the wallpaper?",
      answer:
        "No. MacWall only plays video: its catalog and your own MP4, MOV and M4V files. Use Plash for websites.",
    },
    {
      question: "Who makes Plash?",
      answer:
        "Plash is made by Sindre Sorhus. MacWall is an independent Mac app and is not affiliated with Plash.",
    },
  ],
}))

// ---------------------------------------------------------------------------
// /alternatives/dynamic-wallpaper-club
// ---------------------------------------------------------------------------

export const dynamicWallpaperClubPage = salePricedPage((price) => ({
  slug: "dynamic-wallpaper-club",
  pathname: "/alternatives/dynamic-wallpaper-club",
  title: "Dynamic Wallpaper Club vs MacWall: Which to Use",
  headline: "Dynamic Wallpaper Club vs MacWall",
  description:
    "Dynamic Wallpaper Club is a free site for macOS dynamic wallpapers; MacWall is a paid video wallpaper app. How they differ, with dated sources.",
  keywords: [
    "dynamic wallpaper club",
    "dynamic wallpaper club mac",
    "dynamic wallpaper creator mac",
    "dynamic wallpaper mac",
    "dynamic wallpaper club alternative",
  ],
  publishedAt: "2026-10-27",
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Dynamic Wallpaper Club is a free website, not an app.** It hosts a community gallery of macOS dynamic wallpapers and a free Dynamic Wallpaper Creator that times images by the sun's position (Sun Mode) or by time stamps you set (Time Mode), per [dynamicwallpaper.club](${S.dynamicWallpaperClub}). macOS then plays the result itself. MacWall is a paid Mac app that plays looping video instead. For how dynamic, aerial and live wallpapers differ, see [live vs dynamic vs aerial wallpapers](/learn/live-vs-dynamic-vs-aerial-wallpapers-mac).`,
    },
    {
      type: "table",
      columns: ["", "Dynamic Wallpaper Club", "MacWall"],
      rows: [
        ["What it is", "Website", "Mac app"],
        ["Developer", "Not named on the site", "MacWall"],
        ["Price model", "Free; supported by ads and donations", price.summary],
        [
          "Platforms",
          "Web; makes wallpapers for macOS (minimum macOS not stated)",
          MACWALL_PLATFORMS,
        ],
        [
          "What changes",
          "Images switch with the sun's position or the time of day",
          "Looping video plays all the time",
        ],
        [
          "Make your own",
          "Free creator with Sun Mode and Time Mode",
          "Import your own MP4, MOV and M4V clips with Pro",
        ],
        ["Resolution", "Up to 5K", "4K catalog"],
        [
          "Lock Screen",
          "Not stated",
          `Video, ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Dynamic Wallpaper Club facts from dynamicwallpaper.club, accessed ${CHECKED}.`,
    },
    { type: "h2", text: "How a dynamic wallpaper works on a Mac" },
    {
      type: "p",
      text: `Apple added dynamic wallpapers in macOS Mojave in 2018, under the name Dynamic Desktop, which changes the desktop picture to match the time of day ([Apple Newsroom](${S.appleMojave})). Today Apple describes them as wallpapers that "brighten and darken, based on the time of day for your current location" ([Apple Support](${S.appleChangeWallpaper})). A dynamic wallpaper is a set of still images; macOS picks which one to show. Nothing plays as video.`,
    },
    {
      type: "p",
      text: "Dynamic Wallpaper Club builds on that format. Its gallery has wallpapers other people made, and its creator lets you build your own from photos: Sun Mode uses your location to follow the sun, and Time Mode uses time stamps you choose. The site says wallpapers go up to 5K.",
    },
    { type: "h2", text: "How a live wallpaper differs" },
    {
      type: "p",
      text: `A live wallpaper is a video loop that keeps moving whenever the desktop is visible. MacWall plays ${macwallCatalog.liveCountLabel} curated loops (most in 4K), decodes them in hardware, pauses behind full-screen apps, and on ${macwallLockScreenMacOSVersion} or later can play on the Lock Screen and as the Screen Saver. A video costs more energy than a still image, so a dynamic wallpaper is the lighter choice on battery. More detail: [dynamic vs live wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).`,
    },
    { type: "h2", text: "Pick Dynamic Wallpaper Club if" },
    {
      type: "ul",
      items: [
        "You want a desktop that changes slowly with the day, not constant motion.",
        "You want to turn your own photos into a dynamic wallpaper for free.",
        "You want to browse wallpapers other people have made, at up to 5K.",
        "You do not want to install another app.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        "You want moving video on the desktop.",
        `You want motion on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
        "You want a different loop on each display, Shuffle, or a time-of-day Day Schedule that switches between loops.",
        `You are fine paying once: ${price.proText} for up to ${price.proMacs} Macs, after a free 24-hour trial.`,
      ],
    },
    { type: "h2", text: "A note on similar names" },
    {
      type: "p",
      text: `Dynamic Wallpaper Studio on the Mac App Store is a different product: a live (video) wallpaper app by Aesthetic Apps & Widgets srl, free with in-app purchases at $2.99 a week or $29.99 a year, for macOS 12 and later ([Mac App Store](${S.dynamicWallpaperStudio})). If you want time-of-day wallpapers in an app rather than a website, see [24 Hour Wallpaper vs MacWall](/alternatives/24-hour-wallpaper).`,
    },
    { type: "h2", text: "Adding a downloaded wallpaper" },
    {
      type: "p",
      text: `Apple's steps for using your own image: open System Settings, click Wallpaper, then under Your Photos click Add Photo and choose Choose File ([Apple Support](${S.appleChangeWallpaper})). The Appearance menu offers Automatic, Dynamic, Light (Still) and Dark (Still) for dynamic wallpapers ([Apple Support](${S.appleWallpaperSettings})). MacWall cannot open these files; it imports video only.`,
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Dynamic Wallpaper Club", S.dynamicWallpaperClub),
        sourceItem(
          "Dynamic Wallpaper Studio on the Mac App Store",
          S.dynamicWallpaperStudio
        ),
        sourceItem(
          "Apple Newsroom: Apple introduces macOS Mojave",
          S.appleMojave
        ),
        sourceItem(
          "Apple Support: Change your wallpaper on Mac",
          S.appleChangeWallpaper
        ),
        sourceItem(
          "Apple Support: Wallpaper settings on Mac",
          S.appleWallpaperSettings
        ),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is Dynamic Wallpaper Club free?",
      answer:
        "Yes. The site is free and is supported by ads and donations. Its Dynamic Wallpaper Creator is free too.",
    },
    {
      question: "Is Dynamic Wallpaper Club an app?",
      answer:
        "No. It is a website. You download or create wallpapers there, and macOS displays them through System Settings > Wallpaper.",
    },
    {
      question:
        "What is the difference between a dynamic and a live wallpaper?",
      answer:
        "A dynamic wallpaper is a set of still images that macOS switches between by time of day or the sun's position. A live wallpaper is a looping video that moves all the time. Dynamic wallpapers use less energy; live wallpapers show motion.",
    },
    {
      question:
        "Can MacWall play dynamic wallpapers from Dynamic Wallpaper Club?",
      answer:
        "No. MacWall imports video files (MP4, MOV and M4V), not dynamic wallpaper image files. Set those in System Settings > Wallpaper instead.",
    },
    {
      question: "Who runs Dynamic Wallpaper Club?",
      answer:
        "The site does not name a company or developer. MacWall is an independent Mac app and is not affiliated with it.",
    },
  ],
}))

// ---------------------------------------------------------------------------
// /alternatives/iwallpaper
// ---------------------------------------------------------------------------

/** iWallpaper's one in-app purchase on the US Mac App Store. */
const IWALLPAPER_UNLOCK_CENTS = 699

export const iwallpaperAlternativePage = salePricedPage((price) => ({
  slug: "iwallpaper",
  pathname: "/alternatives/iwallpaper",
  title: "iWallpaper for Mac vs MacWall: Price and Features",
  headline: "iWallpaper vs MacWall",
  description:
    "iWallpaper vs MacWall on Mac: price, watermark, macOS versions, multiple monitors and the Lock Screen compared from the App Store listing, with sources.",
  keywords: [
    "iwallpaper",
    "iwallpaper mac",
    "iwallpaper live wallpaper",
    "iwallpaper alternative",
    "iwallpaper vs macwall",
    "iwallpaper watermark",
  ],
  publishedAt: COMPARISONS_RECHECKED_ISO,
  updatedAt: COMPARISONS_RECHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**iWallpaper and MacWall both play live wallpapers on a Mac; they differ most on price, the macOS versions they support and the Lock Screen.** iWallpaper is a free download on the Mac App Store whose one in-app purchase, Remove watermark, costs $6.99, and it runs on macOS 10.15 Catalina or later, per its [App Store listing](${S.iwallpaper}). MacWall is a direct download for macOS 15 or later with a 24-hour trial, then a one-time Pro license (${price.proText} for ${price.proMacs} Macs), and it also plays wallpapers on the Lock Screen and as the screen saver on macOS 26.`,
    },
    {
      type: "table",
      columns: ["", "iWallpaper", "MacWall"],
      rows: [
        ["Developer", "晓栋 周 (as listed on the App Store)", "MacWall"],
        [
          "Price model",
          "Free download; Remove watermark $6.99 (in-app purchase)",
          price.summary,
        ],
        [
          "Where to get it",
          "Mac App Store",
          "Direct download from macwall.app",
        ],
        [
          "Platforms",
          "macOS 10.15+; lists Apple silicon support",
          MACWALL_PLATFORMS,
        ],
        [
          "Lock Screen",
          "Not stated",
          `Video, ${macwallLockScreenMacOSVersion} or later, plus Screen Saver`,
        ],
        [
          "Library",
          "Wallpapers shared by its users, ranked by popularity and date; new ones every day, per the listing",
          `${macwallCatalog.liveCountLabel} curated loops, most in 4K, in 9 categories`,
        ],
        ["Your own videos", "Not stated", "MP4, MOV and M4V with Pro"],
        [
          "Multiple displays",
          "Separate settings for each monitor; standard, vertical, 21:9 and 32:9 ratios",
          "Different loop per display, or the same on all",
        ],
        [
          "Power",
          "Static when the wallpaper is hidden; static modes on battery and in low power",
          "Pauses behind full-screen apps; optional Pause on battery and Lower quality on battery",
        ],
        [
          "Account",
          "Uses iCloud (CloudKit); no separate login",
          "None; the trial asks for an email",
        ],
        [
          "Latest version",
          "1.1.3, June 12, 2025",
          `${macwall.currentVersion}, ${macwall.currentVersionReleasedLabel}`,
        ],
      ],
      caption: `iWallpaper facts from its US Mac App Store listing, accessed ${RECHECKED}.`,
    },
    { type: "h2", text: "Pick iWallpaper if" },
    {
      type: "ul",
      items: [
        "You are on macOS 10.15 Catalina to macOS 14 Sonoma; MacWall needs macOS 15.",
        price.proCurrentCents > IWALLPAPER_UNLOCK_CENTS
          ? `You want the smallest one-time cost: $6.99 removes iWallpaper's watermark, against ${price.proText} for MacWall Pro.`
          : "You want to try an app free with no time limit, and a watermark is fine until you pay.",
        "You use a vertical or 32:9 super-ultrawide monitor; its listing names both ratios.",
        "You prefer to buy through the Mac App Store and sign in with iCloud only.",
        "You want wallpapers other people share, with new ones every day.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        `You want a live Lock Screen and screen saver on ${macwallLockScreenMacOSVersion} or later; iWallpaper's listing doesn't mention the Lock Screen. See [live video screen savers](/screen-saver-mac).`,
        "You want a curated catalog you can preview on the web first: the [MacWall gallery](/wallpapers) shows every loop by category.",
        "You want to import your own videos; iWallpaper's listing doesn't mention it.",
        `You want one license for up to ${price.proMacs} Macs, Bend on an Apple silicon MacBook, Music Sync, or a time-of-day Day Schedule.`,
        `Recent updates matter to you: MacWall ${macwall.currentVersion} shipped on ${macwall.currentVersionReleasedLabel}, while iWallpaper's latest listed version, 1.1.3, is from June 12, 2025.`,
      ],
    },
    { type: "h2", text: "Performance" },
    {
      type: "p",
      text: "Both apps say they stop the wallpaper when you can't see it: iWallpaper's listing describes an occlusion check that keeps a hidden wallpaper static, and MacWall pauses behind full-screen apps. Neither of us publishes an independent test, so compare them in Activity Monitor on your own Mac; the [performance guide](/docs/performance-and-battery) shows how.",
    },
    {
      type: "p",
      text: "More comparisons: [MacWall vs Backdrop](/alternatives/macwall-vs-backdrop), [MacWall vs Wallspace](/alternatives/macwall-vs-wallspace) and [the best live wallpaper apps for Mac](/best-live-wallpaper-mac).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem(
          "iWallpaper on the Mac App Store",
          S.iwallpaper,
          COMPARISONS_RECHECKED_ISO
        ),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is iWallpaper free?",
      answer:
        "iWallpaper is free to download. Its one in-app purchase on the US Mac App Store, Remove watermark, is $6.99, so the free version shows a watermark.",
    },
    {
      question: "Does iWallpaper work on the Lock Screen?",
      answer:
        "Its App Store listing doesn't say. MacWall plays live wallpapers on the Lock Screen and as the screen saver on macOS 26 Tahoe or later.",
    },
    {
      question: "What macOS does iWallpaper need?",
      answer:
        "macOS 10.15 Catalina or later, per its App Store listing. MacWall needs macOS 15 Sequoia or later.",
    },
    {
      question: "Is iWallpaper the same as Wallpaper Engine?",
      answer:
        "No. iWallpaper is a separate Mac App Store app from a different developer. Wallpaper Engine has no Mac version.",
    },
    {
      question: "Is MacWall affiliated with iWallpaper?",
      answer:
        "No. MacWall is an independent Mac app and is not affiliated with iWallpaper or its developer.",
    },
  ],
}))

// ---------------------------------------------------------------------------
// /compare index
// ---------------------------------------------------------------------------

export type MacWallpaperAppType =
  "Live video" | "Static photos" | "Time of day" | "Website" | "Windows only"

/** One row of the /compare table. Every non-MacWall figure comes from `siteUrl`. */
export type MacWallpaperAppEntry = {
  name: string
  type: MacWallpaperAppType
  developer: string
  priceModel: string
  platforms: string
  /** Our comparison page, when one exists. */
  comparePath?: string
  /** The developer's site or store listing (also the price source). */
  siteUrl: string
  sourceLabel: string
  /** When `siteUrl` was read; COMPARISONS_CHECKED_ISO unless set. */
  accessedIso?: string
}

/** Every app on /compare, with MacWall's price as checkout charges it at `now`. */
export function macWallpaperApps(
  price: MacwallPriceFacts = macwallPriceFacts()
): MacWallpaperAppEntry[] {
  return [
    {
      name: "MacWall",
      type: "Live video",
      developer: "MacWall",
      priceModel: price.summary,
      platforms: `${MACWALL_PLATFORMS}; Lock Screen video on macOS 26+`,
      comparePath: "/best-live-wallpaper-mac",
      siteUrl: "/download",
      sourceLabel: "MacWall pricing",
    },
    {
      name: "Backdrop",
      type: "Live video",
      developer: "Cindori AB",
      priceModel:
        "Free tier (3 watermarked wallpapers); $1.99/month, $14.99/year or $29.99 lifetime",
      platforms: "macOS 15+",
      comparePath: macwallVsBackdropPage.pathname,
      siteUrl: S.backdrop,
      sourceLabel: "Backdrop by Cindori",
    },
    {
      name: "Wallspace",
      type: "Live video",
      developer: "Tangent Labs LLP",
      priceModel: "Free; Pro $12.99 one-time",
      platforms: "macOS 15+ (Lock Screen needs macOS 26)",
      comparePath: macwallVsWallspacePage.pathname,
      siteUrl: S.wallspace,
      sourceLabel: "Wallspace",
    },
    {
      name: "iWallpaper",
      type: "Live video",
      developer: "晓栋 周",
      priceModel: "Free; Remove watermark $6.99 (in-app purchase)",
      platforms: "macOS 10.15+",
      comparePath: "/alternatives/iwallpaper",
      siteUrl: S.iwallpaper,
      sourceLabel: "iWallpaper on the Mac App Store",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "Wallper",
      type: "Live video",
      developer: "Sandimax LLC",
      priceModel: "One-time license from $14.99; 7-day free trial",
      platforms: "macOS 14.6+ (Intel and Apple silicon)",
      siteUrl: S.wallper,
      sourceLabel: "Wallper",
    },
    {
      name: "Wallux",
      type: "Live video",
      developer: "Not stated",
      priceModel: "Has a free plan",
      platforms: "macOS 15+ (Lock Screen needs macOS 26)",
      siteUrl: S.wallux,
      sourceLabel: "Wallux",
    },
    {
      name: "Hanami - 6000+ Live Wallpapers",
      type: "Live video",
      developer: "豪 文 (WHBALZAC Inc)",
      priceModel:
        "Free with in-app purchases: $0.99/week, $1.99/month, $4.99 for 6 months, $7.99/year; lifetime upgrade $3.99 or $4.99",
      platforms: "macOS 13+",
      siteUrl: S.hanami,
      sourceLabel: "Hanami on the Mac App Store",
    },
    {
      name: "4K Live Wallpaper",
      type: "Live video",
      developer: "Hao Wen",
      priceModel:
        "Free with in-app purchases: $1.99/month, $8.99 for 6 months, $12.99/year, $29.99 lifetime",
      platforms: "macOS 13+",
      siteUrl: S.fourKLive,
      sourceLabel: "4K Live Wallpaper on the Mac App Store",
    },
    {
      name: "Live Wallpaper Engine HD",
      type: "Live video",
      developer: "Voros Innovation & Business Services Pty Ltd",
      priceModel:
        "Free with in-app purchases from $3.99 to $5.99, including a $5.99 unlock that removes ads",
      platforms: "macOS 10.13+",
      siteUrl: S.liveWallpaperEngineHd,
      sourceLabel: "Live Wallpaper Engine HD on the Mac App Store",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "Paper - 4k Live Wallpapers",
      type: "Live video",
      developer: "凌云 张",
      priceModel: "$7.99 upfront",
      platforms: "macOS 12+",
      siteUrl: S.paper,
      sourceLabel: "Paper on the Mac App Store",
    },
    {
      name: "Dynamic Wallpaper Studio",
      type: "Live video",
      developer: "Aesthetic Apps & Widgets srl",
      priceModel: "Free with in-app purchases: $2.99/week or $29.99/year",
      platforms: "macOS 12+",
      siteUrl: S.dynamicWallpaperStudio,
      sourceLabel: "Dynamic Wallpaper Studio on the Mac App Store",
    },
    {
      name: "Wallnetic: Live Wallpaper 4K",
      type: "Live video",
      developer: "TSQUARE BILISIM REKLAM SANAYI VE TICARET LIMITED SIRKETI",
      priceModel: "Free; no in-app purchases listed",
      platforms: "macOS 13+",
      siteUrl: S.wallnetic,
      sourceLabel: "Wallnetic on the Mac App Store",
    },
    {
      name: "WallpaperMachine",
      type: "Live video",
      developer: "MMFoundation",
      priceModel:
        "Free, open source (GPL-3.0); Workshop downloads need a Steam account that owns Wallpaper Engine",
      platforms: "macOS 15+, Apple silicon only",
      comparePath: wallpaperEngineAlternativePage.pathname,
      siteUrl: S.wallpaperMachine,
      sourceLabel: "WallpaperMachine on GitHub",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "Irvue",
      type: "Static photos",
      developer: "Igor Savelev",
      priceModel:
        "Free; optional subscriptions listed at $0.69/month or $7.00/year",
      platforms: "macOS 14+",
      siteUrl: S.irvue,
      sourceLabel: "Irvue on the Mac App Store",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "Unsplash Wallpapers",
      type: "Static photos",
      developer: "Unsplash Inc",
      priceModel: "Free; no in-app purchases listed",
      platforms: "macOS 13+",
      siteUrl: S.unsplashWallpapers,
      sourceLabel: "Unsplash Wallpapers on the Mac App Store",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "24 Hour Wallpaper",
      type: "Time of day",
      developer: "Jetson Creative LLC",
      priceModel:
        "Free with in-app purchases: all wallpapers $29.99 or $69.99 lifetime, single wallpapers $2.49; 14-day free trial",
      platforms: "macOS 15+",
      comparePath: twentyFourHourWallpaperPage.pathname,
      siteUrl: S.twentyFourHour,
      sourceLabel: "24 Hour Wallpaper on the Mac App Store",
    },
    {
      name: "Dynamic Wallpaper Club",
      type: "Time of day",
      developer: "Not named on the site",
      priceModel: "Free website (ads and donations)",
      platforms: "Web; makes macOS dynamic wallpapers",
      comparePath: dynamicWallpaperClubPage.pathname,
      siteUrl: S.dynamicWallpaperClub,
      sourceLabel: "Dynamic Wallpaper Club",
    },
    {
      name: "Plash",
      type: "Website",
      developer: "Sindre Sorhus",
      priceModel: "Free; no in-app purchases listed",
      platforms: "macOS 26.4+ (App Store version)",
      comparePath: plashAlternativePage.pathname,
      siteUrl: S.plashAppStore,
      sourceLabel: "Plash on the Mac App Store",
    },
    {
      name: "Wallpaper Engine",
      type: "Windows only",
      developer: "Wallpaper Engine Team",
      priceModel: "$4.99 one-time on Steam",
      platforms: "Windows 10 and 11; Android companion app. No Mac version",
      comparePath: wallpaperEngineAlternativePage.pathname,
      siteUrl: S.wallpaperEngineSteam,
      sourceLabel: "Wallpaper Engine on Steam",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
    {
      name: "Lively Wallpaper",
      type: "Windows only",
      developer: "rocksdanister (GitHub repository)",
      priceModel: "Free, open source (GPL-3.0)",
      platforms: "Windows 10 (1903+) and 11; no Mac version",
      comparePath: livelyWallpaperMacPage.pathname,
      siteUrl: S.lively,
      sourceLabel: "Lively Wallpaper on GitHub",
      accessedIso: COMPARISONS_RECHECKED_ISO,
    },
  ]
}

/** Every comparison or alternative page, in the order the /compare hub lists them. */
export const comparisonPages: readonly SeoContentPage[] = [
  bestLiveWallpaperMacPage,
  wallpaperEngineAlternativePage,
  macwallVsBackdropPage,
  macwallVsWallspacePage,
  iwallpaperAlternativePage,
  livelyWallpaperMacPage,
  twentyFourHourWallpaperPage,
  plashAlternativePage,
  dynamicWallpaperClubPage,
]

export const COMPARE_TABLE_COLUMNS = [
  "App",
  "Type",
  "Developer",
  "Price model (US)",
  "Platforms",
  "Details",
] as const

/** Table cell linking to our comparison page, or to the developer's site. */
export function compareDetailsCell(app: MacWallpaperAppEntry): string {
  if (app.comparePath) return `[Our comparison](${app.comparePath})`
  const label = app.siteUrl.startsWith("https://apps.apple.com/")
    ? "Mac App Store listing"
    : app.siteUrl.startsWith("https://github.com/")
      ? "GitHub"
      : "Developer site"
  return `[${label}](${app.siteUrl})`
}

/** The app table, shared by the /compare route and its Markdown twin. */
export function compareAppTable(
  apps: readonly MacWallpaperAppEntry[] = macWallpaperApps()
): ContentTableBlock {
  return {
    type: "table",
    columns: [...COMPARE_TABLE_COLUMNS],
    rows: apps.map((app) => [
      app.name === "MacWall" ? "**MacWall**" : app.name,
      app.type,
      app.developer,
      app.priceModel,
      app.platforms,
      compareDetailsCell(app),
    ]),
    caption: `US prices as listed on each developer's site, the US Mac App Store, Steam or GitHub, read on ${CHECKED} or, where the Sources list says so, ${RECHECKED}. Some sites show local prices by region.`,
  }
}

const APP_COUNT = macWallpaperApps().length
const LIVE_COUNT = macWallpaperApps().filter(
  (app) => app.type === "Live video"
).length

/** Sections before the app table (the /compare route renders the table itself). */
export const compareIntroSections: ContentBlock[] = [
  {
    type: "p",
    text: `**The best wallpaper app for a Mac depends on what you want on screen: moving video, a new photo every day, a scene that follows the time of day, or a web page.** This table lists ${APP_COUNT} apps and tools people use or search for on a Mac, ${LIVE_COUNT} of them for live video wallpapers, with each one's developer, price model, exact US price and platforms, read from the developer's page, the Mac App Store, Steam or GitHub. Two of them, Wallpaper Engine and Lively Wallpaper, do not run on macOS. The MacWall team wrote this page, so every row has a source and our comparison pages say where another app is the better fit. For live wallpaper apps only, see [the best live wallpaper apps for Mac](/best-live-wallpaper-mac).`,
  },
  { type: "h2", text: "All apps at a glance" },
]

/** Sections after the app table. */
export const compareOutroSections: ContentBlock[] = [
  { type: "h2", text: "How to choose" },
  {
    type: "ul",
    items: [
      "**Pay once for a video catalog**: MacWall, Wallspace Pro, Wallper, Paper, or iWallpaper's $6.99 watermark removal.",
      "**Use it free for as long as you like**: Wallspace, Wallnetic, WallpaperMachine, or Backdrop's watermarked free tier.",
      "**A new still photo on a schedule**: Unsplash Wallpapers (free) or Irvue (free, with optional subscriptions).",
      "**Older macOS**: Live Wallpaper Engine HD lists macOS 10.13 and iWallpaper macOS 10.15; Paper and Dynamic Wallpaper Studio list macOS 12; Hanami, 4K Live Wallpaper, Wallnetic and Unsplash Wallpapers list macOS 13.",
      "**A website as wallpaper**: Plash.",
      "**A wallpaper that follows the time of day**: 24 Hour Wallpaper, Dynamic Wallpaper Club, or Apple's built-in dynamic wallpapers.",
      "**A moving screen saver**: [live video screen savers for Mac](/screen-saver-mac).",
      "**Coming from Windows**: Wallpaper Engine and Lively have no Mac version. WallpaperMachine plays many Wallpaper Engine wallpapers you own on Apple silicon Macs, or pick one of the Mac apps.",
    ],
  },
]

/** The Sources list: one entry per competitor URL. */
export function compareSourcesSections(
  apps: readonly MacWallpaperAppEntry[] = macWallpaperApps()
): ContentBlock[] {
  return [
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        ...apps
          .filter((app) => app.name !== "MacWall")
          .map((app) =>
            sourceItem(
              app.sourceLabel,
              app.siteUrl,
              app.accessedIso ?? COMPARISONS_CHECKED_ISO
            )
          ),
        sourceItem("Plash by Sindre Sorhus", S.plashSite),
        sourceItem("Wallpaper Engine official site", S.wallpaperEngineSite),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ]
}

export const compareIndexPage = salePricedPage((price) => {
  const apps = macWallpaperApps(price)
  return {
    slug: "compare",
    pathname: "/compare",
    title: `Best Wallpaper Apps for Mac (${comparisonTitleYear(COMPARE_CHECKED_ISO)}): Live and Static`,
    headline: "Best wallpaper apps for Mac, compared",
    description: `${apps.length} Mac wallpaper apps side by side, live and static: developer, exact US price, price model and platforms, each with a dated source.`,
    keywords: [
      "best wallpaper app for mac",
      "mac wallpaper app",
      "wallpaper app mac",
      "macbook wallpaper app",
      "wallpaper apps for mac",
      "mac wallpaper apps compared",
    ],
    publishedAt: "2026-10-27",
    updatedAt: COMPARE_CHECKED_ISO,
    sections: [
      ...compareIntroSections,
      compareAppTable(apps),
      ...compareOutroSections,
      { type: "h2", text: "Our comparison pages" },
      {
        type: "ul",
        items: comparisonPages.map(
          (page) => `[${page.headline}](${page.pathname}): ${page.description}`
        ),
      },
      ...compareSourcesSections(apps),
    ],
    faq: [
      {
        question: "What is the best wallpaper app for Mac?",
        answer:
          "It depends on your macOS version, budget and what you want on screen. For video wallpapers with a one-time price, MacWall, Wallspace Pro and Wallper are options; for free use, Wallspace, Wallnetic or Backdrop's free tier; for a new photo every day, Unsplash Wallpapers or Irvue; for a website, Plash; for time-of-day wallpapers, 24 Hour Wallpaper or Dynamic Wallpaper Club.",
      },
      {
        question: "Which Mac wallpaper apps are free?",
        answer:
          "Wallspace, Wallnetic, Plash, Unsplash Wallpapers and WallpaperMachine are free, and Dynamic Wallpaper Club is a free website. Backdrop, iWallpaper, Irvue, Hanami, 4K Live Wallpaper, Live Wallpaper Engine HD, Dynamic Wallpaper Studio and 24 Hour Wallpaper are free to download with paid upgrades. MacWall is free for 24 hours, then needs a one-time license.",
      },
      {
        question: "Do Wallpaper Engine or Lively Wallpaper run on Mac?",
        answer:
          "No. Wallpaper Engine's Steam page lists Windows 10 and 11 only, and Lively Wallpaper's README describes a Windows app. WallpaperMachine, a separate open-source app, plays many Wallpaper Engine wallpapers on Apple silicon Macs; otherwise use a native Mac app.",
      },
      {
        question: "Which apps work on older versions of macOS?",
        answer:
          "Live Wallpaper Engine HD lists macOS 10.13 and iWallpaper macOS 10.15; Paper and Dynamic Wallpaper Studio list macOS 12; Hanami, 4K Live Wallpaper, Wallnetic and Unsplash Wallpapers list macOS 13; Irvue lists macOS 14 and Wallper macOS 14.6. MacWall, Backdrop, Wallspace, Wallux, WallpaperMachine and 24 Hour Wallpaper need macOS 15, and the current Plash needs macOS 26.4.",
      },
      {
        question: "How were these prices checked?",
        answer: `We read each developer's page, Mac App Store listing, Steam page or GitHub README on ${CHECKED}, or on ${RECHECKED} for the rows the Sources list marks, using US prices. Prices change and some stores show local prices, so follow the source link before you buy.`,
      },
    ],
  }
})
