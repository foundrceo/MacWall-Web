import type { BlogArticle } from "@/lib/content/types"

export const featureArticles: BlogArticle[] = [
  {
    slug: "why-macwall-best-native-wallpaper-app",
    pathname: "/blog/why-macwall-best-native-wallpaper-app",
    title: "The Best Native Wallpaper App for macOS",
    headline: "Why MacWall Is the Best Native Wallpaper App",
    description:
      "Native SwiftUI, Metal hardware decode, menu bar controls, and intelligent pause: why MacWall runs smoother than cross-platform wallpaper apps.",
    excerpt:
      "Built for Mac. Runs like Mac software. Here's the engineering behind the smoothest wallpaper experience.",
    category: "features",
    readMinutes: 7,
    publishedAt: "2026-03-11",
    keywords: [
      "best native wallpaper app mac",
      "macwall review",
      "smoothest live wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "Most wallpaper apps on Mac are ports. Electron shells, web views, or Windows code in compatibility layers. **MacWall** is native macOS software. That is not marketing fluff; it is why playback stays smooth when you have twenty Safari tabs open.",
      },
      {
        type: "h2",
        text: "Hardware-accelerated video decode",
      },
      {
        type: "p",
        text: "MacWall decodes video on the GPU using Apple's media stack. On M1, M2, M3, and M4 Macs, this means fractions of a CPU core instead of software rendering that competes with your actual work.",
      },
      {
        type: "h2",
        text: "Menu bar-first design",
      },
      {
        type: "p",
        text: "Real Mac utilities live in the menu bar. MacWall follows that pattern: pause, resume, and switch wallpapers without a floating window cluttering your desktop.",
      },
      {
        type: "h2",
        text: "Intelligent pause rules",
      },
      {
        type: "ul",
        items: [
          "Pause when on battery power",
          "Pause when any app goes full screen",
          "Per-display players, one decoder per monitor",
          "Respects reduced motion accessibility settings",
        ],
      },
      {
        type: "h2",
        text: "Community + imports",
      },
      {
        type: "p",
        text: "Curated catalog lanes plus unlimited personal imports. You are not locked into a closed library. Upload, share, and discover, the catalog grows daily.",
      },
      {
        type: "h2",
        text: "Fair pricing",
      },
      {
        type: "p",
        text: "One-time $12.99, not a monthly subscription. Lifetime updates on up to 3 Macs (Pro Plus: 5). Make a Reel with #macwall and earn your money back.",
      },
    ],
  },
  {
    slug: "lock-screen-live-wallpaper-macos",
    pathname: "/blog/lock-screen-live-wallpaper-macos",
    title: "Lock Screen Live Wallpaper on macOS (MacWall Pro)",
    headline: "Lock Screen Live Wallpaper on macOS",
    description:
      "MacWall Pro brings live video motion to your Mac Lock Screen on macOS 26 (Tahoe) and later, with a one-time price and lifetime updates.",
    excerpt:
      "Motion on your Lock Screen, the Pro feature that makes MacWall stand out.",
    category: "features",
    readMinutes: 5,
    publishedAt: "2026-03-12",
    keywords: [
      "lock screen live wallpaper mac",
      "animated lock screen macos",
      "mac lock screen video wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "Your desktop is only half the canvas. **MacWall Pro** extends live motion to the Lock Screen on macOS 26 (Tahoe) and later, where Apple allows custom video backgrounds.",
      },
      {
        type: "h2",
        text: "How to enable Lock Screen wallpaper",
      },
      {
        type: "ol",
        items: [
          "Activate MacWall with your one-time license.",
          "Pick a wallpaper from the catalog or your Library.",
          "Enable Lock Screen in wallpaper settings.",
          "Lock your Mac to see the loop on the login screen.",
        ],
      },
      {
        type: "h2",
        text: "OS compatibility notes",
      },
      {
        type: "p",
        text: "Lock Screen video support varies by macOS version and region. MacWall Pro includes lifetime updates as Apple expands APIs. Desktop live wallpapers work on all supported macOS builds.",
      },
    ],
  },
  {
    slug: "live-wallpaper-battery-drain-mac",
    pathname: "/blog/live-wallpaper-battery-drain-mac",
    title: "Do Live Wallpapers Drain Mac Battery? (Honest Answer)",
    headline: "Live Wallpaper Battery Drain on Mac",
    description:
      "How MacWall keeps live wallpaper battery impact low on MacBooks: automatic pause on battery, GPU hardware decode, and full-screen detection.",
    excerpt:
      "The truth about live wallpapers and MacBook battery life, and how MacWall fixes it.",
    category: "features",
    readMinutes: 5,
    publishedAt: "2026-03-13",
    keywords: [
      "live wallpaper battery drain mac",
      "wallpaper app battery macbook",
      "animated wallpaper power usage",
    ],
    sections: [
      {
        type: "p",
        text: "Yes, playing video continuously uses energy. But **how** the app plays video matters enormously. Software-rendered wallpapers can burn 5–15% CPU. MacWall's hardware decode on Apple Silicon typically stays under 1% when plugged in, and **zero** when pause-on-battery kicks in.",
      },
      {
        type: "h2",
        text: "MacWall's power-saving features",
      },
      {
        type: "ul",
        items: [
          "Automatic pause on battery",
          "Pause during full-screen apps (video calls, games, Keynote)",
          "One hardware decoder per display, no duplicate work",
          "Preload off until wallpaper is visible",
        ],
      },
      {
        type: "h2",
        text: "Practical advice",
      },
      {
        type: "p",
        text: "On a MacBook Air, keep pause-on-battery enabled. On a desk setup, enjoy 4K loops freely. Use the menu bar to pause manually during long unplugged sessions.",
      },
    ],
  },
  {
    slug: "4k-video-wallpaper-mac",
    pathname: "/blog/4k-video-wallpaper-mac",
    title: "4K Video Wallpapers on Mac: Performance Guide",
    headline: "4K Video Wallpapers on Mac",
    description:
      "Run stunning 3840×2160 and 5K motion wallpapers on your Mac without stutter, thanks to MacWall's GPU decode pipeline built for Retina displays.",
    excerpt: "4K loops on Retina displays with native hardware acceleration.",
    category: "features",
    readMinutes: 4,
    publishedAt: "2026-03-14",
    keywords: [
      "4k wallpaper mac",
      "4k live wallpaper macos",
      "ultra hd wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "4K video wallpapers look incredible on 27-inch iMacs and MacBook Pro Retina panels. **MacWall** decodes 4K H.264 and HEVC streams on the GPU, the same pipeline used by QuickTime and Final Cut playback.",
      },
      {
        type: "h2",
        text: "When 4K makes sense",
      },
      {
        type: "ul",
        items: [
          "Native 4K or 5K displays",
          "Cinematic nature and space loops",
          "Desk setups plugged into power",
        ],
      },
      {
        type: "h2",
        text: "When to use 1440p instead",
      },
      {
        type: "p",
        text: "MacBook Air 13-inch and older Intel Macs may run cooler with 2560×1440 sources. MacWall scales video to fit, pick the resolution that matches your display for best quality-to-performance ratio.",
      },
    ],
  },
  {
    slug: "multi-monitor-wallpaper-mac",
    pathname: "/blog/multi-monitor-wallpaper-mac",
    title: "Dual Monitor Wallpaper on Mac: Different Wallpaper per Display",
    headline: "Dual Monitor Wallpaper on Mac",
    description:
      "Set a different wallpaper on each monitor on a Mac, span one image across two screens, and run live wallpapers on dual, triple, and ultrawide setups.",
    excerpt:
      "Different wallpapers per display, spanning one image, and live wallpapers across every screen.",
    category: "features",
    readMinutes: 5,
    publishedAt: "2026-03-15",
    updatedAt: "2026-09-28",
    keywords: [
      "dual monitor wallpaper",
      "dual monitor wallpaper mac",
      "multi monitor wallpaper mac",
      "different wallpaper on each monitor mac",
      "span wallpaper across two monitors mac",
      "ultrawide wallpaper mac",
      "dual monitor live wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: "**To set a different wallpaper on each monitor on a Mac, open System Settings > Wallpaper; with two or more displays connected, each one gets its own wallpaper choice.** macOS cannot stretch a single image across two screens by itself, so to span one picture you split it into two images sized to each display. For live wallpapers on every screen, MacWall runs one player per monitor, synced or independent.",
      },
      { type: "h2", text: "Set a different wallpaper on each display" },
      {
        type: "ol",
        items: [
          "Connect your external monitor and open **System Settings > Wallpaper**.",
          "At the top of the pane, select the display you want to change.",
          "Choose its wallpaper, then select the next display and repeat.",
        ],
      },
      {
        type: "p",
        text: "Each Space in Mission Control can also hold its own wallpaper per display. Full basics: [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac).",
      },
      { type: "h2", text: "Span one wallpaper across two monitors" },
      {
        type: "ol",
        items: [
          "Find a panoramic image at least as wide as both displays combined, for example 7680×2160 for two 4K monitors side by side.",
          "Crop it into a left half and a right half matching each display's resolution.",
          "Set the left half on the left monitor and the right half on the right monitor, both with **Fill Screen**.",
        ],
      },
      { type: "h2", text: "Dual monitor sizes to target" },
      {
        type: "ul",
        items: [
          "**Two 1080p monitors**: 3840×1080 total, 1920×1080 each",
          "**Two 1440p monitors**: 5120×1440 total, 2560×1440 each",
          "**Two 4K monitors**: 7680×2160 total, 3840×2160 each",
          "**Ultrawide 34-inch**: 3440×1440; **49-inch super-ultrawide**: 5120×1440",
          "**MacBook + external**: size each separately; see [MacBook wallpaper size](/blog/macbook-wallpaper-size)",
        ],
      },
      { type: "h2", text: "Live wallpapers on every display" },
      {
        type: "p",
        text: "**MacWall** assigns one player per monitor: mirror the same loop everywhere or pick a different wallpaper for each screen. Mixed setups work too, such as a MacBook next to an ultrawide, dual 4K monitors, or three displays on a Mac Studio. Playback is hardware-decoded and pauses when a display sleeps or a full-screen app covers it.",
      },
      {
        type: "ul",
        items: [
          "Use calmer loops such as [rain](/wallpapers/collections/rain) or [ocean](/wallpapers/collections/ocean) on your main work monitor.",
          "Put bolder motion like [cyberpunk](/wallpapers/collections/cyberpunk) or [JDM cars](/wallpapers/collections/jdm) on a secondary screen.",
          "Match each loop's resolution to its display so you are not decoding pixels you never see.",
        ],
      },
    ],
    faq: [
      {
        question: "Can a Mac have different wallpapers on two monitors?",
        answer:
          "Yes. System Settings > Wallpaper shows a separate choice for each connected display. MacWall does the same for live wallpapers.",
      },
      {
        question: "How do I stretch one wallpaper across two monitors on Mac?",
        answer:
          "macOS has no span option. Split a panoramic image into two halves sized to each display and set one half on each monitor with Fill Screen.",
      },
      {
        question:
          "Do live wallpapers on two monitors use double the resources?",
        answer:
          "Each display plays its own loop, but decoding runs on Apple's media engine rather than the CPU, and MacWall pauses any display that is asleep or covered by a full-screen app.",
      },
    ],
  },
  {
    slug: "apple-silicon-wallpaper-performance",
    pathname: "/blog/apple-silicon-wallpaper-performance",
    title: "Apple Silicon & Live Wallpapers: Why Native Apps Win",
    headline: "Apple Silicon Live Wallpaper Performance",
    description:
      "M1, M2, M3, and M4 Macs decode video wallpapers efficiently. See how MacWall's native Metal pipeline beats cross-platform overhead on Apple Silicon.",
    excerpt:
      "Why Apple Silicon Macs are the best machines for live wallpapers, with the right app.",
    category: "features",
    readMinutes: 5,
    publishedAt: "2026-03-16",
    keywords: [
      "apple silicon wallpaper",
      "m1 live wallpaper mac",
      "metal wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: "Apple Silicon unified memory and media engines make live wallpapers practical for daily use, **if** the app uses native decode. MacWall is built with SwiftUI and Metal, targeting M-series chips from day one.",
      },
      {
        type: "h2",
        text: "What to avoid on Apple Silicon",
      },
      {
        type: "ul",
        items: [
          "Electron apps wrapping Chromium video players",
          "Rosetta-translated Windows ports",
          "WebView-based wallpaper engines",
        ],
      },
      {
        type: "h2",
        text: "What MacWall does instead",
      },
      {
        type: "p",
        text: "AVFoundation hardware decode → Metal compositing behind desktop windows. Activity Monitor should show MacWall using minimal CPU during idle desktop use.",
      },
    ],
  },
  {
    slug: "menu-bar-wallpaper-controls-mac",
    pathname: "/blog/menu-bar-wallpaper-controls-mac",
    title: "Menu Bar Wallpaper Controls on Mac (MacWall)",
    headline: "Menu Bar Wallpaper Controls on Mac",
    description:
      "Pause, resume, and switch live wallpapers right from the Mac menu bar with MacWall, no floating windows and no clutter on your desktop.",
    excerpt:
      "Control your desktop motion like a real Mac utility, from the menu bar.",
    category: "features",
    readMinutes: 3,
    publishedAt: "2026-03-17",
    keywords: [
      "menu bar wallpaper mac",
      "macwall menu bar",
      "wallpaper controls macos",
    ],
    sections: [
      {
        type: "p",
        text: "The best Mac apps stay out of your way. **MacWall** runs from the menu bar: pause before a Zoom call, resume after, switch wallpapers without opening the main window.",
      },
      {
        type: "h2",
        text: "Available controls",
      },
      {
        type: "ul",
        items: [
          "Pause / resume / stop playback",
          "Quick access to current wallpaper",
          "Open main window for catalog browsing",
          "Status indicator when running in background",
        ],
      },
    ],
  },
]
