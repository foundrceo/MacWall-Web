import {
  macwall,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import type { BlogArticle } from "@/lib/content/types"

export const comparisonArticles: BlogArticle[] = [
  {
    slug: "dynamic-wallpaper-vs-live-wallpaper-mac",
    pathname: "/blog/dynamic-wallpaper-vs-live-wallpaper-mac",
    title: "Dynamic vs Live Wallpaper on Mac: The Difference",
    headline: "Dynamic Wallpaper vs Live Wallpaper on Mac",
    description:
      "Apple's Dynamic Wallpapers shift with the time of day and aerials move as you lock or unlock. Live wallpapers play video. How the three differ.",
    excerpt:
      "Dynamic Wallpapers, Apple's aerials, and live video wallpapers compared, with Apple's own descriptions.",
    category: "comparisons",
    readMinutes: 7,
    publishedAt: "2026-07-13",
    updatedAt: "2026-10-27",
    keywords: [
      "dynamic wallpaper vs live wallpaper mac",
      "dynamic wallpaper mac",
      "macos dynamic wallpaper",
      "animated wallpaper mac",
      "live wallpaper mac",
      "aerial wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "**A dynamic wallpaper on a Mac is an Apple image that brightens and darkens with the time of day where you are, while a live wallpaper is a video loop that keeps playing on the desktop behind your windows.** Dynamic Wallpapers are built into macOS; live video wallpapers need an app such as MacWall.",
      },
      {
        type: "p",
        text: "There is a third option that sits between the two: Apple's aerial wallpapers, which are slow-motion footage that moves when you lock or unlock your Mac. This guide uses Apple's own help pages and announcements to explain all three, then shows where a live wallpaper app fits.",
      },
      { type: "h2", text: "What a Dynamic Wallpaper is" },
      {
        type: "p",
        text: "Apple introduced the idea in macOS Mojave, announced on 4 June 2018, under the name Dynamic Desktop. Apple said it automatically changes the desktop picture to match the time of day. In current versions of macOS the category is called Dynamic Wallpapers, and Apple describes them as images that brighten and darken based on the time of day for your current location.",
      },
      {
        type: "p",
        text: "In other words, a Dynamic Wallpaper is one scene shown in different light. It does not play motion; it shifts from a daytime look to an evening look as the hours pass.",
      },
      { type: "h3", text: "Appearance options" },
      {
        type: "p",
        text: "When you pick a Dynamic Wallpaper, the Appearance pop-up menu offers four choices:",
      },
      {
        type: "ul",
        items: [
          "**Dynamic**: follows the time of day. Apple's Ventura page says this option applies to Dynamic Wallpapers.",
          "**Automatic**: Apple's Ventura page says this applies to Light & Dark Wallpapers.",
          "**Light (Still)** and **Dark (Still)**: as the labels say, a fixed light or dark version.",
        ],
      },
      { type: "h3", text: "How to set one" },
      {
        type: "ol",
        items: [
          "Choose Apple menu > System Settings, then click **Wallpaper** in the sidebar.",
          "Pick a wallpaper in the **Dynamic Wallpapers** category.",
          "Choose an option in the Appearance pop-up menu.",
        ],
      },
      {
        type: "p",
        text: "The full walkthrough, including rotation and your own photos, is in [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac).",
      },
      { type: "h2", text: "Aerial wallpapers: Apple's moving option" },
      {
        type: "p",
        text: "With macOS Sonoma in 2023, Apple added screen savers featuring slow-motion videos of locations around the world, and said they transition into the desktop after you log in. On Sonoma, the **Show as wallpaper** switch in Screen Saver settings used a still aerial image as your desktop picture.",
      },
      {
        type: "p",
        text: "On macOS 26 and macOS 27, the aerial wallpapers (Landscape, Cityscape, Underwater, and Earth) animate as you lock or unlock your Mac, and the aerial you choose is also the screen saver by default. There is also a **Shuffle Aerials** category: still aerial images that change at an interval you set. So aerials do move, but at the edges of a session, not while you work.",
      },
      { type: "h2", text: "What a live wallpaper is" },
      {
        type: "p",
        text: `A live wallpaper is a video loop that plays as the desktop picture, behind your icons and windows, for as long as it is visible. macOS does not offer this in System Settings, so it comes from an app. [MacWall](/download) is one: a native Mac app with ${macwallCatalog.liveCountLabel} 4K live wallpapers across ${macwall.categories.length} categories, plus your own MP4 and MOV clips with Pro.`,
      },
      {
        type: "p",
        text: `Because a live wallpaper decodes video, how it plays matters. MacWall uses hardware video decoding for H.264 and HEVC, pauses by default when a full-screen app covers the desktop, when the screen is locked, and when displays sleep, and can also pause in Low Power Mode or when the Mac is busy. Desktop playback needs ${macwallMinimumMacOSVersion} or later. With Pro, MacWall can also play video on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
      },
      { type: "h2", text: "Dynamic, aerial, and live side by side" },
      {
        type: "table",
        columns: [
          "",
          "Dynamic Wallpaper",
          "Aerial wallpaper",
          "Live wallpaper (MacWall)",
        ],
        rows: [
          [
            "What you see",
            "One still image that brightens and darkens",
            "Slow-motion footage of places around the world",
            "A looping video",
          ],
          [
            "When it changes",
            "Over the day, based on time and your location",
            "Animates as you lock or unlock (macOS 26 and 27)",
            "Plays continuously while visible, with pause rules",
          ],
          [
            "Where to get it",
            "System Settings > Wallpaper > Dynamic Wallpapers",
            "System Settings > Wallpaper > Landscape, Cityscape, Underwater, Earth",
            "[Download MacWall](/download)",
          ],
          [
            "Your own content",
            "Apple's set in System Settings; third-party tools can make new ones",
            "Apple's footage",
            "Catalog loops, or your own MP4 and MOV with Pro",
          ],
          [
            "First available",
            "macOS Mojave (2018)",
            "macOS Sonoma (2023), as screen savers",
            `${macwallMinimumMacOSVersion} or later`,
          ],
          [
            "Price",
            "Included with macOS",
            "Included with macOS",
            `Free 24-hour trial, then ${macwall.pro.price} one-time for Pro`,
          ],
        ],
        caption:
          "Dynamic and aerial columns from Apple Support and Apple Newsroom; MacWall column from MacWall's docs and pricing.",
      },
      { type: "h2", text: "Third-party dynamic wallpaper tools" },
      {
        type: "p",
        text: "If you like the time-of-day idea but want more scenes, a few third-party tools build on it:",
      },
      {
        type: "ul",
        items: [
          "**24 Hour Wallpaper** (Jetson Creative) changes wallpapers with the time of day using its own ProTime engine or Apple's Dynamic Desktop format. Its App Store listing mentions 8 free wallpapers and 165 more by in-app purchase, and it requires macOS 15.0 or later.",
          "**Dynamic Wallpaper Club** is a free website with a Dynamic Wallpaper Creator. It offers a Sun Mode, which uses your location, and a Time Mode, and supports images up to 5K.",
        ],
      },
      {
        type: "p",
        text: "Both stay on the dynamic side of the line: the image changes with the hour, but nothing plays as video. For a side-by-side look at live wallpaper apps, see the [comparison hub](/compare).",
      },
      { type: "h2", text: "Which should you use?" },
      {
        type: "ul",
        items: [
          "**Choose a Dynamic Wallpaper** if you want a calm desktop that tracks the day, with nothing to install.",
          "**Choose an aerial** if you like motion at lock and unlock, and a still desktop while you work.",
          "**Choose a live wallpaper** if you want motion on the desktop itself, your own clips, or a different loop on each display. Browse the [wallpaper gallery](/wallpapers) to see what that looks like.",
          "**Mix them**: MacWall's Day Schedule picks a wallpaper by time of day, which gives a live wallpaper some of the feel of a Dynamic one.",
        ],
      },
      { type: "h2", text: "What about battery and performance?" },
      {
        type: "p",
        text: "A Dynamic Wallpaper is a still image, so there is no video to decode. A live wallpaper does decode video, and its cost depends on the source resolution, frame rate, number of displays, and pause rules. MacWall does not promise a fixed battery or CPU figure; [performance and battery](/docs/performance-and-battery) explains each pause rule and how to check MacWall's CPU use in Activity Monitor on your own Mac.",
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          "[Customize the wallpaper on your Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp3013/mac), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS Tahoe 26)](https://support.apple.com/guide/mac-help/mchlp1103/26/mac/26), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS Ventura 13)](https://support.apple.com/guide/mac-help/mchlp1103/13.0/mac/13.0), Apple Support, accessed 27 October 2026",
          "[Change Screen Saver settings on Mac (macOS Sonoma 14)](https://support.apple.com/guide/mac-help/mchlp1227/14.0/mac/14.0), Apple Support, accessed 27 October 2026",
          "[Use a screen saver on your Mac](https://support.apple.com/guide/mac-help/use-a-screen-saver-mchl4b68853d/mac), Apple Support, accessed 27 October 2026",
          "[Apple introduces macOS Mojave](https://www.apple.com/newsroom/2018/06/apple-introduces-macos-mojave/), Apple Newsroom, accessed 27 October 2026",
          "[macOS Sonoma brings new capabilities for elevating productivity and creativity](https://www.apple.com/newsroom/2023/06/macos-sonoma-brings-new-capabilities-for-elevating-productivity-and-creativity/), Apple Newsroom, accessed 27 October 2026",
          "[24 Hour Wallpaper](https://apps.apple.com/us/app/24-hour-wallpaper/id1226087575?mt=12), Mac App Store, accessed 27 October 2026",
          "[Dynamic Wallpaper Club](https://dynamicwallpaper.club/), dynamicwallpaper.club, accessed 27 October 2026",
        ],
      },
    ],
    faq: [
      {
        question: "What is a dynamic wallpaper on Mac?",
        answer:
          "It is one of Apple's built-in wallpapers that brightens and darkens based on the time of day for your current location. Apple first shipped it in macOS Mojave in 2018 as Dynamic Desktop.",
      },
      {
        question: "Is a live wallpaper the same as a dynamic wallpaper?",
        answer:
          "No. A Dynamic Wallpaper is a still scene that changes its light over the day. A live wallpaper is a video loop that plays on the desktop while it is visible.",
      },
      {
        question: "Do Apple's aerial wallpapers count as live wallpapers?",
        answer:
          "Partly. On macOS 26 and 27 they animate as you lock or unlock your Mac and serve as the screen saver by default, but Apple does not describe them playing on the desktop while you work.",
      },
      {
        question: "How do I get a dynamic wallpaper on Mac?",
        answer:
          "Open System Settings > Wallpaper, pick a wallpaper in the Dynamic Wallpapers category, and choose Dynamic or Automatic in the Appearance pop-up menu.",
      },
      {
        question: "Can I make my own dynamic wallpaper?",
        answer:
          "Not in System Settings. Third-party tools such as Dynamic Wallpaper Club's free creator or 24 Hour Wallpaper offer time-of-day wallpapers beyond Apple's set.",
      },
      {
        question: "Which Macs can run MacWall live wallpapers?",
        answer: `Apple silicon and Intel Macs on ${macwallMinimumMacOSVersion} or later. Live Lock Screen and Screen Saver video needs ${macwallLockScreenMacOSVersion} or later and a Pro license.`,
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
        text: "A common worry about live wallpapers is whether they will slow down a Mac. Apple Silicon can decode H.264 and HEVC in dedicated media hardware, which reduces CPU work when the source video and codec are supported. Real resource use still depends on everything **around** the decoder: source resolution and frame rate, display count, compositing, and pause behavior.",
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
