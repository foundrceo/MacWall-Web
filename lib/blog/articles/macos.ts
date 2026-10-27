import { macwall, macwallCatalog } from "@/lib/macwall-site"
import type { BlogArticle } from "@/lib/content/types"

export const macosArticles: BlogArticle[] = [
  {
    slug: "macos-sonoma-live-wallpaper",
    pathname: "/blog/macos-sonoma-live-wallpaper",
    title: "Live Wallpapers on macOS Sonoma: What Works",
    headline: "Live Wallpapers on macOS Sonoma: What Works",
    description:
      "Can you get live wallpapers on macOS Sonoma? Apple's Aerial wallpapers move, but MacWall needs macOS 15 Sequoia or later. Check your version first.",
    excerpt:
      "MacWall does not run on Sonoma. Here is what Sonoma can do on its own, and how to check whether your Mac can upgrade.",
    category: "macos",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    updatedAt: "2026-10-16",
    keywords: [
      "macos sonoma live wallpaper",
      "sonoma animated wallpaper",
      "live wallpaper sonoma mac",
    ],
    sections: [
      {
        type: "p",
        text: "**Short answer: MacWall does not run on macOS Sonoma (macOS 14).** It needs **macOS 15 Sequoia or later** for desktop live wallpapers, and **macOS 26 Tahoe or later** for a live Lock Screen and Screen Saver. If your Mac is on Sonoma, update macOS first, or use Apple's built-in Aerial wallpapers, which Sonoma already animates.",
      },
      { type: "h2", text: "What Sonoma can do without any app" },
      {
        type: "ul",
        items: [
          "**Aerial wallpapers**: Sonoma added slow-motion aerial videos (landscapes, cities, underwater) that play as your screen saver and then settle into the desktop wallpaper when you log in. Pick one in System Settings → Wallpaper.",
          "**Dynamic wallpapers**: the HEIC wallpapers that shift with the time of day are still there. They change a few times a day; they are not continuous video. See [dynamic vs live wallpaper](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).",
          "**No custom video**: Sonoma cannot use your own MP4 or MOV as a wallpaper. That needs a third-party app.",
        ],
      },
      { type: "h2", text: "Check whether your Mac can move past Sonoma" },
      {
        type: "ol",
        items: [
          "Open Apple menu → About This Mac to see your macOS version.",
          "Open System Settings → General → Software Update. If macOS Sequoia (15) or a later version is offered, your Mac supports it.",
          "Back up with Time Machine, then update.",
          "After updating, [download MacWall](/download): every download starts with a free 24-hour trial.",
        ],
      },
      { type: "h2", text: "If your Mac cannot update" },
      {
        type: "p",
        text: "Some older Macs stop at Sonoma. On those, stay with Apple's Aerial and dynamic wallpapers. Third-party live wallpaper apps also set their own minimum macOS version, so check each app's requirements before you buy; MacWall's are listed on the [download page](/download).",
      },
    ],
    faq: [
      {
        question: "Does MacWall work on macOS Sonoma?",
        answer:
          "No. MacWall needs macOS 15 Sequoia or later for desktop live wallpapers, and macOS 26 Tahoe or later for the live Lock Screen and Screen Saver.",
      },
      {
        question: "Can I set a video as my wallpaper on Sonoma?",
        answer:
          "Not with built-in settings. Sonoma animates Apple's own Aerial wallpapers, but a custom MP4 or MOV needs a third-party app that supports Sonoma.",
      },
    ],
  },
  {
    slug: "macos-sequoia-dynamic-wallpaper",
    pathname: "/blog/macos-sequoia-dynamic-wallpaper",
    title: "Live & Dynamic Wallpapers on macOS Sequoia",
    headline: "Live Wallpapers on macOS Sequoia",
    description:
      "MacWall runs on macOS 15 Sequoia: 4K video wallpapers on the desktop next to Apple's Dynamic Wallpapers, with a one-time Pro license and no subscription.",
    excerpt:
      "What MacWall does on macOS Sequoia, and which features need macOS 26 or later.",
    category: "macos",
    readMinutes: 5,
    publishedAt: "2026-07-13",
    keywords: [
      "macos sequoia wallpaper",
      "sequoia live wallpaper",
      "dynamic wallpaper sequoia",
    ],
    sections: [
      {
        type: "p",
        text: "**macOS Sequoia (macOS 15) is the minimum version for MacWall's desktop live wallpapers.** MacWall adds full-motion video next to Sequoia's built-in Dynamic Wallpapers. Live Lock Screen and Screen Saver video needs macOS 26 (Tahoe) or later, so on Sequoia MacWall plays on the desktop only.",
      },
      {
        type: "h2",
        text: "What MacWall does on Sequoia",
      },
      {
        type: "ul",
        items: [
          "Desktop live wallpapers with hardware video decoding on Apple silicon and Intel Macs",
          `${macwallCatalog.liveCountLabel} 4K catalog loops, plus your own MP4 and MOV files with Pro`,
          "Pauses behind full-screen apps, and optionally in Low Power Mode or when the Mac is busy",
          `A one-time ${macwall.pro.price} Pro license instead of a subscription`,
        ],
      },
      {
        type: "h2",
        text: "Upgrade path",
      },
      {
        type: "p",
        text: "Apple lists macOS 27 Golden Gate (27.2) as the current version and 15.8.2 as the latest Sequoia release, per [Apple Support](https://support.apple.com/en-us/109033). If your Mac can move to macOS 26 or later, MacWall Pro adds live Lock Screen and Screen Saver video. Pro licenses include lifetime updates.",
      },
    ],
  },
  {
    slug: "live-wallpaper-macbook-pro",
    pathname: "/blog/live-wallpaper-macbook-pro",
    title: "Live Wallpapers for MacBook Pro (M-Series)",
    headline: "Live Wallpapers for MacBook Pro",
    description:
      "A MacBook Pro setup guide for 4K motion wallpapers: external displays, battery tips, per-monitor loops, and recommended MacWall settings for M-series.",
    excerpt: "Settings for hardware-decoded live wallpapers on a MacBook Pro.",
    category: "macos",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    keywords: [
      "live wallpaper macbook pro",
      "macbook pro animated desktop",
      "m3 wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "MacBook Pro suits live wallpapers well: high-resolution panels (3024 × 1964 on the 14-inch and 3456 × 2234 on the 16-inch, per Apple), M-series media engines, and support for several external displays. **MacWall** uses hardware decoding and per-display playback on all of them. Sizes for every model are in [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
      {
        type: "h2",
        text: "Recommended MacBook Pro settings",
      },
      {
        type: "ul",
        items: [
          "Turn on pause-on-battery and lower-quality-on-battery for mobile use",
          "Use 4K catalog loops on the built-in display",
          "Assign a separate wallpaper to each external monitor",
          "Turn on Lock Screen motion on supported macOS versions",
        ],
      },
    ],
  },
  {
    slug: "live-wallpaper-macbook-air",
    pathname: "/blog/live-wallpaper-macbook-air",
    title: "Live Wallpapers for MacBook Air",
    headline: "Live Wallpapers for MacBook Air",
    description:
      "Light, efficient live motion wallpapers for MacBook Air: battery-smart defaults, 1440p to 4K guidance, and quiet hardware-decoded playback on M-series.",
    excerpt: "Live wallpapers on MacBook Air with battery-friendly settings.",
    category: "macos",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    keywords: [
      "live wallpaper macbook air",
      "macbook air animated wallpaper",
      "m2 air wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "MacBook Air owners care about weight, silence, and battery. **MacWall** respects all three: hardware decode on M1/M2/M3 Air chips, an optional Low Power Mode pause, and calm catalog loops that look great on 13-inch and 15-inch panels.",
      },
      {
        type: "h2",
        text: "Air-optimized tips",
      },
      {
        type: "ul",
        items: [
          "Turn on pause-on-battery and lower-quality-on-battery (both off by default)",
          "Prefer 2560×1440 loops on 13-inch Air for best efficiency",
          "Use menu bar pause before long unplugged work sessions",
          "Free download, no subscription weighing down your wallet",
        ],
      },
    ],
  },
  {
    slug: "macos-27-beta-live-wallpaper-not-working",
    pathname: "/blog/macos-27-beta-live-wallpaper-not-working",
    title: "macOS 27 Beta Broke Live Wallpapers? The Fix",
    headline: "macOS 27 Beta Broke Live Wallpapers: The Fix",
    description:
      "Lock Screen or Screen Saver video stopped after the macOS 27 beta? Why it happens, how MacWall handles macOS 27, and how to restore Apple's defaults.",
    excerpt:
      "Why Lock Screen video can stop on macOS 27, and how to get it back with MacWall.",
    category: "macos",
    readMinutes: 6,
    publishedAt: "2026-07-15",
    keywords: [
      "live wallpaper not working macos 27",
      "macos 27 beta wallpaper broken",
      "macos 27 lock screen wallpaper",
      "macos 27 screen saver video",
      "macos 27 beta live wallpaper fix",
      "wallpaper app macos 27",
    ],
    sections: [
      {
        type: "p",
        text: "Installed the new **macOS 27 beta** and noticed your live Lock Screen or Screen Saver suddenly shows Apple's defaults instead of your video? The beta changed system wallpaper behavior, and Lock Screen features built only for the macOS 26 behavior can stop working. macOS 27 Golden Gate has since been released (27.2 is the latest version Apple lists), and it runs only on Apple silicon Macs.",
      },
      { type: "h2", text: "What changed in macOS 27" },
      {
        type: "p",
        text: "Apple regularly reworks system internals between major releases, and the macOS 27 beta is no exception. Lock Screen and Screen Saver wallpapers that worked on macOS 26 (Tahoe) could stop playing without an error. In apps built only for the macOS 26 behavior, the video does not appear.",
      },
      { type: "h2", text: "How MacWall handles macOS 27" },
      {
        type: "p",
        text: "**MacWall** added dedicated macOS 27 support, so **live Lock Screen and Screen Saver video keeps working through Apple's wallpaper system on macOS 27**. Switching back and forth is safe, and your original system wallpaper is kept.",
      },
      {
        type: "h2",
        text: "How to get live Lock Screen wallpaper on macOS 27 beta",
      },
      {
        type: "ol",
        items: [
          "Download MacWall from macwall.app/download.",
          "Pick any wallpaper from the catalog or import your own MP4/MOV.",
          "Open **Settings** > **Lock Screen** and enable **Live Lock Screen & Screen Saver** (MacWall Pro, or during the free 24-hour trial).",
          "Lock your Mac. The video plays on the Lock Screen.",
        ],
      },
      { type: "h2", text: "If your system wallpaper got stuck" },
      {
        type: "p",
        text: "Switched between apps and now the Lock Screen shows the wrong wallpaper? MacWall includes a one-click repair tool in Settings that cleanly restores Apple's default Lock Screen and Screen Saver. No Terminal, no reinstall.",
      },
    ],
  },
  {
    slug: "macos-27-lock-screen-live-wallpaper",
    pathname: "/blog/macos-27-lock-screen-live-wallpaper",
    title: "macOS 27 Lock Screen Live Wallpaper Guide",
    headline: "Lock Screen Live Wallpaper on macOS 27",
    description:
      "Set live video on the macOS 27 Lock Screen and Screen Saver with MacWall Pro: requirements, setup steps, and how to restore Apple's defaults.",
    excerpt:
      "Step by step: video on the macOS 27 Lock Screen and Screen Saver with MacWall Pro.",
    category: "macos",
    readMinutes: 5,
    publishedAt: "2026-07-15",
    keywords: [
      "macos 27 lock screen live wallpaper",
      "macos 27 live wallpaper",
      "macos 27 screen saver wallpaper",
      "lock screen video wallpaper macos 27",
      "macos 27 wallpaper app",
    ],
    sections: [
      {
        type: "p",
        text: "macOS 27 Golden Gate ships with Apple's aerial wallpapers, which animate as you lock or unlock your Mac. Out of the box you are limited to Apple's footage. **MacWall Pro** puts **your own video, or any catalog loop,** on the macOS 27 Lock Screen and Screen Saver through Apple's wallpaper system.",
      },
      { type: "h2", text: "What you get" },
      {
        type: "ul",
        items: [
          "Any catalog wallpaper or personal MP4/MOV on your Lock Screen",
          "The same video as your Screen Saver, one integration covers both",
          "True native playback, not an overlay hack",
          "Automatic format conversion when a clip needs it, hardware-accelerated",
          "One-click restore of Apple's defaults anytime",
        ],
      },
      { type: "h2", text: "Setup" },
      {
        type: "ol",
        items: [
          "Download MacWall and pick a wallpaper (or import your own).",
          `Activate your one-time ${macwall.pro.price} license (or use the free 24-hour trial), which includes Lock Screen.`,
          "In **Settings** > **Lock Screen**, enable **Live Lock Screen & Screen Saver**.",
          "Lock your Mac. The video plays on the Lock Screen.",
        ],
      },
      { type: "h2", text: "Requirements" },
      {
        type: "ul",
        items: [
          "Live Lock Screen & Screen Saver: macOS 26 (Tahoe) or later, including macOS 27",
          "Desktop live wallpapers: macOS 15 Sequoia and later",
          "MacWall runs on Apple silicon and Intel Macs. macOS 27 itself runs only on Apple silicon Macs, per [Apple's compatibility list](https://support.apple.com/en-us/127255)",
        ],
      },
      { type: "h2", text: "Why Lock Screen video can break on a new macOS" },
      {
        type: "p",
        text: "Apple's macOS 27 beta changed system wallpaper behavior, which broke Lock Screen video in apps built only for the macOS 26 behavior. MacWall added dedicated macOS 27 support and includes a one-click restore of Apple's defaults. If Lock Screen video stopped after an update, see [macOS 27 beta broke live wallpapers](/blog/macos-27-beta-live-wallpaper-not-working).",
      },
    ],
  },
  {
    slug: "macos-tahoe-wallpapers",
    pathname: "/blog/macos-tahoe-wallpapers",
    title: "macOS Tahoe Wallpapers: Default, Dynamic and Live",
    headline: "macOS Tahoe Wallpapers: Default, Dynamic, and Live",
    description:
      "Where to find macOS Tahoe (macOS 26) wallpapers, how Dynamic and Aerial wallpapers work there, and how to add moving video to the desktop and Lock Screen.",
    excerpt:
      "Everything about wallpapers on macOS 26 Tahoe, from Apple's defaults to live Lock Screen video.",
    category: "macos",
    readMinutes: 5,
    publishedAt: "2026-09-28",
    keywords: [
      "macos tahoe wallpaper",
      "macos 26 wallpaper",
      "macos tahoe wallpapers download",
      "macos tahoe live wallpaper",
      "macos tahoe dynamic wallpaper",
      "macos tahoe lock screen wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "**macOS Tahoe (macOS 26) wallpapers live in System Settings > Wallpaper, where Apple's new Tahoe designs sit alongside Dynamic Desktops, Aerial landscapes, and your own photos.** Tahoe is also the first macOS version that lets third-party apps put a moving video on the Lock Screen and Screen Saver, which is what makes live Lock Screen wallpapers possible on a Mac. Apple's current version is macOS 27 Golden Gate, whose Wallpaper settings add a Mac category to the same list.",
      },
      { type: "h2", text: "Where to find the macOS Tahoe wallpapers" },
      {
        type: "ol",
        items: [
          "Open **System Settings** from the Apple menu.",
          "Click **Wallpaper** in the sidebar.",
          "Scroll through Apple's categories: Dynamic Wallpapers, Your Photos, the Landscape, Cityscape, Underwater, and Earth aerials, Shuffle Aerials, Pictures, and Colors.",
          "Click a thumbnail to apply it. Aerial wallpapers download the first time you choose them.",
        ],
      },
      {
        type: "p",
        text: "The still image files are stored in **/System/Library/Desktop Pictures**. Aerial wallpapers are downloaded on demand into a system cache rather than shipped with macOS, so they only appear on disk after you select them.",
      },
      {
        type: "h2",
        text: "Dynamic, Aerial, and live: what is the difference?",
      },
      {
        type: "ul",
        items: [
          "**Dynamic Desktop**: a set of still images that swap with the time of day or your Light and Dark appearance. No motion.",
          "**Aerial wallpapers**: slow-motion landscape footage that plays on the Lock Screen and as the screen saver, then settles to a still frame on the desktop.",
          "**Live wallpaper**: a video loop that keeps playing on the desktop behind your windows. macOS has no built-in option for this; apps like [MacWall](/download) add it.",
        ],
      },
      {
        type: "p",
        text: "The longer explanation is in [dynamic wallpaper vs live wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).",
      },
      { type: "h2", text: "Live Lock Screen wallpaper on Tahoe" },
      {
        type: "p",
        text: "Before Tahoe, no third-party app could put its own video on the Lock Screen, because that surface is drawn by the system before you log in. macOS 26 exposed wallpaper APIs that let apps register a video as a system wallpaper, and MacWall Pro uses them to play any catalog loop on the Lock Screen and as a Screen Saver. Setup is covered in [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).",
      },
      { type: "h2", text: "Wallpapers that suit Tahoe's Liquid Glass look" },
      {
        type: "p",
        text: "Tahoe's translucent Liquid Glass menus and Dock pick up color from whatever sits behind them, so the wallpaper shapes how the whole interface looks. Darker, slower loops keep menu text readable; bright, busy scenes can wash it out. Good starting points in the MacWall catalog: [galaxy](/wallpapers/collections/galaxy), [rain](/wallpapers/collections/rain), [ocean](/wallpapers/collections/ocean), and [Japanese](/wallpapers/collections/japanese) collections.",
      },
      { type: "h2", text: "Can I use the Tahoe wallpaper on an older Mac?" },
      {
        type: "p",
        text: "Apple's wallpaper files are licensed for use on macOS, so we do not host copies. If your Mac cannot run Tahoe, copy the image from a Mac that can (it is a normal image file in /System/Library/Desktop Pictures) and set it with Finder > right-click > **Set Desktop Picture**. Step-by-step: [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac).",
      },
    ],
    faq: [
      {
        question: "Where are macOS Tahoe wallpapers stored?",
        answer:
          "Still wallpapers are in /System/Library/Desktop Pictures. Aerial wallpapers are downloaded on demand into a system cache the first time you select them in System Settings > Wallpaper.",
      },
      {
        question: "Does macOS Tahoe support live wallpapers?",
        answer:
          "Tahoe's Aerial wallpapers move on the Lock Screen and screen saver but stay still on the desktop. For a video that keeps playing on the desktop, and for your own video on the Lock Screen, use a live wallpaper app such as MacWall.",
      },
      {
        question: "Can I set a different Lock Screen wallpaper on macOS Tahoe?",
        answer:
          "Apple's help pages do not describe a separate Lock Screen picture. MacWall Pro on macOS 26 or later can put a moving video on the Lock Screen and Screen Saver.",
      },
    ],
  },
]
