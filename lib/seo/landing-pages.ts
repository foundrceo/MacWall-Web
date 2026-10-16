import { LICENSE_OFFERS } from "@/lib/license/offers.shared"
import {
  macwall,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallSocialProof,
  macwallMinimumMacOSRequirementOrLater,
} from "@/lib/macwall-site"
import type { SeoContentPage } from "@/lib/content/types"

export const downloadPage: SeoContentPage = {
  slug: "download",
  pathname: "/download",
  title: "Download MacWall for Mac – Free 24-Hour Trial",
  headline: "Download MacWall for Mac",
  description: `Live wallpapers for macOS 15 or later. Free 24-hour trial with no card, then ${macwall.pro.price} once for up to ${macwall.maxLicensedMacs} Macs. ${macwallSocialProof.trustedLine}.`,
  keywords: [
    "macwall download",
    "download live wallpaper mac",
    "mac wallpaper app download",
    "macos wallpaper app",
  ],
  sections: [
    {
      type: "p",
      text: `**MacWall needs macOS 15 Sequoia or later** on an Apple silicon or Intel Mac. A live Lock Screen and Screen Saver need **${macwallLockScreenMacOSVersion} or later**. Check Apple menu → About This Mac before you download. If you are on an older version, see [live wallpapers on macOS Sonoma](/blog/macos-sonoma-live-wallpaper).`,
    },
    {
      type: "p",
      text: `The download is free and starts with a 24-hour trial of the full catalog: ${macwallCatalog.liveCountLabel} curated 4K live wallpapers. The trial asks for an email address, never a card, and runs once per Mac. After it, a one-time Pro license keeps everything unlocked; see [pricing](/pricing) for your region. ${macwallSocialProof.trustedLine}.`,
    },
    { type: "h2", text: "Install in under a minute" },
    {
      type: "ol",
      items: [
        "Click Download below to get the latest DMG.",
        "Open the disk image and drag MacWall to Applications.",
        "Open MacWall from Applications. macOS asks you to confirm an app downloaded from the internet; click Open.",
        "Follow the short setup, then choose **Try Free · 24h** on the last screen, or enter the license key from your purchase email.",
        "Pick a wallpaper and click Set Wallpaper. Your first loop is playing in a few seconds.",
      ],
    },
    { type: "h2", text: "What you get" },
    {
      type: "ul",
      items: [
        "Curated cloud catalog across 9 categories, with search and filters",
        "A different wallpaper on each display, or the same loop on all of them",
        `Live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} and later`,
        "Hardware-decoded playback that pauses behind full-screen apps",
        "Menu bar control: play, pause, stop, switch",
        "Music Sync gradients from Apple Music and Spotify, and Bend on Apple silicon MacBooks",
        "With Pro: import your own MP4, MOV and M4V clips",
      ],
    },
    { type: "h2", text: "System requirements" },
    {
      type: "ul",
      items: [
        macwallMinimumMacOSRequirementOrLater,
        `Lock Screen & Screen Saver video: ${macwallLockScreenMacOSVersion} or later`,
        "Apple silicon or Intel Mac",
        "Internet for catalog sync; downloaded wallpapers play offline",
      ],
    },
  ],
  faq: [
    {
      question: "How much does MacWall cost?",
      answer: `The download and the 24-hour trial are free. Pro is a one-time ${macwall.pro.price} for up to ${macwall.maxLicensedMacs} Macs (regional prices apply, including a lower price in India), with free updates and no subscription. Pro+ covers 5 or 10 Macs. Every license has a ${macwall.refundWindowDays}-day money-back guarantee.`,
    },
    {
      question: "What happens when the trial ends?",
      answer:
        "You can keep browsing the catalog, but setting live wallpapers and the Lock Screen need Pro. Nothing is charged automatically, because the trial never asks for a card.",
    },
    {
      question: "Is MacWall safe to install?",
      answer:
        "MacWall is distributed only from macwall.app as a DMG that is signed and notarized by Apple. macOS shows its standard confirmation the first time you open an app downloaded from the internet. MacWall has no account system and does not need a card for the trial.",
    },
  ],
}

