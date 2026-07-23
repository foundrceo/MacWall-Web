import {
  macwall,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSRequirementOrLater,
} from "@/lib/macwall-site"
import type { SeoContentPage } from "@/lib/content/types"

export const downloadPage: SeoContentPage = {
  slug: "download",
  pathname: "/download",
  title: "Download MacWall for Mac",
  headline: "Download MacWall for Mac",
  description:
    "Download MacWall for macOS. Native live motion wallpapers with hardware decode, menu bar controls, and a curated catalog. One-time $7.99.",
  keywords: [
    "macwall download",
    "download live wallpaper mac",
    "mac wallpaper app download",
    "macos wallpaper app",
  ],
  sections: [
    {
      type: "p",
      text: "**MacWall** is the native macOS app for live motion wallpapers. Download, install in seconds, and transform your desktop with cinematic video loops. One payment of $7.99 unlocks everything, with lifetime updates and no subscription.",
    },
    {
      type: "h2",
      text: "What you get",
    },
    {
      type: "ul",
      items: [
        "Curated cloud catalog across 9 categories",
        "Import your own MP4 and MOV clips",
        "Hardware-accelerated playback on Apple Silicon and Intel",
        "Menu bar control: pause, resume, stop, switch",
        "Multi-display support, synced or solo",
        "Music Sync gradients from Apple Music and Spotify",
        "Auto-pause on battery, full screen, and high CPU",
      ],
    },
    {
      type: "h2",
      text: "System requirements",
    },
    {
      type: "ul",
      items: [
        macwallMinimumMacOSRequirementOrLater,
        "Apple Silicon or Intel Mac",
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
        "Activate your license; it arrives by email right after checkout.",
      ],
    },
  ],
  faq: [
    {
      question: "How much does MacWall cost?",
      answer:
        `MacWall is a one-time $7.99 purchase (early bird, normally $9.99) with lifetime updates on up to 3 Macs per license (Pro Plus: 5 Macs). No subscription. Post a Reel with #macwall and earn up to 100% of it back.`,
    },
    {
      question: "Is MacWall safe to install?",
      answer:
        "MacWall is distributed from macwall.app. macOS may ask you to confirm the developer on first launch, this is normal for apps outside the Mac App Store.",
    },
  ],
}

export const liveWallpaperMacPage: SeoContentPage = {
  slug: "live-wallpaper-mac",
  pathname: "/live-wallpaper-mac",
  title: "Live Wallpaper for Mac: Native & Smooth | MacWall",
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
      text: "Your Mac desktop should move. **MacWall** is the native live wallpaper app built exclusively for macOS, not a port, not a web view, not a subscription trap. Video loops play behind your windows with GPU decode, intelligent pause, and menu bar control.",
    },
    {
      type: "h2",
      text: "Why MacWall is the best live wallpaper for Mac",
    },
    {
      type: "ul",
      items: [
        "**Native performance**: SwiftUI + AVFoundation hardware decode",
        "**Pay once, own it**: $7.99 one-time, never a monthly fee",
        "**Community catalog**: Nature, Space, Anime, and six more categories",
        "**Your clips**: import any compatible MP4 or MOV",
        "**Menu bar first**: pause, switch, and control without a window",
        `**Lock Screen Pro**: live Lock Screen and Screen Saver on ${macwallMinimumMacOSVersion}`,
      ],
    },
    {
      type: "h2",
      text: "Built for real Mac workflows",
    },
    {
      type: "p",
      text: "Pause on battery. Pause in full screen. One decoder per display. MacWall respects how you actually use a MacBook and a desk setup, beauty without compromise.",
    },
    {
      type: "h2",
      text: "Get started",
    },
    {
      type: "p",
      text: "Download at macwall.app/download and unlock everything with one $7.99 payment, Lock Screen included. Read our blog for guides, comparisons, and category picks.",
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
    `MacWall Pro brings live video to your Mac Lock Screen and Screen Saver on ${macwallMinimumMacOSVersion}, using Apple's own wallpaper system. One-time purchase, lifetime updates.`,
  keywords: [
    "lock screen live wallpaper mac",
    "animated lock screen macos",
    "mac lock screen video",
    "macos 26 tahoe lock screen wallpaper",
    "mac screen saver video",
  ],
  sections: [
    {
      type: "p",
      text: `Desktop motion is just the beginning. On **${macwallMinimumMacOSVersion}**, **MacWall Pro** extends live video wallpapers to your **Lock Screen and Screen Saver**, the screen you see dozens of times a day before you even log in. It plugs into Apple's native wallpaper system, so there are no extra installers or extensions.`,
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
      text: `${macwall.pro.price} ${macwall.pro.suffix}, ${macwall.pro.headline}. Up to 3 Macs per license (Pro Plus: 5). Make a Reel with ${macwall.reelRefundHashtag} to earn up to 100% back.`,
    },
  ],
  faq: [
    {
      question: "Which macOS versions support Lock Screen video?",
      answer:
        `Live Lock Screen and Screen Saver wallpapers require ${macwallMinimumMacOSVersion} or later, where Apple exposes the native wallpaper APIs MacWall uses.`,
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
        "vs Backdrop, lower Pro price, community uploads, Reel refund",
        "vs Wallpaper Engine, native Mac app, no Windows dependency",
        "vs Wallper, bigger community catalog and aggressive one-time pricing",
        "vs Wallspace, deeper catalog, imports, and Lock Screen Pro",
        "vs web-based tools. GPU decode, not Chromium overhead",
      ],
    },
    {
      type: "h2",
      text: "Try it on your Mac",
    },
    {
      type: "p",
      text: "Download MacWall and judge smoothness yourself. Check Activity Monitor. MacWall should stay lightweight while your desktop looks incredible.",
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
    "The best native Mac alternative to Wallpaper Engine: smooth video wallpapers, GPU hardware decode, a community catalog, and no Steam or Windows required.",
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
      text: "Wallpaper Engine has no official Mac app. **MacWall** is the native alternative for video live wallpapers, built for macOS with a growing community catalog. One-time $7.99, cheaper than Wallpaper Engine itself, with lifetime updates.",
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
        "Browse the catalog for fresh 4K drops, then control everything from the menu bar.",
      ],
    },
  ],
  faq: [],
}

