import { macwall } from "@/lib/macwall-site"
import type { SeoContentPage } from "@/lib/content/types"

export const downloadPage: SeoContentPage = {
  slug: "download",
  pathname: "/download",
  title: "Download MacWall for Mac",
  headline: "Download MacWall for Mac",
  description:
    "Free download for macOS. Native live motion wallpapers with hardware decode, menu bar controls, and a curated catalog. Intel and Apple Silicon supported.",
  keywords: [
    "macwall download",
    "download live wallpaper mac",
    "mac wallpaper app download",
    "macos wallpaper app free",
  ],
  sections: [
    {
      type: "p",
      text: "**MacWall** is the native macOS app for live motion wallpapers. Download free, install in seconds, and transform your desktop with cinematic video loops.",
    },
    {
      type: "h2",
      text: "What you get",
    },
    {
      type: "ul",
      items: [
        "Curated catalog across 9 categories",
        "Import your own MP4, MOV, and GIF files",
        "Hardware-accelerated playback on Apple Silicon",
        "Menu bar pause, resume, and stop",
        "Multi-monitor support",
        "Pause on battery and full screen",
      ],
    },
    {
      type: "h2",
      text: "System requirements",
    },
    {
      type: "ul",
      items: [
        "macOS Sonoma, Ventura, or Sequoia (recent builds)",
        "Intel or Apple Silicon Mac",
        "Network for catalog sync (offline playback after download)",
      ],
    },
    {
      type: "h2",
      text: "Install steps",
    },
    {
      type: "ol",
      items: [
        "Click Download below to get the latest DMG.",
        "Open the disk image and drag MacWall to Applications.",
        "Launch from the Dock and pick your first wallpaper.",
        "Optional: upgrade to Pro for Lock Screen motion.",
      ],
    },
  ],
  faq: [
    {
      question: "Is MacWall free to download?",
      answer:
        "Yes. Desktop live wallpapers are free. MacWall Pro is an optional one-time upgrade for Lock Screen and exclusive catalog features.",
    },
    {
      question: "Is MacWall safe to install?",
      answer:
        "MacWall is distributed from macwall.app. macOS may ask you to confirm the developer on first launch — this is normal for apps outside the Mac App Store.",
    },
  ],
}

export const liveWallpaperMacPage: SeoContentPage = {
  slug: "live-wallpaper-mac",
  pathname: "/live-wallpaper-mac",
  title: "Live Wallpaper for Mac — Native & Smooth | MacWall",
  headline: "Live Wallpaper for Mac",
  description:
    "The #1 native live wallpaper app for macOS. Hardware decode, menu bar controls, community catalog, and the smoothest motion desktops on Apple Silicon.",
  keywords: [
    "live wallpaper for mac",
    "live wallpaper mac",
    "live wallpaper macbook",
    "animated wallpaper macos",
    "moving wallpaper mac",
    "video wallpaper mac",
    "dynamic wallpaper mac",
    "free live wallpaper mac",
    "4k live wallpaper mac",
    "motion desktop mac",
  ],
  sections: [
    {
      type: "p",
      text: "Your Mac desktop should move. **MacWall** is the native live wallpaper app built exclusively for macOS — not a port, not a web view, not a subscription trap. Video loops play behind your windows with GPU decode, intelligent pause, and menu bar control.",
    },
    {
      type: "h2",
      text: "Why MacWall is the best live wallpaper for Mac",
    },
    {
      type: "ul",
      items: [
        "**Native performance** — SwiftUI + Metal on Apple Silicon",
        "**Free to start** — full desktop playback without paying monthly",
        "**Community catalog** — Nature, Space, Anime, and six more categories",
        "**Your clips** — import any compatible video",
        "**Lock Screen Pro** — motion on login screen where macOS allows",
        "**One-time pricing** — $7.99 Pro, lifetime updates",
      ],
    },
    {
      type: "h2",
      text: "Built for real Mac workflows",
    },
    {
      type: "p",
      text: "Pause on battery. Pause in full screen. One decoder per display. MacWall respects how you actually use a MacBook and a desk setup — beauty without compromise.",
    },
    {
      type: "h2",
      text: "Get started",
    },
    {
      type: "p",
      text: "Download free at macwall.app/download. Read our blog for guides, comparisons, and category picks. Upgrade to Pro when you want Lock Screen live wallpaper.",
    },
  ],
  faq: [
    {
      question: "What is the best live wallpaper app for Mac?",
      answer:
        "MacWall is the top native choice for smooth video wallpapers, fair pricing, and macOS integration. See our 2026 comparison article for an honest look at alternatives.",
    },
    {
      question: "Does live wallpaper work on M1/M2/M3 Macs?",
      answer:
        "Yes. MacWall uses hardware video decode on all Apple Silicon Macs for efficient playback.",
    },
  ],
}

