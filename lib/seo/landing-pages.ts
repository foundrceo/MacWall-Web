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
  title: "Download MacWall for Mac, Free 24-Hour Trial",
  headline: "Download MacWall for Mac",
  description: `Live wallpapers for macOS 15 or later. Free 24-hour trial with no card, then ${macwall.pro.price} once for up to ${macwall.maxLicensedMacs} Macs. ${macwallSocialProof.downloadsLine}.`,
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
      text: `The download is free and starts with a 24-hour trial of the full catalog: ${macwallCatalog.liveCountLabel} curated live wallpapers, most in 4K. The trial asks for an email address, never a card, and runs once per Mac. After it, a one-time Pro license keeps everything unlocked; see [pricing](/pricing) for your region. ${macwallSocialProof.downloadsLine}.`,
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

/**
 * Competitor facts on these pages were read on this date from the sources
 * each page lists under "Sources". Re-check every source before changing it.
 */
const COMPARISONS_CHECKED_ISO = "2026-10-27"
const COMPARISONS_ACCESSED_LABEL = "27 October 2026"

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`
const MACWALL_PRO_USD = usd(LICENSE_OFFERS.permanent.usdCents)
const MACWALL_PRO_INDIA_USD = usd(LICENSE_OFFERS.permanent.indiaUsdCents)
const MACWALL_PRO_PLUS_USD = usd(LICENSE_OFFERS.permanent_5.usdCents)
const MACWALL_PRO_MACS = LICENSE_OFFERS.permanent.maxDevices
const MACWALL_PRO_PLUS_MACS = LICENSE_OFFERS.permanent_5.maxDevices

/** One honest summary of MacWall's price, reused by every comparison table. */
const MACWALL_PRICE_SUMMARY = `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD}); ${MACWALL_PRO_PLUS_MACS} Macs ${MACWALL_PRO_PLUS_USD}; 24-hour free trial`
const MACWALL_PLATFORMS = "macOS 15+ (Apple silicon and Intel)"

/** Competitor pages read on COMPARISONS_CHECKED_ISO (US prices). */
const COMPARISON_SOURCES = {
  backdrop: "https://cindori.com/backdrop",
  wallspace: "https://wallspace.app/",
  wallper: "https://www.wallper.app/",
  wallux: "https://wallux.app/",
  hanami:
    "https://apps.apple.com/us/app/hanami-live-wallpaper/id1456235760?mt=12",
  fourKLive: "https://apps.apple.com/us/app/4k-live-wallpaper/id1469182113",
  paper:
    "https://apps.apple.com/us/app/paper-4k-live-wallpapers/id1515245310?mt=12",
  dynamicWallpaperStudio:
    "https://apps.apple.com/us/app/dynamic-wallpaper-studio/id1453504509?mt=12",
  wallnetic:
    "https://apps.apple.com/us/app/wallnetic-live-wallpaper-4k/id6760347328?mt=12",
  plashAppStore: "https://apps.apple.com/us/app/plash/id1494023538",
  twentyFourHour:
    "https://apps.apple.com/us/app/24-hour-wallpaper/id1226087575?mt=12",
  wallpaperEngineSteam:
    "https://store.steampowered.com/app/431960/Wallpaper_Engine/?cc=us",
  wallpaperEngineSite: "https://www.wallpaperengine.io/en",
  lively: "https://github.com/rocksdanister/lively",
} as const

/** One "Sources" list item: "[Page](url), accessed 27 October 2026". */
const sourceItem = (label: string, url: string) =>
  `[${label}](${url}), accessed ${COMPARISONS_ACCESSED_LABEL}`

const MACWALL_FACTS_NOTE =
  "MacWall's own prices and requirements come from our [pricing](/pricing) and [download](/download) pages."

export const bestLiveWallpaperMacPage: SeoContentPage = {
  slug: "best-live-wallpaper-mac",
  pathname: "/best-live-wallpaper-mac",
  title: "Best Live Wallpaper Apps for Mac (2026), Compared",
  headline: "Live Wallpaper Apps for Mac, Compared",
  description:
    "MacWall, Backdrop, Wallspace, Wallper, Hanami and five more Mac live wallpaper apps compared on price, macOS version and Lock Screen, with sources.",
  keywords: [
    "best live wallpaper mac",
    "best live wallpaper app mac",
    "mac wallpaper app",
    "macbook wallpaper app",
    "live wallpaper app mac",
    "best animated wallpaper mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**There is no single best live wallpaper app for Mac; the right one depends on your macOS version, your budget and what you want on screen.** The ten apps below all play video behind your windows, several can also animate the Lock Screen, and prices run from free to $29.99 for a lifetime license. The MacWall team wrote this page, so every competitor price links to the developer's page or the Mac App Store as read on ${COMPARISONS_ACCESSED_LABEL}, and we say where another app is the better fit.`,
    },
    { type: "h2", text: "Side by side" },
    {
      type: "table",
      columns: [
        "App",
        "Price model (US)",
        "Desktop needs",
        "Lock Screen or screen saver",
      ],
      rows: [
        [
          "**MacWall**",
          MACWALL_PRICE_SUMMARY,
          MACWALL_PLATFORMS,
          "Live Lock Screen and Screen Saver, macOS 26+",
        ],
        [
          `[Backdrop](${COMPARISON_SOURCES.backdrop})`,
          "Free tier (3 watermarked wallpapers, no time limit); $1.99/month, $14.99/year or $29.99 lifetime",
          "macOS 15+",
          "Lock Screen video",
        ],
        [
          `[Wallspace](${COMPARISON_SOURCES.wallspace})`,
          "Free; Pro $12.99 one-time",
          "macOS 15+",
          "Lock Screen with Pro, macOS 26+",
        ],
        [
          `[Wallper](${COMPARISON_SOURCES.wallper})`,
          "One-time license from $14.99; 7-day free trial",
          "macOS 14.6+ (Intel and Apple silicon)",
          "Lock Screen support; macOS version not stated",
        ],
        [
          `[Wallux](${COMPARISON_SOURCES.wallux})`,
          "Has a free plan",
          "macOS 15+",
          "Video Lock Screen, macOS 26+",
        ],
        [
          `[Hanami](${COMPARISON_SOURCES.hanami})`,
          "Free with in-app purchases: Pro from $0.99/week to $7.99/year; lifetime upgrade $3.99 or $4.99",
          "macOS 13+",
          "Can run as the screen saver",
        ],
        [
          `[4K Live Wallpaper](${COMPARISON_SOURCES.fourKLive})`,
          "Free with in-app purchases: $1.99/month, $8.99 for 6 months, $12.99/year, $29.99 lifetime",
          "macOS 13+",
          "Live lock screen screensaver",
        ],
        [
          `[Paper](${COMPARISON_SOURCES.paper})`,
          "$7.99 upfront",
          "macOS 12+",
          "Not stated",
        ],
        [
          `[Dynamic Wallpaper Studio](${COMPARISON_SOURCES.dynamicWallpaperStudio})`,
          "Free with in-app purchases: $2.99/week or $29.99/year",
          "macOS 12+",
          "Not stated",
        ],
        [
          `[Wallnetic](${COMPARISON_SOURCES.wallnetic})`,
          "Free; no in-app purchases listed",
          "macOS 13+",
          "Not stated",
        ],
      ],
      caption: `US prices as listed on ${COMPARISONS_ACCESSED_LABEL} on each developer's site or the US Mac App Store; some sites show local prices by region. "Not stated" means the source page does not say.`,
    },
    { type: "h2", text: "Library sizes, as each developer states them" },
    {
      type: "ul",
      items: [
        `**MacWall**: ${macwallCatalog.liveCountLabel} curated live wallpapers, most in 4K.`,
        "**Hanami**: 6,000+ live wallpapers.",
        "**Dynamic Wallpaper Studio**: 5,000+ live wallpapers, plus 700+ exclusive ones.",
        "**Paper**: 4,000+ wallpapers.",
        "**Backdrop**: “thousands of community-created live wallpapers”.",
        "**Wallper**: “thousands of 4K live wallpapers”.",
        "**Wallspace**: 1,000+ wallpapers.",
      ],
    },
    { type: "h2", text: "Which one fits you" },
    {
      type: "ul",
      items: [
        "**You want a ready-made catalog and to pay once**: MacWall ($12.99 for 3 Macs), Wallspace Pro ($12.99), Wallper (from $14.99) or Paper ($7.99 upfront). Wallper's 7-day trial is longer than MacWall's 24 hours.",
        "**You want to use it free for as long as you like**: Wallspace and Wallnetic are free to use, and Backdrop's free tier has no time limit but caps you at 3 watermarked wallpapers. MacWall's trial lasts 24 hours.",
        "**You prefer to pay by the month or week**: Backdrop ($1.99/month), 4K Live Wallpaper ($1.99/month), Hanami (from $0.99/week) and Dynamic Wallpaper Studio ($2.99/week). MacWall has no monthly plan.",
        "**You are on macOS 12, 13 or 14**: Paper and Dynamic Wallpaper Studio list macOS 12, Hanami, 4K Live Wallpaper and Wallnetic list macOS 13, and Wallper lists macOS 14.6. MacWall, Backdrop, Wallspace and Wallux need macOS 15.",
        "**You want a website, not a video, as your wallpaper**: [Plash](/alternatives/plash) is free; its App Store version needs macOS 26.4.",
        "**You want a wallpaper that follows the time of day**: [24 Hour Wallpaper](/alternatives/24-hour-wallpaper), or Apple's built-in dynamic wallpapers.",
        "**You want desktop pets or interactive effects**: Wallux lists both.",
        "**You are coming from Windows**: [Wallpaper Engine](/alternatives/wallpaper-engine) and [Lively Wallpaper](/alternatives/lively-wallpaper-mac) are Windows-only, so you need one of the Mac apps above.",
      ],
    },
    { type: "h2", text: "What MacWall does differently" },
    {
      type: "ul",
      items: [
        `**Price**: ${MACWALL_PRO_USD} once covers ${MACWALL_PRO_MACS} personal Macs, and buyers in India pay ${MACWALL_PRO_INDIA_USD}. No subscription.`,
        "**Bend**: on Apple silicon MacBooks the desktop folds and dims with the lid angle as you close it.",
        "**Music Sync**: album-art gradients from Apple Music and Spotify.",
        "**Per-display wallpapers**: a different loop on each screen, or the same loop on all of them.",
        `**Live Lock Screen and Screen Saver** on ${macwallLockScreenMacOSVersion} and later.`,
        "**Rotation**: Shuffle every 15 minutes to once a day, and a Day Schedule that picks a wallpaper by time of day.",
      ],
    },
    { type: "h2", text: "Where MacWall is weaker" },
    {
      type: "ul",
      items: [
        "The free trial lasts 24 hours, and after it the app is browse-only until you buy.",
        "It needs macOS 15 Sequoia or later, while several apps above run on macOS 12 or 13.",
        "Importing your own videos is a paid feature, not part of the trial.",
        "Its library is smaller than the figures Hanami, Dynamic Wallpaper Studio, Paper, Backdrop and Wallper publish.",
      ],
    },
    {
      type: "p",
      text: "Whichever app you try, open Activity Monitor next to it. Some developers publish their own CPU figures (Backdrop says under 0.3% on an M1 Max, Wallux says 0.2%, Wallspace says under 2%), but none of these, ours included, is an independent test. Browse the [MacWall catalog](/wallpapers) before you download, or see [every app we compare](/compare).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Backdrop by Cindori", COMPARISON_SOURCES.backdrop),
        sourceItem("Wallspace", COMPARISON_SOURCES.wallspace),
        sourceItem("Wallper", COMPARISON_SOURCES.wallper),
        sourceItem("Wallux", COMPARISON_SOURCES.wallux),
        sourceItem("Hanami on the Mac App Store", COMPARISON_SOURCES.hanami),
        sourceItem(
          "4K Live Wallpaper on the Mac App Store",
          COMPARISON_SOURCES.fourKLive
        ),
        sourceItem("Paper on the Mac App Store", COMPARISON_SOURCES.paper),
        sourceItem(
          "Dynamic Wallpaper Studio on the Mac App Store",
          COMPARISON_SOURCES.dynamicWallpaperStudio
        ),
        sourceItem(
          "Wallnetic on the Mac App Store",
          COMPARISON_SOURCES.wallnetic
        ),
        sourceItem(
          "Plash on the Mac App Store",
          COMPARISON_SOURCES.plashAppStore
        ),
        sourceItem(
          "24 Hour Wallpaper on the Mac App Store",
          COMPARISON_SOURCES.twentyFourHour
        ),
        sourceItem(
          "Wallpaper Engine on Steam",
          COMPARISON_SOURCES.wallpaperEngineSteam
        ),
        sourceItem("Lively Wallpaper on GitHub", COMPARISON_SOURCES.lively),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "What is the best live wallpaper app for Mac?",
      answer:
        "It depends on what you need. MacWall, Wallspace Pro and Wallper suit people who want a curated catalog and a one-time price. Wallspace, Wallnetic and Backdrop's free tier let you use an app free for as long as you like. Hanami, 4K Live Wallpaper, Paper and Dynamic Wallpaper Studio run on older macOS versions.",
    },
    {
      question: "Is there a free live wallpaper app for Mac?",
      answer:
        "Yes. Wallspace is free to download and use, Wallnetic is free on the Mac App Store with no in-app purchases listed, and Backdrop has a free tier with 3 watermarked wallpapers. Plash shows a website as your wallpaper for free. MacWall is free to try for 24 hours, then needs a one-time Pro license.",
    },
    {
      question: "Which live wallpaper apps work on older versions of macOS?",
      answer:
        "Paper and Dynamic Wallpaper Studio list macOS 12, Hanami, 4K Live Wallpaper and Wallnetic list macOS 13, and Wallper lists macOS 14.6. MacWall, Backdrop, Wallspace and Wallux need macOS 15. Check Apple menu > About This Mac for your version.",
    },
    {
      question: "Do live wallpapers slow down a Mac?",
      answer:
        "A native app that decodes video in hardware uses far less CPU than software decoding, and most of these apps pause behind full-screen windows. The cost still depends on the video's resolution and frame rate and on how many displays play it, so check Activity Monitor on your own Mac.",
    },
    {
      question: "Does Wallpaper Engine work on Mac?",
      answer:
        "No. Its Steam page lists Windows 10 and Windows 11 only. On a Mac you need a native app such as one of those compared on this page.",
    },
  ],
}