export const macwallVsBackdropPage: SeoContentPage = {
  slug: "macwall-vs-backdrop",
  pathname: "/alternatives/macwall-vs-backdrop",
  title: "Backdrop Alternative for Mac: MacWall",
  headline: "The Backdrop Alternative for Mac",
  description:
    "Looking for a Backdrop alternative? MacWall costs $2 less, covers up to 3 Macs per license (Pro Plus: 5), and adds community uploads and a Reel refund. Honest side-by-side.",
  keywords: [
    "backdrop alternative mac",
    "backdrop alternative",
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
        "MacWall: $7.99 one-time, everything included",
        "Backdrop: $9.99 one-time",
        `Both: 4K video, multi-monitor, Lock Screen on ${macwallMinimumMacOSVersion}`,
        "MacWall: personal video imports + community catalog",
        "MacWall: Reel refund, earn up to 100% back",
        "Backdrop: in-app backdrop editor",
      ],
    },
  ],
  faq: [],
}

export const macwallVsWallperPage: SeoContentPage = {
  slug: "macwall-vs-wallper",
  pathname: "/alternatives/macwall-vs-wallper",
  title: "Wallper Alternative for Mac: MacWall",
  headline: "The Wallper Alternative for Mac",
  description:
    `Looking for a Wallper alternative? MacWall costs less, has a bigger community catalog, and brings live Lock Screen wallpapers to ${macwallMinimumMacOSVersion}.`,
  keywords: [
    "wallper alternative",
    "wallper alternative mac",
    "wallper app alternative mac",
    "apps like wallper mac",
    "apps like wallper",
    "wallper free alternative",
  ],
  sections: [
    {
      type: "p",
      text: "**Wallper** offers SwiftUI playback with a curated library of around 700 loops at $9.99. **MacWall** costs less at $7.99 one-time, adds a larger community catalog, a Reel refund program that can pay the whole license back, and a menu bar-first workflow.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: $7.99 one-time, everything included, lifetime updates",
        "Wallper: $9.99 one-time license",
        "Both: 4K video, Apple Silicon optimized, multi-monitor",
        "MacWall: community uploads + import your own MP4/MOV",
        "MacWall: Reel refund, earn up to 100% of your purchase back",
        "MacWall: one license per Mac",
      ],
    },
    {
      type: "p",
      text: "Same one-time pricing model, but MacWall costs $2 less, covers up to 3 Macs per license (Pro Plus: 5), and is the only one that can refund itself through a Reel. For daily menu bar control and multi-category discovery, MacWall is the stronger buy.",
    },
  ],
  faq: [
    {
      question: "Is MacWall cheaper than Wallper?",
      answer:
        "Yes. MacWall is $7.99 one-time (early bird, normally $9.99) versus Wallper's $9.99, with up to 3 Macs per license (Pro Plus: 5). Post a Reel with #macwall and you can earn the full price back.",
    },
    {
      question: "Which is better for MacBook battery life?",
      answer:
        "Both use hardware decode. MacWall additionally pauses automatically on battery and in full screen, keeping playback off when it doesn't matter.",
    },
  ],
}