export const lockScreenWallpaperPage: SeoContentPage = {
  slug: "lock-screen-wallpaper",
  pathname: "/lock-screen-wallpaper",
  title: "Lock Screen Live Wallpaper for Mac | MacWall Pro",
  headline: "Lock Screen Live Wallpaper for Mac",
  description:
    "MacWall Pro brings video motion to your Mac Lock Screen on supported Sonoma and Sequoia builds. One-time purchase, lifetime updates.",
  keywords: [
    "lock screen live wallpaper mac",
    "animated lock screen macos",
    "mac lock screen video",
  ],
  sections: [
    {
      type: "p",
      text: "Desktop motion is just the beginning. **MacWall Pro** extends live video wallpapers to your Lock Screen — the screen you see dozens of times a day before you even log in.",
    },
    {
      type: "h2",
      text: "Pro features",
    },
    {
      type: "ul",
      items: macwall.pro.features.map((f) => f),
    },
    {
      type: "h2",
      text: "Pricing",
    },
    {
      type: "p",
      text: `${macwall.pro.price} ${macwall.pro.suffix} — ${macwall.pro.headline}. Licensed on up to ${macwall.maxLicensedMacs} personal Macs. Make a Reel with ${macwall.reelRefundHashtag} to earn up to 100% back.`,
    },
  ],
  faq: [
    {
      question: "Which macOS versions support Lock Screen video?",
      answer:
        "Support varies by OS version. MacWall Pro includes lifetime updates as Apple expands Lock Screen customization APIs.",
    },
  ],
}

export const bestLiveWallpaperMacPage: SeoContentPage = {
  slug: "best-live-wallpaper-mac",
  pathname: "/best-live-wallpaper-mac",
  title: "Best Live Wallpaper for Mac (2026) | MacWall",
  headline: "Best Live Wallpaper for Mac in 2026",
  description:
    "MacWall ranks #1 for native performance, value, and daily usability. Compare features, pricing, and why Mac users choose MacWall over alternatives.",
  keywords: [
    "best live wallpaper mac",
    "best wallpaper app mac 2026",
    "best live wallpaper app for macbook",
    "best animated wallpaper mac",
    "best free wallpaper app mac",
    "top mac wallpaper app",
  ],
  sections: [
    {
      type: "p",
      text: "Searching for the **best live wallpaper for Mac** in 2026? You want smooth playback, battery smarts, and no subscription. **MacWall** delivers all three as native macOS software.",
    },
    {
      type: "h2",
      text: "MacWall vs the field",
    },
    {
      type: "ul",
      items: [
        "vs Backdrop — lower Pro price, community uploads, Reel refund",
        "vs Wallpaper Engine — native Mac app, no Windows dependency",
        "vs Wallper — bigger community catalog and aggressive one-time pricing",
        "vs Wallspace — deeper catalog, imports, and Lock Screen Pro",
        "vs iWallpaper — better macOS integration and catalog depth",
        "vs web-based tools — GPU decode, not Chromium overhead",
      ],
    },
    {
      type: "h2",
      text: "Try it free",
    },
    {
      type: "p",
      text: "Download MacWall and judge smoothness yourself. Check Activity Monitor — MacWall should stay lightweight while your desktop looks incredible.",
    },
  ],
  faq: [],
}