export const wallpaperEngineAlternativePage: SeoContentPage = {
  slug: "wallpaper-engine",
  pathname: "/alternatives/wallpaper-engine",
  title: "Wallpaper Engine for Mac: Does It Work in 2026?",
  headline: "Wallpaper Engine for Mac: What Actually Works",
  description:
    "Wallpaper Engine is Windows only, per its Steam page. Here is what runs on a Mac instead, with prices and macOS versions from dated sources.",
  keywords: [
    "wallpaper engine mac",
    "wallpaper engine for mac",
    "is wallpaper engine on mac",
    "wallpaper engine macbook",
    "wallpaper engine mac alternative",
    "apps like wallpaper engine for mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Wallpaper Engine does not run on macOS.** Its [Steam page](${COMPARISON_SOURCES.wallpaperEngineSteam}) lists Windows 10 and Windows 11 as the only operating systems, and the [official site](${COMPARISON_SOURCES.wallpaperEngineSite}) lists Windows plus an Android companion app, with no Mac version. On a Mac you need a native app instead. MacWall is one; this page compares the two and points to other Mac options. MacWall is not affiliated with Wallpaper Engine.`,
    },
    {
      type: "table",
      columns: ["", "Wallpaper Engine", "MacWall"],
      rows: [
        ["Developer", "Wallpaper Engine Team", "MacWall"],
        ["Price model", "$4.99 one-time on Steam (US)", MACWALL_PRICE_SUMMARY],
        [
          "Platforms",
          "Windows 10 and 11; Android companion app",
          MACWALL_PLATFORMS,
        ],
        ["Runs on a Mac", "No", "Yes"],
        [
          "Mac Lock Screen",
          "No Mac version",
          `Video, on ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Wallpaper Engine facts from Steam and wallpaperengine.io, accessed ${COMPARISONS_ACCESSED_LABEL}.`,
    },
    { type: "h2", text: "What to use on a Mac instead" },
    {
      type: "p",
      text: `If you mostly used Wallpaper Engine for video loops, a native Mac app gives you the same look plus Mac features such as the Lock Screen. [MacWall](/download) has ${macwallCatalog.liveCountLabel} curated live wallpapers (most in 4K), plays your own MP4 and MOV files with Pro, and puts motion on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}. Other native options, each with its own sourced price:`,
    },
    {
      type: "ul",
      items: [
        "[Backdrop](/alternatives/macwall-vs-backdrop): free tier with 3 watermarked wallpapers, or $1.99/month, $14.99/year or $29.99 lifetime. Needs macOS 15.",
        "[Wallspace](/alternatives/macwall-vs-wallspace): free, with Pro at $12.99 one-time. Needs macOS 15.",
        "Wallper: one-time license from $14.99 with a 7-day trial. Needs macOS 14.6.",
        "Hanami and 4K Live Wallpaper on the Mac App Store: free with in-app purchases, and both list macOS 13.",
        "[Plash](/alternatives/plash): free, and shows a website as your wallpaper rather than a video.",
      ],
    },
    {
      type: "p",
      text: "The full list, with prices and requirements for each app, is on [live wallpaper apps for Mac, compared](/best-live-wallpaper-mac) and the [comparison index](/compare).",
    },
    { type: "h2", text: "Where Wallpaper Engine is the better fit" },
    {
      type: "p",
      text: `If you also use a Windows PC, Wallpaper Engine is cheaper: $4.99 on Steam against ${MACWALL_PRO_USD} for MacWall, and it has an Android companion app. It just will not help on the Mac itself, and Steam lists no macOS build.`,
    },
    { type: "h2", text: "Moving your own clips over" },
    {
      type: "ol",
      items: [
        "Copy the MP4 or MOV loops you made yourself or have the rights to use. Only move files you own; wallpapers downloaded from other people stay under their terms.",
        "[Download MacWall](/download) and start the 24-hour trial to test the catalog on your displays.",
        "With Pro, import your clips into the Library and assign a different one to each display if you like. The [import guide](/docs/import-your-own-videos) covers formats and encoding.",
      ],
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem(
          "Wallpaper Engine on Steam",
          COMPARISON_SOURCES.wallpaperEngineSteam
        ),
        sourceItem(
          "Wallpaper Engine official site",
          COMPARISON_SOURCES.wallpaperEngineSite
        ),
        sourceItem("Backdrop by Cindori", COMPARISON_SOURCES.backdrop),
        sourceItem("Wallspace", COMPARISON_SOURCES.wallspace),
        sourceItem("Wallper", COMPARISON_SOURCES.wallper),
        sourceItem("Hanami on the Mac App Store", COMPARISON_SOURCES.hanami),
        sourceItem(
          "4K Live Wallpaper on the Mac App Store",
          COMPARISON_SOURCES.fourKLive
        ),
        sourceItem(
          "Plash on the Mac App Store",
          COMPARISON_SOURCES.plashAppStore
        ),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Does Wallpaper Engine work on Mac?",
      answer:
        "No. Wallpaper Engine's Steam page lists Windows 10 and Windows 11 only, and its official site mentions Windows and an Android companion app, not macOS. Use a native Mac app instead, such as MacWall, Backdrop or Wallspace.",
    },
    {
      question: "Is there a Wallpaper Engine for MacBook?",
      answer:
        "No. There is no macOS version for any Mac, MacBook included. Native apps such as MacWall play video wallpapers on MacBook Air and MacBook Pro running macOS 15 or later.",
    },
    {
      question: "Can I use my Wallpaper Engine wallpapers on Mac?",
      answer:
        "MacWall cannot open Wallpaper Engine projects. It plays its own catalog and video files you have the rights to use, so if you made a video wallpaper yourself and still have the MP4 or MOV file, you can import it with Pro.",
    },
    {
      question: "How much does Wallpaper Engine cost compared with MacWall?",
      answer: `Wallpaper Engine is $4.99 one-time on Steam in the US, for Windows. MacWall Pro is ${MACWALL_PRO_USD} one-time for up to ${MACWALL_PRO_MACS} Macs, after a free 24-hour trial.`,
    },
    {
      question: "Is MacWall made by the Wallpaper Engine team?",
      answer:
        "No. MacWall is an independent Mac app and is not affiliated with Wallpaper Engine or Steam.",
    },
  ],
}

export const macwallVsBackdropPage: SeoContentPage = {
  slug: "macwall-vs-backdrop",
  pathname: "/alternatives/macwall-vs-backdrop",
  title: "MacWall vs Backdrop for Mac: Price and Features",
  headline: "MacWall vs Backdrop",
  description:
    "MacWall vs Backdrop by Cindori: prices, free tier, Lock Screen, library and requirements compared with dated sources, and when Backdrop fits better.",
  keywords: [
    "backdrop mac",
    "backdrop app mac",
    "macwall vs backdrop",
    "backdrop alternative mac",
    "backdrop cindori alternative",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Backdrop and MacWall are both native Mac apps that play video as your wallpaper, including on the Lock Screen, and both need macOS 15.** Backdrop, by Cindori, has a free tier with no time limit and sells $1.99 monthly, $14.99 yearly and $29.99 lifetime plans, per [its page](${COMPARISON_SOURCES.backdrop}). MacWall has a 24-hour trial and one price: ${MACWALL_PRO_USD} once for ${MACWALL_PRO_MACS} Macs.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Backdrop"],
      rows: [
        ["Developer", "MacWall", "Cindori AB"],
        [
          "Price model",
          `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD}); ${MACWALL_PRO_PLUS_MACS} Macs ${MACWALL_PRO_PLUS_USD}`,
          "$1.99/month, $14.99/year or $29.99 lifetime",
        ],
        [
          "Free use",
          "24 hours of the full catalog, no card",
          "Free tier with no time limit, 3 watermarked wallpapers",
        ],
        [
          "Platforms",
          MACWALL_PLATFORMS,
          "macOS 15+; its page also says it supports macOS 27",
        ],
        [
          "Lock Screen",
          `Video, ${macwallLockScreenMacOSVersion} or later, plus Screen Saver`,
          "Video",
        ],
        [
          "Library",
          `${macwallCatalog.liveCountLabel} curated loops, most in 4K`,
          "“Thousands of community-created live wallpapers”",
        ],
        [
          "Your own videos",
          "Import MP4 and MOV with Pro",
          "Custom video import (Creator)",
        ],
        [
          "Multiple displays",
          "Different loop per display, or the same on all",
          "Mirror one wallpaper or use a different one per screen",
        ],
        [
          "Rotation",
          "Shuffle and a time-of-day Day Schedule",
          "Playlists with scheduling and shuffle",
        ],
        ["Full-screen apps", "Pauses behind them", "Pauses behind them"],
      ],
      caption: `Backdrop facts from cindori.com/backdrop, accessed ${COMPARISONS_ACCESSED_LABEL}, in USD; Backdrop's store shows local prices by region.`,
    },
    { type: "h2", text: "Pick Backdrop if" },
    {
      type: "ul",
      items: [
        "You want to use an app free for weeks before paying, and 3 watermarked wallpapers are enough for that.",
        "You prefer a monthly or yearly plan to paying upfront.",
        "You want to search by style, color, mood, resolution or creator; Backdrop lists all of these filters.",
        "You want playlists with scheduling.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        `You want a one-time price below Backdrop's $29.99 lifetime plan: ${MACWALL_PRO_USD} for up to ${MACWALL_PRO_MACS} Macs, or ${MACWALL_PRO_INDIA_USD} in India.`,
        "You like the categories in the [catalog](/wallpapers): anime, cars, nature, space, dark and more.",
        "You want Bend on an Apple silicon MacBook, Music Sync gradients, or a live Screen Saver as well as the Lock Screen.",
      ],
    },
    { type: "h2", text: "Performance" },
    {
      type: "p",
      text: "Backdrop's page says it uses under 0.3% CPU on a 10-core M1 Max. MacWall decodes video in hardware and pauses behind full-screen apps. Neither of us publishes an independent head-to-head test, so compare both in Activity Monitor on your own Mac; the [performance guide](/docs/performance-and-battery) shows how.",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [sourceItem("Backdrop by Cindori", COMPARISON_SOURCES.backdrop)],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is MacWall cheaper than Backdrop?",
      answer: `As a one-time purchase, yes: MacWall Pro is ${MACWALL_PRO_USD} for up to ${MACWALL_PRO_MACS} Macs, and Backdrop's lifetime license is $29.99. Backdrop also sells $1.99 monthly and $14.99 yearly plans, which cost less upfront.`,
    },
    {
      question: "Is Backdrop free?",
      answer:
        "Backdrop has a free tier with no time limit that is limited to 3 watermarked wallpapers. The full library needs a paid plan.",
    },
    {
      question: "Do both work on the Mac Lock Screen?",
      answer: `Yes. Both list Lock Screen video. MacWall's needs ${macwallLockScreenMacOSVersion} or later. Both rely on macOS wallpaper behavior that Apple can change in updates.`,
    },
    {
      question: "Can I use my own videos in both apps?",
      answer:
        "Yes. Backdrop lists custom video import through its Creator, and MacWall imports MP4 and MOV files with Pro.",
    },
    {
      question: "Which app uses less CPU?",
      answer:
        "Backdrop says it uses under 0.3% CPU on an M1 Max; that is the developer's own figure. MacWall publishes no head-to-head test either. Run each in Activity Monitor with your own displays and videos.",
    },
  ],
}