/** Competitor facts on these pages were checked on this date against the linked sources. */
const COMPARISONS_CHECKED_ISO = "2026-10-16"
const COMPARISONS_CHECKED_LABEL = "October 16, 2026"

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`
const MACWALL_PRO_USD = usd(LICENSE_OFFERS.permanent.usdCents)
const MACWALL_PRO_INDIA_USD = usd(LICENSE_OFFERS.permanent.indiaUsdCents)
const MACWALL_PRO_PLUS_USD = usd(LICENSE_OFFERS.permanent_5.usdCents)
const MACWALL_PRO_MACS = LICENSE_OFFERS.permanent.maxDevices
const MACWALL_PRO_PLUS_MACS = LICENSE_OFFERS.permanent_5.maxDevices

/** One honest summary of MacWall, reused by every comparison table. */
const MACWALL_COMPARISON_ROW = [
  "**MacWall**",
  `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD}); ${MACWALL_PRO_PLUS_MACS} Macs ${MACWALL_PRO_PLUS_USD}`,
  "macOS 15+",
  "Video, macOS 26+",
  `${macwallCatalog.liveCountLabel} curated 4K loops`,
]

const COMPARISON_COLUMNS = [
  "App",
  "Price",
  "Desktop needs",
  "Lock Screen",
  "Library",
]

const COMPARISON_SOURCES_NOTE = `Prices in USD as listed on each developer's site on ${COMPARISONS_CHECKED_LABEL}; some sites show local prices by region. Library sizes for other apps are the developers' own figures.`

export const bestLiveWallpaperMacPage: SeoContentPage = {
  slug: "best-live-wallpaper-mac",
  pathname: "/best-live-wallpaper-mac",
  title: "Best Live Wallpaper Apps for Mac (2026), Compared | MacWall",
  headline: "Live Wallpaper Apps for Mac, Compared",
  description:
    "MacWall, Backdrop, Wallper, Wallspace, Wallux, Vivid Walls and Aerial compared on price, trial, macOS support and Lock Screen, with sources and honest picks.",
  keywords: [
    "best live wallpaper mac",
    "best wallpaper app mac 2026",
    "best live wallpaper app for macbook",
    "best animated wallpaper mac",
    "live wallpaper app mac comparison",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**There is no single best live wallpaper app for Mac; the right one depends on your macOS version, your budget and what you want to watch.** Every serious option is now a native app that decodes video in hardware, and most of them can put motion on the Lock Screen on macOS 26. They differ on price model, trial length, minimum macOS and library. This page is written by the MacWall team, so we link our sources and say where another app fits better.`,
    },
    { type: "h2", text: "Side by side" },
    {
      type: "table",
      columns: COMPARISON_COLUMNS,
      rows: [
        MACWALL_COMPARISON_ROW,
        [
          "[Backdrop](https://cindori.com/backdrop)",
          "Monthly, yearly or lifetime; lifetime about $29.99 ([MacSources](https://macsources.com/backdrop-for-mac-review/), May 2026)",
          "macOS 15+",
          "Video, since v2.0 (Sept 2025)",
          "“Thousands” of community wallpapers",
        ],
        [
          "[Wallper](https://www.wallper.app/pricing)",
          "$14.99 one-time for 3 Macs; $24.99 for 5",
          "macOS 14.6+",
          "Video on macOS 26+",
          "2,600 to 3,000+ (figures vary by page)",
        ],
        [
          "[Wallspace](https://wallspace.app/pricing)",
          "Free tier; Pro $12.99 one-time",
          "macOS 15+",
          "macOS 26+",
          "1,000+",
        ],
        [
          "[Wallux](https://wallux.app/pricing)",
          "$2.99/month or $9.99 lifetime (3 Macs)",
          "macOS 15+",
          "Video on macOS 26+",
          "Not stated; adds interactive effects",
        ],
        [
          "[Vivid Walls](https://vividwalls.app/)",
          "$9.99 one-time (in-app purchase)",
          "macOS 14+, Apple silicon only",
          "Login transition only",
          "Plays your own Wallpaper Engine library",
        ],
        [
          "[Aerial](https://aerialscreensaver.github.io)",
          "Free, open source",
          "Current release: macOS 26",
          "Screen saver, not Lock Screen",
          "Apple's aerials and your own videos",
        ],
      ],
      caption: COMPARISON_SOURCES_NOTE,
    },
    { type: "h2", text: "Which one fits you" },
    {
      type: "ul",
      items: [
        "**You want a ready-made catalog and to pay once**: MacWall or Wallper. MacWall is cheaper for 3 Macs and has regional pricing; Wallper gives a 7-day trial and runs on macOS 14.6.",
        "**You want to try for a long time before paying**: Wallspace (free tier) or Backdrop (no time limit, watermarked). MacWall's trial is only 24 hours.",
        "**You already own Wallpaper Engine on Steam**: Vivid Walls plays those scenes natively on Apple silicon. MacWall cannot import Wallpaper Engine scenes.",
        "**You want free and only need Apple's aerials or your own clips**: Aerial.",
        "**You want interactive effects or desktop pets**: Wallux.",
        "**You are on macOS 14 Sonoma**: Wallper or Vivid Walls. MacWall, Backdrop, Wallspace and Wallux need macOS 15.",
      ],
    },
    { type: "h2", text: "What MacWall does differently" },
    {
      type: "ul",
      items: [
        `**Price**: ${MACWALL_PRO_USD} once covers ${MACWALL_PRO_MACS} personal Macs, and buyers in India pay ${MACWALL_PRO_INDIA_USD}. No subscription.`,
        "**Bend**: on Apple silicon MacBooks the desktop folds and dims with the lid angle as you close it. We have not found another app that does this.",
        "**Music Sync**: album-art gradients from Apple Music and Spotify (Wallper has a similar feature).",
        "**Per-display wallpapers**: a different loop on each screen, or the same loop shared by one player.",
        "**Live Lock Screen and Screen Saver** on macOS 26 and later, with two playback modes if one misbehaves after a macOS update.",
      ],
    },
    { type: "h2", text: "Where MacWall is weaker" },
    {
      type: "ul",
      items: [
        "The free trial lasts 24 hours, and after it the app is browse-only until you buy.",
        "It needs macOS 15 Sequoia or later.",
        "Importing your own videos is a paid feature, not part of the trial.",
        "Its library is smaller than the figures Backdrop and Wallper publish.",
      ],
    },
    {
      type: "p",
      text: "Whichever app you try, open Activity Monitor next to it: the real cost of a live wallpaper depends on your Mac, the video and the app's pause rules, and none of these developers, us included, publishes an independent test. Browse the [MacWall catalog](/wallpapers) or [collections](/wallpapers/collections) before you download.",
    },
  ],
  faq: [
    {
      question: "What is the best live wallpaper app for Mac?",
      answer:
        "It depends on what you need. MacWall and Wallper suit people who want a curated catalog and a one-time price, Wallspace and Backdrop let you try longer for free, Vivid Walls reuses a Wallpaper Engine library, and Aerial is the free option for Apple's aerials and your own clips.",
    },
    {
      question: "Is there a free live wallpaper app for Mac?",
      answer:
        "Yes. Aerial is free and open source, Wallspace has a permanent free tier, and Plash shows a website as your wallpaper for free. MacWall is free to try for 24 hours, then needs a one-time Pro license.",
    },
    {
      question: "Do live wallpapers slow down a Mac?",
      answer:
        "A native app that decodes video on Apple's media engine uses far less CPU than software decoding or a browser-based wallpaper, and good apps pause behind full-screen windows. The cost still depends on the video's resolution and frame rate and how many displays play it, so check Activity Monitor on your own Mac.",
    },
  ],
}

