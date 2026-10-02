import {
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSRequirementOrLater,
} from "@/lib/macwall-site"
import type { SeoContentPage } from "@/lib/content/types"

export const downloadPage: SeoContentPage = {
  slug: "download",
  pathname: "/download",
  title: "Download MacWall for Mac",
  headline: "Download MacWall for Mac",
  description:
    "Download MacWall for macOS. Native live wallpapers with hardware decode, menu bar controls, and a hand-picked catalog. Free to try, then $12.99 once.",
  keywords: [
    "macwall download",
    "download live wallpaper mac",
    "mac wallpaper app download",
    "macos wallpaper app",
  ],
  sections: [
    {
      type: "p",
      text: "**MacWall** is the native macOS app for live wallpapers. Download it, install in seconds, and your desktop becomes a cinematic video loop. One payment of $12.99 unlocks everything, with free updates forever and no subscription.",
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
        "Lock Screen & Screen Saver video: macOS 26 (Tahoe) or later",
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
        `MacWall is a one-time $12.99 payment with free updates forever on up to 3 Macs per license (Pro+: 5 Macs). No subscription. Post a Reel with #macwall and you can get up to 100% of it refunded.`,
    },
    {
      question: "Is MacWall safe to install?",
      answer:
        "MacWall is distributed from macwall.app. macOS may ask you to confirm the developer on first launch, this is normal for apps outside the Mac App Store.",
    },
  ],
}

