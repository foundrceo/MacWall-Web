import type { BlogArticleInput } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallCreatorDisclosure,
  macwallImportFormatsLabel,
  macwallLockScreenMacOSVersion,
  macwallPermissions,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"

export const overviewArticles: BlogArticleInput[] = [
  {
    slug: "what-is-macwall-complete-guide",
    pathname: "/blog/what-is-macwall-complete-guide",
    title: "What Is MacWall? The Complete Guide to the Mac App",
    headline: "What Is MacWall? Everything You Need to Know",
    description:
      "What MacWall is and does in version 4.1: 4K live wallpapers for the Mac desktop and Lock Screen, two playback modes, battery settings and pricing.",
    excerpt:
      "One page, every answer: what MacWall does, how it plays, what it costs, what it asks permission for, and who it suits.",
    category: "features",
    publishedAt: "2026-08-01",
    updatedAt: "2026-11-06",
    keywords: [
      "what is macwall",
      "macwall app",
      "macwall complete guide",
      "live wallpaper mac app",
      "macwall features",
    ],
    sections: [
      {
        type: "p",
        text: `**MacWall is a native Mac app that plays 4K live video wallpapers on your desktop and, on ${macwallLockScreenMacOSVersion} or later, on the Lock Screen and as the screen saver.** It has a catalog of ${macwallCatalog.liveCountLabel} loops and plays your own videos with Pro. ${macwallSupportedMacOS.summary} The current version is ${macwall.currentVersion}, released on ${macwall.currentVersionReleasedLabel}.`,
      },
      { type: "h2", text: "What MacWall does" },
      {
        type: "ul",
        items: [
          `**A 4K catalog**: ${macwallCatalog.liveCountLabel} live wallpapers in ${macwall.categories.length} categories (${macwall.categories.join(", ")}), browsable in the app and at [macwall.app/wallpapers](/wallpapers).`,
          `**Your own videos**: with Pro, add ${macwallImportFormatsLabel} files privately; they stay on your Mac.`,
          `**Lock Screen and screen saver**: on ${macwallLockScreenMacOSVersion} or later, the same video plays when your Mac is locked and as the screen saver.`,
          "**Every display**: one loop on all of them, or a different one per display, remembered for each monitor setup.",
          "**Shuffle and Day Schedule**: rotate through your favorites, your downloads or the whole catalog, or change the wallpaper through the day, set like alarms.",
          "**Music Sync**: visuals from the album cover for Apple Music and Spotify, on the beat.",
          "**Bend**: on Apple silicon MacBooks, the desktop folds with the lid as you close it.",
          "**Menu bar control**: play, pause, skip, sound and Stop Wallpaper, plus shortcuts that work in every app.",
        ],
      },
      { type: "h2", text: "Two ways to play" },
      {
        type: "p",
        text: `Pick a playback mode in **${macwallPlaybackModes.settingsPath}** and switch any time:`,
      },
      {
        type: "ul",
        items: [
          `**${macwallPlaybackModes.systemWallpaper.setting}** (${macwallPlaybackModes.systemWallpaper.minimumMacOS} and later, the default there): ${macwallPlaybackModes.systemWallpaper.summary}`,
          `**${macwallPlaybackModes.app.setting}** (every supported version, and the only mode on macOS 15): ${macwallPlaybackModes.app.summary}`,
        ],
      },
      {
        type: "p",
        text: "The Lock Screen side, step by step, is in [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac) and [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).",
      },
      { type: "h2", text: "Battery and performance" },
      {
        type: "p",
        text: `MacWall plays H.264 and HEVC video with Apple's hardware decoding, so on a supported codec most of the work runs on the media engine instead of the CPU. ${macwallBatteryPolicy.summary} With ${macwallPlaybackModes.systemWallpaper.setting} playback, ${macwallPlaybackModes.systemWallpaper.cpu}.`,
      },
      {
        type: "p",
        text: "MacWall hasn't published a measured battery test, so it doesn't quote a figure. What drives the cost, and how to measure it on your own Mac in Activity Monitor, is in [live wallpaper CPU and battery use](/blog/live-wallpaper-cpu-usage-mac).",
      },
      { type: "h2", text: "Get started" },
      {
        type: "ol",
        items: [
          "[Download MacWall](/download), open the DMG and drag the app to Applications.",
          "Open it from Applications. At the end of setup, choose **Try Free** to start the free 24-hour trial.",
          "Browse Home or Explore, or press Command-K to search. Open a wallpaper and click **Set Wallpaper**.",
          "Use the MacWall icon in the menu bar to pause, skip or stop.",
        ],
      },
      {
        type: "p",
        text: "The longer walkthrough is [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).",
      },
      { type: "h2", text: "Pricing" },
      {
        type: "ul",
        items: [
          `**Free trial**: ${macwallTrial.summary}`,
          `**Pro**: a one-time purchase for up to ${macwall.maxLicensedMacs} Macs, with lifetime updates. No subscription and no ads.`,
          "**Pro+**: the same on 5 or 10 Macs, for families, teams and studios.",
          `**Refunds**: a ${macwall.refundWindowDays}-day money-back window on license purchases.`,
          `**Creator refund**: post a public video of MacWall running on your Mac, labelled ${macwallCreatorDisclosure.label} and tagged ${macwall.reelRefundHashtag}, and get 50% back at ${macwall.reelRefundHalfViews.toLocaleString("en-US")} views or all of it at ${macwall.reelRefundFullViews.toLocaleString("en-US")} ([rules](/creator)).`,
        ],
      },
      {
        type: "p",
        text: "Current prices, including any sale, are on the [pricing page](/pricing). Checkout runs through Stripe, and the license key activates in the app.",
      },
      { type: "h2", text: "Permissions and privacy" },
      {
        type: "p",
        text: `${macwallPermissions.summary} Videos you add privately never leave your Mac. See the [privacy policy](/legal/privacy) for what the app and the website collect.`,
      },
      { type: "h2", text: "A community-built catalog" },
      {
        type: "p",
        text: "Alongside MacWall's own picks, the catalog takes submissions from users. Pro users upload from the Mac app with a rights declaration, and a person on the MacWall team reviews each one before it appears in Explore. How it works: [upload a wallpaper to the MacWall community](/blog/upload-wallpaper-macwall-community).",
      },
      { type: "h2", text: "Who MacWall is for" },
      {
        type: "ul",
        items: [
          "Mac users who want motion on the desktop and Lock Screen without a subscription.",
          "MacBook owners who want a wallpaper that pauses on battery or behind full-screen apps.",
          "Desks with several displays that want a loop per screen.",
          "People who film or make their own loops, and want to use or share them.",
        ],
      },
      { type: "h2", text: "Who should skip it" },
      {
        type: "ul",
        items: [
          "You want interactive scenes or web pages as wallpapers: MacWall plays video loops only.",
          "Your Mac can't run macOS 15 or later.",
          "You want something free for good: see [free animated wallpapers for Mac](/blog/animated-desktop-background-mac-free).",
        ],
      },
      {
        type: "p",
        text: "For how MacWall compares with other Mac wallpaper apps, with each app's price and requirements and a dated source for every row, see the [comparison hub](/compare). Release notes are in the [changelog](/changelog), and help is in the [docs](/docs) or at support@macwall.app.",
      },
    ],
    faq: [
      {
        question: "What is MacWall?",
        answer:
          "A native Mac app that plays 4K live video wallpapers on the desktop and, on macOS 26 or later, on the Lock Screen and as the screen saver, from its catalog or your own videos.",
      },
      {
        question: "Is MacWall free?",
        answer:
          "No. Every Mac gets a free 24-hour trial with no card; after that, Pro is a one-time purchase. There is no subscription.",
      },
      {
        question: "Which Macs and macOS versions does MacWall support?",
        answer: macwallSupportedMacOS.summary,
      },
      {
        question: "What permissions does MacWall need?",
        answer: macwallPermissions.summary,
      },
      {
        question: "Can I use my own videos in MacWall?",
        answer: `Yes, with Pro: add ${macwallImportFormatsLabel} files under Upload Wallpaper > Private. GIFs need converting to MP4 first.`,
      },
    ],
  },
]