export const wallpaperEngineAlternativePage: SeoContentPage = {
  slug: "wallpaper-engine",
  pathname: "/alternatives/wallpaper-engine",
  title: "Wallpaper Engine for Mac? What Works in 2026 | MacWall",
  headline: "Wallpaper Engine for Mac: What Actually Works",
  description:
    "Wallpaper Engine is Windows-only. Here are the Mac options: reuse your Steam library with Vivid Walls, or switch to a native video wallpaper app such as MacWall.",
  keywords: [
    "wallpaper engine mac",
    "wallpaper engine for mac",
    "wallpaper engine macos",
    "wallpaper engine mac alternative",
    "apps like wallpaper engine for mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: "**No, Wallpaper Engine does not run on Mac.** It is a Windows 10 and 11 app sold on [Steam](https://store.steampowered.com/app/431960/Wallpaper_Engine/), and there is no macOS version. You have two realistic paths: reuse the Wallpaper Engine scenes you already own with a compatibility app, or switch to a native Mac app with its own catalog. MacWall is the second kind and is not affiliated with Wallpaper Engine.",
    },
    { type: "h2", text: "Path 1: reuse your Wallpaper Engine library" },
    {
      type: "p",
      text: "[Vivid Walls](https://vividwalls.app/) ($9.99, 3-day trial, Apple silicon and macOS 14+) plays Wallpaper Engine scene and video wallpapers natively on the Mac, using a free Windows companion to transfer the library you own. Wallpapers built on 3D models or executables do not carry over. If you have a large Workshop collection, start there.",
    },
    { type: "h2", text: "Path 2: a native Mac video wallpaper app" },
    {
      type: "p",
      text: `If you mostly used Wallpaper Engine for video loops, a native app gives you the same look with Mac features such as the Lock Screen. [MacWall](/download) has ${macwallCatalog.liveCountLabel} curated 4K live wallpapers, plays your own MP4 and MOV files with Pro, and puts motion on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}. Pro is ${MACWALL_PRO_USD} once for ${MACWALL_PRO_MACS} Macs (${MACWALL_PRO_INDIA_USD} in India). Other native options are compared on [live wallpaper apps for Mac](/best-live-wallpaper-mac).`,
    },
    {
      type: "table",
      columns: ["", "Wallpaper Engine", "MacWall"],
      rows: [
        ["Runs on", "Windows 10/11", "macOS 15+ (Apple silicon and Intel)"],
        [
          "Content",
          "Steam Workshop: video, web, interactive scenes",
          "Curated video loops plus your own MP4/MOV",
        ],
        ["Interactive scenes", "Yes", "No"],
        ["Mac Lock Screen", "No", `Yes, on ${macwallLockScreenMacOSVersion}`],
        [
          "Price",
          "One-time on Steam",
          `${MACWALL_PRO_USD} one-time, 24-hour free trial`,
        ],
      ],
      caption: `Checked ${COMPARISONS_CHECKED_LABEL}.`,
    },
    { type: "h2", text: "Moving your own clips over" },
    {
      type: "ol",
      items: [
        "Export or copy the MP4 or MOV loops you made yourself or have the rights to use. Workshop items stay licensed to Wallpaper Engine.",
        "[Download MacWall](/download) and start the 24-hour trial to test the catalog on your displays.",
        "With Pro, import your clips into the Library and assign a different one to each display if you like.",
      ],
    },
  ],
  faq: [
    {
      question: "Does Wallpaper Engine work on Mac?",
      answer:
        "No. Wallpaper Engine is Windows-only and has no macOS version on Steam. Running it in a virtual machine cannot draw on the real Mac desktop. Use a Mac app instead: Vivid Walls to reuse Wallpaper Engine scenes, or a native video wallpaper app such as MacWall.",
    },
    {
      question: "Can I use my Wallpaper Engine wallpapers on Mac?",
      answer:
        "Partly. Vivid Walls can play many scene and video wallpapers from a library you own. MacWall cannot import Wallpaper Engine scenes; it plays its own catalog and video files you have the rights to use.",
    },
    {
      question: "Is MacWall made by the Wallpaper Engine team?",
      answer:
        "No. MacWall is an independent Mac app made by OG APPS, LLC and is not affiliated with Wallpaper Engine or Steam.",
    },
  ],
}