export const wallpaperEngineAlternativePage: SeoContentPage = {
  slug: "wallpaper-engine",
  pathname: "/alternatives/wallpaper-engine",
  title: "Wallpaper Engine Alternative for Mac | MacWall",
  headline: "Wallpaper Engine Alternative for Mac",
  description:
    "The best native Mac alternative to Wallpaper Engine. Video wallpapers, hardware decode, and no Steam required.",
  keywords: [
    "wallpaper engine mac alternative",
    "wallpaper engine macos",
    "wallpaper engine for mac",
    "wallpaper engine mac download",
    "steam wallpaper engine mac",
    "apps like wallpaper engine for mac",
  ],
  sections: [
    {
      type: "p",
      text: "Wallpaper Engine has no official Mac app. **MacWall** is the native alternative for video live wallpapers — built for macOS, free to download, with a growing community catalog.",
    },
    {
      type: "h2",
      text: "Migration tips",
    },
    {
      type: "ol",
      items: [
        "Export favorite loops as MP4 from Wallpaper Engine on Windows.",
        "Import MP4 files into MacWall Library.",
        "Browse MacWall catalog for fresh 4K content.",
        "Need .pkg scene files? Consider Vivid Walls — MacWall is better for daily video playback.",
      ],
    },
  ],
  faq: [],
}

export const macwallVsBackdropPage: SeoContentPage = {
  slug: "macwall-vs-backdrop",
  pathname: "/alternatives/macwall-vs-backdrop",
  title: "MacWall vs Backdrop (2026 Comparison)",
  headline: "MacWall vs Backdrop",
  description:
    "Honest comparison of MacWall and Backdrop — pricing, Lock Screen, catalog, and which native app fits your Mac.",
  keywords: [
    "macwall vs backdrop",
    "backdrop alternative mac",
    "backdrop mac wallpaper app",
    "backdrop cindori alternative",
    "best backdrop alternative",
  ],
  sections: [
    {
      type: "p",
      text: "Two excellent native apps. **MacWall** wins on value ($7.99 Pro), community uploads, and the Reel refund program. **Backdrop** wins on built-in editor and established library size.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: free desktop tier, $7.99 Pro one-time",
        "Backdrop: $9.99 one-time",
        "Both: 4K video, multi-monitor, Lock Screen on supported macOS",
        "MacWall: personal video imports + community catalog",
        "Backdrop: in-app backdrop editor",
      ],
    },
  ],
  faq: [],
}

export const macwallVsWallperPage: SeoContentPage = {
  slug: "macwall-vs-wallper",
  pathname: "/alternatives/macwall-vs-wallper",
  title: "MacWall vs Wallper",
  headline: "MacWall vs Wallper",
  description:
    "Compare MacWall and Wallper for live wallpapers on Mac — catalog, performance, and pricing.",
  keywords: [
    "macwall vs wallper",
    "wallper alternative",
    "wallper app alternative mac",
    "wallper vs macwall",
    "apps like wallper",
    "wallper free alternative",
  ],
  sections: [
    {
      type: "p",
      text: "**Wallper** offers SwiftUI playback with a curated library of around 700 loops. **MacWall** differentiates with a larger community catalog, free desktop tier, Reel refund program, menu bar-first workflow, and aggressive early-bird Pro pricing.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: free desktop live wallpapers, $7.99 Pro one-time",
        "Wallper: paid license after trial",
        "Both: 4K video, Apple Silicon optimized, multi-monitor",
        "MacWall: community uploads + import your own MP4/MOV/GIF for free",
        "MacWall: Reel refund — earn up to 100% of Pro back",
      ],
    },
    {
      type: "p",
      text: "Download both free tiers and compare smoothness on your specific Mac — MacWall optimizes for daily menu bar control and multi-category discovery.",
    },
  ],
  faq: [
    {
      question: "Is MacWall a free Wallper alternative?",
      answer:
        "Yes. MacWall's desktop live wallpapers are completely free, including catalog browsing and personal video imports. Pro is an optional $7.99 one-time upgrade for Lock Screen motion.",
    },
    {
      question: "Which is better for MacBook battery life?",
      answer:
        "Both use hardware decode. MacWall additionally pauses automatically on battery and in full screen, keeping playback off when it doesn't matter.",
    },
  ],
}

