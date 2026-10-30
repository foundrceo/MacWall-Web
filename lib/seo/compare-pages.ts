import { LICENSE_OFFERS } from "@/lib/license/offers.shared"
import {
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
import type {
  ContentBlock,
  ContentTableBlock,
  SeoContentPage,
} from "@/lib/content/types"

/**
 * Competitor facts in this file were read on this date from the URLs below
 * (US prices). Re-check every source before changing a figure.
 */
export const COMPARE_CHECKED_ISO = "2026-10-27"
const COMPARE_ACCESSED_LABEL = "27 October 2026"

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`
const MACWALL_PRO_USD = usd(LICENSE_OFFERS.permanent.usdCents)
const MACWALL_PRO_INDIA_USD = usd(LICENSE_OFFERS.permanent.indiaUsdCents)
const MACWALL_PRO_PLUS_USD = usd(LICENSE_OFFERS.permanent_5.usdCents)
const MACWALL_PRO_MACS = LICENSE_OFFERS.permanent.maxDevices
const MACWALL_PRO_PLUS_MACS = LICENSE_OFFERS.permanent_5.maxDevices

const MACWALL_PRICE_SUMMARY = `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD}); ${MACWALL_PRO_PLUS_MACS} Macs ${MACWALL_PRO_PLUS_USD}; 24-hour free trial`
const MACWALL_PLATFORMS = "macOS 15+ (Apple silicon and Intel)"

const MACWALL_FACTS_NOTE =
  "MacWall's own prices and requirements come from our [pricing](/pricing) and [download](/download) pages."

/** One "Sources" list item: "[Page](url), accessed 27 October 2026". */
const sourceItem = (label: string, url: string) =>
  `[${label}](${url}), accessed ${COMPARE_ACCESSED_LABEL}`

const SOURCES = {
  backdrop: "https://cindori.com/backdrop",
  wallspace: "https://wallspace.app/",
  wallpaperEngineSteam:
    "https://store.steampowered.com/app/431960/Wallpaper_Engine/?cc=us",
  wallpaperEngineSite: "https://www.wallpaperengine.io/en",
  lively: "https://github.com/rocksdanister/lively",
  plashSite: "https://sindresorhus.com/plash",
  plashAppStore: "https://apps.apple.com/us/app/plash/id1494023538",
  twentyFourHour:
    "https://apps.apple.com/us/app/24-hour-wallpaper/id1226087575?mt=12",
  dynamicWallpaperClub: "https://dynamicwallpaper.club/",
  dynamicWallpaperStudio:
    "https://apps.apple.com/us/app/dynamic-wallpaper-studio/id1453504509?mt=12",
  wallper: "https://www.wallper.app/",
  wallux: "https://wallux.app/",
  hanami:
    "https://apps.apple.com/us/app/hanami-live-wallpaper/id1456235760?mt=12",
  fourKLive: "https://apps.apple.com/us/app/4k-live-wallpaper/id1469182113",
  paper:
    "https://apps.apple.com/us/app/paper-4k-live-wallpapers/id1515245310?mt=12",
  wallnetic:
    "https://apps.apple.com/us/app/wallnetic-live-wallpaper-4k/id6760347328?mt=12",
  appleChangeWallpaper:
    "https://support.apple.com/guide/mac-help/mchlp3013/mac",
  appleWallpaperSettings:
    "https://support.apple.com/guide/mac-help/mchlp1103/mac",
  appleMojave:
    "https://www.apple.com/newsroom/2018/06/apple-introduces-macos-mojave/",
} as const

// ---------------------------------------------------------------------------
// /alternatives/24-hour-wallpaper
// ---------------------------------------------------------------------------

export const twentyFourHourWallpaperPage: SeoContentPage = {
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
  updatedAt: COMPARE_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**24 Hour Wallpaper and MacWall do different jobs.** 24 Hour Wallpaper, by Jetson Creative, shows wallpapers that change with the time of day at your location, using its own ProTime engine or Apple's Dynamic Desktop format, per its [Mac App Store page](${SOURCES.twentyFourHour}). MacWall plays looping video. Pick 24 Hour Wallpaper for a scene that shifts from morning to night, and MacWall for constant motion and a live Lock Screen.`,
    },
    {
      type: "table",
      columns: ["", "24 Hour Wallpaper", "MacWall"],
      rows: [
        ["Developer", "Jetson Creative LLC", "MacWall"],
        [
          "Price model",
          "Free download with in-app purchases: lifetime access to all wallpapers at $29.99 or $69.99 (two listings), single wallpapers $2.49, and a 14-day free trial",
          MACWALL_PRICE_SUMMARY,
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
      caption: `24 Hour Wallpaper facts from its US Mac App Store page, accessed ${COMPARE_ACCESSED_LABEL}.`,
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
        `You want the whole catalog for one price: ${MACWALL_PRO_USD} once for up to ${MACWALL_PRO_MACS} Macs (${MACWALL_PRO_INDIA_USD} in India), against $29.99 or $69.99 for 24 Hour Wallpaper's lifetime options.`,
        "You want to import your own MP4 and MOV clips (with Pro).",
        "You want Music Sync gradients from Apple Music and Spotify, or Bend on an Apple silicon MacBook.",
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
      text: `Before you pay for either app, try Apple's dynamic wallpapers. Apple says they "brighten and darken, based on the time of day for your current location" ([Apple Support](${SOURCES.appleChangeWallpaper})). Open System Settings, click Wallpaper, and pick one under Dynamic Wallpapers. The Appearance menu next to it offers Automatic, Dynamic, Light (Still) and Dark (Still) ([Apple Support](${SOURCES.appleWallpaperSettings})). 24 Hour Wallpaper adds 173 more scenes on top of those (8 free, 165 paid). For more on the difference, read [dynamic vs live wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).`,
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem(
          "24 Hour Wallpaper on the Mac App Store",
          SOURCES.twentyFourHour
        ),
        sourceItem(
          "Apple Support: Change your wallpaper on Mac",
          SOURCES.appleChangeWallpaper
        ),
        sourceItem(
          "Apple Support: Wallpaper settings on Mac",
          SOURCES.appleWallpaperSettings
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
}

// ---------------------------------------------------------------------------
// /alternatives/plash
// ---------------------------------------------------------------------------

export const plashAlternativePage: SeoContentPage = {
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
  updatedAt: COMPARE_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Plash and MacWall put different things on your desktop.** Plash, a free app by Sindre Sorhus, makes any website your wallpaper, per [its site](${SOURCES.plashSite}). MacWall plays looping video from a curated catalog or your own files. If you want a dashboard, a live web page or a page you built yourself behind your windows, Plash is the better fit and costs nothing.`,
    },
    {
      type: "table",
      columns: ["", "Plash", "MacWall"],
      rows: [
        ["Developer", "Sindre Sorhus", "MacWall"],
        [
          "Price model",
          "Free; no in-app purchases listed",
          MACWALL_PRICE_SUMMARY,
        ],
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
          "Import your own MP4 and MOV clips with Pro",
        ],
        ["Automation", "Shortcuts and a URL scheme", "Menu bar controls"],
        [
          "Battery",
          "Can pause on battery",
          "Pauses behind full-screen apps; optional pause in Low Power Mode",
        ],
      ],
      caption: `Plash facts from sindresorhus.com/plash and its US Mac App Store page, accessed ${COMPARE_ACCESSED_LABEL}.`,
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
        `You are fine paying once: ${MACWALL_PRO_USD} for up to ${MACWALL_PRO_MACS} Macs, after a free 24-hour trial.`,
      ],
    },
    { type: "h2", text: "Check your macOS version first" },
    {
      type: "p",
      text: "The current Plash on the Mac App Store needs macOS 26.4 or later, and the version on the developer's site needs macOS 26; the site says older releases run on macOS 10.15 and later. MacWall needs macOS 15 for desktop wallpapers and macOS 26 for the Lock Screen. Choose Apple menu > About This Mac to see your version.",
    },
    {
      type: "p",
      text: "Want other video wallpaper apps? See [live wallpaper apps for Mac, compared](/best-live-wallpaper-mac) or the [full comparison index](/compare).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Plash by Sindre Sorhus", SOURCES.plashSite),
        sourceItem("Plash on the Mac App Store", SOURCES.plashAppStore),
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
}

// ---------------------------------------------------------------------------
// /alternatives/dynamic-wallpaper-club
// ---------------------------------------------------------------------------

export const dynamicWallpaperClubPage: SeoContentPage = {
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
  updatedAt: COMPARE_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Dynamic Wallpaper Club is a free website, not an app.** It hosts a community gallery of macOS dynamic wallpapers and a free Dynamic Wallpaper Creator that times images by the sun's position (Sun Mode) or by time stamps you set (Time Mode), per [dynamicwallpaper.club](${SOURCES.dynamicWallpaperClub}). macOS then plays the result itself. MacWall is a paid Mac app that plays looping video instead.`,
    },
    {
      type: "table",
      columns: ["", "Dynamic Wallpaper Club", "MacWall"],
      rows: [
        ["What it is", "Website", "Mac app"],
        ["Developer", "Not named on the site", "MacWall"],
        [
          "Price model",
          "Free; supported by ads and donations",
          MACWALL_PRICE_SUMMARY,
        ],
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
          "Import your own MP4 and MOV clips with Pro",
        ],
        ["Resolution", "Up to 5K", "4K catalog"],
        [
          "Lock Screen",
          "Not stated",
          `Video, ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Dynamic Wallpaper Club facts from dynamicwallpaper.club, accessed ${COMPARE_ACCESSED_LABEL}.`,
    },
    { type: "h2", text: "How a dynamic wallpaper works on a Mac" },
    {
      type: "p",
      text: `Apple added dynamic wallpapers in macOS Mojave in 2018, under the name Dynamic Desktop, which changes the desktop picture to match the time of day ([Apple Newsroom](${SOURCES.appleMojave})). Today Apple describes them as wallpapers that "brighten and darken, based on the time of day for your current location" ([Apple Support](${SOURCES.appleChangeWallpaper})). A dynamic wallpaper is a set of still images; macOS picks which one to show. Nothing plays as video.`,
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
        `You are fine paying once: ${MACWALL_PRO_USD} for up to ${MACWALL_PRO_MACS} Macs, after a free 24-hour trial.`,
      ],
    },
    { type: "h2", text: "A note on similar names" },
    {
      type: "p",
      text: `Dynamic Wallpaper Studio on the Mac App Store is a different product: a live (video) wallpaper app by Aesthetic Apps & Widgets srl, free with in-app purchases at $2.99 a week or $29.99 a year, for macOS 12 and later ([Mac App Store](${SOURCES.dynamicWallpaperStudio})). If you want time-of-day wallpapers in an app rather than a website, see [24 Hour Wallpaper vs MacWall](/alternatives/24-hour-wallpaper).`,
    },
    { type: "h2", text: "Adding a downloaded wallpaper" },
    {
      type: "p",
      text: `Apple's steps for using your own image: open System Settings, click Wallpaper, then under Your Photos click Add Photo and choose Choose File ([Apple Support](${SOURCES.appleChangeWallpaper})). The Appearance menu offers Automatic, Dynamic, Light (Still) and Dark (Still) for dynamic wallpapers ([Apple Support](${SOURCES.appleWallpaperSettings})). MacWall cannot open these files; it imports video only.`,
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Dynamic Wallpaper Club", SOURCES.dynamicWallpaperClub),
        sourceItem(
          "Dynamic Wallpaper Studio on the Mac App Store",
          SOURCES.dynamicWallpaperStudio
        ),
        sourceItem(
          "Apple Newsroom: Apple introduces macOS Mojave",
          SOURCES.appleMojave
        ),
        sourceItem(
          "Apple Support: Change your wallpaper on Mac",
          SOURCES.appleChangeWallpaper
        ),
        sourceItem(
          "Apple Support: Wallpaper settings on Mac",
          SOURCES.appleWallpaperSettings
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
}

// ---------------------------------------------------------------------------
// /compare index
// ---------------------------------------------------------------------------

/** One row of the /compare table. Every non-MacWall figure comes from `sourceUrl`. */
export type MacWallpaperAppEntry = {
  name: string
  developer: string
  priceModel: string
  platforms: string
  /** Our comparison page, when one exists. */
  comparePath?: string
  /** The developer's site or store listing (also the price source). */
  siteUrl: string
  sourceLabel: string
}

export const macWallpaperApps: readonly MacWallpaperAppEntry[] = [
  {
    name: "MacWall",
    developer: "MacWall",
    priceModel: MACWALL_PRICE_SUMMARY,
    platforms: `${MACWALL_PLATFORMS}; Lock Screen video on macOS 26+`,
    comparePath: "/best-live-wallpaper-mac",
    siteUrl: "/download",
    sourceLabel: "MacWall pricing",
  },
  {
    name: "Backdrop",
    developer: "Cindori AB",
    priceModel:
      "Free tier (3 watermarked wallpapers); $1.99/month, $14.99/year or $29.99 lifetime",
    platforms: "macOS 15+",
    comparePath: macwallVsBackdropPage.pathname,
    siteUrl: SOURCES.backdrop,
    sourceLabel: "Backdrop by Cindori",
  },
  {
    name: "Wallspace",
    developer: "Tangent Labs LLP",
    priceModel: "Free; Pro $12.99 one-time",
    platforms: "macOS 15+ (Lock Screen needs macOS 26)",
    comparePath: macwallVsWallspacePage.pathname,
    siteUrl: SOURCES.wallspace,
    sourceLabel: "Wallspace",
  },
  {
    name: "Wallper",
    developer: "Sandimax LLC",
    priceModel: "One-time license from $14.99; 7-day free trial",
    platforms: "macOS 14.6+ (Intel and Apple silicon)",
    siteUrl: SOURCES.wallper,
    sourceLabel: "Wallper",
  },
  {
    name: "Wallux",
    developer: "Not stated",
    priceModel: "Has a free plan",
    platforms: "macOS 15+ (Lock Screen needs macOS 26)",
    siteUrl: SOURCES.wallux,
    sourceLabel: "Wallux",
  },
  {
    name: "Hanami - 6000+ Live Wallpapers",
    developer: "豪 文 (WHBALZAC Inc)",
    priceModel:
      "Free with in-app purchases: $0.99/week, $1.99/month, $4.99 for 6 months, $7.99/year; lifetime upgrade $3.99 or $4.99",
    platforms: "macOS 13+",
    siteUrl: SOURCES.hanami,
    sourceLabel: "Hanami on the Mac App Store",
  },
  {
    name: "4K Live Wallpaper",
    developer: "Hao Wen",
    priceModel:
      "Free with in-app purchases: $1.99/month, $8.99 for 6 months, $12.99/year, $29.99 lifetime",
    platforms: "macOS 13+",
    siteUrl: SOURCES.fourKLive,
    sourceLabel: "4K Live Wallpaper on the Mac App Store",
  },
  {
    name: "Paper - 4k Live Wallpapers",
    developer: "凌云 张",
    priceModel: "$7.99 upfront",
    platforms: "macOS 12+",
    siteUrl: SOURCES.paper,
    sourceLabel: "Paper on the Mac App Store",
  },
  {
    name: "Dynamic Wallpaper Studio",
    developer: "Aesthetic Apps & Widgets srl",
    priceModel: "Free with in-app purchases: $2.99/week or $29.99/year",
    platforms: "macOS 12+",
    siteUrl: SOURCES.dynamicWallpaperStudio,
    sourceLabel: "Dynamic Wallpaper Studio on the Mac App Store",
  },
  {
    name: "Wallnetic: Live Wallpaper 4K",
    developer: "TSQUARE BILISIM REKLAM SANAYI VE TICARET LIMITED SIRKETI",
    priceModel: "Free; no in-app purchases listed",
    platforms: "macOS 13+",
    siteUrl: SOURCES.wallnetic,
    sourceLabel: "Wallnetic on the Mac App Store",
  },
  {
    name: "24 Hour Wallpaper",
    developer: "Jetson Creative LLC",
    priceModel:
      "Free with in-app purchases: all wallpapers $29.99 or $69.99 lifetime, single wallpapers $2.49; 14-day free trial",
    platforms: "macOS 15+",
    comparePath: twentyFourHourWallpaperPage.pathname,
    siteUrl: SOURCES.twentyFourHour,
    sourceLabel: "24 Hour Wallpaper on the Mac App Store",
  },
  {
    name: "Plash",
    developer: "Sindre Sorhus",
    priceModel: "Free; no in-app purchases listed",
    platforms: "macOS 26.4+ (App Store version)",
    comparePath: plashAlternativePage.pathname,
    siteUrl: SOURCES.plashAppStore,
    sourceLabel: "Plash on the Mac App Store",
  },
  {
    name: "Dynamic Wallpaper Club",
    developer: "Not named on the site",
    priceModel: "Free website (ads and donations)",
    platforms: "Web; makes macOS dynamic wallpapers",
    comparePath: dynamicWallpaperClubPage.pathname,
    siteUrl: SOURCES.dynamicWallpaperClub,
    sourceLabel: "Dynamic Wallpaper Club",
  },
  {
    name: "Wallpaper Engine",
    developer: "Wallpaper Engine Team",
    priceModel: "$4.99 one-time on Steam",
    platforms: "Windows 10 and 11 only; Android companion. No Mac version",
    comparePath: wallpaperEngineAlternativePage.pathname,
    siteUrl: SOURCES.wallpaperEngineSteam,
    sourceLabel: "Wallpaper Engine on Steam",
  },
  {
    name: "Lively Wallpaper",
    developer: "rocksdanister (GitHub repository)",
    priceModel: "Free, open source (GPL-3.0)",
    platforms: "Windows 10 only. No Mac version",
    comparePath: livelyWallpaperMacPage.pathname,
    siteUrl: SOURCES.lively,
    sourceLabel: "Lively Wallpaper on GitHub",
  },
]

/** Every comparison or alternative page, in the order the /compare hub lists them. */
export const comparisonPages: readonly SeoContentPage[] = [
  bestLiveWallpaperMacPage,
  wallpaperEngineAlternativePage,
  macwallVsBackdropPage,
  macwallVsWallspacePage,
  livelyWallpaperMacPage,
  twentyFourHourWallpaperPage,
  plashAlternativePage,
  dynamicWallpaperClubPage,
]

export const COMPARE_TABLE_COLUMNS = [
  "App",
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
    : "Developer site"
  return `[${label}](${app.siteUrl})`
}

/** The app table, shared by the /compare route and its Markdown twin. */
export const compareAppTable: ContentTableBlock = {
  type: "table",
  columns: [...COMPARE_TABLE_COLUMNS],
  rows: macWallpaperApps.map((app) => [
    app.name === "MacWall" ? "**MacWall**" : app.name,
    app.developer,
    app.priceModel,
    app.platforms,
    compareDetailsCell(app),
  ]),
  caption: `US prices as listed on ${COMPARE_ACCESSED_LABEL} on each developer's site, the US Mac App Store or Steam; some sites show local prices by region. Every source is listed below.`,
}

/** Sections before the app table (the /compare route renders the table itself). */
export const compareIntroSections: ContentBlock[] = [
  {
    type: "p",
    text: `**This table lists ${macWallpaperApps.length} wallpaper apps and tools that people use or search for on a Mac, with each one's developer, price model, exact US price and platforms, read from the developer's page, the Mac App Store or Steam on ${COMPARE_ACCESSED_LABEL}.** Two of them, Wallpaper Engine and Lively Wallpaper, do not run on macOS. The Mac apps need anything from macOS 12 to macOS 26.4. The MacWall team wrote this page, so every row has a source and our comparison pages say where another app is the better fit.`,
  },
  { type: "h2", text: "All apps at a glance" },
]

/** Sections after the app table. */
export const compareOutroSections: ContentBlock[] = [
  { type: "h2", text: "How to choose" },
  {
    type: "ul",
    items: [
      "**Pay once for a video catalog**: MacWall, Wallspace Pro, Wallper or Paper.",
      "**Use it free for as long as you like**: Wallspace, Wallnetic, or Backdrop's watermarked free tier.",
      "**Older macOS**: Paper and Dynamic Wallpaper Studio list macOS 12; Hanami, 4K Live Wallpaper and Wallnetic list macOS 13.",
      "**A website as wallpaper**: Plash.",
      "**A wallpaper that follows the time of day**: 24 Hour Wallpaper, Dynamic Wallpaper Club, or Apple's built-in dynamic wallpapers.",
      "**Coming from Windows**: Wallpaper Engine and Lively have no Mac version, so pick one of the Mac apps.",
    ],
  },
]

/** The Sources list: one entry per competitor URL. */
export const compareSourcesSections: ContentBlock[] = [
  { type: "h2", text: "Sources" },
  {
    type: "ul",
    items: [
      ...macWallpaperApps
        .filter((app) => app.name !== "MacWall")
        .map((app) => sourceItem(app.sourceLabel, app.siteUrl)),
      sourceItem("Plash by Sindre Sorhus", SOURCES.plashSite),
      sourceItem("Wallpaper Engine official site", SOURCES.wallpaperEngineSite),
    ],
  },
  { type: "p", text: MACWALL_FACTS_NOTE },
]

export const compareIndexPage: SeoContentPage = {
  slug: "compare",
  pathname: "/compare",
  title: "Mac Wallpaper Apps Compared: Prices and Platforms",
  headline: "Mac wallpaper apps compared",
  description:
    "15 Mac wallpaper apps and tools side by side: developer, exact US price, price model and platforms, each with a dated source, plus our comparisons.",
  keywords: [
    "mac wallpaper app",
    "wallpaper app mac",
    "macbook wallpaper app",
    "mac live wallpaper app",
    "live wallpaper app mac comparison",
    "mac wallpaper apps compared",
  ],
  updatedAt: COMPARE_CHECKED_ISO,
  sections: [
    ...compareIntroSections,
    compareAppTable,
    ...compareOutroSections,
    { type: "h2", text: "Our comparison pages" },
    {
      type: "ul",
      items: comparisonPages.map(
        (page) => `[${page.headline}](${page.pathname}): ${page.description}`
      ),
    },
    ...compareSourcesSections,
  ],
  faq: [
    {
      question: "What is the best wallpaper app for Mac?",
      answer:
        "It depends on your macOS version, budget and what you want on screen. For video wallpapers with a one-time price, MacWall, Wallspace Pro and Wallper are options; for free use, Wallspace, Wallnetic or Backdrop's free tier; for a website, Plash; for time-of-day wallpapers, 24 Hour Wallpaper or Dynamic Wallpaper Club.",
    },
    {
      question: "Which Mac wallpaper apps are free?",
      answer:
        "Wallspace, Wallnetic and Plash are free, and Dynamic Wallpaper Club is a free website. Backdrop, Hanami, 4K Live Wallpaper, Dynamic Wallpaper Studio and 24 Hour Wallpaper are free to download with paid upgrades. MacWall is free for 24 hours, then needs a one-time license.",
    },
    {
      question: "Do Wallpaper Engine or Lively Wallpaper run on Mac?",
      answer:
        "No. Wallpaper Engine's Steam page lists Windows 10 and 11 only, and Lively Wallpaper's README describes a Windows app. Use a native Mac app instead.",
    },
    {
      question: "Which apps work on older versions of macOS?",
      answer:
        "Paper and Dynamic Wallpaper Studio list macOS 12; Hanami, 4K Live Wallpaper and Wallnetic list macOS 13; Wallper lists macOS 14.6. MacWall, Backdrop, Wallspace, Wallux and 24 Hour Wallpaper need macOS 15, and the current Plash needs macOS 26.4.",
    },
    {
      question: "How were these prices checked?",
      answer: `We read each developer's page, Mac App Store listing or Steam page on ${COMPARE_ACCESSED_LABEL}, using US prices. Prices change and some stores show local prices, so follow the source link before you buy.`,
    },
  ],
}