export const macwallVsBackdropPage: SeoContentPage = {
  slug: "macwall-vs-backdrop",
  pathname: "/alternatives/macwall-vs-backdrop",
  title: "MacWall vs Backdrop: Live Wallpaper Apps for Mac Compared",
  headline: "MacWall vs Backdrop",
  description:
    "MacWall vs Backdrop by Cindori: price, trial, Lock Screen, library and tools compared with sources, including when Backdrop is the better choice.",
  keywords: [
    "backdrop alternative mac",
    "macwall vs backdrop",
    "backdrop cindori alternative",
    "backdrop mac wallpaper app",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Backdrop and MacWall are both native Mac apps for video wallpapers with Lock Screen support on macOS 26.** Backdrop has the longer track record, a no-time-limit trial and a creator tool; MacWall costs less as a one-time purchase (${MACWALL_PRO_USD} for ${MACWALL_PRO_MACS} Macs) and adds Bend and Music Sync.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Backdrop"],
      rows: [
        [
          "Price",
          `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD})`,
          "Monthly, yearly or lifetime; about $14.99/year or $29.99 lifetime ([MacSources](https://macsources.com/backdrop-for-mac-review/), May 2026)",
        ],
        [
          "Free trial",
          "24 hours of the full catalog, no card",
          "No time limit, 3 watermarked wallpapers ([Cindori](https://cindori.com/backdrop))",
        ],
        ["Desktop", "macOS 15+", "macOS 15+"],
        ["Lock Screen", "macOS 26+", "Since v2.0, September 2025"],
        [
          "Library",
          `${macwallCatalog.liveCountLabel} curated 4K loops`,
          "“Thousands” of community wallpapers, 24 collections",
        ],
        ["Make your own", "Import MP4/MOV with Pro", "Built-in Creator tool"],
        [
          "Extras",
          "Bend, Music Sync, per-display loops",
          "Playlists, curated collections",
        ],
        [
          "Refunds",
          `${macwall.refundWindowDays} days`,
          "14 days, before license activation",
        ],
      ],
      caption: `Checked ${COMPARISONS_CHECKED_LABEL}. Backdrop shows regional prices on its own store.`,
    },
    { type: "h2", text: "Pick Backdrop if" },
    {
      type: "ul",
      items: [
        "You want to try for days or weeks before paying.",
        "You want to build and publish your own animated wallpapers with an editor.",
        "You prefer a monthly plan over paying upfront.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        `You want a one-time price under Backdrop's lifetime license, for up to ${MACWALL_PRO_MACS} Macs.`,
        "You like the categories in the [catalog](/wallpapers): anime, cars, nature, space, dark and more.",
        "You want Bend on an Apple silicon MacBook or Music Sync gradients.",
      ],
    },
  ],
  faq: [
    {
      question: "Is MacWall cheaper than Backdrop?",
      answer: `As a one-time purchase, yes: MacWall Pro is ${MACWALL_PRO_USD} for ${MACWALL_PRO_MACS} Macs, while Backdrop's lifetime license was reported at about $29.99 in May 2026. Backdrop also sells monthly and yearly plans.`,
    },
    {
      question: "Do both work on the Mac Lock Screen?",
      answer:
        "Yes. Both play video on the Lock Screen on macOS 26 or later. Both rely on macOS wallpaper behavior that Apple can change in updates.",
    },
  ],
}

