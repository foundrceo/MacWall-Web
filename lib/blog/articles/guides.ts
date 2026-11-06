import { blogSources } from "@/lib/blog/sources"
import { sourcesBlocks } from "@/lib/content/sources"
import type { BlogArticleInput } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallCreatorDisclosure,
  macwallImportFormatsLabel,
  macwallImportFormatsOrLabel,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"

export const guideArticles: BlogArticleInput[] = [
  {
    slug: "how-to-set-live-wallpaper-mac",
    pathname: "/blog/how-to-set-live-wallpaper-mac",
    title: "How to Set a Live Wallpaper on Mac, Step by Step",
    headline: "How to Set a Live Wallpaper on Mac",
    description:
      "Set a moving wallpaper on a Mac or MacBook with MacWall: install it, pick a loop, choose a playback mode, and keep battery use in check.",
    excerpt:
      "A walkthrough for video wallpapers on Apple silicon and Intel Macs running macOS 15 Sequoia or later, with MacBook battery settings.",
    category: "guides",
    publishedAt: "2026-07-13",
    updatedAt: "2026-11-06",
    keywords: [
      "how to set live wallpaper on mac",
      "animated wallpaper mac",
      "live wallpaper macos tutorial",
      "macbook animated wallpaper",
      "live wallpaper macbook",
    ],
    sections: [
      {
        type: "p",
        text: `**To set a live wallpaper on a Mac, install a live wallpaper app such as MacWall, open a wallpaper and click Set Wallpaper. System Settings has no option for video wallpapers.** macOS ships Dynamic Wallpapers, which change their light over the day, and aerials, which animate as you lock or unlock, but neither plays a video on the desktop while you work. MacWall does, on ${macwallSupportedMacOS.architectures} running ${macwallMinimumMacOSVersion} or later.`,
      },
      { type: "h2", text: "Step 1: Install MacWall" },
      {
        type: "p",
        text: `[Download MacWall](/download), open the DMG and drag MacWall to Applications, then open it from Applications rather than from the DMG (running it from the disk image is a common cause of black flashes). At the end of setup, choose **Try Free**, then **Start Free Trial**, for the ${macwallTrial.name}: ${macwallTrial.includesLabel}, once per Mac. It asks for your email address, never a card. Importing your own videos needs Pro.`,
      },
      { type: "h2", text: "Step 2: Pick a wallpaper" },
      {
        type: "p",
        text: `Browse **Home** and **Explore** in the app, or press Command-K to search. The catalog has ${macwallCatalog.liveCountLabel} 4K loops across ${macwall.categories.length} categories: ${macwall.categories.join(", ")}. Open one to preview it, then click **Set Wallpaper**. MacWall downloads the full file first, so the loop keeps playing offline afterwards. You can also start from the [web gallery](/wallpapers): every wallpaper page has a **Set on Mac** button that opens it in the app.`,
      },
      { type: "h2", text: "Step 3: Choose how it plays" },
      {
        type: "p",
        text: `MacWall has two playback modes in **${macwallPlaybackModes.settingsPath}**:`,
      },
      {
        type: "ul",
        items: [
          `**${macwallPlaybackModes.systemWallpaper.setting}** (${macwallPlaybackModes.systemWallpaper.minimumMacOS} and later, the default for new installs there): ${macwallPlaybackModes.systemWallpaper.summary}`,
          `**${macwallPlaybackModes.app.setting}** (every supported version, and the only mode on macOS 15): ${macwallPlaybackModes.app.summary}`,
        ],
      },
      {
        type: "p",
        text: `With ${macwallPlaybackModes.systemWallpaper.setting}, ${macwallPlaybackModes.systemWallpaper.cpu}. With ${macwallPlaybackModes.app.setting}, turn on **Open MacWall at login** so the desktop moves after a restart.`,
      },
      { type: "h2", text: "Step 4: Control it from the menu bar" },
      {
        type: "p",
        text: "Click the MacWall icon in the menu bar for what's playing and quick controls: play or pause, the previous or next wallpaper, sound, and Stop Wallpaper. From any app, Control-Option-Command-P plays or pauses and Control-Option-Command-M turns sound on or off. A paused wallpaper keeps its last frame and starts again on its own.",
      },
      { type: "h2", text: "Step 5: Add the Lock Screen (optional)" },
      {
        type: "p",
        text: `On ${macwallLockScreenMacOSVersion} or later, MacWall can play on the Lock Screen and as the screen saver too, with Pro or during the trial. With ${macwallPlaybackModes.systemWallpaper.setting} it happens on its own; with ${macwallPlaybackModes.app.setting}, turn on **Show on Lock Screen and screen saver** in Settings → Lock Screen. The Lock Screen guide is [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac).`,
      },
      { type: "h2", text: "Live wallpapers on a MacBook" },
      {
        type: "p",
        text: `${macwallBatteryPolicy.summary} The settings worth knowing on a laptop, all in **${macwallBatteryPolicy.settingsPath}**:`,
      },
      {
        type: "ul",
        items: [
          `**${macwallBatteryPolicy.pauseOnBattery.label}** (off by default): ${macwallBatteryPolicy.pauseOnBattery.detail}. Turn it on if you work unplugged and want the most battery.`,
          `**${macwallBatteryPolicy.lowerQualityOnBattery.label}** (off by default): ${macwallBatteryPolicy.lowerQualityOnBattery.detail}. A middle ground when you still want motion.`,
          `**${macwallBatteryPolicy.pauseWhenBusy.label}** (off by default): ${macwallBatteryPolicy.pauseWhenBusy.detail}.`,
          `**${macwallBatteryPolicy.pauseBehindFullScreen.label}** (on by default): a wallpaper covered by a full-screen app, a video call or a game does no decoding.`,
        ],
      },
      {
        type: "p",
        text: "Match the loop to the screen: a 4K loop on a 13-inch MacBook Air decodes pixels the panel can't show. [MacBook wallpaper size](/blog/macbook-wallpaper-size) lists every model's native resolution, and [live wallpaper CPU and battery use](/blog/live-wallpaper-cpu-usage-mac) explains what drives the cost. On Apple silicon MacBooks, MacWall's Bend effect also folds the desktop with the lid as you close it; see [Bend](/bend).",
      },
      { type: "h2", text: "Use your own video" },
      {
        type: "p",
        text: `With Pro, click **Upload Wallpaper** (Command-N), choose **Private** and drop in up to 10 ${macwallImportFormatsLabel} files. They stay on your Mac and play like any catalog wallpaper. GIFs aren't supported, so convert them to MP4 first. Encoding settings and the GIF conversion are in [how to use a video as your wallpaper](/blog/how-to-use-video-as-wallpaper-mac).`,
      },
      { type: "h2", text: "Where to find live wallpapers" },
      {
        type: "p",
        text: "Browse the [web gallery](/wallpapers) or start from a collection such as [rain](/wallpapers/collections/rain), [lofi](/wallpapers/collections/lofi), [galaxy](/wallpapers/collections/galaxy) or [ocean](/wallpapers/collections/ocean). For a MacBook screen, the [MacBook Air](/wallpapers/display/macbook-air) and [MacBook Pro](/wallpapers/display/macbook-pro) pages list loops sized for those panels.",
      },
    ],
    faq: [
      {
        question: "Can you have a live wallpaper on a Mac?",
        answer: `Yes, with an app. macOS plays Dynamic Wallpapers and aerials that animate at lock and unlock, but a video that keeps playing on the desktop needs an app such as MacWall, which runs on ${macwallMinimumMacOSVersion} or later.`,
      },
      {
        question: "How do I get a live wallpaper on my MacBook?",
        answer:
          "Install MacWall, open a wallpaper from the catalog and click Set Wallpaper. It works on every MacBook Air and MacBook Pro that runs macOS 15 or later, Apple silicon or Intel.",
      },
      {
        question: "Do live wallpapers drain a MacBook's battery?",
        answer:
          "Playing video uses some energy. MacWall pauses behind full-screen apps by default, and Pause on battery holds the frame whenever the Mac is unplugged if you turn it on; how much it costs depends on your Mac, the video and your settings.",
      },
      {
        question: "Can I use a GIF as a live wallpaper on Mac?",
        answer: `Not directly. MacWall plays ${macwallImportFormatsLabel} videos, so convert the GIF to an H.264 MP4 first, which also makes it smaller.`,
      },
      {
        question: "How do I remove a live wallpaper on Mac?",
        answer:
          "Choose Stop Wallpaper from the MacWall menu bar icon, then pick any wallpaper in System Settings > Wallpaper.",
      },
    ],
  },
  {
    slug: "how-to-use-video-as-wallpaper-mac",
    pathname: "/blog/how-to-use-video-as-wallpaper-mac",
    title: "How to Use a Video or GIF as Your Mac Wallpaper",
    headline: "How to Use a Video as Your Wallpaper on Mac",
    description:
      "Set your own MP4 or MOV as a moving Mac wallpaper, convert a GIF first, and export loops that play smoothly: formats, settings and steps.",
    excerpt:
      "Which video files work, how to turn a GIF into an MP4, export settings for clean loops, and the steps to set your clip in MacWall.",
    category: "guides",
    publishedAt: "2026-07-13",
    updatedAt: "2026-11-06",
    keywords: [
      "video as wallpaper mac",
      "mp4 wallpaper mac",
      "gif wallpaper mac",
      "how to make a gif your wallpaper on mac",
      "custom video wallpaper macos",
      "import wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: `**To use a video as your Mac wallpaper, open MacWall, click Upload Wallpaper, choose Private, drop in an ${macwallImportFormatsOrLabel} file, add it to your Library and click Set Wallpaper.** System Settings only takes still images, Dynamic Wallpapers and Apple's aerials, so a clip of your own needs an app. In MacWall, adding your own videos needs Pro; it isn't part of the ${macwallTrial.name}.`,
      },
      {
        type: "p",
        text: "Most of the work is in the file, not the app. A short, well-encoded clip that loops cleanly looks better and costs less to play than a long one, and a GIF has to become a video first. This guide covers both, then the steps in MacWall.",
      },
      { type: "h2", text: "Which files work" },
      {
        type: "table",
        columns: ["File", "Plays as a wallpaper?", "What to do"],
        rows: [
          [
            `${macwallImportFormatsLabel} with H.264 or HEVC inside`,
            "Yes",
            "The best choice: both decode on Apple's media hardware",
          ],
          [
            "MP4 or MOV with ProRes, AV1 or VP9 inside",
            "Yes, after a conversion",
            "MacWall converts these when you set them, and the wallpaper can look black until that finishes. Export H.264 or HEVC instead",
          ],
          ["GIF", "No", "Convert it to an MP4 first (below)"],
          ["MKV, AVI, WMV, WebM", "No", "Re-export as MP4 or MOV"],
          ["Still images", "No", "Use System Settings > Wallpaper"],
        ],
        caption:
          "MacWall 4.1.0. Private videos have no resolution or size limit; public catalog submissions need 1920 × 1080 and at most 300 MB.",
      },
      { type: "h2", text: "Turn a GIF into an MP4" },
      {
        type: "p",
        text: "A GIF is a sequence of images with at most 256 colors per frame, so it is large for what it shows and bands on gradients. Converting it to an H.264 MP4 gives a smaller file that plays like any other video. With the free command-line tool ffmpeg (install it with Homebrew: `brew install ffmpeg`), run this in Terminal from the GIF's folder:",
      },
      {
        type: "p",
        text: '`ffmpeg -i loop.gif -c:v libx264 -crf 18 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -movflags +faststart loop.mp4`',
      },
      {
        type: "ul",
        items: [
          "`-c:v libx264 -crf 18` encodes H.264 at high quality; raise the number (to 23, say) for a smaller file.",
          "`-pix_fmt yuv420p` uses the color format every Mac player expects.",
          "The `scale` filter rounds the width and height down to even numbers, which H.264 at that color format requires and many GIFs don't have.",
          "`-movflags +faststart` puts the file's index at the start so it opens quickly.",
        ],
      },
      {
        type: "p",
        text: "Most GIFs are small, often under 600 pixels wide, so even converted they look soft on a Retina display. If the GIF came from a video, go back to that video instead.",
      },
      { type: "h2", text: "Export settings for a smooth loop" },
      {
        type: "table",
        columns: ["Setting", "Use", "Why"],
        rows: [
          [
            "Resolution",
            "Your display's native size, or 3840 × 2160 for a 4K panel",
            "Pixels above the panel's resolution are decoded and never seen",
          ],
          [
            "Codec",
            "HEVC for the smallest file; H.264 for the widest compatibility",
            "Both decode in hardware on Apple silicon",
          ],
          [
            "Frame rate",
            "24 to 30 fps",
            "Plenty for ambient motion, and cheaper to play than 60 fps",
          ],
          [
            "Length",
            "5 to 30 seconds that loop cleanly",
            "A short seamless loop beats a long clip with a visible jump",
          ],
          [
            "Audio",
            "Only if you want sound",
            "MacWall plays a wallpaper's sound only when you turn it on, and remembers that for each wallpaper",
          ],
        ],
        caption:
          "From MacWall's import guide. Native resolutions for every Mac are in MacBook wallpaper size.",
      },
      {
        type: "p",
        text: "On a Mac without other tools, QuickTime Player covers the basics. Apple's guide says **Edit > Trim** cuts a clip down with yellow handles, and **File > Export As** saves a QuickTime movie at 4K, 1080p, 720p or 480p; at 4K or 1080p the Format menu offers **Smaller File Size** (HEVC) or **Greater Compatibility** (H.264). That is also the quickest way to turn a ProRes clip into one MacWall plays without converting. Native sizes for every Mac are in [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
      { type: "h3", text: "Make the loop seamless" },
      {
        type: "p",
        text: "A wallpaper repeats hundreds of times an hour at the edge of your vision, so a jump at the loop point is the one thing you will notice. Pick footage whose first and last frames are close: slow pans, drifting clouds, rain, water, particles. If the ends don't match, crossfade the last second into the first in your editor before exporting.",
      },
      { type: "h2", text: "Set your video as the wallpaper in MacWall" },
      {
        type: "ol",
        items: [
          "[Download MacWall](/download), install it and activate Pro. See [license and activation](/docs/license-and-activation).",
          "Click **Upload Wallpaper** in the toolbar, or press Command-N.",
          "Choose **Private**. Videos added here stay on your Mac and only you see them.",
          "Drop up to 10 videos onto the page, or click **Choose Videos**.",
          "Check the name and category MacWall suggests for each file, then click **Add to Library**.",
          "Open the video in Library and click **Set Wallpaper**.",
        ],
      },
      {
        type: "p",
        text: `It then plays like any catalog wallpaper: on one display or all of them, pausing behind full-screen apps, and on ${macwallLockScreenMacOSVersion} or later on the Lock Screen too. A new wallpaper starts muted; the speaker in the player bar or the menu bar turns its sound on. The task-only version of these steps is in [import your own videos](/docs/import-your-own-videos).`,
      },
      { type: "h2", text: "Where to get clips you can use" },
      {
        type: "p",
        text: "Use clips you filmed, created or have the rights to use, for example royalty-free stock under a license that allows it. Your own footage works well: a timelapse, a slow pan over a landscape, rain on a window. An export from any video editor works as long as the codec inside is H.264 or HEVC. A wallpaper you download from someone else stays under their terms, even on your own desktop.",
      },
      {
        type: "p",
        text: "To share a loop you made with every MacWall user, submit it under **Public** instead. The rules and the review process are in [upload a wallpaper to the MacWall community](/blog/upload-wallpaper-macwall-community).",
      },
      { type: "h2", text: "If the video doesn't play" },
      {
        type: "ul",
        items: [
          "**Black wallpaper right after setting it**: the clip is probably ProRes, AV1 or VP9 and is still being converted. Wait, or re-export it as H.264 or HEVC.",
          "**\"MacWall can't open this video\"**: the container isn't one macOS reads (MKV, AVI, WMV). Re-export as MP4 or MOV.",
          "**A jump at the loop point**: trim or crossfade the ends; see above.",
          "**Soft or blurry**: the source is smaller than your display. Use a larger original rather than upscaling.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I set a video as my wallpaper on Mac?",
        answer: `Not with System Settings, which takes still images, Dynamic Wallpapers and Apple's aerials. With MacWall Pro you can add ${macwallImportFormatsLabel} videos and set them as live wallpapers.`,
      },
      {
        question: "How do I make a GIF my wallpaper on Mac?",
        answer:
          "Convert it to an H.264 MP4 first, for example with ffmpeg, then add the MP4 to MacWall under Upload Wallpaper > Private. MacWall doesn't play GIF files directly.",
      },
      {
        question: "What video format is best for a Mac wallpaper?",
        answer:
          "An MP4 or MOV with HEVC or H.264 inside, at your display's resolution and 24 to 30 fps. Both codecs decode in hardware on Apple silicon.",
      },
      {
        question: "Are my imported videos uploaded anywhere?",
        answer:
          "No. Videos added under Private stay on your Mac. Only what you submit under Public is uploaded, for review before it appears in the catalog.",
      },
      {
        question: "Do I need MacWall Pro to use my own video?",
        answer: `Yes. Adding your own videos needs Pro; the ${macwallTrial.name} covers ${macwallTrial.includesLabel}.`,
      },
    ],
  },
  {
    slug: "animated-desktop-background-mac-free",
    pathname: "/blog/animated-desktop-background-mac-free",
    title: "Free Animated Wallpapers for Mac: Every Option",
    headline: "Free Animated Wallpapers for Mac",
    description:
      "Every free way to get an animated wallpaper on a Mac: Apple's built-in options, free apps with their limits, and where MacWall's free trial fits.",
    excerpt:
      "Apple's aerials and Dynamic Wallpapers, free live wallpaper apps and their catches, and an honest note on MacWall, which is paid after a trial.",
    category: "guides",
    publishedAt: "2026-07-13",
    updatedAt: "2026-11-06",
    keywords: [
      "free animated wallpaper mac",
      "animated wallpaper mac",
      "free live wallpaper mac",
      "live wallpaper for mac free",
      "animated desktop background mac free",
    ],
    sections: [
      {
        type: "p",
        text: "**Yes, you can get an animated wallpaper on a Mac for free.** macOS includes aerials that animate as you lock or unlock and Dynamic Wallpapers that change with the time of day. For video that keeps playing on the desktop, the free options are apps such as Wallnetic, Wallspace's free plan and Backdrop's free tier, and Plash shows a web page as your wallpaper. MacWall, which publishes this blog, is not free: it has a free 24-hour trial, then Pro is a one-time purchase.",
      },
      {
        type: "p",
        text: "App prices and plans below are as each developer's site or Mac App Store listing showed them on 27 October 2026; they change, so check the source before you install. Apple's options are from Apple's help pages for macOS 26 and 27.",
      },
      { type: "h2", text: "Free options built into macOS" },
      {
        type: "ul",
        items: [
          "**Aerials** (Landscape, Cityscape, Underwater, Earth): on macOS 26 and 27, Apple says they animate as you lock or unlock your Mac, and the aerial you choose is also your screen saver by default. They don't move while you work.",
          "**Dynamic Wallpapers**: one scene that brightens and darkens with the time of day where you are. No motion, but it changes through the day with nothing to install.",
          "**Shuffle Aerials**: still aerial images that change at an interval you set.",
          '**Mac** (macOS 27): Apple describes it as animated gradient pill shapes that spell "Mac", in a color you choose.',
        ],
      },
      {
        type: "p",
        text: "All of them are in System Settings > Wallpaper. The step-by-step guide is [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac), and the difference between dynamic and live wallpapers is explained in [dynamic wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).",
      },
      { type: "h2", text: "Free live wallpaper apps" },
      {
        type: "table",
        columns: ["App", "What's free", "Needs"],
        rows: [
          [
            "Wallnetic: Live Wallpaper 4K",
            "Free; no in-app purchases listed",
            "macOS 13+",
          ],
          [
            "Wallspace",
            "Free; a Pro upgrade is a one-time purchase",
            "macOS 15+ (Lock Screen needs macOS 26)",
          ],
          [
            "Backdrop (Cindori)",
            "Free tier with 3 watermarked wallpapers; the rest is a subscription or lifetime purchase",
            "macOS 15+",
          ],
          [
            "Plash (Sindre Sorhus)",
            "Free; shows a website, not a video",
            "macOS 26.4+ (App Store version)",
          ],
          [
            "Dynamic Wallpaper Club",
            "Free website for making and sharing dynamic (time-of-day) wallpapers",
            "A web browser; macOS plays the result",
          ],
        ],
        caption:
          "From each developer's site or US Mac App Store listing, read 27 October 2026. Full details and links are on the comparison hub.",
      },
      {
        type: "p",
        text: "Free usually has a catch, and it is worth knowing which one before you set up a desktop around an app: a watermark, a small free set, ads on a website, or a newer macOS than you run. Two things are worth checking in any free app: whether it pauses behind full-screen apps, so a hidden wallpaper isn't decoding video, and what it asks permission for. Setting a wallpaper needs no Screen Recording or Accessibility permission. Every app here, free and paid, is listed with its price and source on the [comparison hub](/compare).",
      },
      { type: "h2", text: "Where MacWall fits" },
      {
        type: "p",
        text: `MacWall is a paid app with a free trial. Every Mac gets one ${macwallTrial.name} of ${macwallTrial.includesLabel}, with no card. After that, Pro is a one-time purchase for up to ${macwall.maxLicensedMacs} Macs, with no subscription, and the catalog stays browsable without it; the current price is on the [pricing page](/pricing). What you pay for is a native app with ${macwallCatalog.liveCountLabel} 4K loops, your own ${macwallImportFormatsLabel} videos, Lock Screen and screen saver video on ${macwallLockScreenMacOSVersion} or later, and pause rules for battery and full-screen apps.`,
      },
      {
        type: "p",
        text: `If you want Pro for nothing, the creator program refunds it for a public video of MacWall running on your Mac, on Instagram, TikTok, YouTube, Threads or X. Because the refund pays you for it, the post must carry ${macwallCreatorDisclosure.label}, along with ${macwall.reelRefundHashtag}. When one video reaches ${macwall.reelRefundHalfViews.toLocaleString("en-US")} organic views you get 50% of what you paid back, and at ${macwall.reelRefundFullViews.toLocaleString("en-US")} all of it. The rules, including what disqualifies a post, are on the [creator page](/creator).`,
      },
      { type: "h2", text: "How to choose" },
      {
        type: "ul",
        items: [
          "**Motion only when you lock or unlock**: Apple's aerials. Free, built in, nothing to install.",
          "**A desktop that changes through the day**: a Dynamic Wallpaper, or make your own with Dynamic Wallpaper Club.",
          "**A web page or dashboard as the wallpaper**: Plash.",
          "**Video on the desktop at no cost**: try a free app and check its limits against the list above.",
          "**A large 4K catalog, your own clips and a moving Lock Screen**: try MacWall free for 24 hours and decide.",
        ],
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          "[Customize the wallpaper on your Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp3013/mac), Apple Support, accessed 6 November 2026",
          "[Wallpaper settings on Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp1103/mac), Apple Support, accessed 6 November 2026",
          "[Wallnetic: Live Wallpaper 4K](https://apps.apple.com/us/app/wallnetic-live-wallpaper-4k/id6760347328?mt=12), Mac App Store, accessed 27 October 2026",
          "[Wallspace](https://wallspace.app/), wallspace.app, accessed 27 October 2026",
          "[Backdrop](https://cindori.com/backdrop), Cindori, accessed 27 October 2026",
          "[Plash](https://apps.apple.com/us/app/plash/id1494023538), Mac App Store, accessed 27 October 2026",
          "[Dynamic Wallpaper Club](https://dynamicwallpaper.club/), dynamicwallpaper.club, accessed 27 October 2026",
        ],
      },
    ],
    faq: [
      {
        question: "Is MacWall free?",
        answer: `No. MacWall is a paid app with a ${macwallTrial.name}, once per Mac and with no card. After the trial, Pro is a one-time purchase; the catalog stays browsable without it.`,
      },
      {
        question: "Can I get a live wallpaper on Mac for free?",
        answer:
          "Yes. Apple's aerials animate as you lock or unlock, and free apps such as Wallnetic, Wallspace's free plan and Backdrop's free tier play video on the desktop, each with its own limits.",
      },
      {
        question: "Does macOS have animated wallpapers?",
        answer:
          "Partly. On macOS 26 and 27 the aerial wallpapers animate as you lock or unlock, and Dynamic Wallpapers change their light through the day. A video that plays on the desktop while you work needs an app.",
      },
      {
        question: "Are free live wallpaper apps safe?",
        answer:
          "Install them from the Mac App Store or the developer's own site, and be wary of any wallpaper app that asks for Screen Recording or Accessibility permission, which setting a wallpaper doesn't need.",
      },
    ],
  },
  {
    slug: "upload-wallpaper-macwall-community",
    pathname: "/blog/upload-wallpaper-macwall-community",
    title: "How to Upload a Wallpaper to the MacWall Community",
    headline: "Upload Your Wallpaper to the MacWall Community",
    description:
      "Share a live wallpaper you made with every MacWall user: the in-app Upload Wallpaper steps, file rules, the rights declaration and how review works.",
    excerpt:
      "Made a loop you like? Upload it from the Mac app, declare the rights, and follow it through review into Explore.",
    category: "guides",
    publishedAt: "2026-07-15",
    updatedAt: "2026-11-06",
    keywords: [
      "upload wallpaper macwall",
      "community wallpaper mac",
      "share live wallpaper mac",
      "submit wallpaper macwall catalog",
      "create live wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To share a wallpaper with every MacWall user, open the Mac app, click Upload Wallpaper, choose Public, drop in your video, fill in the details and the rights declaration, and click Submit for Review.** Uploads happen only in the Mac app, not on the website, and need MacWall Pro. A person on the MacWall team reviews each one before it appears in Explore.",
      },
      { type: "h2", text: "What you can upload" },
      {
        type: "ul",
        items: [
          "**A video**: MP4 or MOV with H.264 or HEVC inside. MacWall turns down AV1, ProRes and VP9 for the catalog, because they can show a black desktop on many Macs.",
          "**At least 1920 × 1080**, and 4K looks best on Retina displays.",
          "**Up to 300 MB** per file.",
          "**A clean loop**: the last frame should flow back into the first.",
          "**Your own work, or work you have permission to share** (see the rights declaration below).",
        ],
      },
      {
        type: "p",
        text: "If your clip isn't in that shape yet, [how to use a video as your wallpaper](/blog/how-to-use-video-as-wallpaper-mac) covers the export settings and how to make the loop seamless.",
      },
      { type: "h2", text: "Upload it, step by step" },
      {
        type: "ol",
        items: [
          "Open MacWall and click **Upload Wallpaper** in the toolbar, or press Command-N.",
          "Choose **Public**. The page explains: share with every MacWall user; each upload is reviewed first.",
          "Drop up to 10 videos onto the page, or click **Choose Files**. Each one joins the queue; click a file to edit its details.",
          "Check the **title** (up to 50 characters) and the **category** MacWall suggests, and change them if you like. The categories are the app's nine: Anime, Nature, Cars, Gaming, Space, Heroes, Dark, Abstract and Others.",
          "Pick a thumbnail with **Choose Thumbnail**: a frame from the video, or an image of your own.",
          'Enter your **author name** (2 to 40 characters). It appears on the wallpaper as "by" your name.',
          "Complete the **rights declaration** for each file.",
          "Click **Submit for Review**.",
        ],
      },
      { type: "h2", text: "The rights declaration" },
      {
        type: "p",
        text: "Every public upload carries a declaration, and Submit stays disabled until it is complete. You choose one of two statements:",
      },
      {
        type: "ul",
        items: [
          "**I created this wallpaper** and own the rights necessary to publish it.",
          "**I have permission or a license** allowing me to publish and distribute it through MacWall. You then name the original creator or rights holder, link to the original, and pick the license type: Creative Commons, a free stock license (Pexels or Pixabay, for example), written permission from the creator, a purchased license, or another license. For the last three you also link to the permission or license itself.",
        ],
      },
      {
        type: "p",
        text: "Then you confirm that the information about the author and origin is accurate. The app spells out what doesn't qualify: footage from films, shows, games, music videos, stock libraries or other artists needs written permission from the rights holder. The MacWall team removes anything that turns out to infringe someone's rights.",
      },
      { type: "h2", text: "What happens in review" },
      {
        type: "p",
        text: 'A person on the MacWall team reviews every submission before it is published, checking the loop, the quality and the rights. Follow each one under **Submissions**, the third tab on the Upload Wallpaper page, filtered by **Pending**, **Approved** or **Rejected**. A rejected upload can carry a note from the reviewer, under "Why it was rejected", so you know what to fix before you try again. Approved wallpapers appear in Explore for every MacWall user.',
      },
      { type: "h2", text: "Share a wallpaper from your Library" },
      {
        type: "p",
        text: "A video you already added privately can go to the community without starting over. In your Library, open the video's menu and choose **Upload to Community**, enter your author name, complete the same rights declaration and click **Submit for Review**.",
      },
      { type: "h2", text: "Tips for loops that get approved" },
      {
        type: "ul",
        items: [
          "Slow motion beats fast cuts: a wallpaper sits behind your work all day.",
          "Check the loop point at full screen; a jump is easy to spot on a desktop.",
          "Export 4K HEVC if you can. It is small for its quality and decodes in hardware on Apple silicon.",
          "Keep text, logos and watermarks out of the frame.",
          "Pick the category people would browse for it, and a title that says what's in it.",
        ],
      },
      { type: "h2", text: "Private instead of public" },
      {
        type: "p",
        text: "To use a video on your own Mac only, choose **Private** on the same page. Private videos stay on your Mac, skip review, and have no resolution or file size limit. Both private and public uploads need Pro; the free 24-hour trial covers the catalog and the Lock Screen, not uploads. Step-by-step: [import your own videos](/docs/import-your-own-videos).",
      },
    ],
    faq: [
      {
        question: "Can I upload a wallpaper to MacWall from the website?",
        answer:
          "No. Uploads happen in the Mac app: click Upload Wallpaper (Command-N) and choose Public.",
      },
      {
        question: "Do I need MacWall Pro to upload?",
        answer:
          "Yes. Public and private uploads both need Pro; the free 24-hour trial doesn't include them.",
      },
      {
        question: "What size and format do community uploads need?",
        answer:
          "An MP4 or MOV with H.264 or HEVC inside, at least 1920 × 1080, and up to 300 MB.",
      },
      {
        question: "How do I know if my wallpaper was approved?",
        answer:
          "Open Upload Wallpaper and go to Submissions. Each upload shows Pending, Approved or Rejected, and a rejection can include a note from the reviewer.",
      },
      {
        question: "Can I upload clips from a film or a game?",
        answer:
          "Only with written permission from the rights holder. The rights declaration asks for the source and the license, and anything that infringes someone's rights is removed.",
      },
    ],
  },
  {
    slug: "how-to-change-wallpaper-on-mac",
    pathname: "/blog/how-to-change-wallpaper-on-mac",
    title: "How to Change Wallpaper on Mac (and Rotate It)",
    headline: "How to Change and Rotate the Wallpaper on a Mac",
    description:
      "Change your Mac or MacBook wallpaper in System Settings, Photos, Finder or Safari, rotate it with Shuffle, and add a moving video wallpaper.",
    excerpt:
      "Apple's own steps for changing and rotating the wallpaper on macOS 27 and Tahoe, plus how to add a live video wallpaper.",
    category: "guides",
    publishedAt: "2026-09-28",
    updatedAt: "2026-10-27",
    keywords: [
      "how to change wallpaper on mac",
      "how to change macbook wallpaper",
      "how to change wallpaper on macbook",
      "how to change mac wallpaper",
      "rotate wallpaper mac",
      "how to change desktop wallpaper on mac",
      "how to set a photo as wallpaper on mac",
      "mac wallpaper shuffle",
    ],
    sections: [
      {
        type: "p",
        text: "**To change the wallpaper on a Mac, open System Settings, click Wallpaper in the sidebar, and pick one of Apple's wallpapers or one of your own photos. To rotate wallpapers automatically, choose Shuffle Aerials or let Your Photos shuffle, then set the interval in the pop-up menu next to Shuffle.**",
      },
      {
        type: "p",
        text: "The steps below come from Apple's help pages for macOS 27 Golden Gate, the current version, and macOS Tahoe 26. Apple gives one set of steps for every Mac, so changing a MacBook Air or MacBook Pro wallpaper works exactly like changing an iMac's. To check which version you have, choose Apple menu > About This Mac.",
      },
      { type: "h2", text: "Change the wallpaper in System Settings" },
      {
        type: "ol",
        items: [
          "Choose Apple menu > **System Settings**.",
          "Click **Wallpaper** in the sidebar. Apple notes that you may need to scroll down to see it.",
          "Click a wallpaper in one of the categories, or go to **Your Photos** to use an image of your own.",
        ],
      },
      {
        type: "p",
        text: "Apple groups its wallpapers into categories. macOS 27 adds a Mac category that macOS 26 does not have; the rest of the list is the same.",
      },
      {
        type: "table",
        columns: [
          "Category",
          "macOS 27",
          "macOS 26",
          "What Apple says about it",
        ],
        rows: [
          [
            "Dynamic Wallpapers",
            "Yes",
            "Yes",
            "Images that brighten and darken based on the time of day for your location",
          ],
          [
            "Your Photos",
            "Yes",
            "Yes",
            "Your own images, added with Add Photo",
          ],
          [
            "Landscape, Cityscape, Underwater, Earth",
            "Yes",
            "Yes",
            "Aerials that animate as you lock or unlock your Mac",
          ],
          ["Mac", "Yes", "No", "Listed in macOS 27 only"],
          [
            "Shuffle Aerials",
            "Yes",
            "Yes",
            "Still aerial images that change at an interval you set",
          ],
          ["Pictures", "Yes", "Yes", "Listed in both versions"],
          ["Colors", "Yes", "Yes", "Solid colors, with a Rotate button"],
        ],
        caption:
          "Wallpaper categories in System Settings, from Apple Support, accessed 27 October 2026.",
      },
      { type: "h2", text: "Use your own photo as the wallpaper" },
      {
        type: "ol",
        items: [
          "Open System Settings > Wallpaper and find **Your Photos**.",
          "Click **Add Photo**.",
          "Choose **Choose from Photos**, **Choose File**, or **Choose Folder**, then select the image or folder.",
        ],
      },
      {
        type: "p",
        text: "You can also drag an image file onto the wallpaper thumbnail at the top of Wallpaper settings. For a sharp result, use an image at least as large as your screen's native resolution. [MacBook wallpaper size](/blog/macbook-wallpaper-size) lists Apple's figure for every current model, the [screen resolution checker](/tools/screen-resolution) helps you confirm your screen, and the [wallpaper resizer](/tools/wallpaper-resizer) fits an image to it.",
      },
      { type: "h2", text: "Set a wallpaper from Photos, Finder, or Safari" },
      {
        type: "ul",
        items: [
          "**Photos**: select a photo, click the Share button, then choose **Set Wallpaper**.",
          "**Finder**: Control-click an image file, then choose **Set Desktop Picture**.",
          "**Safari**: Control-click an image on a web page, then choose **Use Image as Desktop Wallpaper**.",
        ],
      },
      { type: "h2", text: "How to rotate wallpapers on a Mac" },
      {
        type: "p",
        text: "macOS can change the wallpaper for you. Apple's current help pages describe three ways to do it:",
      },
      {
        type: "ul",
        items: [
          "**Shuffle Aerials**: still aerial images that change at an interval you set. Pick the interval from the pop-up menu next to **Shuffle** at the top of the window.",
          "**Your Photos**: photos you added can also shuffle, so a folder of your own images becomes a rotating set.",
          "**Colors**: the **Rotate** button cycles through Apple's solid colors.",
        ],
      },
      {
        type: "p",
        text: "Apple's pages for macOS 26 and 27 do not list the interval values, so open the Shuffle pop-up menu on your Mac to see which options it offers.",
      },
      { type: "h3", text: "Rotating wallpapers on macOS Ventura" },
      {
        type: "p",
        text: "On macOS Ventura 13 the same feature used different labels. Turn on **Auto-Rotate** to cycle through the pictures in a folder or album, choose a time interval from the **Change picture** pop-up menu, and select **Randomly** to shuffle the order. Ventura also lists five ways to arrange a picture: Fill Screen, Fit to Screen, Stretch to Fill Screen, Center, and Tile.",
      },
      { type: "h2", text: "Dynamic Wallpapers change on their own" },
      {
        type: "p",
        text: "A Dynamic Wallpaper needs no schedule. Apple describes these images as ones that brighten and darken based on the time of day for your current location. The Appearance pop-up menu offers Automatic, Dynamic, Light (Still), and Dark (Still). Apple first shipped the idea in macOS Mojave in 2018 as Dynamic Desktop. The full comparison is in [dynamic wallpaper vs live wallpaper](/blog/dynamic-wallpaper-vs-live-wallpaper-mac).",
      },
      { type: "h2", text: "Aerials, the screen saver, and the Lock Screen" },
      {
        type: "p",
        text: "On macOS 26 and 27, the aerial wallpapers (Landscape, Cityscape, Underwater, and Earth) animate as you lock or unlock your Mac, and the aerial you choose as wallpaper is also the screen saver by default. Screen saver options are in System Settings > Wallpaper > Screen Saver, and the idle timing is in System Settings > Lock Screen.",
      },
      {
        type: "p",
        text: "macOS Sonoma 14 worked the other way round: in Screen Saver settings you turned on **Show as wallpaper** to use a still aerial image as the desktop picture. That label does not appear on Apple's macOS 26 or 27 pages.",
      },
      { type: "h2", text: "Multiple displays and Spaces" },
      {
        type: "p",
        text: "Apple's Wallpaper settings page covers one switch for bigger setups: if you added desktop spaces or connected more than one display, turn on **Show on all Spaces** to use the same wallpaper on every space and display. Apple's page does not give steps for a different picture on each display. For that, and for live wallpapers across several screens, see [multi-monitor wallpaper on Mac](/blog/multi-monitor-wallpaper-mac).",
      },
      { type: "h2", text: "Make the wallpaper move with MacWall" },
      {
        type: "p",
        text: `Apple's help pages describe still images, Dynamic Wallpapers, and aerials that move when you lock or unlock. None of them describes a video that keeps playing on the desktop while you work. [MacWall](/download) adds that: it is a native Mac app with ${macwallCatalog.liveCountLabel} 4K live wallpapers, and it runs on ${macwallMinimumMacOSVersion} or later.`,
      },
      {
        type: "ol",
        items: [
          "[Download MacWall](/download), open the DMG, and move the app to Applications.",
          "Finish setup and start the free 24-hour trial. It asks for an email address, never a card.",
          "Browse the catalog in the app or at [macwall.app/wallpapers](/wallpapers), open a wallpaper, and click **Set wallpaper**.",
          "Pause, resume, stop, or switch wallpapers from the MacWall menu bar icon.",
        ],
      },
      {
        type: "p",
        text: `MacWall has its own rotation. Shuffle changes the wallpaper every 15 minutes, 1, 4 or 12 hours, or once a day, drawing from your favorites, your downloads, or the whole catalog. Day Schedule picks a wallpaper by time of day. With Pro, live Lock Screen and Screen Saver video works on ${macwallLockScreenMacOSVersion} or later. Full steps are in [set a live wallpaper](/docs/set-a-live-wallpaper) and [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac), and prices are on the [pricing page](/pricing).`,
      },
      {
        type: "table",
        columns: ["Option", "What changes", "Interval"],
        rows: [
          [
            "Shuffle Aerials (macOS)",
            "Still aerial images",
            "Set in the Shuffle pop-up menu (values not listed by Apple)",
          ],
          [
            "Your Photos shuffle (macOS)",
            "Your own photos",
            "Set in Wallpaper settings",
          ],
          [
            "Colors Rotate (macOS)",
            "Solid colors",
            "Cycles with the Rotate button",
          ],
          [
            "Dynamic Wallpapers (macOS)",
            "Brightness of one image",
            "Follows the time of day where you are",
          ],
          [
            "MacWall Shuffle",
            "Video wallpapers",
            "Every 15 minutes, 1, 4 or 12 hours, or once a day",
          ],
          ["MacWall Day Schedule", "Video wallpapers", "By time of day"],
        ],
        caption:
          "macOS rows from Apple Support; MacWall rows from the MacWall docs.",
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          "[Customize the wallpaper on your Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp3013/mac), Apple Support, accessed 27 October 2026",
          "[Customize the wallpaper on your Mac (macOS Tahoe 26)](https://support.apple.com/guide/mac-help/mchlp3013/26.0/mac/26), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp1103/mac), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS Tahoe 26)](https://support.apple.com/guide/mac-help/mchlp1103/26/mac/26), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS Ventura 13)](https://support.apple.com/guide/mac-help/mchlp1103/13.0/mac/13.0), Apple Support, accessed 27 October 2026",
          "[Use a screen saver on your Mac](https://support.apple.com/guide/mac-help/use-a-screen-saver-mchl4b68853d/mac), Apple Support, accessed 27 October 2026",
          "[Change Screen Saver settings on Mac](https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac), Apple Support, accessed 27 October 2026",
          "[Change Screen Saver settings on Mac (macOS Sonoma 14)](https://support.apple.com/guide/mac-help/mchlp1227/14.0/mac/14.0), Apple Support, accessed 27 October 2026",
          "[Find out which macOS your Mac is using](https://support.apple.com/en-us/109033), Apple Support, accessed 27 October 2026",
          "[Apple introduces macOS Mojave](https://www.apple.com/newsroom/2018/06/apple-introduces-macos-mojave/), Apple Newsroom, accessed 27 October 2026",
        ],
      },
    ],
    faq: [
      {
        question: "How do I change the wallpaper on a MacBook?",
        answer:
          "The same way as on any Mac: choose Apple menu > System Settings, click Wallpaper in the sidebar, and pick a wallpaper or add your own under Your Photos. Apple's steps do not differ between MacBook Air, MacBook Pro, and desktop Macs.",
      },
      {
        question: "How do I make my Mac wallpaper rotate automatically?",
        answer:
          "In System Settings > Wallpaper, choose Shuffle Aerials or let Your Photos shuffle, then set the interval in the pop-up menu next to Shuffle. On macOS Ventura the options are called Auto-Rotate, Change picture, and Randomly.",
      },
      {
        question: "How often can macOS change the wallpaper?",
        answer:
          "Apple's help pages do not list the interval values, so check the Shuffle pop-up menu on your Mac. MacWall's own Shuffle offers every 15 minutes, 1, 4 or 12 hours, or once a day.",
      },
      {
        question: "Can I set a video as my Mac wallpaper?",
        answer: `Not with System Settings. Apple's aerial wallpapers animate when you lock or unlock, but a video that keeps playing on the desktop needs an app such as MacWall, which runs on ${macwallMinimumMacOSVersion} or later.`,
      },
      {
        question: "How do I use the same wallpaper on every display?",
        answer:
          "Turn on Show on all Spaces in Wallpaper settings. Apple says this uses the same wallpaper on every desktop space and every connected display.",
      },
      {
        question: "Can I have a moving wallpaper on the Mac Lock Screen?",
        answer: `Apple's aerials animate as you lock or unlock. To put your own video or a MacWall catalog loop on the Lock Screen and Screen Saver, you need MacWall Pro on ${macwallLockScreenMacOSVersion} or later.`,
      },
    ],
  },
  {
    slug: "macbook-wallpaper-size",
    pathname: "/blog/macbook-wallpaper-size",
    title: "MacBook Wallpaper Size: Resolution for Every Mac",
    headline: "MacBook Wallpaper Size for Every Model",
    description:
      "Wallpaper size for every MacBook Air, MacBook Pro, iMac and Apple display, from Apple's native resolutions, plus how to size one image for all of them.",
    excerpt:
      "Apple's native resolution for every current Mac, and how to pick an image size that stays sharp.",
    category: "guides",
    publishedAt: "2026-09-28",
    updatedAt: "2026-10-27",
    keywords: [
      "macbook wallpaper size",
      "mac wallpaper size",
      "macbook wallpaper dimensions",
      "what size is a macbook wallpaper",
      "macbook pro wallpaper dimensions",
      "macbook air wallpaper size",
      "imac wallpaper size",
      "studio display wallpaper",
      "5k wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "**The best wallpaper size for a 14-inch MacBook Pro is its native resolution, 3024 by 1964 pixels, and for a 13-inch MacBook Air with M4 or M5 it is 2560 by 1664 pixels (Apple tech specs).** Every Mac has its own figure, listed in the table below, and an image at or above that size will look sharp on it.",
      },
      {
        type: "p",
        text: "All resolutions and pixel densities on this page come from Apple's tech specs and support pages, read on 27 October 2026. The aspect ratios are worked out from Apple's pixel counts; Apple states a ratio only for Pro Display XDR (16:9).",
      },
      { type: "h2", text: "Wallpaper size for every current Mac" },
      {
        type: "table",
        columns: [
          "Model",
          "Screen (diagonal)",
          "Native resolution",
          "Pixel density",
          "Aspect ratio",
        ],
        rows: [
          [
            "MacBook Air 13-inch (M5)",
            "13.6-inch",
            "2560 × 1664",
            "224 ppi",
            "20:13",
          ],
          [
            "MacBook Air 15-inch (M5)",
            "15.3-inch",
            "2880 × 1864",
            "224 ppi",
            "about 1.55:1",
          ],
          [
            "MacBook Air 13-inch (M4, 2025)",
            "13.6-inch",
            "2560 × 1664",
            "224 ppi",
            "20:13",
          ],
          [
            "MacBook Air (M1, 2020)",
            "13.3-inch",
            "2560 × 1600",
            "227 ppi",
            "16:10",
          ],
          [
            "MacBook Pro 14-inch (M5, M5 Pro, M5 Max)",
            "14.2-inch",
            "3024 × 1964",
            "254 ppi",
            "about 1.54:1",
          ],
          [
            "MacBook Pro 16-inch (M5 Pro, M5 Max)",
            "16.2-inch",
            "3456 × 2234",
            "254 ppi",
            "about 1.55:1",
          ],
          [
            "MacBook Pro 14-inch (M4 Pro or M4 Max, 2024)",
            "14.2-inch",
            "3024 × 1964",
            "254 ppi",
            "about 1.54:1",
          ],
          [
            "MacBook Pro 13-inch (M2, 2022)",
            "13.3-inch",
            "2560 × 1600",
            "227 ppi",
            "16:10",
          ],
          [
            "MacBook Neo 13-inch (A18 Pro)",
            "13.0-inch",
            "2408 × 1506",
            "219 ppi",
            "about 1.6:1",
          ],
          [
            "iMac 24-inch (M4)",
            "23.5-inch actual",
            "4480 × 2520",
            "218 ppi",
            "16:9",
          ],
          ["Studio Display", "27-inch", "5120 × 2880", "218 ppi", "16:9"],
          ["Studio Display XDR", "27-inch", "5120 × 2880", "218 ppi", "16:9"],
          [
            "Pro Display XDR",
            "32-inch",
            "6016 × 3384",
            "218 ppi",
            "16:9 (stated by Apple)",
          ],
        ],
        caption:
          "Source: Apple tech specs and Apple Support, accessed 27 October 2026. Aspect ratios are derived from Apple's pixel counts unless marked.",
      },
      { type: "h2", text: "MacBook Air wallpaper size" },
      {
        type: "p",
        text: "The 13-inch MacBook Air with M4 or M5 has a 2560 × 1664 display at 224 pixels per inch, and the 15-inch M5 model has 2880 × 1864 at the same density. The MacBook Air (M1, 2020) uses 2560 × 1600 at 227 ppi, a plain 16:10 shape. Apple notes that both current sizes have rounded top corners, so the viewable area is a little smaller than the measured rectangle. Keep faces and text away from the very top of the image, where the corners and the menu bar sit.",
      },
      { type: "h2", text: "MacBook Pro wallpaper size" },
      {
        type: "p",
        text: "Every 14-inch MacBook Pro in the table, M4 Pro and M4 Max as well as the M5 family, has a 3024 × 1964 panel at 254 ppi. The 16-inch M5 Pro and M5 Max models have 3456 × 2234, also at 254 ppi, the largest laptop panel in the table above. The older 13-inch MacBook Pro (M2, 2022) has 2560 × 1600, the same as the M1 MacBook Air.",
      },
      { type: "h2", text: "MacBook Neo wallpaper size" },
      {
        type: "p",
        text: "The MacBook Neo (13-inch, A18 Pro) has a 13.0-inch display at 2408 × 1506 and 219 ppi. Its shape works out to about 1.6:1, a touch wider than the current MacBook Air and MacBook Pro, so an image made for a MacBook Pro will lose a sliver at the top and bottom when it fills the screen.",
      },
      { type: "h2", text: "iMac, Studio Display, and Pro Display XDR" },
      {
        type: "ul",
        items: [
          "**iMac 24-inch (M4)**: 4480 × 2520 at 218 ppi. Apple calls it a 24-inch 4.5K Retina display and gives the actual diagonal as 23.5 inches.",
          "**Studio Display and Studio Display XDR**: both 5120 × 2880 at 218 ppi, so a 5K image (5120 × 2880) is the right size. Apple lists an Apple silicon Mac on macOS Tahoe 26.3.1 or later as a requirement for both.",
          "**Pro Display XDR**: 6016 × 3384 at 218 ppi, and the only display in the table where Apple states the 16:9 ratio itself.",
        ],
      },
      { type: "h2", text: "How to pick the right image size" },
      {
        type: "ul",
        items: [
          "**Match or exceed the native resolution.** An image smaller than the panel gets scaled up and looks soft. A larger one is scaled down and stays sharp.",
          "**One image for several Macs**: a 5120 × 2880 image is at least as wide and as tall as every Mac in the table except Pro Display XDR, so it covers a mixed household or office.",
          "**Mind the shape.** MacBooks sit between about 1.54:1 and 1.6:1, while the iMac and Apple's external displays are 16:9. A 16:9 image on a MacBook screen loses some width at the left and right when it fills the screen, so keep the subject near the center.",
          "**Leave the top edge quiet.** The menu bar sits there, and the MacBook Air has rounded top corners.",
          "**Resize instead of stretching.** The [wallpaper resizer](/tools/wallpaper-resizer) fits an image to a target size, and the [screen resolution checker](/tools/screen-resolution) helps you confirm which screen you are designing for.",
        ],
      },
      {
        type: "h2",
        text: "Native resolution vs the scaled sizes in System Settings",
      },
      {
        type: "p",
        text: "The resolution choices in Displays settings are scaled sizes that change how large text and windows look. They are not the panel's pixel count. Size the wallpaper for the native resolution in Apple's tech specs, the figures in the table above, and it will stay sharp at any scaling choice. The longer explanation is in [wallpaper resolution and displays](/learn/wallpaper-resolution-and-displays).",
      },
      { type: "h2", text: "External displays" },
      {
        type: "p",
        text: "For a third-party monitor, use the native resolution from its maker's spec sheet. Apple's specs also say how many external displays each Mac can drive: the MacBook Air with M5 supports two at up to 6K 60Hz or 4K 144Hz, or one at up to 8K 60Hz, 5K 120Hz, or 4K 240Hz, while the MacBook Air (M1, 2020) and the 13-inch MacBook Pro (M2, 2022) support one at up to 6K 60Hz. Setting a different wallpaper on each screen is covered in [multi-monitor wallpaper on Mac](/blog/multi-monitor-wallpaper-mac).",
      },
      { type: "h2", text: "Live wallpaper sizes" },
      {
        type: "p",
        text: `Video wallpapers follow the same rule, but a bigger file is not free: it costs more to decode. MacWall's [import guide](/docs/import-your-own-videos) recommends matching your display, or 3840 × 2160 for a 4K panel, and 24 to 30 fps for ambient motion, because encoding above the panel's resolution adds decode work with no visible gain. The MacWall catalog holds ${macwallCatalog.liveCountLabel} 4K live wallpapers, with an Ultrawide filter in the app. Browse them in the [wallpaper gallery](/wallpapers), [download MacWall](/download), or see [set a live wallpaper](/docs/set-a-live-wallpaper).`,
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          "[MacBook Air (13-inch and 15-inch, M5) tech specs](https://www.apple.com/macbook-air/specs/), Apple, accessed 27 October 2026",
          "[MacBook Air (13-inch, M4, 2025) tech specs](https://support.apple.com/en-us/122209), Apple Support, accessed 27 October 2026",
          "[MacBook Air (M1, 2020) tech specs](https://support.apple.com/en-us/111883), Apple Support, accessed 27 October 2026",
          "[MacBook Pro (14-inch and 16-inch, M5 family) tech specs](https://www.apple.com/macbook-pro/specs/), Apple, accessed 27 October 2026",
          "[MacBook Pro (14-inch, M4 Pro or M4 Max, 2024) tech specs](https://support.apple.com/en-us/121553), Apple Support, accessed 27 October 2026",
          "[MacBook Pro (13-inch, M2, 2022) tech specs](https://support.apple.com/en-us/111869), Apple Support, accessed 27 October 2026",
          "[MacBook Neo tech specs](https://www.apple.com/macbook-neo/specs/), Apple, accessed 27 October 2026",
          "[iMac tech specs](https://www.apple.com/imac/specs/), Apple, accessed 27 October 2026",
          "[Studio Display tech specs](https://www.apple.com/studio-display/specs/), Apple, accessed 27 October 2026",
          "[Studio Display XDR tech specs](https://www.apple.com/studio-display-xdr/specs/), Apple, accessed 27 October 2026",
          "[Pro Display XDR tech specs](https://support.apple.com/en-us/111892), Apple Support, accessed 27 October 2026",
        ],
      },
    ],
    faq: [
      {
        question: "What size should a MacBook Air wallpaper be?",
        answer:
          "2560 × 1664 pixels for the 13-inch MacBook Air with M4 or M5, 2880 × 1864 for the 15-inch M5 model, and 2560 × 1600 for the MacBook Air (M1, 2020).",
      },
      {
        question: "What size should a MacBook Pro wallpaper be?",
        answer:
          "3024 × 1964 pixels for the 14-inch MacBook Pro (M4 Pro, M4 Max, and M5 family) and 3456 × 2234 for the 16-inch M5 Pro and M5 Max. The 13-inch MacBook Pro (M2, 2022) uses 2560 × 1600.",
      },
      {
        question: "What wallpaper size fits the Studio Display?",
        answer:
          "5120 × 2880 pixels. Apple lists that resolution at 218 ppi for both the Studio Display and the Studio Display XDR, a 16:9 shape.",
      },
      {
        question: "Is a 5K wallpaper good for a MacBook?",
        answer:
          "Yes. A 5120 × 2880 image is larger than every MacBook panel in Apple's specs, so macOS scales it down cleanly. It is 16:9, so a little of the left and right edges is cropped on a MacBook screen.",
      },
      {
        question: "What aspect ratio are Mac wallpapers?",
        answer:
          "Working from Apple's pixel counts, current MacBooks are about 1.54:1 to 1.6:1, the M1 MacBook Air and M2 13-inch MacBook Pro are 16:10, and the iMac and Apple's external displays are 16:9.",
      },
      {
        question: "What size should a live wallpaper be on a Mac?",
        answer:
          "The same as a still: match the display. MacWall's import guide suggests 3840 × 2160 for a 4K panel and 24 to 30 fps, since going above the panel's resolution only adds decode work.",
      },
    ],
  },
  {
    slug: "how-to-change-lock-screen-on-mac",
    pathname: "/blog/how-to-change-lock-screen-on-mac",
    title: "How to Change the Lock Screen on Mac",
    headline: "How to Change the Lock Screen on a Mac",
    description:
      "Change the Mac Lock Screen wallpaper, clock, login picture and message on macOS 27 and Tahoe, set when it locks, and put a video on it.",
    excerpt:
      "The Lock Screen picture, clock, login picture, message and password settings, from Apple's help pages, plus a moving Lock Screen.",
    category: "guides",
    publishedAt: "2026-11-06",
    keywords: [
      "how to change lock screen on mac",
      "how to change lock screen wallpaper on mac",
      "mac lock screen wallpaper",
      "change login screen mac",
      "mac lock screen message",
      "mac lock screen clock",
      "live lock screen mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To change the Lock Screen on a Mac, change your wallpaper in System Settings > Wallpaper: on current macOS the Lock Screen shows the same picture as the desktop, and Apple's settings have no separate Lock Screen wallpaper. The clock is under Clock Appearance in the same pane, your login picture is in Users & Groups, and the message, password and login window options are in System Settings > Lock Screen.**",
      },
      {
        type: "p",
        text: `The steps below follow Apple's help pages for macOS 27 Golden Gate and macOS Tahoe 26, read on 6 November 2026, with notes where macOS Sequoia 15 differs. To see which version you have, choose Apple menu > About This Mac. A Lock Screen that plays video is not something System Settings offers; the last part of this guide covers it with [MacWall](/download), which needs ${macwallLockScreenMacOSVersion} or later for that.`,
      },
      { type: "h2", text: "What you can change on the Mac Lock Screen" },
      {
        type: "table",
        columns: ["What you see", "Where to change it", "Notes"],
        rows: [
          [
            "Background picture",
            "System Settings > Wallpaper",
            "The same picture as your desktop",
          ],
          [
            "Large clock",
            "System Settings > Wallpaper > Clock Appearance",
            "macOS 26 and 27: whether it shows, where, font and weight",
          ],
          [
            "Login picture",
            "System Settings > Users & Groups",
            "Also your Apple Account picture and your My Card in Contacts",
          ],
          [
            "Message",
            "System Settings > Lock Screen > Show message when locked",
            "Shown in the login window, for example contact details for a lost Mac",
          ],
          [
            "When a password is needed",
            "System Settings > Lock Screen",
            "Require password after screen saver begins or display is turned off",
          ],
          [
            "Screen saver",
            "System Settings > Wallpaper > Screen Saver",
            "Starts after the idle time you choose",
          ],
          [
            "Login window layout",
            "System Settings > Lock Screen > Login window shows",
            "A list of users, or name and password fields",
          ],
          [
            "A moving video",
            "Not in System Settings",
            `MacWall Pro on ${macwallLockScreenMacOSVersion} or later`,
          ],
        ],
        caption:
          "From Apple Support's Mac User Guide for macOS 27 and macOS Tahoe 26, read 6 November 2026. The last row is MacWall.",
      },
      { type: "h2", text: "Change the Lock Screen wallpaper" },
      {
        type: "ol",
        items: [
          "Choose Apple menu > **System Settings**, then click **Wallpaper** in the sidebar. Apple notes you may need to scroll down to see it.",
          "Pick a wallpaper from one of Apple's categories: Dynamic Wallpapers, the Landscape, Cityscape, Underwater and Earth aerials, Shuffle Aerials, Pictures or Colors. macOS 27 also has a Mac category.",
          "For your own picture, scroll to **Your Photos**, click **Add Photo**, then choose **Choose from Photos**, **Choose File** or **Choose Folder**.",
          "Lock your Mac to check it: press **Control-Command-Q**, or choose Apple menu > **Lock Screen**.",
        ],
      },
      {
        type: "p",
        text: "Apple describes the aerials as images that animate as you lock or unlock your Mac, and by default the aerial you choose is also your screen saver. That is the closest System Settings comes to a moving Lock Screen. Every other way to set a wallpaper, from Photos, Finder or Safari, changes the Lock Screen too, because it is the same picture; [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac) covers all of them.",
      },
      {
        type: "h3",
        text: "Can the Lock Screen have a different picture from the desktop?",
      },
      {
        type: "p",
        text: `Not with Apple's settings. The Wallpaper pages for macOS 26 and 27 describe one current wallpaper, with no separate Lock Screen picture, and macOS uses that one wallpaper for both places. MacWall can split them in its ${macwallPlaybackModes.app.setting} playback mode, where MacWall draws the desktop itself: open a wallpaper, click the arrow next to **Set Wallpaper** and choose **Lock Screen Only**, and the Lock Screen plays that one while the desktop keeps its own.`,
      },
      { type: "h2", text: "Change the clock on the Lock Screen" },
      {
        type: "p",
        text: "On macOS 26 and 27, Wallpaper settings has a **Clock Appearance** section. Apple says it lets you choose whether the large clock appears and where it appears: on the Lock Screen only, or on both the screen saver and the Lock Screen. You can also choose the clock's font and its weight, meaning how light or heavy the numbers look. A thin clock suits a busy picture; a heavy one stays readable over a bright one.",
      },
      { type: "h2", text: "Change your login picture" },
      {
        type: "ol",
        items: [
          "Choose Apple menu > **System Settings**, then click **Users & Groups** in the sidebar.",
          "Click the picture next to your login name.",
          "Choose a source: **Memoji**, **Emoji**, **Monogram** (a background color and your initials), **Camera**, **Photos** or **Suggestions**. You can also drag an image from the Finder onto the current picture.",
          "Drag the picture inside the circle to position it, use the slider to zoom, then click **Save**.",
        ],
      },
      {
        type: "p",
        text: "Apple notes that the login picture is also your Apple Account picture and your My Card in Contacts, and that you can't change the picture of another user who is logged in at the time.",
      },
      { type: "h2", text: "Show a message on the Lock Screen" },
      {
        type: "p",
        text: "In System Settings > **Lock Screen**, turn on **Show message when locked** and enter a short message. Apple says it appears in the login window to anyone who tries to log in while your Mac is locked, and suggests using it for contact details in case the Mac is lost. Keep it to a line, such as an email address, rather than anything private.",
      },
      { type: "h2", text: "Set when your Mac locks and asks for a password" },
      {
        type: "p",
        text: "Three settings decide how quickly the Lock Screen appears. Two of them are in System Settings > Lock Screen, and the screen saver's own timer is in Wallpaper settings:",
      },
      {
        type: "ul",
        items: [
          "**Turn display off on battery when inactive** and **Turn display off on power adapter when inactive**: how long the Mac can sit idle before the display turns off, set separately for battery and power.",
          "**Require password after screen saver begins or display is turned off**: how long after the screen saver starts, or the Mac sleeps, before your password is needed.",
          "**Start Screen Saver** (Wallpaper > Screen Saver): how long the Mac can be inactive before the screen saver starts.",
        ],
      },
      {
        type: "p",
        text: "To lock right away, press Control-Command-Q or choose Apple menu > Lock Screen. To start the screen saver by moving the pointer into a corner, go to System Settings > Desktop & Dock and click **Hot Corners**. Pressing a key, moving the mouse or touching the trackpad stops the screen saver.",
      },
      { type: "h2", text: "Change the login window" },
      {
        type: "ul",
        items: [
          "**Login window shows**: **List of users** lets people pick their name; **Name and password** makes them type both, which reveals less about who uses the Mac.",
          "**Show the Sleep, Restart, and Shut Down buttons**: shows or hides those buttons in the login window.",
          "**Show password hints**: Apple says the hint appears if someone clicks the question mark in the password field or enters a wrong password three times in a row.",
          "**Accessibility Options**: settings that make it easier to log in to your Mac.",
        ],
      },
      { type: "h2", text: "Choose the screen saver" },
      {
        type: "p",
        text: 'The screen saver plays before the Lock Screen when you step away, so it is part of the same look. Open System Settings > Wallpaper, click **Screen Saver**, select **Custom**, and choose from Apple\'s categories: macOS slow-motion images, the Landscape, Cityscape, Underwater and Earth aerials, Shuffle Aerials, and Other, which holds your photos, Message and Word of the Day. macOS 27 adds Mac, gradient pill shapes that spell the word "Mac". The full walkthrough is in [how to change the screen saver on Mac](/blog/how-to-change-screen-saver-mac).',
      },
      { type: "h2", text: "Put a video on the Lock Screen with MacWall" },
      {
        type: "p",
        text: `Apple's aerials move only as you lock or unlock. To have your own video, or one of MacWall's ${macwallCatalog.liveCountLabel} catalog loops, play on the Lock Screen and as the screen saver, you need [MacWall](/download) on ${macwallLockScreenMacOSVersion} or later, macOS 27 included, with Pro or the ${macwallTrial.name}. On macOS 15 MacWall plays the desktop only, and the Lock Screen shows a still from your wallpaper. How it works depends on the playback mode in **${macwallPlaybackModes.settingsPath}**:`,
      },
      {
        type: "ul",
        items: [
          `**${macwallPlaybackModes.systemWallpaper.setting}** (new installs on macOS 26 and later start here): set a wallpaper as usual and the Lock Screen and screen saver play it too, sound included, even while MacWall is closed. Turn on **Play only on the Lock Screen** in Settings → Lock Screen and the desktop rests on a still frame while the wallpaper moves when you lock, like Apple's aerials. Turn off **Play the wallpaper while locked** and the Lock Screen holds its frame, which saves battery.`,
          `**${macwallPlaybackModes.app.setting}**: in Settings → Lock Screen, turn on **Show on Lock Screen and screen saver**. Then the menu next to **Set Wallpaper** picks Desktop & Lock Screen, Desktop Only or Lock Screen Only.`,
        ],
      },
      {
        type: "p",
        text: "Lock with Control-Command-Q to see it. Setup details are in [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver), what changed in macOS 27 is in [Lock Screen live wallpaper on macOS 27](/blog/macos-27-lock-screen-live-wallpaper), and if the video stopped after an update, see [live wallpaper stopped after a macOS update](/blog/macos-27-beta-live-wallpaper-not-working).",
      },
      { type: "h2", text: "On macOS Sequoia 15" },
      {
        type: "p",
        text: "Sequoia arranges a few of these settings differently. Screen Saver is its own item in the System Settings sidebar, and its aerials and macOS images have a **Show as wallpaper** switch that uses a still version as the desktop picture. The clock and the screen saver timer are in System Settings > Lock Screen rather than Wallpaper: **Start Screen Saver when inactive**, **Show large clock** (with the screen saver and the Lock Screen, just the Lock Screen, or neither), **Show 24-hour time** and **Show user name and photo**. The message, password and login window options are the same as above.",
      },
      { type: "h2", text: "If the Lock Screen doesn't change" },
      {
        type: "ul",
        items: [
          "**Still the old picture**: set the wallpaper again in System Settings > Wallpaper, then lock with Control-Command-Q.",
          "**A different screen saver than you expect**: on macOS 26 and 27, the aerial you pick as wallpaper is also the screen saver by default; choosing another one under Screen Saver replaces it, including one MacWall set.",
          "**The screen goes dark too soon**: lengthen the two Turn display off settings in System Settings > Lock Screen. MacWall can't keep the display on.",
          "**A MacWall video is frozen or blank on the Lock Screen**: update MacWall from Settings → About → Check Now, then set the wallpaper again. [How Lock Screen video works on macOS Tahoe](/learn/how-macos-tahoe-lock-screen-video-works) explains the black screen after unlock.",
        ],
      },
      ...sourcesBlocks([
        blogSources.appleLockScreenSettings,
        blogSources.appleLockScreenSettings26,
        blogSources.appleLockScreenSettings15,
        blogSources.appleCustomizeWallpaper,
        blogSources.appleWallpaperSettings,
        blogSources.appleWallpaperSettings26,
        blogSources.appleWallpaperSettings15,
        blogSources.appleLoginPicture,
        blogSources.appleUseScreenSaver,
        blogSources.appleScreenSaverSettings,
        blogSources.appleScreenSaverSettings15,
        blogSources.appleMacOSVersions,
      ]),
    ],
    faq: [
      {
        question: "How do I change my Lock Screen wallpaper on a Mac?",
        answer:
          "Change your desktop wallpaper in System Settings > Wallpaper. On current macOS the Lock Screen shows the same picture, so there is no separate Lock Screen wallpaper to set.",
      },
      {
        question:
          "Can I have a different Lock Screen and desktop wallpaper on a Mac?",
        answer: `Not with Apple's settings: macOS uses one wallpaper for both. MacWall can, in its ${macwallPlaybackModes.app.setting} playback mode: open a wallpaper, click the arrow next to Set Wallpaper and choose Lock Screen Only.`,
      },
      {
        question: "How do I change the clock on the Mac Lock Screen?",
        answer:
          "On macOS 26 and 27, open System Settings > Wallpaper and use Clock Appearance to choose whether the large clock shows, where it shows, and its font and weight.",
      },
      {
        question: "How do I put a message on my Mac's Lock Screen?",
        answer:
          "In System Settings > Lock Screen, turn on Show message when locked and type the message. Apple suggests contact details in case the Mac is lost.",
      },
      {
        question: "How do I change my login picture on a Mac?",
        answer:
          "Open System Settings > Users & Groups, click the picture next to your login name, choose a Memoji, emoji, monogram, camera shot or photo, then click Save.",
      },
      {
        question: "Can a Mac Lock Screen play a video?",
        answer: `Apple's aerials animate as you lock or unlock. For your own video or a looping wallpaper on the Lock Screen and screen saver, use MacWall Pro (or its free 24-hour trial) on ${macwallLockScreenMacOSVersion} or later.`,
      },
    ],
  },
  {
    slug: "how-to-change-screen-saver-mac",
    pathname: "/blog/how-to-change-screen-saver-mac",
    title: "Mac Screen Savers: How to Change Them, Best Picks",
    headline: "How to Change the Screen Saver on Mac",
    description:
      "Change your Mac screen saver on macOS 27, Tahoe or Sequoia, set when it starts or turn it off, the best built-in screen savers, and a video screen saver.",
    excerpt:
      "Apple's steps for macOS 26 and 27, what moved since Sequoia, the best built-in screen savers, and your own video as the screen saver.",
    category: "guides",
    publishedAt: "2026-09-28",
    updatedAt: "2026-11-06",
    keywords: [
      "how to change screensaver on mac",
      "how to change screen saver mac",
      "mac screensaver",
      "screensavers for mac",
      "aerial screensaver mac",
      "how to turn off screensaver mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To change the screen saver on a Mac with macOS 26 or 27, open System Settings, click Wallpaper, click Screen Saver, then choose one.** In the same place, **Start Screen Saver** sets how long your Mac waits before it begins. On macOS Sequoia 15, Screen Saver is its own item in the System Settings sidebar instead.",
      },
      {
        type: "p",
        text: "This guide follows Apple's help pages for macOS 27 Golden Gate, macOS Tahoe 26 and macOS Sequoia 15, read on 6 November 2026. To check your version, choose Apple menu > About This Mac.",
      },
      { type: "h2", text: "Change the screen saver on macOS 26 and 27" },
      {
        type: "ol",
        items: [
          "Choose Apple menu > **System Settings**, then click **Wallpaper** in the sidebar. You may need to scroll down.",
          "Click **Screen Saver**.",
          "Under **Use Screen Saver**, choose **Custom**.",
          "Choose a screen saver from one of the categories below, then click **Options** at the top of the window to set color, speed and more, where the screen saver has them.",
          "Move the pointer over the thumbnail at the top and click **Preview** to see it full screen. Move the pointer to stop.",
        ],
      },
      {
        type: "table",
        columns: ["Category", "What it is", "macOS 26", "macOS 27"],
        rows: [
          ["macOS", "Slow-motion images", "Yes", "Yes"],
          [
            "Landscape, Cityscape, Underwater, Earth",
            "Slow-motion aerials; some download the first time you pick them",
            "Yes",
            "Yes",
          ],
          [
            "Mac",
            'Gradient pill shapes that spell "Mac" in shifting colors',
            "No",
            "Yes",
          ],
          [
            "Shuffle Aerials",
            "Rotates through several aerials at an interval you set",
            "Yes",
            "Yes",
          ],
          [
            "Other",
            "Your photos and screen savers such as Message and Word of the Day; Random shuffles them",
            "Yes",
            "Yes",
          ],
        ],
        caption:
          "Screen saver categories from Apple Support, read 6 November 2026.",
      },
      {
        type: "p",
        text: "On macOS 26 and 27 the wallpaper and the screen saver are linked: Apple says the aerial you choose as your wallpaper is also used as your screen saver by default, and aerial wallpapers animate as you lock or unlock. Choose a different screen saver here to break that link.",
      },
      { type: "h2", text: "Set when the screen saver starts, or turn it off" },
      {
        type: "ul",
        items: [
          "**Timer**: in System Settings > Wallpaper > Screen Saver, **Start Screen Saver** sets how long your Mac can be inactive before it starts. To turn the screen saver off, set it to Never.",
          "**Right away**: choose Apple menu > Lock Screen, which Apple says also starts the screen saver.",
          "**Hot corner**: System Settings > Desktop & Dock > **Hot Corners**, then pick Start Screen Saver for a corner and move the pointer there.",
          "**The display turning off**: System Settings > Lock Screen has separate **Turn display off on battery when inactive** and **on power adapter when inactive** timers. Apple notes the screen saver doesn't start if the display is already off, so set these longer than the screen saver timer.",
          "**Password**: **Require password after screen saver begins or display is turned off**, also in Lock Screen settings, decides how soon your password is needed.",
        ],
      },
      {
        type: "p",
        text: "Pressing any key, moving the mouse or touching the trackpad stops the screen saver.",
      },
      { type: "h2", text: "On macOS Sequoia 15" },
      {
        type: "p",
        text: "Sequoia puts **Screen Saver** in the System Settings sidebar. The timer is **Start Screen Saver when inactive** in System Settings > Lock Screen, and Screen Saver settings shows a **Lock Screen Settings** button when the display is set to sleep before the screen saver starts. The aerials and macOS images there have a **Show as wallpaper** switch that uses a still version as your desktop picture, and **Show on all Spaces** uses the same screen saver on every Space and display.",
      },
      { type: "h2", text: "The best Mac screen savers" },
      {
        type: "ul",
        items: [
          "**Apple's aerials**: Landscape, Cityscape, Underwater and Earth, in slow motion. The best built-in choice on a large display; pick one and it downloads the first time.",
          "**Shuffle Aerials**: the same footage, changing at an interval you choose from the pop-up menu next to Shuffle.",
          '**Mac** (macOS 27): colored pill shapes spelling "Mac". Quiet, and it suits a desk Mac.',
          "**Photos**: your own albums; the Options let you pick a style.",
          "**Message** and **Word of the Day**: minimal, readable, and useful on a shared Mac.",
          "**Your own video**: not possible in System Settings; see below.",
        ],
      },
      { type: "h2", text: "Use your own video as the screen saver" },
      {
        type: "p",
        text: `System Settings only offers Apple's own footage as a moving screen saver. [MacWall](/download) plays your wallpaper as the screen saver and on the Lock Screen on ${macwallLockScreenMacOSVersion} or later, with Pro or during the ${macwallTrial.name}: a catalog loop, or your own ${macwallImportFormatsLabel} video. It depends on the playback mode in ${macwallPlaybackModes.settingsPath}:`,
      },
      {
        type: "ul",
        items: [
          `**${macwallPlaybackModes.systemWallpaper.setting}**: the screen saver and Lock Screen play the same wallpaper as the desktop, sound included, even while MacWall is closed.`,
          `**${macwallPlaybackModes.app.setting}**: turn on **Show on Lock Screen and screen saver** in MacWall's Settings → Lock Screen.`,
        ],
      },
      {
        type: "p",
        text: "If you later choose another screen saver in System Settings, macOS shows that one instead. Slow, dark loops make the best screen savers: try [moon](/wallpapers/collections/moon), [rain](/wallpapers/collections/rain) or [galaxy](/wallpapers/collections/galaxy). How it works, step by step, is on [live video screen savers for Mac](/screen-saver-mac), and the rest of the Lock Screen is covered in [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac).",
      },
      { type: "h2", text: "Screen saver not working?" },
      {
        type: "ul",
        items: [
          "**It never starts**: check Start Screen Saver isn't set to Never, and that the display isn't set to turn off sooner in Lock Screen settings.",
          "**It doesn't start during a call or a video**: apps that play video or keep the display awake hold it off while they run.",
          "**An aerial shows black**: aerials marked for download need a network connection the first time; pick it again once you're online.",
          "**A different screen saver than you chose**: on macOS 26 and 27, picking an aerial wallpaper sets its aerial as the screen saver by default.",
        ],
      },
      ...sourcesBlocks([
        blogSources.appleScreenSaverSettings,
        blogSources.appleUseScreenSaver,
        blogSources.appleScreenSaverSettings15,
        blogSources.appleCustomizeWallpaper,
        blogSources.appleLockScreenSettings,
        blogSources.appleLockScreenSettings15,
      ]),
    ],
    faq: [
      {
        question: "Where is the screen saver setting on a Mac?",
        answer:
          "On macOS 26 and 27, in System Settings > Wallpaper > Screen Saver. On macOS Sequoia 15, Screen Saver is its own item in the System Settings sidebar.",
      },
      {
        question: "How do I turn off the screen saver on a Mac?",
        answer:
          "On macOS 26 and 27, set Start Screen Saver to Never in System Settings > Wallpaper > Screen Saver. On Sequoia, set Start Screen Saver when inactive to Never in Lock Screen settings.",
      },
      {
        question: "How do I start the screen saver right away?",
        answer:
          "Choose Apple menu > Lock Screen, or set up a hot corner in System Settings > Desktop & Dock > Hot Corners and move the pointer into it.",
      },
      {
        question: "Can I use my own video as a Mac screen saver?",
        answer: `Not with System Settings. MacWall Pro on ${macwallLockScreenMacOSVersion} or later plays a catalog loop or your own video as the screen saver and on the Lock Screen.`,
      },
      {
        question: "What are the best screen savers on a Mac?",
        answer:
          "Apple's slow-motion aerials (Landscape, Cityscape, Underwater, Earth) and Shuffle Aerials are the best built in; Message and Word of the Day are the quietest. For your own footage you need an app such as MacWall.",
      },
    ],
  },
  {
    slug: "how-to-customize-mac-desktop",
    pathname: "/blog/how-to-customize-mac-desktop",
    title: "How to Customize Your MacBook: 12 Changes",
    headline: "How to Customize Your MacBook",
    description:
      "Customize your MacBook or Mac: wallpaper, widgets, Liquid Glass and accent colors, Dock, menu bar, icons, Lock Screen and a moving desktop.",
    excerpt:
      "Twelve changes that turn a stock MacBook into your own setup, from the wallpaper and widgets to the Dock, icons and Lock Screen.",
    category: "guides",
    publishedAt: "2026-09-28",
    updatedAt: "2026-11-06",
    keywords: [
      "how to customize macbook",
      "how to customize mac desktop",
      "macbook customization",
      "aesthetic mac setup",
      "how to add widgets to mac desktop",
      "how to hide desktop icons on mac",
      "how to change mac icons",
    ],
    sections: [
      {
        type: "p",
        text: "**To customize a MacBook, start with the wallpaper (System Settings > Wallpaper), set the look in System Settings > Appearance, add widgets by Control-clicking the desktop and choosing Edit Widgets, then tidy the Dock, menu bar and icons.** Everything here works the same on a MacBook Air, a MacBook Pro or a desktop Mac; the last few steps matter most on a laptop.",
      },
      { type: "h2", text: "1. Pick a wallpaper that sets the mood" },
      {
        type: "p",
        text: "Everything else takes its color from the wallpaper, especially the translucent Liquid Glass menus and Dock of macOS Tahoe and later. Choose a still in System Settings > Wallpaper ([full guide](/blog/how-to-change-wallpaper-on-mac)) or a moving one with [MacWall](/download). Popular picks: [lofi](/wallpapers/collections/lofi), [purple](/wallpapers/collections/purple), [rain](/wallpapers/collections/rain) and [anime](/wallpapers/anime). Size it for your screen with [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
      { type: "h2", text: "2. Set the appearance and Liquid Glass" },
      {
        type: "p",
        text: "System Settings > Appearance chooses Light, Dark or Auto, plus an accent color and a highlight color. On macOS 27, Apple says you can also customize how Liquid Glass looks, from ultraclear to fully tinted, in the same Appearance settings. Matching the accent to your wallpaper, purple with a purple loop for example, makes the whole system feel designed.",
      },
      { type: "h2", text: "3. Add widgets to the desktop" },
      {
        type: "ol",
        items: [
          "Control-click (or right-click) an empty part of the desktop.",
          "Choose **Edit Widgets**.",
          "Drag widgets such as Calendar, Weather, Reminders or Clock onto the desktop. Widgets from iPhone apps work too when your iPhone is nearby or on the same network.",
        ],
      },
      { type: "h2", text: "4. Hide desktop icons" },
      {
        type: "ul",
        items: [
          "Finder > Settings > General: uncheck hard disks, external disks and connected servers under **Show these items on the desktop**.",
          "Move files into folders, or turn on **Use Stacks** (Control-click the desktop) to group them automatically.",
          "To hide every icon, run `defaults write com.apple.finder CreateDesktop false; killall Finder` in Terminal. Replace `false` with `true` to bring them back.",
        ],
      },
      { type: "h2", text: "5. Clean up the Dock" },
      {
        type: "ul",
        items: [
          "System Settings > Desktop & Dock: turn on **Automatically hide and show the Dock**, which also gives a 13-inch screen more room.",
          "Turn off **Show suggested and recent apps in Dock**.",
          "Drag apps you rarely use out of the Dock until you see Remove.",
        ],
      },
      { type: "h2", text: "6. Tidy the menu bar" },
      {
        type: "p",
        text: "Hold Command and drag menu bar icons to reorder or remove them. In System Settings > Control Center you choose which system icons appear. Setting the menu bar to hide automatically gives a cleaner desktop, and fewer icons leave more room on a smaller MacBook screen.",
      },
      { type: "h2", text: "7. Custom app and folder icons" },
      {
        type: "ol",
        items: [
          "Copy an image (PNG works best) to the clipboard.",
          "Select the app or folder in Finder and press Command-I to open Get Info.",
          "Click the small icon at the top left of the Get Info window and press Command-V.",
        ],
      },
      {
        type: "p",
        text: "On macOS Tahoe and later, folders can also take a color and a symbol or emoji directly from the Finder.",
      },
      { type: "h2", text: "8. Use Stage Manager or Spaces" },
      {
        type: "p",
        text: "Stage Manager (in Control Center) keeps one app in focus and parks the rest at the side, leaving more of the wallpaper visible. Spaces in Mission Control give each workspace its own wallpaper, unless **Show on all Spaces** is on in Wallpaper settings.",
      },
      { type: "h2", text: "9. Customize the Lock Screen" },
      {
        type: "p",
        text: "The Lock Screen shows your wallpaper, so step 1 already changed it. On macOS 26 and 27, **Clock Appearance** in Wallpaper settings sets the large clock's font, weight and where it appears; System Settings > Lock Screen adds a message, and Users & Groups sets your login picture. The full guide is [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac).",
      },
      { type: "h2", text: "10. Pick a screen saver" },
      {
        type: "p",
        text: "Apple's slow-motion aerials make the best built-in screen savers, and on macOS 26 and 27 the aerial you pick as your wallpaper becomes the screen saver by default. Choose one in System Settings > Wallpaper > Screen Saver; [how to change the screen saver on Mac](/blog/how-to-change-screen-saver-mac) has the options.",
      },
      { type: "h2", text: "11. Add motion to the desktop and Lock Screen" },
      {
        type: "p",
        text: `A live wallpaper is the biggest single change you can make to how a Mac feels. MacWall plays ${macwallCatalog.liveCountLabel} 4K loops, or your own videos with Pro, on the desktop on ${macwallMinimumMacOSVersion} or later, and on the Lock Screen and as the screen saver on ${macwallLockScreenMacOSVersion} or later. On Apple silicon MacBooks, its [Bend](/bend) effect folds the desktop with the lid as you close it. Setup: [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).`,
      },
      { type: "h2", text: "12. Keep it light on battery" },
      {
        type: "p",
        text: `A customized MacBook shouldn't cost you an afternoon unplugged. Fewer widgets that refresh often, a still or Dynamic Wallpaper when you need every minute, and a moving one that pauses when it is hidden all help. MacWall pauses behind full-screen apps by default, and **${macwallBatteryPolicy.pauseOnBattery.label}** in ${macwallBatteryPolicy.settingsPath} ${macwallBatteryPolicy.pauseOnBattery.detail}. What drives the cost is explained in [live wallpaper CPU and battery use](/blog/live-wallpaper-cpu-usage-mac).`,
      },
    ],
    faq: [
      {
        question: "How do I customize my MacBook?",
        answer:
          "Change the wallpaper in System Settings > Wallpaper, set Light or Dark and an accent color in Appearance, add desktop widgets, auto-hide the Dock, tidy the menu bar, and set custom folder icons. A live wallpaper app adds motion.",
      },
      {
        question: "How do I make my Mac desktop aesthetic?",
        answer:
          "Choose a cohesive wallpaper (a live one adds the most), match the accent color in System Settings > Appearance, add a few widgets, hide desktop icons and auto-hide the Dock.",
      },
      {
        question: "How do I add widgets to the Mac desktop?",
        answer:
          "Control-click the desktop, choose Edit Widgets, and drag widgets from the gallery onto the desktop. This works on macOS Sonoma and later.",
      },
      {
        question: "How do I hide desktop icons on a Mac?",
        answer:
          "Uncheck the items in Finder > Settings > General, use Stacks, or run defaults write com.apple.finder CreateDesktop false; killall Finder in Terminal.",
      },
      {
        question: "Can I change the Lock Screen on a MacBook?",
        answer:
          "Yes. It shows your wallpaper, so change that in System Settings > Wallpaper. On macOS 26 and 27, Clock Appearance changes the clock, and Lock Screen settings add a message.",
      },
    ],
  },
]
