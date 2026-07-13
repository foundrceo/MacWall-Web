import type { BlogArticle } from "@/lib/content/types"

export const guideArticles: BlogArticle[] = [
  {
    slug: "how-to-set-live-wallpaper-mac",
    pathname: "/blog/how-to-set-live-wallpaper-mac",
    title: "How to Set a Live Wallpaper on Mac (2026 Guide)",
    headline: "How to Set a Live Wallpaper on Mac",
    description:
      "Step-by-step guide to animated desktop backgrounds on macOS with MacWall — download, pick a wallpaper, and control playback from the menu bar.",
    excerpt:
      "The complete walkthrough for motion wallpapers on Intel and Apple Silicon Macs running Sonoma, Ventura, and Sequoia.",
    category: "guides",
    readMinutes: 6,
    publishedAt: "2026-03-01",
    keywords: [
      "how to set live wallpaper on mac",
      "animated wallpaper mac",
      "live wallpaper macos tutorial",
    ],
    sections: [
      {
        type: "p",
        text: "macOS ships with a handful of dynamic wallpapers, but they are limited and you cannot use your own video loops. **MacWall** is a native app that plays motion wallpapers behind your desktop windows — with hardware decoding on Apple Silicon, menu bar controls, and an offline-friendly catalog.",
      },
      {
        type: "h2",
        text: "Step 1: Download MacWall",
      },
      {
        type: "p",
        text: "Visit macwall.app/download and grab the latest DMG. Open it, drag MacWall to Applications, and launch from the Dock. The app runs quietly in the background — you control everything from the menu bar icon.",
      },
      {
        type: "h2",
        text: "Step 2: Pick a wallpaper from the catalog",
      },
      {
        type: "p",
        text: "Open MacWall and browse Home, Explore, or Library. Categories include Nature, Space, Anime, Cars, City, Video Games, Sci-fi, Fantasy, and Cats. Tap any tile to preview, then set it as your desktop background. Videos loop seamlessly with zero stutter.",
      },
      {
        type: "h2",
        text: "Step 3: Import your own clips (optional)",
      },
      {
        type: "p",
        text: "Drag and drop MP4, MOV, M4V, or GIF files into MacWall. Your imports stay in your Library — perfect for personal loops, cinematic edits, or clips you found online.",
      },
      {
        type: "h2",
        text: "Step 4: Control playback from the menu bar",
      },
      {
        type: "p",
        text: "Pause, resume, or stop from the menu bar without opening the main window. MacWall automatically pauses on battery power and when another app goes full screen — so your Mac stays fast during work and gaming.",
      },
      {
        type: "h2",
        text: "Step 5: Upgrade to Pro for Lock Screen (optional)",
      },
      {
        type: "p",
        text: "MacWall Pro adds Lock Screen live wallpaper on supported Sonoma and Sequoia builds. One-time purchase, lifetime updates, licensed on up to 3 personal Macs.",
      },
    ],
    faq: [
      {
        question: "Does live wallpaper slow down my Mac?",
        answer:
          "MacWall uses hardware video decode on Apple Silicon and intelligently pauses on battery and full screen. Most users see minimal CPU impact during normal desktop use.",
      },
      {
        question: "Which macOS versions are supported?",
        answer:
          "MacWall targets recent Sonoma, Ventura, and Sequoia builds. Lock Screen motion is a Pro feature and varies by OS version.",
      },
    ],
  },
  {
    slug: "how-to-use-video-as-wallpaper-mac",
    pathname: "/blog/how-to-use-video-as-wallpaper-mac",
    title: "How to Use Any Video as a Wallpaper on Mac",
    headline: "How to Use Any Video as a Wallpaper on Mac",
    description:
      "Turn MP4, MOV, and GIF files into looping desktop backgrounds on macOS with MacWall's drag-and-drop import and hardware-accelerated playback.",
    excerpt:
      "Import personal clips, cinematic loops, or gameplay captures as live Mac desktop wallpapers.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-03-02",
    keywords: [
      "video as wallpaper mac",
      "mp4 wallpaper mac",
      "custom video wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: "Apple does not let you set a video file as your desktop background out of the box. **MacWall** solves this with native hardware decode — your video plays behind Finder windows, loops cleanly, and respects battery and full-screen rules.",
      },
      {
        type: "h2",
        text: "Supported formats",
      },
      {
        type: "ul",
        items: [
          "MP4 and M4V (H.264 / HEVC)",
          "MOV (QuickTime)",
          "GIF (short animated loops)",
          "4K and ultrawide aspect ratios",
        ],
      },
      {
        type: "h2",
        text: "Import workflow",
      },
      {
        type: "ol",
        items: [
          "Download and open MacWall.",
          "Go to Library → Import, or drag a file onto the app window.",
          "Preview the loop, then set as desktop wallpaper.",
          "Use the menu bar to pause when you need maximum performance.",
        ],
      },
      {
        type: "h2",
        text: "Tips for smooth playback",
      },
      {
        type: "ul",
        items: [
          "Prefer H.264 or HEVC encodes — MacWall decodes on the GPU.",
          "Shorter loops (30–120 seconds) feel more natural than hour-long files.",
          "Enable pause-on-battery if you work unplugged often.",
          "Use one wallpaper per display on multi-monitor setups.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I use Wallpaper Engine scenes on Mac?",
        answer:
          "Wallpaper Engine .pkg scenes require a specialized renderer. MacWall focuses on native video playback — the smoothest path for most Mac users. See our Wallpaper Engine alternative guide for details.",
      },
    ],
  },
  {
    slug: "mp4-wallpaper-mac-guide",
    pathname: "/blog/mp4-wallpaper-mac-guide",
    title: "MP4 Wallpaper on Mac: Complete Setup Guide",
    headline: "MP4 Wallpaper on Mac",
    description:
      "Everything you need to loop MP4 files as macOS desktop backgrounds — encoding tips, resolution guidance, and MacWall setup.",
    excerpt:
      "The definitive guide to MP4 live wallpapers on MacBook and iMac with native performance.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-03-03",
    keywords: [
      "mp4 wallpaper mac",
      "mp4 live wallpaper macos",
      "video loop desktop mac",
    ],
    sections: [
      {
        type: "p",
        text: "MP4 is the most common format for live wallpapers. **MacWall** plays MP4 files with hardware acceleration — no browser wrappers, no Electron overhead.",
      },
      {
        type: "h2",
        text: "Recommended MP4 settings",
      },
      {
        type: "ul",
        items: [
          "Resolution: match your display (2560×1440, 3840×2160, or 5120×2880)",
          "Codec: H.264 (broad compatibility) or HEVC (smaller files on Apple Silicon)",
          "Frame rate: 24–30 fps for cinematic loops; 60 fps only if motion demands it",
          "Bitrate: 8–20 Mbps for 4K loops balances quality and file size",
        ],
      },
      {
        type: "h2",
        text: "Set your MP4 in MacWall",
      },
      {
        type: "p",
        text: "Import via drag-and-drop, select the clip, and apply. MacWall crossfades between wallpaper changes and keeps one decoder per display for predictable performance.",
      },
    ],
    faq: [],
  },
  {
    slug: "macbook-animated-wallpaper-guide",
    pathname: "/blog/macbook-animated-wallpaper-guide",
    title: "Animated Wallpaper for MacBook: Setup & Battery Tips",
    headline: "Animated Wallpaper for MacBook",
    description:
      "Live motion wallpapers on MacBook Pro and MacBook Air without killing battery — MacWall's smart pause and Apple Silicon decode explained.",
    excerpt:
      "How to get cinematic desktop motion on a laptop Mac without sacrificing unplugged runtime.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-03-04",
    keywords: [
      "macbook animated wallpaper",
      "live wallpaper macbook pro",
      "macbook air wallpaper app",
    ],
    sections: [
      {
        type: "p",
        text: "MacBook users want beautiful desktops but fear battery drain. **MacWall** was built for exactly this: native Metal-backed decode, automatic pause on battery, and pause when you go full screen in any app.",
      },
      {
        type: "h2",
        text: "MacBook Pro vs MacBook Air",
      },
      {
        type: "p",
        text: "Both M-series MacBooks handle 4K video wallpapers efficiently when MacWall uses hardware decode. Pro models with multiple displays can run independent wallpapers per screen. Air users benefit most from pause-on-battery — enable it in settings.",
      },
      {
        type: "h2",
        text: "Best practices on laptop",
      },
      {
        type: "ul",
        items: [
          "Use 1440p or 4K loops — avoid unnecessary 8K on a 13-inch display",
          "Pause manually from the menu bar during video calls or gaming",
          "Pick shorter loops to reduce decoder memory footprint",
          "Try MacWall's curated catalog — clips are optimized for Mac playback",
        ],
      },
    ],
    faq: [
      {
        question: "Will live wallpaper drain my MacBook battery?",
        answer:
          "MacWall pauses automatically on battery power. When plugged in, hardware decode keeps CPU usage low compared to software-rendered alternatives.",
      },
    ],
  },
  {
    slug: "import-custom-wallpaper-mac",
    pathname: "/blog/import-custom-wallpaper-mac",
    title: "How to Import Custom Wallpapers on Mac",
    headline: "Import Custom Wallpapers on Mac",
    description:
      "Bring your own video loops into MacWall — personal clips, AI-generated motion, or downloads from any source.",
    excerpt:
      "Your library, your rules: custom imports with native macOS playback.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-03-05",
    keywords: [
      "custom wallpaper mac",
      "import wallpaper macos",
      "personal video wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "Closed catalogs limit creativity. **MacWall** combines a community catalog with unlimited personal imports — drag any compatible video into your Library and set it instantly.",
      },
      {
        type: "h2",
        text: "Where to find clips",
      },
      {
        type: "ul",
        items: [
          "Film your own timelapses or nature scenes",
          "Export motion graphics from After Effects or DaVinci Resolve",
          "Download royalty-free loops from stock sites",
          "Browse the MacWall community catalog for inspiration",
        ],
      },
      {
        type: "h2",
        text: "Organize your Library",
      },
      {
        type: "p",
        text: "Favorites, playlists (Pro), and per-display assignments keep large libraries manageable. Switch wallpapers from Home or the menu bar without re-importing.",
      },
    ],
    faq: [],
  },
  {
    slug: "animated-desktop-background-mac-free",
    pathname: "/blog/animated-desktop-background-mac-free",
    title: "Free Animated Desktop Backgrounds for Mac",
    headline: "Free Animated Desktop Backgrounds for Mac",
    description:
      "MacWall is free to download with a curated motion wallpaper catalog. Learn what's included free vs MacWall Pro.",
    excerpt:
      "Start with free live wallpapers on macOS — upgrade only when you want Lock Screen and Pro catalog lanes.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-03-06",
    keywords: [
      "free animated wallpaper mac",
      "free live wallpaper macos",
      "animated desktop background mac free",
    ],
    sections: [
      {
        type: "p",
        text: "**MacWall** is free to download. You get native playback, catalog browsing, imports, menu bar controls, multi-display support, and smart pause — without a subscription.",
      },
      {
        type: "h2",
        text: "Free vs MacWall Pro",
      },
      {
        type: "ul",
        items: [
          "Free: desktop live wallpapers, imports, community catalog, hardware decode",
          "Pro ($7.99 one-time): Lock Screen live wallpaper, exclusive catalog lanes, unlimited playlists, future Pro features",
          "No monthly fee — ever",
        ],
      },
      {
        type: "h2",
        text: "Earn Pro back with a Reel",
      },
      {
        type: "p",
        text: "Post a TikTok or Instagram Reel with #macwall. Hit 2,000 views for 50% back or 20,000 views for a full refund. See Pricing for details.",
      },
    ],
    faq: [],
  },
]