export const macwallVsWallspacePage: SeoContentPage = {
  slug: "macwall-vs-wallspace",
  pathname: "/alternatives/macwall-vs-wallspace",
  title: "MacWall vs Wallspace: Live Wallpaper Apps for Mac Compared",
  headline: "MacWall vs Wallspace",
  description:
    "MacWall vs Wallspace: free tier, one-time price, Lock Screen, library and requirements compared with sources, including when Wallspace is the better choice.",
  keywords: [
    "wallspace alternative",
    "wallspace alternative mac",
    "macwall vs wallspace",
    "apps like wallspace mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Wallspace and MacWall are native Swift apps for live wallpapers with Lock Screen support on macOS 26, and both sell a one-time Pro license.** Wallspace's advantage is a permanent free tier; MacWall's Pro covers ${MACWALL_PRO_MACS} Macs in one purchase and adds Bend, Music Sync and regional pricing.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Wallspace"],
      rows: [
        [
          "Price",
          `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD})`,
          "$12.99 one-time per Mac; multi-Mac packs from $19.49 ([pricing](https://wallspace.app/pricing))",
        ],
        ["Free use", "24-hour trial, then browse-only", "Permanent free tier"],
        ["Desktop", "macOS 15+", "macOS 15+"],
        ["Lock Screen", "macOS 26+, plus Screen Saver", "macOS 26+"],
        [
          "Library",
          `${macwallCatalog.liveCountLabel} curated 4K loops`,
          "1,000+ (self-reported)",
        ],
        ["Refunds", `${macwall.refundWindowDays} days`, "5 days"],
      ],
      caption: `Checked ${COMPARISONS_CHECKED_LABEL}. Wallspace lists $8.99 on one of its other pages; the pricing page says $12.99.`,
    },
    { type: "h2", text: "Pick Wallspace if" },
    {
      type: "ul",
      items: [
        "You want to keep using a free version indefinitely.",
        "You install apps with Homebrew.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        `You want one license for ${MACWALL_PRO_MACS} Macs, or you buy from India at ${MACWALL_PRO_INDIA_USD}.`,
        "You want Bend, Music Sync, or a live Screen Saver as well as the Lock Screen.",
        "You like what is in the [MacWall catalog](/wallpapers).",
      ],
    },
  ],
  faq: [
    {
      question: "Does MacWall require an account?",
      answer:
        "No. MacWall has no accounts. The free trial asks for an email address but no card, and a Pro license is a key that activates on up to 3 Macs.",
    },
    {
      question: "Is MacWall lighter than Wallspace?",
      answer:
        "Both use hardware video decoding, and neither of us publishes an independent head-to-head test. Compare them in Activity Monitor on your own Mac.",
    },
  ],
}