export const macwallVsIwallpaperPage: SeoContentPage = {
  slug: "macwall-vs-iwallpaper",
  pathname: "/alternatives/macwall-vs-iwallpaper",
  title: "MacWall vs iWallpaper",
  headline: "MacWall vs iWallpaper",
  description:
    "MacWall vs iWallpaper — native design, catalog depth, and performance compared.",
  keywords: [
    "macwall vs iwallpaper",
    "iwallpaper alternative mac",
    "iwallpaper mac app",
    "apps like iwallpaper",
  ],
  sections: [
    {
      type: "p",
      text: "**iWallpaper** is a Mac App Store option with a searchable video library. **MacWall** feels more native to macOS design standards, offers community uploads, imports, and Lock Screen Pro — without App Store sandbox limitations on distribution.",
    },
    {
      type: "p",
      text: "For users who want the smoothest native experience and fair one-time Pro pricing, MacWall is the stronger pick.",
    },
  ],
  faq: [],
}

export const macwallVsWallspacePage: SeoContentPage = {
  slug: "macwall-vs-wallspace",
  pathname: "/alternatives/macwall-vs-wallspace",
  title: "MacWall vs Wallspace (2026 Comparison)",
  headline: "MacWall vs Wallspace",
  description:
    "Compare MacWall and Wallspace for Mac live wallpapers — catalog size, Lock Screen support, pricing, and battery impact.",
  keywords: [
    "macwall vs wallspace",
    "wallspace alternative",
    "wallspace mac app",
    "wallspace vs macwall",
    "apps like wallspace mac",
    "wallspace live wallpaper alternative",
  ],
  sections: [
    {
      type: "p",
      text: "**Wallspace** is a minimal Swift app focused on simplicity and low CPU usage. **MacWall** matches that native efficiency while adding a much deeper community catalog, search and filters, personal video imports on the free tier, and a Reel refund program that can make Pro effectively free.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: free desktop tier, $7.99 Pro one-time",
        "Wallspace: free tier, $8.99 Pro one-time",
        "Both: native Swift, hardware-accelerated 4K, multi-monitor, battery-aware pause",
        "MacWall: 9-category community catalog with search, filters, and likes",
        "MacWall: Lock Screen Pro on supported Sonoma/Sequoia builds — Wallspace needs macOS 26+",
        "MacWall: Reel refund — 50% back at 2k views, 100% at 20k views",
      ],
    },
    {
      type: "h2",
      text: "Which should you pick?",
    },
    {
      type: "p",
      text: "If you want the absolute minimum feature set, Wallspace is a fine pick. If you want catalog discovery, community uploads, imports, and broader Lock Screen support without a subscription, MacWall is the stronger daily driver.",
    },
  ],
  faq: [
    {
      question: "Is MacWall lighter than Wallspace?",
      answer:
        "Both are native Swift apps with hardware video decode. MacWall pauses on battery and in full screen automatically, so real-world impact stays minimal on MacBooks.",
    },
    {
      question: "Does MacWall require an account?",
      answer:
        "No account is needed to browse the catalog and set desktop wallpapers. Sign-in is only used for community features like uploads and likes.",
    },
  ],
}

export const macwallVsVividWallsPage: SeoContentPage = {
  slug: "macwall-vs-vivid-walls",
  pathname: "/alternatives/macwall-vs-vivid-walls",
  title: "MacWall vs Vivid Walls (2026 Comparison)",
  headline: "MacWall vs Vivid Walls",
  description:
    "MacWall vs Vivid Walls — video wallpapers vs Wallpaper Engine scene files on Mac. Pricing, performance, and which fits your setup.",
  keywords: [
    "macwall vs vivid walls",
    "vivid walls alternative",
    "vivid walls mac",
    "wallpaper engine scenes mac",
    "apps like vivid walls",
  ],
  sections: [
    {
      type: "p",
      text: "**Vivid Walls** specializes in running Wallpaper Engine .pkg/.scene files on macOS via a Vulkan-to-Metal renderer. **MacWall** focuses on what most people actually want daily: smooth native 4K video wallpapers with a curated catalog, free desktop tier, and menu bar controls.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: free desktop tier, $7.99 Pro one-time",
        "Vivid Walls: $9.99 one-time, aimed at existing Wallpaper Engine libraries",
        "MacWall: native AVFoundation video pipeline — no scene-engine overhead",
        "MacWall: community catalog, imports, Lock Screen Pro, Reel refund",
        "Vivid Walls: the pick if you own Steam Workshop scene files",
      ],
    },
    {
      type: "p",
      text: "Rule of thumb: own a Wallpaper Engine library on Steam? Try Vivid Walls. Want the best daily video wallpaper experience built for macOS? Download MacWall free.",
    },
  ],
  faq: [
    {
      question: "Can MacWall play Wallpaper Engine scene files?",
      answer:
        "No — MacWall plays video (MP4, MOV, GIF) natively for maximum smoothness and battery efficiency. Export scenes as MP4 to use them in MacWall.",
    },
  ],
}

