import type { BlogArticle } from "@/lib/content/types"

export const comparisonArticles: BlogArticle[] = [
  {
    slug: "dynamic-wallpaper-vs-live-wallpaper-mac",
    pathname: "/blog/dynamic-wallpaper-vs-live-wallpaper-mac",
    title: "Dynamic Wallpaper vs Live Wallpaper on Mac",
    headline: "Dynamic Wallpaper vs Live Wallpaper on Mac",
    description:
      "Apple's dynamic wallpapers change with time of day. Live wallpapers play video loops. Learn the difference and when to use MacWall.",
    excerpt:
      "Understand macOS dynamic wallpapers vs true motion video backgrounds.",
    category: "comparisons",
    readMinutes: 5,
    publishedAt: "2026-07-13",
    keywords: [
      "dynamic wallpaper vs live wallpaper mac",
      "macos dynamic wallpaper",
      "animated vs live wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "Apple's **dynamic wallpapers** (Sonoma, Sequoia) shift appearance based on time of day, beautiful, but limited to Apple's bundled sets. **Live wallpapers** play actual video loops: ocean waves, city timelapses, anime scenes, space flythroughs.",
      },
      {
        type: "h2",
        text: "When to use Apple's dynamic wallpapers",
      },
      {
        type: "p",
        text: "Subtle, system-integrated, zero third-party software. Great if you want calm gradients that match light/dark mode schedules. To set one, open System Settings > Wallpaper and pick any wallpaper marked Dynamic.",
      },
      {
        type: "h2",
        text: "When to use MacWall live wallpapers",
      },
      {
        type: "p",
        text: "You want cinematic motion, custom imports, category browsing, multi-monitor independence, and optional Lock Screen video. MacWall pauses intelligently so live motion does not fight your workflow.",
      },
    ],
    faq: [
      {
        question: "What is a dynamic wallpaper on Mac?",
        answer:
          "A dynamic wallpaper is a set of still images in one HEIC file that macOS swaps based on the time of day or your Light and Dark appearance. It changes a few times a day but never plays motion.",
      },
      {
        question: "How do I get a dynamic wallpaper on Mac?",
        answer:
          "Open System Settings > Wallpaper and choose any wallpaper labelled Dynamic. For moving video instead, install a live wallpaper app such as MacWall.",
      },
      {
        question: "Is a live wallpaper the same as a dynamic wallpaper?",
        answer:
          "No. A dynamic wallpaper is scheduled stills; a live wallpaper is a looping video that plays continuously behind your windows.",
      },
    ],
  },
  {
    slug: "live-wallpaper-cpu-usage-mac",
    pathname: "/blog/live-wallpaper-cpu-usage-mac",
    title: "Live Wallpaper CPU Usage on Mac: What Drives It",
    headline: "Live Wallpaper CPU Usage on Mac: What Drives It",
    description:
      "What affects live-wallpaper CPU use on a Mac, including hardware decode, source media, display count, auto-pause behavior, and battery quality settings.",
    excerpt:
      "Hardware decode can keep CPU work low, while source media, displays, and pause settings determine real-world resource use.",
    category: "comparisons",
    readMinutes: 6,
    publishedAt: "2026-07-15",
    keywords: [
      "live wallpaper cpu usage mac",
      "do live wallpapers drain battery mac",
      "lightest wallpaper app mac",
      "live wallpaper performance macos",
      "low cpu live wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "The number one fear about live wallpapers is whether they will slow down a Mac. Apple Silicon can decode H.264 and HEVC in dedicated media hardware, which reduces CPU work when the source video and codec are supported. Real resource use still depends on everything **around** the decoder: source resolution and frame rate, display count, compositing, and pause behavior.",
      },
      { type: "h2", text: "What MacWall does to keep CPU low" },
      {
        type: "ul",
        items: [
          "**Quit the app, keep the wallpaper**: on macOS 26 and later (System Wallpaper mode), macOS itself plays the wallpaper, so you can quit MacWall and it keeps moving with 0% MacWall CPU",
          "**Hardware decode** via AVFoundation/VideoToolbox, so decoding runs on the media engine rather than the CPU",
          "**Pause when busy** (optional, off by default): playback pauses when system load passes 80% and resumes at 55%",
          "**Pause behind full-screen apps** (on by default): a covered wallpaper does no decode work, per display",
          "**Pause on screen lock and display sleep**: nothing renders when you're away",
          "**Lower quality on battery** (optional): caps playback at 1080p/30fps on battery",
          "**Shared players**: displays showing the same loop share one player instead of decoding it twice",
          "**Quality presets**: the Performance preset caps playback at 1280 pixels and 30fps if you want extra headroom",
        ],
      },
      { type: "h2", text: "How other approaches differ" },
      {
        type: "p",
        text: "Website-as-wallpaper tools keep a full web rendering engine running to draw the desktop, which costs more than handing a video file to the media engine. Scene-based wallpapers are rendered frame by frame on the GPU. Other native video apps such as Backdrop and Wallspace use the same hardware decode path, so differences between them come down to pause rules and settings. We have not run a controlled head-to-head test, so treat any app's CPU claim, including ours, as something to check on your own Mac.",
      },
      { type: "h2", text: "Check it yourself" },
      {
        type: "p",
        text: "MacWall shows live CPU, RAM, and cache stats right in its menu bar popover. Open Activity Monitor next to it, with a full-screen app in front, MacWall is not decoding the wallpaper at all.",
      },
    ],
  },
]