export const livelyWallpaperMacPage: SeoContentPage = {
  slug: "lively-wallpaper-mac",
  pathname: "/alternatives/lively-wallpaper-mac",
  title: "Lively Wallpaper for Mac: The Native Alternative | MacWall",
  headline: "Lively Wallpaper for Mac",
  description:
    "Lively Wallpaper is Windows-only. MacWall is the native macOS equivalent: live video wallpapers with hardware decode and menu bar controls.",
  keywords: [
    "lively wallpaper mac",
    "lively wallpaper for macos",
    "lively wallpaper mac download",
    "lively wallpaper alternative mac",
    "free live wallpaper app mac",
    "rocksdanister lively mac",
  ],
  sections: [
    {
      type: "p",
      text: "Searching for **Lively Wallpaper on Mac**? Lively is a popular live wallpaper app, but it's Windows-only and has no macOS version. **MacWall** is the closest native equivalent: desktop video wallpapers, your own MP4 and MOV imports, and a hand-picked community catalog, all with a one-time Pro license. See [pricing](/pricing) for the current regional offer.",
    },
    {
      type: "h2",
      text: "Why MacWall instead of Lively on Mac",
    },
    {
      type: "ul",
      items: [
        "One-time Pro license, no subscription, free updates forever",
        "Native Swift app, built only for macOS",
        "Import the same video files you used in Lively",
        "Curated 4K catalog across Anime, Nature, Cars, Gaming, and more",
        "Pauses behind full-screen apps, with optional Low Power Mode and busy-CPU pauses",
        `Live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}`,
        "Post a Reel with #macwall and get up to 100% refunded",
      ],
    },
    {
      type: "h2",
      text: "Switching from Lively",
    },
    {
      type: "ol",
      items: [
        "Copy your favorite video wallpapers from your Windows PC.",
        "Download MacWall from macwall.app/download.",
        "Import the videos into your MacWall Library.",
        "Browse the catalog for fresh Mac-optimized 4K loops.",
      ],
    },
  ],
  faq: [
    {
      question: "Is there a Lively Wallpaper version for Mac?",
      answer:
        "No. Lively Wallpaper supports Windows only. MacWall is the native macOS alternative for video live wallpapers.",
    },
    {
      question: "How much does MacWall cost?",
      answer:
        "MacWall has a one-time license with free updates forever. Pro covers up to 3 Macs; Pro+ covers 5 or 10 Macs. Visit the pricing page for the current regional offer. No subscription, and a Reel with #macwall can get you the whole thing refunded.",
    },
  ],
}