export const macwallVsWallspacePage: SeoContentPage = {
  slug: "macwall-vs-wallspace",
  pathname: "/alternatives/macwall-vs-wallspace",
  title: "MacWall vs Wallspace: Price, Trial and Features",
  headline: "MacWall vs Wallspace",
  description:
    "MacWall vs Wallspace: free tier, one-time Pro price, Lock Screen, library and requirements compared with dated sources, and when Wallspace fits better.",
  keywords: [
    "wallspace",
    "wallspace app",
    "wallspace alternative mac",
    "macwall vs wallspace",
    "apps like wallspace mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Wallspace and MacWall are both native Mac apps for video wallpapers that need macOS 15, with Lock Screen video on macOS 26.** Wallspace is free to download and use, and Wallspace Pro is $12.99 one-time, per [wallspace.app](${COMPARISON_SOURCES.wallspace}). MacWall Pro is also ${MACWALL_PRO_USD} one-time and covers ${MACWALL_PRO_MACS} Macs, but MacWall starts with a 24-hour trial instead of a free tier.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Wallspace"],
      rows: [
        ["Developer", "MacWall", "Tangent Labs LLP"],
        [
          "Price model",
          `${MACWALL_PRO_USD} one-time for ${MACWALL_PRO_MACS} Macs (India ${MACWALL_PRO_INDIA_USD}); ${MACWALL_PRO_PLUS_MACS} Macs ${MACWALL_PRO_PLUS_USD}`,
          "Free; Pro $12.99 one-time",
        ],
        [
          "Free use",
          "24-hour trial, then browse-only",
          "Free to download and use",
        ],
        ["Platforms", MACWALL_PLATFORMS, "macOS 15+"],
        [
          "Lock Screen",
          `${macwallLockScreenMacOSVersion} or later, plus Screen Saver`,
          "macOS 26+, with Pro",
        ],
        [
          "Library",
          `${macwallCatalog.liveCountLabel} curated loops, most in 4K`,
          "1,000+ wallpapers",
        ],
        ["Your own videos", "MP4, MOV and M4V with Pro", "Your own MP4 files"],
        [
          "Multiple displays",
          "Different loop per display, or the same on all",
          "Different per display, or mirrored",
        ],
        ["Install", "DMG from macwall.app", "Direct download or Homebrew"],
        [
          "Account",
          "None; the trial asks for an email",
          "No login; also says no ads or tracking",
        ],
      ],
      caption: `Wallspace facts from wallspace.app, accessed ${COMPARISONS_ACCESSED_LABEL}.`,
    },
    { type: "h2", text: "Pick Wallspace if" },
    {
      type: "ul",
      items: [
        "You want to keep using a free version indefinitely.",
        "You install apps with Homebrew.",
        "You want AI search across the library, which Wallspace lists.",
      ],
    },
    { type: "h2", text: "Pick MacWall if" },
    {
      type: "ul",
      items: [
        `You want one license for ${MACWALL_PRO_MACS} Macs, or you buy from India at ${MACWALL_PRO_INDIA_USD}.`,
        "You want Bend, Music Sync, or a live Screen Saver as well as the Lock Screen.",
        "You want rotation by time of day with Day Schedule.",
        "You like what is in the [MacWall catalog](/wallpapers).",
      ],
    },
    { type: "h2", text: "Performance" },
    {
      type: "p",
      text: "Wallspace says it uses under 2% CPU. Both apps decode video in hardware, and neither of us publishes an independent head-to-head test. Compare them in Activity Monitor on your own Mac; the [performance guide](/docs/performance-and-battery) shows how.",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [sourceItem("Wallspace", COMPARISON_SOURCES.wallspace)],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is Wallspace free?",
      answer:
        "Wallspace is free to download and use. Wallspace Pro, at $12.99 one-time, adds unlimited downloads, 4K, the Lock Screen and community features, per its site.",
    },
    {
      question: "Which is cheaper, MacWall or Wallspace?",
      answer: `Both Pro licenses are $12.99 one-time in the US. MacWall's covers up to ${MACWALL_PRO_MACS} Macs and costs ${MACWALL_PRO_INDIA_USD} in India. Wallspace has a free version; MacWall has a 24-hour trial.`,
    },
    {
      question: "Does MacWall require an account?",
      answer: `No. MacWall has no accounts. The free trial asks for an email address but no card, and a Pro license is a key that activates on up to ${MACWALL_PRO_MACS} Macs.`,
    },
    {
      question: "Do both work on the Lock Screen?",
      answer:
        "Yes, on macOS 26 or later. Wallspace includes it with Pro; MacWall includes it in the trial and with Pro, and adds a live Screen Saver.",
    },
    {
      question: "Is MacWall lighter than Wallspace?",
      answer:
        "Both use hardware video decoding. Wallspace says it uses under 2% CPU, and neither of us publishes an independent head-to-head test. Compare them in Activity Monitor on your own Mac.",
    },
  ],
}

