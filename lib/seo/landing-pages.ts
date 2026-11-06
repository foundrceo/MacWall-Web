import {
  macwall,
  macwallCatalog,
  macwallImportFormatsLabel,
  macwallImportFormatsOrLabel,
  macwallLockScreenMacOSVersion,
  macwallSocialProof,
  macwallMinimumMacOSRequirementOrLater,
} from "@/lib/macwall-site"
import {
  categoryHubIntro,
  categoryHubSections,
  categorySeoFor,
} from "@/lib/seo/category-seo"
import {
  COMPARISONS_CHECKED_ISO,
  COMPARISONS_RECHECKED_ISO,
  COMPARISON_SOURCES,
  MACWALL_FACTS_NOTE,
  MACWALL_PLATFORMS,
  accessedLabel,
  comparisonTitleYear,
  salePricedPage,
  sourceItem,
} from "@/lib/seo/comparison-facts"
import { LICENSE_OFFERS } from "@/lib/license/offers.shared"
import type { SeoContentPage } from "@/lib/content/types"

const S = COMPARISON_SOURCES
const CHECKED = accessedLabel(COMPARISONS_CHECKED_ISO)
const RECHECKED = accessedLabel(COMPARISONS_RECHECKED_ISO)

/** Macs one Pro license covers; fixed per pack, so FAQs can name it. */
const PRO_MACS = LICENSE_OFFERS.permanent.maxDevices
/** Regular US Pro price in cents, for FAQ comparisons that name no price. */
const PRO_REGULAR_CENTS = LICENSE_OFFERS.permanent.usdCents