export function wallpaperCategoryPage(
  categoryName: string,
  options: { total?: number } = {}
): SeoContentPage {
  const pathSlug =
    categoryName === "Others" ? "others" : categoryName.toLowerCase()
  const lower = categoryName.toLowerCase()
  const countPhrase =
    options.total && options.total > 0
      ? `${options.total} ${lower} live wallpapers`
      : `${categoryName} live wallpapers`

  return {
    slug: pathSlug,
    pathname: `/wallpapers/${pathSlug}`,
    title: `${categoryName} Live Wallpapers for Mac | MacWall`,
    headline: `${categoryName} Live Wallpapers for Mac`,
    description: `Browse ${lower} live wallpapers for Mac: preview every loop free, then set it on your desktop and Lock Screen with MacWall. All in 4K; one-time purchase, no subscription.`,
    keywords: [
      `${lower} wallpaper mac`,
      `${lower} live wallpaper macos`,
      `animated ${lower} desktop mac`,
    ],
    sections: [
      {
        type: "p",
        text: `This page lists **${countPhrase}** from the MacWall catalog, most-liked first. Every one is a real video loop, not a GIF, and you can preview it here before you install anything. Open a wallpaper to see its resolution, length and file size, then use **Set on Mac** to send it straight to the app.`,
      },
      { type: "h2", text: "How to set one on your Mac" },
      {
        type: "ol",
        items: [
          "[Download MacWall](/download) (macOS 15 or later) and start the free 24-hour trial; it asks for an email, never a card.",
          `Open a ${lower} wallpaper on this page and click **Set on Mac**, or find it under ${categoryName} in the app.`,
          "Click Set Wallpaper. To use a different loop on another display, click the arrow next to Set Wallpaper and pick the display.",
          `On ${macwallLockScreenMacOSVersion} or later, the same loop can play on the Lock Screen and as the Screen Saver.`,
        ],
      },
      { type: "h2", text: "Before you pick" },
      {
        type: "ul",
        items: [
          "**Resolution**: the catalog is 4K, and each wallpaper page shows its exact size, so you can match it to your display for the sharpest result.",
          "**Ultrawide and multiple displays**: a handful of loops are made for ultrawide monitors; others are cropped to fill. Two displays showing the same loop share one player.",
          "**Laptops**: playback is decoded in hardware and pauses behind full-screen apps. On battery you can cap it at 1080p or pause it in Low Power Mode from Settings → Power.",
        ],
      },
      {
        type: "p",
        text: `Comparing apps first? See [live wallpaper apps for Mac compared](/best-live-wallpaper-mac) and [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).`,
      },
    ],
    faq: [
      {
        question: `Are these ${lower} wallpapers free?`,
        answer: `Previewing them here is free. Setting them on your Mac needs MacWall: every download includes a free 24-hour trial, then a one-time Pro license (${macwall.pro.price} for up to ${macwall.maxLicensedMacs} Macs, lower in some regions) keeps the whole catalog unlocked.`,
      },
      {
        question: `Can I use ${lower} live wallpapers on the Lock Screen?`,
        answer: `Yes, on ${macwallLockScreenMacOSVersion} or later. On macOS 15 the wallpaper plays on the desktop only.`,
      },
    ],
  }
}