export const macwallVsWallspacePage: SeoContentPage = {
  slug: "macwall-vs-wallspace",
  pathname: "/alternatives/macwall-vs-wallspace",
  title: "Wallspace Alternative for Mac: MacWall",
  headline: "The Wallspace Alternative for Mac",
  description:
    `Looking for a Wallspace alternative? MacWall costs less, adds a deeper catalog with community uploads, and brings live Lock Screen wallpapers to ${macwallMinimumMacOSVersion}.`,
  keywords: [
    "wallspace alternative",
    "wallspace alternative mac",
    "wallspace mac app",
    "wallspace app alternative",
    "apps like wallspace mac",
    "wallspace live wallpaper alternative",
  ],
  sections: [
    {
      type: "p",
      text: "**Wallspace** is a minimal Swift app focused on simplicity and low CPU usage. **MacWall** matches that native efficiency while adding a much deeper community catalog, search and filters, personal video imports, and a Reel refund program that can make the purchase effectively free.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: $7.99 one-time, everything included, up to 3 Macs per license (Pro Plus: 5)",
        "Wallspace: $8.99 Pro one-time",
        "Both: native Swift, hardware-accelerated 4K, multi-monitor, battery-aware pause",
        "MacWall: 9-category community catalog with search, filters, and likes",
        `Both: live Lock Screen on ${macwallMinimumMacOSVersion}. MacWall adds Screen Saver video too`,
        "MacWall: Reel refund. 50% back at 2k views, 100% at 20k views",
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
      text: "Searching for **Lively Wallpaper on Mac**? Lively is a popular live wallpaper app, but it's Windows-only and has no macOS version. **MacWall** is the closest native equivalent: desktop video wallpapers, your own MP4 and MOV imports, and a curated community catalog, all for a one-time $7.99.",
    },
    {
      type: "h2",
      text: "Why MacWall instead of Lively on Mac",
    },
    {
      type: "ul",
      items: [
        "One-time $7.99, no subscription, lifetime updates",
        "Native Swift app, built only for macOS",
        "Import the same video files you used in Lively",
        "Curated 4K catalog across Nature, Space, Anime, and more",
        "Pause on battery, full screen, and high CPU. MacBook-friendly",
        `Live Lock Screen and Screen Saver on ${macwallMinimumMacOSVersion}`,
        "Post a Reel with #macwall and earn up to 100% back",
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
        "MacWall is a one-time $7.99 purchase (early bird, normally $9.99) with lifetime updates on up to 3 Macs per license (Pro Plus: 5 Macs). No subscription, and a Reel with #macwall can earn the full price back.",
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
    description: `Browse ${categoryName.toLowerCase()} live wallpapers for Mac: curated ${categoryName.toLowerCase()} motion video loops in MacWall, 4K with GPU hardware decode and a one-time purchase, no subscription.`,
    keywords: [
      `${categoryName.toLowerCase()} wallpaper mac`,
      `${categoryName.toLowerCase()} live wallpaper macos`,
      `animated ${categoryName.toLowerCase()} desktop mac`,
    ],
    sections: [
      {
        type: "p",
        text: `Discover **${categoryName}** live wallpapers in MacWall's curated catalog. Every clip loops seamlessly with hardware decode on Apple Silicon, ready to set on your desktop in one click.`,
      },
      {
        type: "h2",
        text: `Why ${categoryName} wallpapers on Mac`,
      },
      {
        type: "p",
        text: `${categoryName} motion backgrounds transform your Mac into a personalized space. MacWall's community uploads fresh ${categoryName.toLowerCase()} loops regularly, or import your own favorites.`,
      },
      {
        type: "h2",
        text: `${categoryName} on every display, battery-friendly`,
      },
      {
        type: "p",
        text: `Run ${categoryName.toLowerCase()} loops in crisp 4K with hardware-accelerated decode on Apple Silicon and Intel Macs. MacWall pauses automatically on battery, full screen, and high CPU, so your ${categoryName.toLowerCase()} desktop looks cinematic without draining your MacBook. Set a different ${categoryName.toLowerCase()} wallpaper on each monitor, and unlock live Lock Screen motion with MacWall Pro on ${macwallMinimumMacOSVersion}.`,
      },
      {
        type: "h2",
        text: "Get started",
      },
      {
        type: "ol",
        items: [
          "Download MacWall for macOS.",
          `Open Explore and filter by ${categoryName}.`,
          "Preview, set as wallpaper, control from the menu bar.",
        ],
      },
      {
        type: "p",
        text: `Want the full picture first? See the [best live wallpaper app for Mac](/best-live-wallpaper-mac) and our [live wallpaper for Mac](/live-wallpaper-mac) guide, or read the [MacWall blog](/blog) for ${categoryName.toLowerCase()} tips and macOS how-tos.`,
      },
    ],
    faq: [
      {
        question: `How do I get ${categoryName} live wallpapers on my Mac?`,
        answer:
          "Download MacWall, unlock it with a one-time $7.99 license, and the full catalog including Lock Screen wallpapers is yours, with lifetime updates and no subscription.",
      },
    ],
  }
}