export const downloadPage: SeoContentPage = {
  slug: "download",
  pathname: "/download",
  title: "Download MacWall for Mac, Free 24-Hour Trial",
  headline: "Download MacWall for Mac",
  description: `Live wallpapers for macOS 15 or later. Free 24-hour trial with no card, then a one-time Pro license; see pricing for your region. ${macwallSocialProof.downloadsLine}.`,
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
    { type: "h2", text: "Getting started" },
    {
      type: "ul",
      items: [
        "[Install MacWall](/docs/install-macwall): the install steps, your first wallpaper and updates.",
        "[Set a live wallpaper](/docs/set-a-live-wallpaper): from the app or the web gallery, on one display or several.",
        "[Troubleshooting](/docs/troubleshooting): what to try when a wallpaper doesn't appear, freezes on one frame, or the Lock Screen doesn't move.",
        "[License and activation](/docs/license-and-activation): enter your key, and move it to another Mac.",
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
        "Music Sync visuals from the album cover in Apple Music and Spotify, and Bend on Apple silicon MacBooks",
        `With Pro: import your own ${macwallImportFormatsLabel} clips`,
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
      answer: `The download and the 24-hour trial are free. Pro is a one-time license for up to ${macwall.maxLicensedMacs} Macs, with free updates and no subscription, and Pro+ covers 5 or 10 Macs. Prices depend on your region and any running sale, and the pricing page shows today's price for yours. Every license has a ${macwall.refundWindowDays}-day money-back guarantee.`,
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

export const bestLiveWallpaperMacPage = salePricedPage((price) => {
  const rows: string[][] = [
    [
      "**MacWall**",
      price.summary,
      MACWALL_PLATFORMS,
      "Live Lock Screen and Screen Saver, macOS 26+",
    ],
    [
      `[Backdrop](${S.backdrop})`,
      "Free tier (3 watermarked wallpapers, no time limit); $1.99/month, $14.99/year or $29.99 lifetime",
      "macOS 15+",
      "Lock Screen video",
    ],
    [
      `[Wallspace](${S.wallspace})`,
      "Free; Pro $12.99 one-time",
      "macOS 15+",
      "Lock Screen with Pro, macOS 26+",
    ],
    [
      `[Wallper](${S.wallper})`,
      "One-time license from $14.99; 7-day free trial",
      "macOS 14.6+ (Intel and Apple silicon)",
      "Lock Screen support; macOS version not stated",
    ],
    [
      `[iWallpaper](${S.iwallpaper})`,
      "Free; Remove watermark $6.99 (in-app purchase)",
      "macOS 10.15+",
      "Not stated",
    ],
    [
      `[Wallux](${S.wallux})`,
      "Has a free plan",
      "macOS 15+",
      "Video Lock Screen, macOS 26+",
    ],
    [
      `[Hanami](${S.hanami})`,
      "Free with in-app purchases: Pro from $0.99/week to $7.99/year; lifetime upgrade $3.99 or $4.99",
      "macOS 13+",
      "Can run as the screen saver",
    ],
    [
      `[4K Live Wallpaper](${S.fourKLive})`,
      "Free with in-app purchases: $1.99/month, $8.99 for 6 months, $12.99/year, $29.99 lifetime",
      "macOS 13+",
      "Live lock screen screensaver",
    ],
    [
      `[Live Wallpaper Engine HD](${S.liveWallpaperEngineHd})`,
      "Free with in-app purchases from $3.99 to $5.99",
      "macOS 10.13+",
      "Screensaver mode",
    ],
    [`[Paper](${S.paper})`, "$7.99 upfront", "macOS 12+", "Not stated"],
    [
      `[Dynamic Wallpaper Studio](${S.dynamicWallpaperStudio})`,
      "Free with in-app purchases: $2.99/week or $29.99/year",
      "macOS 12+",
      "Not stated",
    ],
    [
      `[Wallnetic](${S.wallnetic})`,
      "Free; no in-app purchases listed",
      "macOS 13+",
      "Not stated",
    ],
    [
      `[WallpaperMachine](${S.wallpaperMachine})`,
      "Free, open source (GPL-3.0); Workshop downloads need Wallpaper Engine on Steam",
      "macOS 15+, Apple silicon only",
      "Experimental lock screen and screen saver",
    ],
  ]

  return {
    slug: "best-live-wallpaper-mac",
    pathname: "/best-live-wallpaper-mac",
    title: `Best Live Wallpaper Apps for Mac (${comparisonTitleYear(COMPARISONS_RECHECKED_ISO)}), Compared`,
    headline: "Best live wallpaper apps for Mac",
    description:
      "MacWall, Backdrop, Wallspace, iWallpaper, Hanami and eight more Mac live wallpaper apps compared on price, macOS version and Lock Screen, with sources.",
    keywords: [
      "best live wallpaper app for mac",
      "best live wallpaper mac",
      "live wallpaper app mac",
      "best animated wallpaper mac",
      "best live wallpaper app mac",
    ],
    publishedAt: "2026-07-13",
    updatedAt: COMPARISONS_RECHECKED_ISO,
    sections: [
      {
        type: "p",
        text: `**There is no single best live wallpaper app for Mac; the right one depends on your macOS version, your budget and what you want on screen.** The ${rows.length} apps below all play moving wallpapers behind your windows, several can also animate the Lock Screen, and prices run from free to $29.99 for a lifetime license. The MacWall team wrote this page, so every competitor price links to the developer's page, GitHub or the Mac App Store, with the date we read it, and we say where another app is the better fit. Want static photo apps too? See [the best wallpaper apps for Mac](/compare).`,
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
        rows,
        caption: `US prices as listed on each developer's site, GitHub or the US Mac App Store: iWallpaper, Live Wallpaper Engine HD and WallpaperMachine read on ${RECHECKED}, the rest on ${CHECKED}. Some sites show local prices by region. "Not stated" means the source page does not say.`,
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
          "**iWallpaper**: wallpapers shared by its users, with new ones every day per its listing; no total stated.",
        ],
      },
      { type: "h2", text: "Which one fits you" },
      {
        type: "ul",
        items: [
          `**You want a ready-made catalog and to pay once**: MacWall (${price.proText} for ${price.proMacs} Macs), Wallspace Pro ($12.99), Wallper (from $14.99) or Paper ($7.99 upfront). Wallper's 7-day trial is longer than MacWall's 24 hours.`,
          "**You want the smallest one-time cost**: iWallpaper is free, and its one in-app purchase, $6.99, removes the watermark.",
          "**You want to use it free for as long as you like**: Wallspace and Wallnetic are free to use, WallpaperMachine is free and open source, and Backdrop's free tier has no time limit but caps you at 3 watermarked wallpapers. MacWall's trial lasts 24 hours.",
          "**You prefer to pay by the month or week**: Backdrop ($1.99/month), 4K Live Wallpaper ($1.99/month), Hanami (from $0.99/week) and Dynamic Wallpaper Studio ($2.99/week). MacWall has no monthly plan.",
          "**You are on macOS 14 or older**: Live Wallpaper Engine HD lists macOS 10.13, iWallpaper macOS 10.15, Paper and Dynamic Wallpaper Studio macOS 12, Hanami, 4K Live Wallpaper and Wallnetic macOS 13, and Wallper macOS 14.6. MacWall, Backdrop, Wallspace, Wallux and WallpaperMachine need macOS 15.",
          "**You already own Wallpaper Engine**: WallpaperMachine plays many of its wallpapers on Apple silicon Macs. See [Wallpaper Engine for Mac](/alternatives/wallpaper-engine) for every option.",
          "**You want clocks and weather on the desktop**: Live Wallpaper Engine HD lists clock and weather widgets and a screensaver mode.",
          "**You want a website, not a video, as your wallpaper**: [Plash](/alternatives/plash) is free; its App Store version needs macOS 26.4.",
          "**You want a wallpaper that follows the time of day**: [24 Hour Wallpaper](/alternatives/24-hour-wallpaper), [Dynamic Wallpaper Club](/alternatives/dynamic-wallpaper-club), or Apple's built-in dynamic wallpapers.",
          "**You want desktop pets or interactive effects**: Wallux lists both.",
          "**You are coming from Windows**: [Wallpaper Engine](/alternatives/wallpaper-engine) and [Lively Wallpaper](/alternatives/lively-wallpaper-mac) are Windows-only, so you need one of the Mac apps above.",
        ],
      },
      { type: "h2", text: "What MacWall does differently" },
      {
        type: "ul",
        items: [
          `**Price**: ${price.proText} once covers ${price.proMacs} personal Macs, and buyers in India pay ${price.india}. No subscription.`,
          "**Bend**: on Apple silicon MacBooks the desktop folds and dims with the lid angle as you close it.",
          "**Music Sync**: visuals from the album cover in Apple Music and Spotify.",
          "**Per-display wallpapers**: a different loop on each screen, or the same loop on all of them.",
          `**Live Lock Screen and Screen Saver** on ${macwallLockScreenMacOSVersion} and later; see [live video screen savers](/screen-saver-mac).`,
          "**Rotation**: Shuffle every 15 minutes to once a day, and a Day Schedule that picks a wallpaper by time of day.",
        ],
      },
      { type: "h2", text: "Where MacWall is weaker" },
      {
        type: "ul",
        items: [
          "The free trial lasts 24 hours, and after it the app is browse-only until you buy.",
          "It needs macOS 15 Sequoia or later, while several apps above run on macOS 10.13 to 14.",
          "Importing your own videos is a paid feature, not part of the trial.",
          "Its library is smaller than the figures Hanami, Dynamic Wallpaper Studio, Paper, Backdrop and Wallper publish.",
          "It has no clock, weather or interactive widgets, which Live Wallpaper Engine HD and Wallux list.",
          "It can't play Wallpaper Engine scenes; WallpaperMachine can.",
        ],
      },
      {
        type: "p",
        text: "Whichever app you try, open Activity Monitor next to it. Some developers publish their own CPU figures (Backdrop says under 0.3% on an M1 Max, Wallux says 0.2%, Wallspace says under 2%), but none of these, ours included, is an independent test. Browse the [MacWall catalog](/wallpapers) before you download.",
      },
      { type: "h2", text: "Head-to-head comparisons" },
      {
        type: "ul",
        items: [
          "[MacWall vs Backdrop](/alternatives/macwall-vs-backdrop): free tier, subscriptions and lifetime price.",
          "[MacWall vs Wallspace](/alternatives/macwall-vs-wallspace): free version against a 24-hour trial.",
          "[iWallpaper vs MacWall](/alternatives/iwallpaper): watermark, macOS versions and the Lock Screen.",
          "[Wallpaper Engine for Mac](/alternatives/wallpaper-engine): WallpaperMachine, a Windows VM and native apps.",
          "[Lively Wallpaper for Mac](/alternatives/lively-wallpaper-mac): free options after a Windows app.",
          "[Plash vs MacWall](/alternatives/plash): a website or a video as the wallpaper.",
          "[24 Hour Wallpaper vs MacWall](/alternatives/24-hour-wallpaper) and [Dynamic Wallpaper Club vs MacWall](/alternatives/dynamic-wallpaper-club): time-of-day wallpapers.",
          "[Best wallpaper apps for Mac](/compare): every app in one table, static photo apps included.",
        ],
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          sourceItem("Backdrop by Cindori", S.backdrop),
          sourceItem("Wallspace", S.wallspace),
          sourceItem("Wallper", S.wallper),
          sourceItem(
            "iWallpaper on the Mac App Store",
            S.iwallpaper,
            COMPARISONS_RECHECKED_ISO
          ),
          sourceItem("Wallux", S.wallux),
          sourceItem("Hanami on the Mac App Store", S.hanami),
          sourceItem("4K Live Wallpaper on the Mac App Store", S.fourKLive),
          sourceItem(
            "Live Wallpaper Engine HD on the Mac App Store",
            S.liveWallpaperEngineHd,
            COMPARISONS_RECHECKED_ISO
          ),
          sourceItem("Paper on the Mac App Store", S.paper),
          sourceItem(
            "Dynamic Wallpaper Studio on the Mac App Store",
            S.dynamicWallpaperStudio
          ),
          sourceItem("Wallnetic on the Mac App Store", S.wallnetic),
          sourceItem(
            "WallpaperMachine on GitHub",
            S.wallpaperMachine,
            COMPARISONS_RECHECKED_ISO
          ),
          sourceItem("Plash on the Mac App Store", S.plashAppStore),
          sourceItem(
            "24 Hour Wallpaper on the Mac App Store",
            S.twentyFourHour
          ),
          sourceItem(
            "Wallpaper Engine on Steam",
            S.wallpaperEngineSteam,
            COMPARISONS_RECHECKED_ISO
          ),
          sourceItem("Lively Wallpaper on GitHub", S.lively),
        ],
      },
      { type: "p", text: MACWALL_FACTS_NOTE },
    ],
    faq: [
      {
        question: "What is the best live wallpaper app for Mac?",
        answer:
          "It depends on what you need. MacWall, Wallspace Pro and Wallper suit people who want a curated catalog and a one-time price. iWallpaper is the cheapest one-time unlock and runs on older macOS. Wallspace, Wallnetic and Backdrop's free tier let you use an app free for as long as you like, and WallpaperMachine plays Wallpaper Engine wallpapers you own.",
      },
      {
        question: "Is there a free live wallpaper app for Mac?",
        answer:
          "Yes. Wallspace is free to download and use, Wallnetic is free on the Mac App Store with no in-app purchases listed, WallpaperMachine is free and open source, Backdrop has a free tier with 3 watermarked wallpapers, and iWallpaper is free with a watermark until you buy its $6.99 upgrade. MacWall is free to try for 24 hours, then needs a one-time Pro license.",
      },
      {
        question: "Which live wallpaper apps work on older versions of macOS?",
        answer:
          "Live Wallpaper Engine HD lists macOS 10.13, iWallpaper macOS 10.15, Paper and Dynamic Wallpaper Studio macOS 12, Hanami, 4K Live Wallpaper and Wallnetic macOS 13, and Wallper macOS 14.6. MacWall, Backdrop, Wallspace, Wallux and WallpaperMachine need macOS 15. Check Apple menu > About This Mac for your version.",
      },
      {
        question: "Do live wallpapers slow down a Mac?",
        answer:
          "A native app that decodes video in hardware uses far less CPU than software decoding, and most of these apps pause behind full-screen windows. The cost still depends on the video's resolution and frame rate and on how many displays play it, so check Activity Monitor on your own Mac.",
      },
      {
        question: "Does Wallpaper Engine work on Mac?",
        answer:
          "No. Its Steam page lists Windows 10 and Windows 11 only. WallpaperMachine, a separate open-source app, plays many Wallpaper Engine wallpapers on Apple silicon Macs if your Steam account owns Wallpaper Engine; otherwise use a native Mac app such as those compared on this page.",
      },
    ],
  }
})

export const wallpaperEngineAlternativePage = salePricedPage((price) => ({
  slug: "wallpaper-engine",
  pathname: "/alternatives/wallpaper-engine",
  title: `Wallpaper Engine for Mac (${comparisonTitleYear(COMPARISONS_RECHECKED_ISO)}): Every Option`,
  headline:
    "Wallpaper Engine for Mac: every way to get it, and the best alternatives",
  description:
    "Wallpaper Engine has no Mac version. What its developers say, WallpaperMachine, a Windows VM and native Mac alternatives, with dated sources.",
  keywords: [
    "wallpaper engine mac",
    "wallpaper engine for mac",
    "does wallpaper engine work on mac",
    "can you use wallpaper engine on mac",
    "wallpaper engine macbook",
    "wallpaper engine mac alternative",
    "apps like wallpaper engine for mac",
  ],
  publishedAt: "2026-07-13",
  updatedAt: COMPARISONS_RECHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Wallpaper Engine has no Mac version.** Its [Steam page](${S.wallpaperEngineSteam}) lists Windows 10 and Windows 11 only, and its [help center](${S.wallpaperEngineHelpMac}) says it is "currently available for Windows and Android", with no immediate plans for other platforms. On a Mac you have three routes: WallpaperMachine, a free open-source app that plays Wallpaper Engine wallpapers; Windows in a virtual machine; or a native Mac live wallpaper app. MacWall is one of those apps and wrote this page, so every outside fact links to its source, read on the date shown. MacWall is not affiliated with Wallpaper Engine.`,
    },
    { type: "h2", text: "Can Wallpaper Engine be used on Mac?" },
    {
      type: "p",
      text: "Not natively. Wallpaper Engine runs only on Windows (the technical reasons are in [why Wallpaper Engine doesn't run on Mac](/learn/why-wallpaper-engine-doesnt-run-on-mac)), so each way to use it on a Mac works around that:",
    },
    {
      type: "table",
      columns: ["Route", "What you get", "What it needs"],
      rows: [
        [
          "WallpaperMachine (option 1)",
          "Many Wallpaper Engine scene, video and web wallpapers on your Mac desktop",
          "macOS 15+ on Apple silicon, and a Steam account that owns Wallpaper Engine for Workshop downloads",
        ],
        [
          "Windows in a virtual machine (option 2)",
          "Wallpaper Engine itself, on the Windows desktop inside the virtual machine",
          "A virtual machine app, a Windows license and Wallpaper Engine",
        ],
        [
          "A native Mac app (option 3)",
          "Video wallpapers made for macOS, often with the Lock Screen",
          "Nothing from Wallpaper Engine; your own clips carry over as video files",
        ],
      ],
    },
    { type: "h2", text: "Why can't I use Wallpaper Engine on Mac?" },
    {
      type: "p",
      text: `Because there is no macOS version to install. Steam's system requirements for Wallpaper Engine list Windows 10 or Windows 11 and DirectX 11 ([Steam](${S.wallpaperEngineSteam})). The developers explain why on their [help page about Linux and Mac OS](${S.wallpaperEngineHelpMac}): Wallpaper Engine is custom software that works closely with each operating system, so a port is a large job with ongoing costs, and with few Steam users on macOS they don't consider it economically viable for now. They say they keep watching Steam's platform statistics. Their mobile companion app is for Android, and the page says iOS doesn't support live wallpapers the way Android does.`,
    },
    { type: "h2", text: "Option 1: WallpaperMachine (free, open source)" },
    {
      type: "p",
      text: `[WallpaperMachine](${S.wallpaperMachine}) is an independent, open-source Mac app (GPL-3.0) from MMFoundation that plays Wallpaper Engine scene, video and web wallpapers on the desktop, with Steam Workshop browsing built in. Its README says it is not affiliated with Wallpaper Engine or Valve and that compatibility varies by wallpaper. It needs macOS 15 Sequoia or later on Apple silicon (M1 or later); Intel Macs aren't supported.`,
    },
    {
      type: "p",
      text: "**The ownership caveat**: you can browse the Workshop without signing in, but downloads need a Steam account that owns Wallpaper Engine ($4.99 on Steam in the US), and scene wallpapers use shared resources from a Wallpaper Engine you own. The README says Workshop wallpapers belong to their creators and the app bundles neither those wallpapers nor Wallpaper Engine's resources. Its lock screen and screen saver features are marked experimental. We haven't tested WallpaperMachine, so read its README for current details before you install it.",
    },
    { type: "h2", text: "Option 2: Windows in a virtual machine" },
    {
      type: "p",
      text: `Microsoft names Parallels Desktop versions 18, 19 and 20 as authorized for running the Arm versions of Windows 11 Pro and Enterprise on Apple M1, M2 and M3 Macs, and warns that Windows on Arm limits some games and apps, including those that rely on DirectX 12 ([Microsoft Support](${S.windowsOnAppleSilicon})). Wallpaper Engine would then decorate the Windows desktop inside the virtual machine's window, not the desktop behind your Mac apps, and Windows needs its own license. Wallpaper Engine doesn't list compatibility layers such as CrossOver as supported either. We haven't tested either route.`,
    },
    { type: "h2", text: "Option 3: a native Mac live wallpaper app" },
    {
      type: "p",
      text: `If you mostly used Wallpaper Engine for video loops, a native app gives you the same look plus Mac features such as the Lock Screen, without Wallpaper Engine. [MacWall](/download) has ${macwallCatalog.liveCountLabel} curated live wallpapers (most in 4K), plays your own ${macwallImportFormatsLabel} files with Pro, and puts motion on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later. The other native options, each with its own sourced price:`,
    },
    {
      type: "table",
      columns: ["App", "Price (US)", "Needs", "Notes"],
      rows: [
        [
          "**MacWall**",
          `${price.proText} one-time for ${price.proMacs} Macs; 24-hour free trial`,
          MACWALL_PLATFORMS,
          "Curated catalog; Lock Screen and screen saver on macOS 26+",
        ],
        [
          `[iWallpaper](/alternatives/iwallpaper)`,
          "Free; Remove watermark $6.99 (in-app purchase)",
          "macOS 10.15+",
          "Wallpapers shared by its users; settings per monitor",
        ],
        [
          `[Live Wallpaper Engine HD](${S.liveWallpaperEngineHd})`,
          "Free with in-app purchases from $3.99 to $5.99",
          "macOS 10.13+",
          "Scenes with clock and weather widgets, and a screensaver mode. Made by Voros Innovation, not the Wallpaper Engine Team",
        ],
        [
          `[Backdrop](/alternatives/macwall-vs-backdrop)`,
          "Free tier (3 watermarked wallpapers); $1.99/month, $14.99/year or $29.99 lifetime",
          "macOS 15+",
          "Community library; Lock Screen video",
        ],
        [
          `[Wallspace](/alternatives/macwall-vs-wallspace)`,
          "Free; Pro $12.99 one-time",
          "macOS 15+",
          "1,000+ wallpapers; Lock Screen with Pro on macOS 26+",
        ],
        [
          `[Wallper](${S.wallper})`,
          "One-time license from $14.99; 7-day free trial",
          "macOS 14.6+",
          "Lock Screen support",
        ],
        [
          `[Hanami](${S.hanami})`,
          "Free with in-app purchases",
          "macOS 13+",
          "6,000+ live wallpapers; can run as the screen saver",
        ],
        [
          `[Plash](/alternatives/plash)`,
          "Free",
          "macOS 26.4+ (App Store version)",
          "A website as your wallpaper, not a video",
        ],
      ],
      caption: `US prices from each developer's site or the US Mac App Store: iWallpaper and Live Wallpaper Engine HD read on ${RECHECKED}, the rest on ${CHECKED}.`,
    },
    {
      type: "p",
      text: "For more apps, with every price and macOS version, see [the best live wallpaper apps for Mac](/best-live-wallpaper-mac) and [the best wallpaper apps for Mac](/compare).",
    },
    { type: "h2", text: "What is the Mac equivalent of Wallpaper Engine?" },
    {
      type: "p",
      text: "No single Mac app does everything Wallpaper Engine does. The closest match depends on the job:",
    },
    {
      type: "ul",
      items: [
        "**Play the Wallpaper Engine wallpapers you already have**: WallpaperMachine.",
        "**A ready-made catalog of video wallpapers**: MacWall, Backdrop, Wallspace or iWallpaper.",
        "**Clocks and weather on the desktop**: Live Wallpaper Engine HD.",
        "**A web page as the wallpaper**: Plash.",
        "**Your own video clips**: MacWall (with Pro), Backdrop's Creator or Wallspace.",
      ],
    },
    { type: "h2", text: "Wallpaper Engine vs MacWall" },
    {
      type: "table",
      columns: ["", "Wallpaper Engine", "MacWall"],
      rows: [
        ["Developer", "Wallpaper Engine Team", "MacWall"],
        ["Price model", "$4.99 one-time on Steam (US)", price.summary],
        [
          "Platforms",
          "Windows 10 and 11; Android companion app",
          MACWALL_PLATFORMS,
        ],
        ["Runs on a Mac", "No", "Yes"],
        [
          "Wallpaper types",
          "3D and 2D animations, websites, videos and some applications",
          "Video",
        ],
        [
          "Mac Lock Screen",
          "No Mac version",
          `Video, on ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Wallpaper Engine facts from Steam and its help center, accessed ${RECHECKED}, and wallpaperengine.io, accessed ${CHECKED}.`,
    },
    { type: "h2", text: "Where Wallpaper Engine is the better fit" },
    {
      type: "p",
      text: `If you also use a Windows PC, Wallpaper Engine costs less: $4.99 on Steam, against ${price.proText} for MacWall. It plays 3D and 2D animations, websites and some applications as well as video, its Steam page says the Workshop has over a million free wallpapers, and it has an Android companion app. It just won't run on the Mac itself.`,
    },
    { type: "h2", text: "Moving your own clips over" },
    {
      type: "ol",
      items: [
        `Copy the video files you made yourself or have the rights to use. Wallpaper Engine's Steam page lists MP4, WebM, AVI, M4V, MOV and WMV for local video wallpapers; MacWall imports ${macwallImportFormatsLabel}. Only move files you own: Workshop wallpapers from other people stay under their terms.`,
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
          S.wallpaperEngineSteam,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem(
          "Wallpaper Engine help: Wallpaper Engine on Linux or Mac OS",
          S.wallpaperEngineHelpMac,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem("Wallpaper Engine official site", S.wallpaperEngineSite),
        sourceItem(
          "WallpaperMachine on GitHub",
          S.wallpaperMachine,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem(
          "Microsoft Support: Options for using Windows 11 with Mac computers with Apple M1, M2 and M3 chips",
          S.windowsOnAppleSilicon,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem(
          "iWallpaper on the Mac App Store",
          S.iwallpaper,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem(
          "Live Wallpaper Engine HD on the Mac App Store",
          S.liveWallpaperEngineHd,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem("Backdrop by Cindori", S.backdrop),
        sourceItem("Wallspace", S.wallspace),
        sourceItem("Wallper", S.wallper),
        sourceItem("Hanami on the Mac App Store", S.hanami),
        sourceItem("Plash on the Mac App Store", S.plashAppStore),
      ],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Does Wallpaper Engine work on Mac?",
      answer:
        "No. Its Steam page lists Windows 10 and Windows 11 only, and its help center says it is available for Windows and Android. On a Mac, WallpaperMachine plays Wallpaper Engine wallpapers you own, or you can use a native app such as MacWall, Backdrop or Wallspace.",
    },
    {
      question: "Is there a Wallpaper Engine for MacBook?",
      answer:
        "No. There is no macOS version for any Mac, MacBook included. Native apps such as MacWall play video wallpapers on MacBook Air and MacBook Pro running macOS 15 or later.",
    },
    {
      question: "Can I use my Wallpaper Engine wallpapers on Mac?",
      answer: `WallpaperMachine, a free open-source app, plays many Wallpaper Engine scene, video and web wallpapers on Apple silicon Macs if your Steam account owns Wallpaper Engine; compatibility varies by wallpaper. MacWall can't open Wallpaper Engine projects, but with Pro it imports ${macwallImportFormatsLabel} videos you made or have the rights to use.`,
    },
    {
      question: "Is Live Wallpaper Engine HD the same as Wallpaper Engine?",
      answer:
        "No. Live Wallpaper Engine HD is a separate Mac App Store app by Voros Innovation, with themed scenes, clock and weather widgets and a screensaver mode. Wallpaper Engine is made by the Wallpaper Engine Team and has no Mac version.",
    },
    {
      question: "How much does Wallpaper Engine cost compared with MacWall?",
      answer: `Wallpaper Engine is $4.99 one-time on Steam in the US, for Windows. MacWall Pro, for Mac, is a one-time license for up to ${PRO_MACS} Macs after a free 24-hour trial; its price depends on your region and any running sale, and the pricing page shows today's price.`,
    },
    {
      question: "Is MacWall made by the Wallpaper Engine team?",
      answer:
        "No. MacWall is an independent Mac app and is not affiliated with Wallpaper Engine or Steam.",
    },
  ],
}))

export const macwallVsBackdropPage = salePricedPage((price) => ({
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
  publishedAt: "2026-07-13",
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Backdrop and MacWall are both native Mac apps that play video as your wallpaper, including on the Lock Screen, and both need macOS 15.** Backdrop, by Cindori, has a free tier with no time limit and sells $1.99 monthly, $14.99 yearly and $29.99 lifetime plans, per [its page](${S.backdrop}). MacWall has a 24-hour trial and one price: ${price.proText} once for ${price.proMacs} Macs.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Backdrop"],
      rows: [
        ["Developer", "MacWall", "Cindori AB"],
        [
          "Price model",
          `${price.proText} one-time for ${price.proMacs} Macs (India ${price.india}); ${price.plusMacs} Macs ${price.plus}`,
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
          `Import ${macwallImportFormatsLabel} with Pro`,
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
      caption: `Backdrop facts from cindori.com/backdrop, accessed ${CHECKED}, in USD; Backdrop's store shows local prices by region.`,
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
        price.proCurrentCents < 2999
          ? `You want a one-time price below Backdrop's $29.99 lifetime plan: ${price.proText} for up to ${price.proMacs} Macs, or ${price.india} in India.`
          : `You want one license for up to ${price.proMacs} Macs, or you buy from India at ${price.india}.`,
        "You like the categories in the [catalog](/wallpapers): anime, cars, nature, space, dark and more.",
        "You want Bend on an Apple silicon MacBook, Music Sync, or a live Screen Saver as well as the Lock Screen.",
      ],
    },
    { type: "h2", text: "Performance" },
    {
      type: "p",
      text: "Backdrop's page says it uses under 0.3% CPU on a 10-core M1 Max. MacWall decodes video in hardware and pauses behind full-screen apps. Neither of us publishes an independent head-to-head test, so compare both in Activity Monitor on your own Mac; the [performance guide](/docs/performance-and-battery) shows how.",
    },
    {
      type: "p",
      text: "More comparisons: [MacWall vs Wallspace](/alternatives/macwall-vs-wallspace), [iWallpaper vs MacWall](/alternatives/iwallpaper) and [the best live wallpaper apps for Mac](/best-live-wallpaper-mac).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [sourceItem("Backdrop by Cindori", S.backdrop)],
    },
    { type: "p", text: MACWALL_FACTS_NOTE },
  ],
  faq: [
    {
      question: "Is MacWall cheaper than Backdrop?",
      answer:
        PRO_REGULAR_CENTS < 2999
          ? `As a one-time purchase, yes: MacWall Pro, for up to ${PRO_MACS} Macs, costs less than Backdrop's $29.99 lifetime license, and the table above shows today's price. Backdrop also sells $1.99 monthly and $14.99 yearly plans, which cost less upfront.`
          : `MacWall Pro is a one-time license for up to ${PRO_MACS} Macs; the table above shows today's price. Backdrop sells $1.99 monthly, $14.99 yearly and $29.99 lifetime plans.`,
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
      answer: `Yes. Backdrop lists custom video import through its Creator, and MacWall imports ${macwallImportFormatsLabel} files with Pro.`,
    },
    {
      question: "Which app uses less CPU?",
      answer:
        "Backdrop says it uses under 0.3% CPU on an M1 Max; that is the developer's own figure. MacWall publishes no head-to-head test either. Run each in Activity Monitor with your own displays and videos.",
    },
  ],
}))

const WALLSPACE_PRO_CENTS = 1299

export const macwallVsWallspacePage = salePricedPage((price) => ({
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
  publishedAt: "2026-07-13",
  updatedAt: COMPARISONS_CHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Wallspace and MacWall are both native Mac apps for video wallpapers that need macOS 15, with Lock Screen video on macOS 26.** Wallspace is free to download and use, and Wallspace Pro is $12.99 one-time, per [wallspace.app](${S.wallspace}). MacWall Pro is ${price.proText} one-time and covers ${price.proMacs} Macs, and MacWall starts with a 24-hour trial instead of a free tier.`,
    },
    {
      type: "table",
      columns: ["", "MacWall", "Wallspace"],
      rows: [
        ["Developer", "MacWall", "Tangent Labs LLP"],
        [
          "Price model",
          `${price.proText} one-time for ${price.proMacs} Macs (India ${price.india}); ${price.plusMacs} Macs ${price.plus}`,
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
        [
          "Your own videos",
          `${macwallImportFormatsLabel} with Pro`,
          "Your own MP4 files",
        ],
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
      caption: `Wallspace facts from wallspace.app, accessed ${CHECKED}.`,
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
        `You want one license for ${price.proMacs} Macs, or you buy from India at ${price.india}.`,
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
    {
      type: "p",
      text: "More comparisons: [MacWall vs Backdrop](/alternatives/macwall-vs-backdrop), [iWallpaper vs MacWall](/alternatives/iwallpaper) and [the best live wallpaper apps for Mac](/best-live-wallpaper-mac).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [sourceItem("Wallspace", S.wallspace)],
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
      answer: `Wallspace Pro is $12.99 one-time in the US. MacWall Pro's regular US price is ${
        PRO_REGULAR_CENTS === WALLSPACE_PRO_CENTS
          ? "the same"
          : PRO_REGULAR_CENTS < WALLSPACE_PRO_CENTS
            ? "lower"
            : "higher"
      }, covers up to ${PRO_MACS} Macs, and costs less in India and during sales; the pricing page shows today's price. Wallspace has a free version; MacWall has a 24-hour trial.`,
    },
    {
      question: "Does MacWall require an account?",
      answer: `No. MacWall has no accounts. The free trial asks for an email address but no card, and a Pro license is a key that activates on up to ${PRO_MACS} Macs.`,
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
}))

export const livelyWallpaperMacPage = salePricedPage((price) => ({
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
  publishedAt: "2026-07-13",
  updatedAt: COMPARISONS_RECHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**Lively Wallpaper does not run on macOS.** Its [GitHub README](${S.lively}) describes a native Windows app, offered through the Microsoft Store (Windows 10 version 1809 or newer) and an installer (Windows 10 version 1903 or newer), and does not mention a Mac version. On a Mac you need a native app instead: MacWall is one, and free options are listed below.`,
    },
    {
      type: "table",
      columns: ["", "Lively Wallpaper", "MacWall"],
      rows: [
        ["Developer", "rocksdanister (GitHub repository)", "MacWall"],
        ["Price model", "Free, open source (GPL-3.0)", price.summary],
        [
          "Platforms",
          "Windows 10 (1903+ installer, 1809+ Microsoft Store) and Windows 11; no Mac version",
          MACWALL_PLATFORMS,
        ],
        ["Runs on a Mac", "No", "Yes"],
        [
          "Mac Lock Screen",
          "No Mac version",
          `Video, on ${macwallLockScreenMacOSVersion} or later`,
        ],
      ],
      caption: `Lively facts from its GitHub README, accessed ${RECHECKED}.`,
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
        `Import the same video files you used in Lively (${macwallImportFormatsLabel}, with Pro)`,
        "Curated 4K catalog across Anime, Nature, Cars, Gaming, and more",
        "Pauses behind full-screen apps, with optional Pause on battery and Pause when your Mac is busy",
        `Live Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion}`,
        `One-time Pro license, ${price.proText} for ${price.proMacs} Macs, with lifetime updates`,
      ],
    },
    {
      type: "p",
      text: "Lively is the better fit if you are on Windows, or if you want a free, open-source app. MacWall is neither free nor open source. For a free, open-source Mac app, see WallpaperMachine on the [Wallpaper Engine for Mac](/alternatives/wallpaper-engine) page.",
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
        sourceItem(
          "Lively Wallpaper on GitHub",
          S.lively,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem("Wallspace", S.wallspace),
        sourceItem("Backdrop by Cindori", S.backdrop),
        sourceItem("Wallnetic on the Mac App Store", S.wallnetic),
        sourceItem("Plash on the Mac App Store", S.plashAppStore),
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
      answer: `Video files you made or have the rights to use, yes: MacWall imports ${macwallImportFormatsLabel} with Pro. MacWall only plays video files, so anything that is not a video file does not carry over.`,
    },
    {
      question: "How much does MacWall cost?",
      answer: `MacWall is free to try for 24 hours. Pro is a one-time license for up to ${PRO_MACS} Macs and Pro+ covers 5 or 10 Macs, with no subscription. The pricing page shows today's price for your region.`,
    },
  ],
}))

/** /screen-saver-mac: MacWall's loops as the macOS screen saver (macOS 26+). */
export const screenSaverMacPage: SeoContentPage = {
  slug: "screen-saver-mac",
  pathname: "/screen-saver-mac",
  title: "Live Video Screen Savers for Mac (macOS 26+)",
  headline: "Live video screen savers for Mac",
  description:
    "Use a MacWall live wallpaper, or your own video with Pro, as your Mac screen saver and Lock Screen on macOS 26 Tahoe or later: how it works and how to set it.",
  keywords: [
    "mac screensaver",
    "screensaver mac",
    "video screensaver mac",
    "live screensaver mac",
    "custom screensaver mac",
    "aerial screensaver mac",
  ],
  publishedAt: COMPARISONS_RECHECKED_ISO,
  updatedAt: COMPARISONS_RECHECKED_ISO,
  sections: [
    {
      type: "p",
      text: `**On macOS 26 Tahoe or later, MacWall plays the wallpaper you set on your desktop, on the Lock Screen and as the screen saver, so the screen saver is a moving video loop instead of a still or one of Apple's aerials.** Pick one of ${macwallCatalog.liveCountLabel} loops from the catalog, most in 4K, or with Pro a video of your own in ${macwallImportFormatsOrLabel}. On macOS 15 Sequoia, MacWall plays on the desktop only.`,
    },
    { type: "h2", text: "How to set a video screen saver on Mac" },
    {
      type: "ol",
      items: [
        "Check your version in Apple menu > About This Mac: you need macOS 26 Tahoe or later.",
        "[Download MacWall](/download) and start the free 24-hour trial, which includes the Lock Screen and screen saver.",
        "Open a wallpaper and click **Set Wallpaper**. With System Wallpaper playback, the default for new installs on macOS 26, the same loop now plays on the desktop, the Lock Screen and the screen saver.",
        `To choose when the screen saver starts, open System Settings > Wallpaper > Screen Saver and set **Start Screen Saver** to how long your Mac can be inactive ([Apple Support](${S.appleScreenSaverSettings})).`,
      ],
    },
    { type: "h2", text: "What changes with each playback mode" },
    {
      type: "p",
      text: "MacWall has two playback modes, in Settings → Wallpaper → Playback, and the screen saver behaves a little differently in each:",
    },
    {
      type: "ul",
      items: [
        "**System Wallpaper**: macOS plays your wallpaper on the desktop, the Lock Screen and the screen saver, even when MacWall is closed. All three show the same wallpaper, sound included. Turn on **Play only on the Lock Screen** in Settings → Lock Screen to keep the desktop on a still frame and let the loop move only when you lock your Mac or the screen saver starts.",
        "**MacWall App**: MacWall plays the desktop while it's open, and Apple's own Aerials player plays a converted copy of the video, without sound, on the Lock Screen and as the screen saver. Turn it on with **Show on Lock Screen and screen saver** in Settings → Lock Screen. The first time a 4K loop goes on the Lock Screen, converting it takes several seconds.",
        "In MacWall App mode the Lock Screen and screen saver can show a different wallpaper from the desktop: open one and choose **Lock Screen Only** from the menu next to Set Wallpaper.",
      ],
    },
    { type: "h2", text: "MacWall or Apple's aerial screen savers" },
    {
      type: "p",
      text: `macOS already includes moving screen savers: slow-motion aerials in Landscape, Cityscape, Underwater and Earth, plus a Shuffle Aerials option, chosen in System Settings > Wallpaper > Screen Saver ([Apple Support](${S.appleScreenSaverSettings})). They are free and made by Apple, and if they are what you want, you don't need an app. MacWall adds a catalog of anime, nature, space, car and other loops, lets you use your own clips with Pro, and keeps the same loop on your desktop if you like.`,
    },
    { type: "h2", text: "Loops that work well as a screen saver" },
    {
      type: "p",
      text: "Slow, calm scenes look best when you step away from the Mac: [rain](/wallpapers/collections/rain), [ocean](/wallpapers/collections/ocean), [snow](/wallpapers/collections/snow), [galaxy](/wallpapers/collections/galaxy), [city nights](/wallpapers/collections/city) and [lofi rooms](/wallpapers/collections/lofi). Browse the [full gallery](/wallpapers) for the rest.",
    },
    { type: "h2", text: "Requirements" },
    {
      type: "ul",
      items: [
        `${macwallLockScreenMacOSVersion} or later for the Lock Screen and screen saver; macOS 15 Sequoia for the desktop`,
        "Apple silicon or Intel Mac",
        "MacWall Pro, or the free 24-hour trial",
        "Pro to use your own videos",
      ],
    },
    {
      type: "p",
      text: "Step-by-step settings for both modes are in the [Lock Screen and screen saver guide](/docs/live-lock-screen-and-screen-saver). For other apps that offer a screensaver mode, see [the best live wallpaper apps for Mac](/best-live-wallpaper-mac).",
    },
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: [
        sourceItem(
          "Apple Support: Change Screen Saver settings on Mac",
          S.appleScreenSaverSettings,
          COMPARISONS_RECHECKED_ISO
        ),
        sourceItem(
          "Live Wallpaper Engine HD on the Mac App Store",
          S.liveWallpaperEngineHd,
          COMPARISONS_RECHECKED_ISO
        ),
      ],
    },
  ],
  faq: [
    {
      question: "Can I use a video as a screen saver on Mac?",
      answer:
        "Yes, on macOS 26 Tahoe or later with an app such as MacWall: the wallpaper you set also plays as the screen saver. Apple's Screen Saver settings list aerials, photos and built-in screen savers, not your own video files.",
    },
    {
      question: "Does a MacWall screen saver work on macOS Sequoia?",
      answer:
        "No. On macOS 15 Sequoia MacWall plays live wallpapers on the desktop only. The Lock Screen and screen saver need macOS 26 Tahoe or later.",
    },
    {
      question: "Can the screen saver show a different video from my desktop?",
      answer:
        "Yes, in MacWall App playback mode: choose Lock Screen Only from the menu next to Set Wallpaper, and the Lock Screen and screen saver get that wallpaper while the desktop keeps its own. With System Wallpaper playback, all three show the same one.",
    },
    {
      question: "Does the screen saver play sound?",
      answer:
        "With System Wallpaper playback, the Lock Screen and screen saver play the wallpaper's sound, if it has any. With MacWall App playback they are silent, because Apple's Aerials player plays them.",
    },
    {
      question: "Does MacWall have a clock screen saver?",
      answer:
        "No. MacWall plays video loops without a clock or widgets. Live Wallpaper Engine HD on the Mac App Store lists clock and weather widgets and a screensaver mode.",
    },
    {
      question: "Is the live screen saver part of the free trial?",
      answer:
        "Yes. The 24-hour trial covers the full catalog, Set Wallpaper and the Lock Screen, which includes the screen saver. After the trial, the Lock Screen and screen saver need Pro.",
    },
  ],
}

/**
 * /wallpapers/{category}: copy from lib/seo/category-seo.ts. `sections` start
 * with the intro (`categoryHubIntro`), then the how-to and collection links
 * (`categoryHubSections`); a route that renders the intro by the H1 renders
 * `categoryHubSections` below the grid instead of `sections`.
 */
export function wallpaperCategoryPage(
  categoryName: string,
  options: { total?: number } = {}
): SeoContentPage {
  const entry = categorySeoFor(categoryName)
  const slug = entry?.slug ?? categoryName.toLowerCase()
  const fallbackTitle = `${categoryName} Live Wallpapers for Mac`

  return {
    slug,
    pathname: `/wallpapers/${slug}`,
    title: entry?.title ?? fallbackTitle,
    headline: entry?.headline ?? fallbackTitle,
    description:
      entry?.description ??
      `${categoryName} live wallpapers for Mac from the ${macwall.name} catalog, as 4K video loops you can preview free and set on your desktop and Lock Screen.`,
    keywords: entry ? [...entry.keywords] : [],
    sections: [
      { type: "p", text: categoryHubIntro(categoryName, options.total) },
      ...categoryHubSections(categoryName),
    ],
    faq: entry ? entry.faq.map((item) => ({ ...item })) : [],
  }
}