export const bestLiveWallpaperMacPage: SeoContentPage = {
  slug: "best-live-wallpaper-mac",
  pathname: "/best-live-wallpaper-mac",
  title: "Best Live Wallpaper for Mac (2026) | MacWall",
  headline: "Best Live Wallpaper for Mac in 2026",
  description:
    "The best live wallpaper app for Mac in 2026, compared: MacWall vs Backdrop, Wallspace, and Wallpaper Engine on performance, battery, catalog, Lock Screen, and price.",
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
      text: "**The best live wallpaper app for Mac in 2026 is a native Swift app that decodes video in hardware, pauses on battery, and supports the Lock Screen on macOS 26.** MacWall, Backdrop, and Wallspace all qualify; MacWall adds an 800+ wallpaper catalog, your own video imports, and a one-time $12.99 price with no subscription.",
    },
    {
      type: "h2",
      text: "What to look for in a Mac live wallpaper app",
    },
    {
      type: "ul",
      items: [
        "**Native, not web-based**: Swift apps use Apple's media engine; Electron or browser wallpapers burn CPU on every frame.",
        "**Battery rules**: automatic pause on battery, in full-screen apps, and under high CPU load.",
        "**Lock Screen support**: live Lock Screen and Screen Saver video requires macOS 26 (Tahoe) APIs.",
        "**A catalog you actually like**: hand-picked 4K loops, plus imports for your own MP4 and MOV files.",
        "**Fair pricing**: a one-time license beats a yearly subscription for something that sits on your desktop for years.",
      ],
    },
    {
      type: "h2",
      text: "MacWall vs the market",
    },
    {
      type: "ul",
      items: [
        "vs Backdrop: cheaper Pro, community uploads, Reel refund",
        "vs Wallpaper Engine, native Mac app, no Windows dependency",
        "vs Wallspace, deeper catalog, imports, and Lock Screen Pro",
        "vs web-based tools. GPU decode, not Chromium overhead",
      ],
    },
    {
      type: "h2",
      text: "Experience it on your Mac",
    },
    {
      type: "p",
      text: "Download MacWall and judge smoothness yourself. Check Activity Monitor. MacWall should stay lightweight while your desktop looks outstanding. Start with a [collection](/wallpapers/collections) such as [rain](/wallpapers/collections/rain), [Gojo](/wallpapers/collections/gojo), or [BMW](/wallpapers/collections/bmw).",
    },
  ],
  faq: [
    {
      question: "What is the best live wallpaper app for Mac?",
      answer:
        "MacWall is the best all-round live wallpaper app for Mac in 2026: native Swift, hardware video decode, auto-pause on battery, live Lock Screen on macOS 26, 800+ curated 4K loops, and a one-time $12.99 price. Backdrop and Wallspace are good native alternatives.",
    },
    {
      question: "Is there a free live wallpaper app for Mac?",
      answer:
        "MacWall is free to download with a 24-hour full-access trial and no account. After that, the full catalog and imports stay unlocked with a one-time Pro license. Open-source projects on GitHub also exist but have no catalog and fewer battery safeguards.",
    },
    {
      question: "Do live wallpapers slow down a Mac?",
      answer:
        "A native app that decodes video on Apple's media engine uses very little CPU, and MacWall pauses playback on battery, in full-screen apps, and under high load. Web-based wallpaper tools are the ones that cost real performance.",
    },
  ],
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
      text: "**No, Wallpaper Engine does not work on Mac.** It is a Windows app sold on Steam, and there is no macOS version. **MacWall** is the native Mac alternative for live video wallpapers: built in Swift for macOS, hardware-decoded, with a community catalog of 800+ curated 4K loops. $12.99 once, with free updates forever.",
    },
    {
      type: "h2",
      text: "Wallpaper Engine vs MacWall at a glance",
    },
    {
      type: "ul",
      items: [
        "**Platform**: Wallpaper Engine is Windows only; MacWall is macOS only (Apple Silicon and Intel, macOS 15+).",
        "**Content**: Wallpaper Engine has interactive scenes and the Steam Workshop; MacWall focuses on smooth 4K video loops plus your own MP4 and MOV imports.",
        "**Lock Screen**: MacWall Pro plays live wallpapers on the Mac Lock Screen and Screen Saver on macOS 26 (Tahoe).",
        "**Battery**: MacWall pauses on battery, in full-screen apps, and under high CPU, built for MacBooks.",
      ],
    },
    {
      type: "h2",
      text: "Migration tips",
    },
    {
      type: "ol",
      items: [
        "Gather MP4 or MOV loops you made yourself or have the rights to use.",
        "Import them into MacWall Library.",
        "Browse the catalog for fresh 4K drops, then control everything from the menu bar.",
      ],
    },
  ],
  faq: [
    {
      question: "Does Wallpaper Engine work on Mac?",
      answer:
        "No. Wallpaper Engine is Windows-only and has no macOS version on Steam. Running it through Wine or a virtual machine cannot draw on the real Mac desktop. A native app such as MacWall is the way to get live wallpapers on a Mac.",
    },
    {
      question: "Is there a Wallpaper Engine for MacBook?",
      answer:
        "Not officially. MacWall gives MacBook Air and MacBook Pro users the same idea natively: animated video wallpapers, a large catalog, imports, and battery-aware playback.",
    },
    {
      question: "Can I use my Wallpaper Engine wallpapers on Mac?",
      answer:
        "No. Wallpaper Engine content is licensed for Wallpaper Engine on Windows, and scene and web wallpapers only run there. MacWall imports videos you made or have the rights to use.",
    },
  ],
}

export const macwallVsBackdropPage: SeoContentPage = {
  slug: "macwall-vs-backdrop",
  pathname: "/alternatives/macwall-vs-backdrop",
  title: "Backdrop Alternative for Mac: MacWall",
  headline: "The Backdrop Alternative for Mac",
  description:
    "Looking for a Backdrop alternative? MacWall is also a one-time payment, covers up to 3 Macs per license (Pro+: 5), and adds community uploads and a Reel refund. Honest side-by-side.",
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
      text: "Two good native apps. **MacWall** is $12.99 Pro, with community uploads and the Reel refund. **Backdrop** wins on its built-in editor and a longer-established library.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: $12.99 once, everything included",
        "Backdrop: $29.99 lifetime, or $14.99/year (listed price, September 2026)",
        `Both: 4K video, multi-monitor, Lock Screen on ${macwallLockScreenMacOSVersion}`,
        "MacWall: personalized video imports + community catalog",
        "MacWall: post a Reel and get up to 100% refunded",
        "Backdrop: in-app backdrop editor",
      ],
    },
  ],
  faq: [],
}

