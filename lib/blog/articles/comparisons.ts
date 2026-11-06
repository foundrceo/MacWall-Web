import { appleSources, sourcesBlocks } from "@/lib/content/sources"
import type { BlogArticleInput } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallPlaybackModes,
} from "@/lib/macwall-site"

export const comparisonArticles: BlogArticleInput[] = [
  {
    slug: "dynamic-wallpaper-vs-live-wallpaper-mac",
    pathname: "/blog/dynamic-wallpaper-vs-live-wallpaper-mac",
    title: "Dynamic Wallpaper on Mac and Live Alternatives",
    headline:
      "Dynamic Wallpaper on Mac, and How It Differs from Live Wallpaper",
    description:
      "How macOS dynamic wallpapers change with the time of day, how to make your own HEIC dynamic wallpaper, and how aerials and live wallpapers differ.",
    excerpt:
      "Dynamic Wallpapers, Apple's aerials and live video wallpapers compared, plus how to make your own dynamic wallpaper.",
    category: "comparisons",
    publishedAt: "2026-07-13",
    updatedAt: "2026-11-06",
    keywords: [
      "dynamic wallpaper mac",
      "mac dynamic wallpaper",
      "dynamic wallpaper vs live wallpaper mac",
      "heic dynamic wallpaper",
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
        text: "There is a third option that sits between the two: Apple's aerial wallpapers, which are slow-motion footage that moves when you lock or unlock your Mac. This guide uses Apple's own help pages and announcements to explain all three, then shows where a live wallpaper app fits. For the definitions side by side, see [live vs dynamic vs aerial wallpapers](/learn/live-vs-dynamic-vs-aerial-wallpapers-mac).",
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
        text: `Because a live wallpaper decodes video, how it plays matters. MacWall uses hardware video decoding for H.264 and HEVC. ${macwallBatteryPolicy.summary} Desktop playback needs ${macwallMinimumMacOSVersion} or later. With Pro, MacWall can also play video on the Lock Screen and Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
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
            "Free 24-hour trial, then a one-time Pro purchase",
          ],
        ],
        caption:
          "Dynamic and aerial columns from Apple Support and Apple Newsroom; MacWall column from MacWall's docs and pricing.",
      },
      { type: "h2", text: "Make your own dynamic (HEIC) wallpaper" },
      {
        type: "p",
        text: "A dynamic wallpaper is a single HEIC file that holds several images of the same scene plus timing data that tells macOS which one to show. System Settings can't make one, but Dynamic Wallpaper Club's free creator can. Its FAQ describes two ways to time the images:",
      },
      {
        type: "ul",
        items: [
          "**Sun Mode**: each image follows the sun's position where you are, including the seasons, so a winter afternoon gets a lower sun than a summer one. It needs GPS data in the photos' Exif metadata: DateTimeOriginal, GPSLatitude and GPSLongitude.",
          "**Time Mode**: you set the time stamp at which each image appears.",
        ],
      },
      {
        type: "ol",
        items: [
          "Shoot or pick a series of the same scene at different times of day. A tripod and the same framing make the changes look natural. The site supports images up to 5K.",
          "Upload them to Dynamic Wallpaper Club's creator, choose Sun Mode or Time Mode, and download the HEIC it makes.",
          "Set it like any image: System Settings > Wallpaper > Your Photos > **Add Photo** > **Choose File**, or Control-click the file in the Finder and choose **Set Desktop Picture**.",
        ],
      },
      {
        type: "p",
        text: "Dynamic Wallpaper Club's how-to adds an advanced option: put the file in Macintosh HD > Library > Desktop Pictures (you'll be asked for your password), which also makes the Light and Dark still versions selectable. If a dynamic wallpaper gets stuck on one image, its FAQ suggests switching to one of Apple's Dynamic Wallpapers set to Dynamic, then setting yours again from the Finder, and restarting if that doesn't help.",
      },
      { type: "h2", text: "Third-party dynamic wallpaper tools" },
      {
        type: "p",
        text: "If you like the time-of-day idea but want more scenes without making them, a few third-party tools build on it:",
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
          "[Frequently Asked Questions about Dynamic Wallpapers](https://dynamicwallpaper.club/faq), Dynamic Wallpaper Club, accessed 6 November 2026",
          "[How to set a Dynamic Wallpaper on macOS](https://dynamicwallpaper.club/how-to), Dynamic Wallpaper Club, accessed 6 November 2026",
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
          "Not in System Settings. Dynamic Wallpaper Club's free creator turns a series of photos into a HEIC dynamic wallpaper timed by the sun's position or by time stamps; set the file like any image.",
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
    title: "Do Live Wallpapers Drain Battery on a Mac?",
    headline: "Live Wallpaper CPU and Battery Use on Mac: What Drives It",
    description:
      "What makes a live wallpaper cost CPU and battery on a Mac, how hardware decoding and pause rules cut it, and how to measure it in Activity Monitor.",
    excerpt:
      "Decoding, resolution, frame rate, displays and pause rules decide what a live wallpaper costs. How to keep it low and measure your own Mac.",
    category: "comparisons",
    publishedAt: "2026-07-15",
    updatedAt: "2026-11-06",
    keywords: [
      "live wallpaper cpu usage mac",
      "do live wallpapers drain battery mac",
      "live wallpaper battery drain mac",
      "live wallpaper performance macos",
      "apple silicon live wallpaper",
      "low cpu live wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "**Yes, a live wallpaper uses some battery: playing video costs energy. How much depends on how the app decodes the video and how much video it decodes (resolution, frame rate, codec and the number of displays) and on whether it stops when you can't see it.** On a Mac, H.264 and HEVC video can be decoded by Apple's media hardware rather than the CPU, which is the biggest single factor. MacWall hasn't published a measured battery test, so the last part of this guide shows how to measure your own Mac.",
      },
      { type: "h2", text: "What a live wallpaper spends energy on" },
      {
        type: "ul",
        items: [
          "**Decoding the video**: turning compressed frames into pictures, 24 to 60 times a second. Done in software, this keeps CPU cores busy for as long as the video plays; done in hardware, it runs on the media engine instead.",
          "**Resolution and frame rate**: a 4K loop has four times the pixels of a 1080p one, and 60 fps is twice the frames of 30 fps. Pixels above your display's resolution are decoded and never seen.",
          "**The codec**: H.264 and HEVC decode in hardware on Apple silicon. Other codecs may fall back to software or need converting first.",
          "**Displays**: the same loop on every display can be decoded once and drawn on each; a different loop per display is decoded separately, so three 4K loops are three times the work.",
          "**Playing when nobody can see it**: behind a full-screen app, on a locked Mac or with the display asleep, a wallpaper that keeps decoding spends energy for nothing.",
        ],
      },
      { type: "h2", text: "Hardware decoding on Apple silicon and Intel" },
      {
        type: "p",
        text: "Apple's video frameworks, AVFoundation and Video Toolbox, give apps access to hardware decoding. On Apple silicon the media engine handles H.264 and HEVC, so a well-built player leaves the CPU mostly idle while the video plays. Intel Macs decode in hardware for the codecs their graphics support, so a lower resolution and frame rate matter more there. MacWall is a native Mac app that plays video through Apple's own frameworks, on Apple silicon and Intel Macs.",
      },
      {
        type: "p",
        text: "Other kinds of wallpaper apps do other work. A web page as the wallpaper keeps a web view running, and an interactive scene is rendered frame by frame. Neither is the same job as decoding a video file, so CPU figures don't compare directly across these kinds of apps. What each kind of wallpaper costs, including Apple's dynamic and aerial ones, is explained in [live vs dynamic vs aerial wallpapers](/learn/live-vs-dynamic-vs-aerial-wallpapers-mac). We have not run a controlled head-to-head test, so treat any app's CPU claim, including ours, as something to check on your own Mac.",
      },
      { type: "h2", text: "What MacWall does to keep it low" },
      {
        type: "ul",
        items: [
          `**${macwallPlaybackModes.systemWallpaper.setting} playback** (${macwallPlaybackModes.systemWallpaper.minimumMacOS} and later): macOS plays the wallpaper itself, so you can quit MacWall and it keeps moving; ${macwallPlaybackModes.systemWallpaper.cpu}.`,
          `**${macwallBatteryPolicy.pauseBehindFullScreen.label}** (on by default): a wallpaper covered by a full-screen app does no decoding, display by display.`,
          `**${macwallBatteryPolicy.pauseOnBattery.label}** (off by default): ${macwallBatteryPolicy.pauseOnBattery.detail}, even while MacWall is closed.`,
          `**${macwallBatteryPolicy.lowerQualityOnBattery.label}** (off by default): ${macwallBatteryPolicy.lowerQualityOnBattery.detail}.`,
          `**${macwallBatteryPolicy.pauseWhenBusy.label}** (off by default): ${macwallBatteryPolicy.pauseWhenBusy.detail}.`,
          "**Display sleep**: playback stops while your displays sleep.",
          "**Shared loops**: displays showing the same wallpaper share one decoder.",
        ],
      },
      {
        type: "p",
        text: `All of these are in **${macwallBatteryPolicy.settingsPath}**. A paused wallpaper keeps its last frame and starts again on its own. On the Lock Screen, ${macwallPlaybackModes.systemWallpaper.setting} keeps playing unless you turn off **Play the wallpaper while locked**, which holds the frame.`,
      },
      { type: "h2", text: "Measure it on your own Mac" },
      {
        type: "ol",
        items: [
          "Set a wallpaper and leave it playing on the desktop for a few minutes.",
          "Open Activity Monitor (Applications > Utilities) and click **CPU** to see each process's CPU use.",
          "Click **Energy**. Apple describes **Energy Impact** as a relative measure of an app's current energy use, lower is better; on a Mac laptop, **12 hr Power** averages it over the last 12 hours.",
          "Open any app full screen and watch MacWall's numbers drop while the wallpaper is covered.",
          "Compare with the wallpaper stopped (Stop Wallpaper in the menu bar), or with a still wallpaper, over the same stretch of time.",
        ],
      },
      {
        type: "p",
        text: `With ${macwallPlaybackModes.systemWallpaper.setting} playback the video is decoded by macOS's wallpaper process rather than by the MacWall app, so compare the whole Mac's CPU and energy use, not just MacWall's row. On a laptop, the battery panel at the bottom of the Energy tab shows the remaining charge and the last 12 hours, which makes a longer before-and-after easy to read. The setup is explained step by step in [performance and battery](/docs/performance-and-battery).`,
      },
      { type: "h2", text: "Settings for a MacBook" },
      {
        type: "ul",
        items: [
          `**Most battery**: turn on ${macwallBatteryPolicy.pauseOnBattery.label}. The wallpaper holds its frame unplugged and plays again when you plug in.`,
          `**Motion on battery, for less**: leave that off and turn on ${macwallBatteryPolicy.lowerQualityOnBattery.label}.`,
          `**Games, exports and builds**: turn on ${macwallBatteryPolicy.pauseWhenBusy.label}.`,
          "**One loop on every display** when a MacBook drives external screens, so it is decoded once.",
        ],
      },
      { type: "h2", text: "Encode your own loops for lighter playback" },
      {
        type: "ul",
        items: [
          "Match the display's resolution, or 3840 × 2160 for a 4K panel; [MacBook wallpaper size](/blog/macbook-wallpaper-size) lists every Mac.",
          "24 to 30 fps is plenty for ambient motion.",
          "Use HEVC or H.264. ProRes, AV1 and VP9 are converted when you set them.",
          "Short seamless loops of 5 to 30 seconds look better than long clips and are no more work to play.",
        ],
      },
      {
        type: "p",
        text: "The full export guide is in [how to use a video as your wallpaper](/blog/how-to-use-video-as-wallpaper-mac). How the decoding works is explained in [hardware video decode](/learn/hardware-video-decode), and the general picture of laptop energy use in [battery and energy basics](/learn/battery-and-energy-basics).",
      },
      ...sourcesBlocks([
        appleSources.activityMonitorEnergy,
        appleSources.videoToolbox,
        appleSources.avFoundation,
      ]),
    ],
    faq: [
      {
        question: "Do live wallpapers drain battery on a Mac?",
        answer:
          "They use some energy, because playing video does. Hardware decoding, a resolution that matches your display, 24 to 30 fps, and pausing when the wallpaper is hidden or the Mac is unplugged keep it small.",
      },
      {
        question: "How much CPU does MacWall use?",
        answer:
          "It depends on the Mac, the video and the number of displays, so MacWall doesn't publish a fixed figure. Check it in Activity Monitor's CPU and Energy tabs; with System Wallpaper playback, compare the whole Mac, since macOS decodes the video.",
      },
      {
        question: "Does MacWall pause on battery?",
        answer: `If you turn on ${macwallBatteryPolicy.pauseOnBattery.label} in ${macwallBatteryPolicy.settingsPath}, it ${macwallBatteryPolicy.pauseOnBattery.detail}. It is off by default.`,
      },
      {
        question: "Is a 4K live wallpaper too heavy for a MacBook Air?",
        answer:
          "A 4K loop decodes more pixels than a 13-inch MacBook Air panel shows. Use a loop sized to the display, or turn on Lower quality on battery, for the same look at less cost.",
      },
      {
        question: "Do two monitors double the cost?",
        answer:
          "Only with two different loops. The same wallpaper on both displays is decoded once.",
      },
    ],
  },
]
