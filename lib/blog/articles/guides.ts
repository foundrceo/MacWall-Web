import {
  macwall,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import type { BlogArticle } from "@/lib/content/types"

export const guideArticles: BlogArticle[] = [
  {
    slug: "how-to-set-live-wallpaper-mac",
    pathname: "/blog/how-to-set-live-wallpaper-mac",
    title: "How to Set a Live Wallpaper on Mac (2026 Guide)",
    headline: "How to Set a Live Wallpaper on Mac",
    description:
      "Set an animated desktop background on macOS with MacWall: download the app, pick a wallpaper, and control playback from the menu bar.",
    excerpt:
      "A walkthrough for motion wallpapers on Apple silicon and Intel Macs running macOS 15 Sequoia or later.",
    category: "guides",
    readMinutes: 6,
    publishedAt: "2026-07-13",
    keywords: [
      "how to set live wallpaper on mac",
      "animated wallpaper mac",
      "live wallpaper macos tutorial",
    ],
    sections: [
      {
        type: "p",
        text: "**To set a live wallpaper on a Mac, install a live wallpaper app such as MacWall, pick a video loop, and click Set. macOS has no built-in option for video wallpapers.** It ships with a handful of dynamic wallpapers, but they are scheduled still images and you cannot use your own video loops. **MacWall** is a native app that plays motion wallpapers behind your desktop windows, with hardware decoding on Apple Silicon, menu bar controls, and an offline-friendly catalog.",
      },
      {
        type: "h2",
        text: "Step 1: Download MacWall",
      },
      {
        type: "p",
        text: "Visit macwall.app/download and grab the latest DMG. Open it, drag MacWall to Applications, and open it from there. Every download starts with a free 24-hour trial. The app runs in the background, and you control it from the menu bar icon.",
      },
      {
        type: "h2",
        text: "Step 2: Pick a wallpaper from the catalog",
      },
      {
        type: "p",
        text: "Open MacWall and browse Home, Explore, or Library. Categories include Anime, Nature, Cars, Gaming, Space, Heroes, Dark, Abstract, and Others. Click any wallpaper to preview it, then click **Set wallpaper**. Downloaded wallpapers are cached on your Mac and play offline.",
      },
      {
        type: "h2",
        text: "Step 3: Import your own clips (optional)",
      },
      {
        type: "p",
        text: "With Pro, drag MP4, MOV, M4V, or GIF files into MacWall's Library. Imports stay on your Mac and are never uploaded. Importing your own videos is not part of the free trial.",
      },
      {
        type: "h2",
        text: "Step 4: Control playback from the menu bar",
      },
      {
        type: "p",
        text: "Pause, resume, or stop from the menu bar without opening the main window. MacWall automatically pauses when another app goes full screen, and can pause in Low Power Mode, so the wallpaper is not decoding video while a game or full-screen app covers it.",
      },
      {
        type: "h2",
        text: "Step 5: Turn on Lock Screen motion",
      },
      {
        type: "p",
        text: `MacWall Pro adds live Lock Screen and Screen Saver video on ${macwallLockScreenMacOSVersion} or later. It is a one-time purchase of ${macwall.pro.price} with lifetime updates, for up to ${macwall.maxLicensedMacs} Macs per license, and Pro+ packs cover 5 or 10 Macs. See [pricing](/pricing).`,
      },
      {
        type: "h2",
        text: "Where to find live wallpapers",
      },
      {
        type: "p",
        text: "Browse the [web gallery](/wallpapers) or start from a collection: [Gojo](/wallpapers/collections/gojo), [Spider-Man](/wallpapers/collections/spider-man), [JDM cars](/wallpapers/collections/jdm), [rain](/wallpapers/collections/rain), [lofi](/wallpapers/collections/lofi), or [galaxy](/wallpapers/collections/galaxy). Every wallpaper page has a **Set on Mac** button that opens it straight in the app.",
      },
    ],
    faq: [
      {
        question: "Can you have a live wallpaper on a Mac?",
        answer:
          "Yes, with a live wallpaper app. macOS only supports still and dynamic wallpapers on its own; apps like MacWall play video loops as the desktop wallpaper on macOS 15 and later.",
      },
      {
        question: "How do I get live wallpapers on my MacBook?",
        answer:
          "Download MacWall, open it, pick a wallpaper from the catalog or import your own MP4 or MOV, and click Set. It works on every MacBook Air and MacBook Pro running macOS 15 or later.",
      },
      {
        question: "Do live wallpapers drain the battery on a Mac?",
        answer:
          "A native app keeps the cost low. MacWall decodes video in hardware and pauses automatically behind full-screen apps and when the display sleeps; actual battery use depends on your Mac, the video, and your settings.",
      },
      {
        question: "How do I remove a live wallpaper on Mac?",
        answer:
          "Choose Stop Wallpaper from the MacWall menu bar icon, then pick any still wallpaper in System Settings > Wallpaper.",
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
    publishedAt: "2026-07-13",
    keywords: [
      "video as wallpaper mac",
      "mp4 wallpaper mac",
      "custom video wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: "Apple does not let you set a video file as your desktop background out of the box. **MacWall** solves this with native hardware decoding: your video plays behind Finder windows, loops cleanly, and follows battery and full-screen pause rules. Importing your own videos needs MacWall Pro.",
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
          "Prefer H.264 or HEVC encodes, which MacWall decodes in hardware.",
          "Short loops of 5 to 30 seconds that repeat cleanly look more natural than long clips.",
          "Turn on pause-on-battery and lower-quality-on-battery if you work unplugged often.",
          "On several displays, one shared loop is decoded once, while separate loops are each decoded.",
        ],
      },
    ],
  },
  {
    slug: "mp4-wallpaper-mac-guide",
    pathname: "/blog/mp4-wallpaper-mac-guide",
    title: "MP4 Wallpaper on Mac: Complete Setup Guide",
    headline: "MP4 Wallpaper on Mac",
    description:
      "Everything you need to loop MP4 files as macOS desktop backgrounds, encoding tips, resolution guidance, and MacWall setup.",
    excerpt:
      "A practical guide to MP4 live wallpapers on MacBook and iMac with native playback.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    keywords: [
      "mp4 wallpaper mac",
      "mp4 live wallpaper macos",
      "video loop desktop mac",
    ],
    sections: [
      {
        type: "p",
        text: "MP4 is the most common format for live wallpapers. **MacWall** plays MP4 files with hardware acceleration, no browser wrappers, no Electron overhead.",
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
        text: "With Pro, import the file by drag and drop, select the clip, and click **Set wallpaper**. Displays showing the same loop share one decoder, which keeps multi-display setups predictable.",
      },
    ],
  },
  {
    slug: "macbook-animated-wallpaper-guide",
    pathname: "/blog/macbook-animated-wallpaper-guide",
    title: "Animated MacBook Wallpaper: Setup and Battery Tips",
    headline: "Animated Wallpaper for MacBook",
    description:
      "Live wallpapers on MacBook Pro and MacBook Air with less battery cost: hardware decoding, full-screen pause, and an optional Low Power Mode pause.",
    excerpt:
      "How to get cinematic desktop motion on a laptop Mac without sacrificing unplugged runtime.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-07-13",
    keywords: [
      "macbook animated wallpaper",
      "live wallpaper macbook pro",
      "macbook air wallpaper app",
    ],
    sections: [
      {
        type: "p",
        text: "MacBook users want a moving desktop without a big battery cost. **MacWall** plays video with hardware decoding, pauses when you go full screen in any app, and can pause in Low Power Mode.",
      },
      {
        type: "h2",
        text: "MacBook Pro vs MacBook Air",
      },
      {
        type: "p",
        text: "Both M-series MacBooks handle 4K video wallpapers efficiently when MacWall uses hardware decode. Any MacBook with an external display can run a different wallpaper on each screen. Air users benefit most from pause-on-battery, so turn it on in Settings.",
      },
      {
        type: "h2",
        text: "Best practices on laptop",
      },
      {
        type: "ul",
        items: [
          "Use 1440p or 4K loops, avoid unnecessary 8K on a 13-inch display",
          "Pause manually from the menu bar during video calls or gaming",
          "Pick short loops that repeat cleanly",
          "Try MacWall's curated catalog, where clips are prepared for Mac playback",
        ],
      },
    ],
  },
  {
    slug: "import-custom-wallpaper-mac",
    pathname: "/blog/import-custom-wallpaper-mac",
    title: "How to Import Custom Wallpapers on Mac",
    headline: "Import Custom Wallpapers on Mac",
    description:
      "Bring your own video loops into MacWall: personal clips, AI-generated motion, or downloads from any source, all with native hardware-decoded playback.",
    excerpt:
      "Your library, your rules: custom imports with native macOS playback.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    keywords: [
      "custom wallpaper mac",
      "import wallpaper macos",
      "personal video wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "Closed catalogs limit creativity. **MacWall** combines a community catalog with unlimited personal imports, drag any compatible video into your Library with Pro and set it.",
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
        text: "Favorites, Shuffle, and per-display assignments keep large libraries manageable. Switch wallpapers from Home or the menu bar without re-importing.",
      },
    ],
  },
  {
    slug: "animated-desktop-background-mac-free",
    pathname: "/blog/animated-desktop-background-mac-free",
    title: "Animated Mac Backgrounds Without a Subscription",
    headline: "Animated Desktop Backgrounds Without a Subscription",
    description:
      "Looking for free animated wallpapers on Mac? What a one-time MacWall license includes, the free 24-hour trial, and how a Reel can refund the price.",
    excerpt:
      "What a one-time license gets you on Mac, and how to earn the price back with a Reel.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-07-13",
    keywords: [
      "free animated wallpaper mac",
      "free live wallpaper macos",
      "animated desktop background mac free",
    ],
    sections: [
      {
        type: "p",
        text: `Searching for free animated wallpapers often leads to browser-based tools, ad-filled sites, or watermarked downloads. **MacWall** starts with a free 24-hour trial, then asks for one ${macwall.pro.price} payment for a native macOS app with the full catalog, imports, menu bar controls, multi-display support, and automatic pausing. No subscription, no ads, lifetime updates.`,
      },
      {
        type: "h2",
        text: "What one payment includes",
      },
      {
        type: "ul",
        items: [
          "Full curated catalog across 9 categories, with new community drops",
          "Desktop live wallpapers plus Lock Screen on supported macOS versions",
          "Import your own MP4/MOV/GIF loops",
          "Shuffle, Day Schedule and menu bar controls",
          "Lifetime updates on up to 3 Macs per license (Pro+ packs: 5 or 10 Macs)",
          "No monthly fee, ever",
        ],
      },
      {
        type: "h2",
        text: "Earn Pro back with a Reel",
      },
      {
        type: "p",
        text: "Want it actually free? Post a TikTok or Instagram Reel with #macwall. Reach 2,000 organic views for 50% back or 20,000 views for a full refund. The terms are on the [creator page](/creator).",
      },
    ],
  },
  {
    slug: "upload-wallpaper-macwall-community",
    pathname: "/blog/upload-wallpaper-macwall-community",
    title: "How to Upload a Wallpaper to the MacWall Community",
    headline: "Upload Your Wallpaper to the MacWall Community Catalog",
    description:
      "Submit your live wallpaper to the MacWall catalog: upload requirements, how human review works, and tips for loops that get approved and featured.",
    excerpt:
      "Made a loop you like? Get it into MacWall's public catalog: drag, drop, and pass review.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-07-15",
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
        text: "MacWall's catalog isn't just curated, it's **community-built**. Anyone can submit a looping video wallpaper, and approved uploads are published to the public catalog where every MacWall user can discover, like, and set them.",
      },
      { type: "h2", text: "Upload requirements" },
      {
        type: "ul",
        items: [
          "A clean loop: the end should flow back into the start",
          "1920×1080 minimum resolution (4K loops look best)",
          "MP4 or MOV format, up to 300 MB",
          "Title up to 50 characters",
          "One of 9 categories: Anime, Nature, Cars, Gaming, Space, Heroes, Dark, Abstract, Others",
        ],
      },
      { type: "h2", text: "How to submit" },
      {
        type: "ol",
        items: [
          "Open MacWall and go to the upload panel.",
          "Drag and drop your video (or use the file picker).",
          "Pick or upload a thumbnail and choose a category.",
          "Submit, your wallpaper enters the human review queue.",
        ],
      },
      { type: "h2", text: "What happens in review" },
      {
        type: "p",
        text: "Every submission is reviewed by a human before publication, checking loop quality, resolution, and content guidelines. You'll see the status in-app: Pending, Approved, or Rejected with notes. Approved wallpapers go live in the catalog for everyone.",
      },
      { type: "h2", text: "Tips to get featured" },
      {
        type: "ul",
        items: [
          "Subtle, slow motion loops outperform fast cuts as wallpapers",
          "Test the loop point, because a visible jump is easy to spot on a desktop",
          "Export at 4K HEVC if you can; Apple silicon decodes it in hardware",
          "Popular likes push your wallpaper up the Most Popular ranking",
        ],
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
    readMinutes: 7,
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
    readMinutes: 7,
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
    slug: "how-to-change-screen-saver-mac",
    pathname: "/blog/how-to-change-screen-saver-mac",
    title: "How to Change the Screen Saver on Mac",
    headline: "How to Change the Screen Saver on Mac",
    description:
      "Change your Mac screen saver in System Settings, use Apple's Aerial landscapes, set when it starts, turn it off, and play your own video as a screen saver.",
    excerpt:
      "Aerials, timing, hot corners, turning it off, and using a video as your Mac screen saver.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-09-28",
    keywords: [
      "how to change screensaver on mac",
      "how to change screen saver mac",
      "mac screen saver",
      "aerial screensaver mac",
      "how to turn off screensaver mac",
      "best mac screensavers",
      "video screensaver mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To change the screen saver on a Mac running macOS 26 or 27, open System Settings, click Wallpaper, then click Screen Saver and pick one.** When the screen saver starts is set separately in System Settings > Lock Screen, according to [Apple's screen saver help page](https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac).",
      },
      { type: "h2", text: "Change the screen saver on macOS 26 and 27" },
      {
        type: "ol",
        items: [
          "Open the Apple menu > **System Settings**.",
          "Click **Wallpaper** in the sidebar, then click **Screen Saver**.",
          "Choose an aerial (Landscape, Cityscape, Underwater, Earth) or another screen saver.",
          "Note that the aerial you pick as your wallpaper is also used as the screen saver by default.",
        ],
      },
      {
        type: "p",
        text: "On macOS Sonoma 14, Screen Saver settings had a **Show as wallpaper** switch that used a still aerial image as the desktop picture. That label does not appear on Apple's macOS 26 or 27 pages.",
      },
      { type: "h2", text: "Set when the screen saver starts" },
      {
        type: "ul",
        items: [
          "**Timer**: System Settings > Lock Screen > **Start Screen Saver when inactive**, from 1 minute to 3 hours, or Never.",
          "**Hot corner**: System Settings > Desktop & Dock > **Hot Corners**, then choose Start Screen Saver for a corner.",
          "**Turn it off**: set Start Screen Saver when inactive to **Never**.",
        ],
      },
      { type: "h2", text: "Best Mac screen savers" },
      {
        type: "ul",
        items: [
          "**Apple Aerials**: slow-motion landscapes and cities, built in since macOS Sonoma. They download the first time you pick them.",
          "**Photos / Ken Burns**: your own albums, panned and zoomed.",
          "**Word of the Day** and **Message**: minimal, readable, and light on power.",
          "**Your own video**: not possible with built-in settings, see below.",
        ],
      },
      { type: "h2", text: "Use a video as your Mac screen saver" },
      {
        type: "p",
        text: "macOS only offers Apple's own Aerials as moving screen savers. On macOS 26 (Tahoe) and later, **MacWall Pro** can register any catalog loop, or your own MP4 or MOV, as the Lock Screen and Screen Saver video through Apple's wallpaper APIs. Pick something slow and dark, such as a [moon](/wallpapers/collections/moon), [rain](/wallpapers/collections/rain), or [galaxy](/wallpapers/collections/galaxy) loop. Setup: [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).",
      },
      { type: "h2", text: "Screen saver not working?" },
      {
        type: "ul",
        items: [
          "Check the inactivity timer in System Settings > Lock Screen is not set to Never.",
          "Apps that play video or keep the display awake (video calls, some games) block the screen saver while they run.",
          "Aerials need a network connection the first time; if one shows black, pick it again once online.",
        ],
      },
    ],
    faq: [
      {
        question: "Where is the screen saver setting on a Mac?",
        answer:
          "On macOS 26 and 27, Apple puts it in System Settings > Wallpaper > Screen Saver. When it starts is set in System Settings > Lock Screen.",
      },
      {
        question: "How do I turn off the screen saver on a Mac?",
        answer:
          "Open System Settings > Lock Screen and set Start Screen Saver when inactive to Never.",
      },
      {
        question: "Can I use my own video as a Mac screen saver?",
        answer:
          "Not with built-in settings. MacWall Pro on macOS 26 or later can set any video loop as the Lock Screen and Screen Saver.",
      },
    ],
  },
  {
    slug: "how-to-customize-mac-desktop",
    pathname: "/blog/how-to-customize-mac-desktop",
    title: "How to Customize Your Mac Desktop: Aesthetic Setup",
    headline: "How to Customize Your Mac Desktop",
    description:
      "Customize your Mac desktop: live wallpapers, desktop widgets, hidden icons, a cleaner Dock and menu bar, accent colors, custom app and folder icons.",
    excerpt:
      "Ten changes that turn a stock macOS desktop into an aesthetic setup.",
    category: "guides",
    readMinutes: 7,
    publishedAt: "2026-09-28",
    keywords: [
      "how to customize mac desktop",
      "macbook customization",
      "aesthetic mac setup",
      "how to add widgets to mac desktop",
      "how to hide desktop icons on mac",
      "how to change mac icons",
      "desktop customization mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To customize a Mac desktop, start with the wallpaper (System Settings > Wallpaper), add widgets by right-clicking the desktop and choosing Edit Widgets, then tidy the Dock, menu bar, and icons.** A live wallpaper app such as MacWall adds motion, which is the biggest single change you can make to how a Mac feels.",
      },
      { type: "h2", text: "1. Pick a wallpaper that sets the mood" },
      {
        type: "p",
        text: "Everything else takes its color from the wallpaper, especially on macOS Tahoe's translucent Liquid Glass. Choose a still in System Settings > Wallpaper ([full guide](/blog/how-to-change-wallpaper-on-mac)) or a moving one with [MacWall](/download). Popular aesthetic picks: [lofi](/wallpapers/collections/lofi), [purple](/wallpapers/collections/purple), [rain](/wallpapers/collections/rain), and [anime](/wallpapers/anime).",
      },
      { type: "h2", text: "2. Add widgets to the desktop" },
      {
        type: "ol",
        items: [
          "Right-click (or Control-click) an empty part of the desktop.",
          "Choose **Edit Widgets**.",
          "Drag widgets such as Calendar, Weather, Reminders, or Clock onto the desktop. Widgets from iPhone apps work too when your iPhone is nearby or on the same network.",
        ],
      },
      { type: "h2", text: "3. Hide desktop icons" },
      {
        type: "ul",
        items: [
          "Finder > Settings > General: uncheck hard disks, external disks, and connected servers under **Show these items on the desktop**.",
          "Move files into folders, or turn on **Use Stacks** (right-click the desktop) to group them automatically.",
          "To hide every icon, run `defaults write com.apple.finder CreateDesktop false; killall Finder` in Terminal. Replace `false` with `true` to bring them back.",
        ],
      },
      { type: "h2", text: "4. Clean up the Dock" },
      {
        type: "ul",
        items: [
          "System Settings > Desktop & Dock: turn on **Automatically hide and show the Dock**.",
          "Turn off **Show suggested and recent apps in Dock**.",
          "Drag apps you rarely use out of the Dock until you see Remove.",
        ],
      },
      { type: "h2", text: "5. Tidy the menu bar" },
      {
        type: "p",
        text: "Hold Command and drag menu bar icons to reorder or remove them. In System Settings > Control Center you choose which system icons appear. Set the menu bar to hide automatically for a cleaner full-screen desktop.",
      },
      { type: "h2", text: "6. Change the accent and highlight color" },
      {
        type: "p",
        text: "System Settings > Appearance lets you choose Light, Dark, or Auto, plus an accent color and highlight color. Matching the accent to your wallpaper, for example purple with a purple loop, makes the whole system feel designed.",
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
        text: "On macOS 26 (Tahoe), folders can also take a color and a symbol or emoji directly from the Finder.",
      },
      { type: "h2", text: "8. Use Stage Manager or Spaces" },
      {
        type: "p",
        text: "Stage Manager (Control Center) keeps one app in focus and parks the rest at the side, leaving the wallpaper visible. Spaces in Mission Control give each workspace its own wallpaper.",
      },
      { type: "h2", text: "9. Add motion to the Lock Screen" },
      {
        type: "p",
        text: "On macOS 26 and later, MacWall Pro plays your wallpaper on the Lock Screen and as the Screen Saver, so the setup starts the moment you open the lid. See [how to change the screen saver on Mac](/blog/how-to-change-screen-saver-mac).",
      },
      { type: "h2", text: "10. Keep it fast" },
      {
        type: "p",
        text: "Aesthetic should not cost battery. Native apps decode video in hardware and pause behind full-screen apps; browser-based wallpaper tools do not. More in [live wallpaper battery drain on Mac](/blog/live-wallpaper-battery-drain-mac).",
      },
    ],
    faq: [
      {
        question: "How do I make my Mac desktop aesthetic?",
        answer:
          "Choose a cohesive wallpaper (a live one adds the most), match the accent color in System Settings > Appearance, add a few widgets, hide desktop icons, and auto-hide the Dock.",
      },
      {
        question: "How do I add widgets to the Mac desktop?",
        answer:
          "Right-click the desktop, choose Edit Widgets, and drag widgets from the gallery onto the desktop. This works on macOS Sonoma and later.",
      },
      {
        question: "How do I hide desktop icons on a Mac?",
        answer:
          "Uncheck the items in Finder > Settings > General, use Stacks, or run defaults write com.apple.finder CreateDesktop false; killall Finder in Terminal.",
      },
    ],
  },
]