export const macwallVsWallspacePage: SeoContentPage = {
  slug: "macwall-vs-wallspace",
  pathname: "/alternatives/macwall-vs-wallspace",
  title: "Wallspace Alternative for Mac: MacWall",
  headline: "The Wallspace Alternative for Mac",
  description:
    `Looking for a Wallspace alternative? MacWall adds a deeper catalog with community uploads and brings live Lock Screen wallpapers to ${macwallLockScreenMacOSVersion}.`,
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
      text: "**Wallspace** is a minimal Swift app focused on a small footprint and low CPU usage. **MacWall** matches that native efficiency while adding a much deeper community catalog, search and filters, your own video imports, and a Reel refund that can make it effectively free.",
    },
    {
      type: "h2",
      text: "Side by side",
    },
    {
      type: "ul",
      items: [
        "MacWall: $12.99 one-time, everything included, up to 3 Macs per license (Pro+: 5)",
        "Wallspace: $12.99 Pro one-time (listed price, September 2026)",
        "Both: native Swift, hardware-accelerated 4K, multi-monitor, battery-aware pause",
        "MacWall: 9-category community catalog with search, filters, and engagement",
        `Both: live Lock Screen on ${macwallLockScreenMacOSVersion}. MacWall adds Screen Saver video too`,
        "MacWall: post a Reel and get paid back, 50% at 2k views and 100% at 20k views",
      ],
    },
    {
      type: "h2",
      text: "Which should you pick?",
    },
    {
      type: "p",
      text: "If you want the absolute essential benefit set, Wallspace is a fine pick. If you want catalog discovery, community uploads, imports, and broader Lock Screen support without a subscription, MacWall is the more powerful daily driver.",
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
        "No account is needed to browse the catalog and set desktop wallpapers. Sign-in is only used for community benefits like uploads and engagement.",
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
      text: "Searching for **Lively Wallpaper on Mac**? Lively is a popular live wallpaper app, but it's Windows-only and has no macOS version. **MacWall** is the closest native equivalent: desktop video wallpapers, your own MP4 and MOV imports, and a hand-picked community catalog, all for $12.99, paid once.",
    },
    {
      type: "h2",
      text: "Why MacWall instead of Lively on Mac",
    },
    {
      type: "ul",
      items: [
        "$12.99 once, no subscription, free updates forever",
        "Native Swift app, built only for macOS",
        "Import the same video files you used in Lively",
        "Curated 4K catalog across Anime, Nature, Cars, Gaming, and more",
        "Pause on battery, full screen, and high CPU. MacBook-friendly",
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
        "MacWall is a one-time $12.99 payment with free updates forever on up to 3 Macs per license (Pro+: 5 Macs). No subscription, and a Reel with #macwall can get you the whole thing refunded.",
    },
  ],
}

export function wallpaperCategoryPage(categoryName: string): SeoContentPage {
  const pathSlug =
    categoryName === "Others"
      ? "others"
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
        text: `Run ${categoryName.toLowerCase()} loops in crisp 4K with hardware-accelerated decode on Apple Silicon and Intel Macs. MacWall pauses automatically on battery, full screen, and high CPU, so your ${categoryName.toLowerCase()} desktop looks cinematic without draining your MacBook. Set a different ${categoryName.toLowerCase()} wallpaper on each monitor, and unlock live Lock Screen motion with MacWall Pro on ${macwallLockScreenMacOSVersion}.`,
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
        text: `Want the full picture first? See the [best live wallpaper app for Mac](/best-live-wallpaper-mac) and our [how to set live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac) guide, or read the [MacWall blog](/blog) for ${categoryName.toLowerCase()} tips and macOS how-tos.`,
      },
    ],
    faq: [
      {
        question: `How do I get ${categoryName} live wallpapers on my Mac?`,
        answer:
          "Download MacWall, unlock it with a one-time $12.99 payment, and the whole catalog including Lock Screen wallpapers is yours, with free updates forever and no subscription.",
      },
    ],
  }
}