export const livelyWallpaperMacPage: SeoContentPage = {
  slug: "lively-wallpaper-mac",
  pathname: "/alternatives/lively-wallpaper-mac",
  title: "Lively Wallpaper for Mac — The Native Alternative | MacWall",
  headline: "Lively Wallpaper for Mac",
  description:
    "Lively Wallpaper is Windows-only. MacWall is the free native macOS equivalent — live video wallpapers with hardware decode and menu bar controls.",
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
      text: "Searching for **Lively Wallpaper on Mac**? Lively is a popular free live wallpaper app — but it's Windows-only and has no macOS version. **MacWall** is the closest native equivalent: free desktop video wallpapers, your own MP4/MOV/GIF imports, and a curated community catalog.",
    },
    {
      type: "h2",
      text: "Why MacWall instead of Lively on Mac",
    },
    {
      type: "ul",
      items: [
        "Free desktop live wallpapers — like Lively, no subscription",
        "Native Swift + Metal app, built only for macOS",
        "Import the same video files you used in Lively",
        "Curated 4K catalog across Nature, Space, Anime, and more",
        "Pause on battery and full screen — MacBook-friendly",
        "Optional $7.99 Pro for Lock Screen live wallpaper",
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
        "Download MacWall free from macwall.app/download.",
        "Import the videos into your MacWall Library.",
        "Browse the catalog for fresh Mac-optimized 4K loops.",
      ],
    },
  ],
  faq: [
    {
      question: "Is there a Lively Wallpaper version for Mac?",
      answer:
        "No. Lively Wallpaper supports Windows only. MacWall is the free native macOS alternative for video live wallpapers.",
    },
    {
      question: "Is MacWall free like Lively?",
      answer:
        "Yes — desktop live wallpapers, catalog browsing, and video imports are free. MacWall Pro is an optional one-time upgrade for Lock Screen motion and exclusive content.",
    },
  ],
}

export function wallpaperCategoryPage(categoryName: string): SeoContentPage {
  const pathSlug =
    categoryName === "Video Games"
      ? "video-games"
      : categoryName === "Sci-fi"
        ? "sci-fi"
        : categoryName.toLowerCase()

  return {
    slug: pathSlug,
    pathname: `/wallpapers/${pathSlug}`,
    title: `${categoryName} Live Wallpapers for Mac | MacWall`,
    headline: `${categoryName} Live Wallpapers for Mac`,
    description: `Browse ${categoryName.toLowerCase()} motion wallpapers for macOS. Curated ${categoryName.toLowerCase()} video loops in MacWall — 4K, hardware decode, free download.`,
    keywords: [
      `${categoryName.toLowerCase()} wallpaper mac`,
      `${categoryName.toLowerCase()} live wallpaper macos`,
      `animated ${categoryName.toLowerCase()} desktop mac`,
    ],
    sections: [
      {
        type: "p",
        text: `Discover **${categoryName}** live wallpapers in MacWall's curated catalog. Every clip loops seamlessly with hardware decode on Apple Silicon — free to browse and set on your desktop.`,
      },
      {
        type: "h2",
        text: `Why ${categoryName} wallpapers on Mac`,
      },
      {
        type: "p",
        text: `${categoryName} motion backgrounds transform your Mac into a personalized space. MacWall's community uploads fresh ${categoryName.toLowerCase()} loops regularly — or import your own favorites.`,
      },
      {
        type: "h2",
        text: "Get started",
      },
      {
        type: "ol",
        items: [
          "Download MacWall free for macOS.",
          `Open Explore and filter by ${categoryName}.`,
          "Preview, set as wallpaper, control from the menu bar.",
        ],
      },
    ],
    faq: [
      {
        question: `Are ${categoryName} wallpapers free?`,
        answer:
          "Desktop playback is free. MacWall Pro unlocks Lock Screen motion and exclusive catalog lanes.",
      },
    ],
  }
}