export const livelyWallpaperMacPage: SeoContentPage = {
  slug: "lively-wallpaper-mac",
  pathname: "/alternatives/lively-wallpaper-mac",
  title: "Lively Wallpaper for Mac: Is There a Mac Version?",
  headline: "Lively Wallpaper for Mac",
  description:
    "Lively Wallpaper is Windows only, per its GitHub README. Here is what runs on a Mac instead, free and paid, with prices from dated sources.",
  keywords: [
    "lively wallpaper mac",
    "lively wallpaper for macos",
    "lively wallpaper mac download",
    "lively wallpaper alternative mac",
    "free live wallpaper app mac",
    "rocksdanister lively mac",
  ],
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Lively Wallpaper does not run on macOS.** Its [GitHub README](${COMPARISON_SOURCES.lively}) describes a native Windows app, offered through the Microsoft Store (Windows 10 version 1809 or newer) and an installer (Windows 10 version 1903 or newer), and does not mention a Mac version. On a Mac you need a native app instead: MacWall is one, and free options are listed below.`,
    },
    {
      type: "table",
      columns: ["", "Lively Wallpaper", "MacWall"],
      rows: [
        ["Developer", "rocksdanister (GitHub repository)", "MacWall"],
        ["Price model", "Free, open source (GPL-3.0)", MACWALL_PRICE_SUMMARY],
        ["Platforms", "Windows 10 and later", MACWALL_PLATFORMS],
        ["Runs on a Mac", "No", "Yes"],
        [
          "Mac Lock Screen",
          "No Mac version",
          `Video, on ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Lively facts from its GitHub README, accessed ${COMPARISONS_ACCESSED_LABEL}.`,
    },
    { type: "h2", text: "Free options on a Mac" },
    {
      type: "p",
      text: "Lively is free, so start with the free Mac apps if price matters most:",
    },
    {
      type: "ul",
      items: [
        "[Wallspace](/alternatives/macwall-vs-wallspace) is free to download and use, with Pro at $12.99 one-time. Needs macOS 15.",
        "[Backdrop](/alternatives/macwall-vs-backdrop) has a free tier with no time limit and 3 watermarked wallpapers. Needs macOS 15.",
        "Wallnetic is free on the Mac App Store with no in-app purchases listed. Needs macOS 13.",
        "[Plash](/alternatives/plash) is free and shows a website as your wallpaper instead of a video.",
      ],
    },
    { type: "h2", text: "Why MacWall instead of Lively on Mac" },
    {
      type: "ul",
      items: [
        "Native Swift app, built only for macOS",
        "Import the same video files you used in Lively (MP4, MOV and M4V, with Pro)",
        "Curated 4K catalog across Anime, Nature, Cars, Gaming, and more",
        "Pauses behind full-screen apps, with optional Low Power Mode and busy-CPU pauses",
        `Live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}`,
        `One-time Pro license, ${MACWALL_PRO_USD} for ${MACWALL_PRO_MACS} Macs, with lifetime updates`,
      ],
    },
    {
      type: "p",
      text: "Lively is the better fit if you are on Windows, or if you want a free, open-source app. MacWall is neither free nor open source.",
    },
    { type: "h2", text: "Switching from Lively" },
    {
      type: "ol",
      items: [
        "Copy the video wallpapers you made or have the rights to use from your Windows PC.",
        "[Download MacWall](/download) and start the free 24-hour trial.",
        "With Pro, import the videos into your MacWall Library.",
        "Browse the catalog for 4K loops made for Mac displays.",
      ],
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem("Lively Wallpaper on GitHub", COMPARISON_SOURCES.lively),
        sourceItem("Wallspace", COMPARISON_SOURCES.wallspace),
        sourceItem("Backdrop by Cindori", COMPARISON_SOURCES.backdrop),
        sourceItem(
          "Wallnetic on the Mac App Store",
          COMPARISON_SOURCES.wallnetic
        ),
        sourceItem(
          "Plash on the Mac App Store",
          COMPARISON_SOURCES.plashAppStore
        ),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is there a Lively Wallpaper version for Mac?",
      answer:
        "No. Lively Wallpaper's GitHub README describes a Windows app and does not mention macOS. On a Mac, use a native app such as MacWall, Wallspace or Backdrop.",
    },
    {
      question: "Is there a free alternative to Lively on Mac?",
      answer:
        "Yes. Wallspace is free to use, Backdrop has a free tier with 3 watermarked wallpapers, and Wallnetic is free on the Mac App Store. Plash is free and shows a website as your wallpaper.",
    },
    {
      question: "Can I use my Lively wallpapers in MacWall?",
      answer:
        "Video files you made or have the rights to use, yes: MacWall imports MP4, MOV and M4V with Pro. MacWall only plays video files, so anything that is not a video file does not carry over.",
    },
    {
      question: "How much does MacWall cost?",
      answer: `MacWall is free to try for 24 hours. Pro is a one-time ${MACWALL_PRO_USD} for up to ${MACWALL_PRO_MACS} Macs (${MACWALL_PRO_INDIA_USD} in India), and Pro+ covers ${MACWALL_PRO_PLUS_MACS} Macs for ${MACWALL_PRO_PLUS_USD}. There is no subscription.`,
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
    title: `${categoryName} Live Wallpapers for Mac`,
    headline: `${categoryName} Live Wallpapers for Mac`,
    description: `Browse ${lower} live wallpapers for Mac in 4K. Preview every loop free, then set it on your desktop and Lock Screen with MacWall, a one-time purchase.`,
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
