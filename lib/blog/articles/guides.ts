import type { BlogArticle } from "@/lib/content/types"

export const guideArticles: BlogArticle[] = [
  {
    slug: "how-to-set-live-wallpaper-mac",
    pathname: "/blog/how-to-set-live-wallpaper-mac",
    title: "How to Set a Live Wallpaper on Mac (2026 Guide)",
    headline: "How to Set a Live Wallpaper on Mac",
    description:
      "Step-by-step guide to animated desktop backgrounds on macOS with MacWall, download, pick a wallpaper, and control playback from the menu bar.",
    excerpt:
      "The complete walkthrough for motion wallpapers on Intel and Apple Silicon Macs running Sequoia and later.",
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
        text: "**To set a live wallpaper on a Mac, install a live wallpaper app such as MacWall, pick a video loop, and click Set. macOS has no built-in option for video wallpapers.** It ships with a handful of dynamic wallpapers, but they are scheduled still images and you cannot use your own video loops. **MacWall** is a native app that plays motion wallpapers behind your desktop windows, with hardware decoding on Apple Silicon, menu bar controls, and an offline-friendly catalog.",
      },
      {
        type: "h2",
        text: "Step 1: Download MacWall",
      },
      {
        type: "p",
        text: "Visit macwall.app/download and grab the latest DMG. Open it, drag MacWall to Applications, and launch from the Dock. The app runs quietly in the background, you control everything from the menu bar icon.",
      },
      {
        type: "h2",
        text: "Step 2: Pick a wallpaper from the catalog",
      },
      {
        type: "p",
        text: "Open MacWall and browse Home, Explore, or Library. Categories include Anime, Nature, Cars, Gaming, Space, Heroes, Dark, Abstract, and Others. Tap any tile to preview, then set it as your desktop background. Videos loop seamlessly with zero stutter.",
      },
      {
        type: "h2",
        text: "Step 3: Import your own clips (optional)",
      },
      {
        type: "p",
        text: "Drag and drop MP4, MOV, M4V, or GIF files into MacWall. Your imports stay in your Library, perfect for personal loops, cinematic edits, or clips you found online.",
      },
      {
        type: "h2",
        text: "Step 4: Control playback from the menu bar",
      },
      {
        type: "p",
        text: "Pause, resume, or stop from the menu bar without opening the main window. MacWall automatically pauses on battery power and when another app goes full screen, so your Mac stays fast during work and gaming.",
      },
      {
        type: "h2",
        text: "Step 5: Turn on Lock Screen motion",
      },
      {
        type: "p",
        text: "MacWall Pro adds Lock Screen live wallpaper on macOS 26 (Tahoe) and later. One-time purchase, lifetime updates, up to 3 Macs per license (Pro Plus: 5 Macs).",
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
          "Very little with a native app. MacWall decodes video in hardware and pauses automatically on battery, in full-screen apps, and when the display sleeps.",
      },
      {
        question: "How do I remove a live wallpaper on Mac?",
        answer:
          "Choose Stop from the MacWall menu bar icon, or quit the app, then pick any still wallpaper in System Settings > Wallpaper.",
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
        text: "Apple does not let you set a video file as your desktop background out of the box. **MacWall** solves this with native hardware decode, your video plays behind Finder windows, loops cleanly, and respects battery and full-screen rules.",
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
          "Prefer H.264 or HEVC encodes. MacWall decodes on the GPU.",
          "Shorter loops (30–120 seconds) feel more natural than hour-long files.",
          "Enable pause-on-battery if you work unplugged often.",
          "Use one wallpaper per display on multi-monitor setups.",
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
        text: "Import via drag-and-drop, select the clip, and apply. MacWall crossfades between wallpaper changes and keeps one decoder per display for predictable performance.",
      },
    ],
  },
  {
    slug: "macbook-animated-wallpaper-guide",
    pathname: "/blog/macbook-animated-wallpaper-guide",
    title: "Animated Wallpaper for MacBook: Setup & Battery Tips",
    headline: "Animated Wallpaper for MacBook",
    description:
      "Live motion wallpapers on MacBook Pro and MacBook Air without killing battery. MacWall's smart pause and Apple Silicon decode explained.",
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
        text: "Both M-series MacBooks handle 4K video wallpapers efficiently when MacWall uses hardware decode. Pro models with multiple displays can run independent wallpapers per screen. Air users benefit most from pause-on-battery, enable it in settings.",
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
          "Pick shorter loops to reduce decoder memory footprint",
          "Try MacWall's curated catalog, clips are optimized for Mac playback",
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
    publishedAt: "2026-03-05",
    keywords: [
      "custom wallpaper mac",
      "import wallpaper macos",
      "personal video wallpaper mac",
    ],
    sections: [
      {
        type: "p",
        text: "Closed catalogs limit creativity. **MacWall** combines a community catalog with unlimited personal imports, drag any compatible video into your Library and set it instantly.",
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
  },
  {
    slug: "animated-desktop-background-mac-free",
    pathname: "/blog/animated-desktop-background-mac-free",
    title: "Animated Mac Backgrounds Without a Subscription",
    headline: "Animated Desktop Backgrounds Without a Subscription",
    description:
      "Searching for free animated wallpapers on Mac? Why a one-time $12.99 app beats free Electron tools, and how a Reel can make MacWall free.",
    excerpt:
      "Why pay-once beats free wallpaper tools on Mac, and how to earn the whole price back with a Reel.",
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
        text: "Searching for free animated wallpapers usually lands you on heavy Electron apps, ad-filled sites, or watermarked downloads. **MacWall** takes the honest route: one $12.99 payment, and you own a native macOS app with the full catalog, imports, menu bar controls, multi-display support, and smart pause. No subscription, no ads, lifetime updates.",
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
          "Unlimited playlists and menu bar controls",
          "Lifetime updates on up to 3 Macs per license (Pro Plus: 5)",
          "No monthly fee, ever",
        ],
      },
      {
        type: "h2",
        text: "Earn Pro back with a Reel",
      },
      {
        type: "p",
        text: "Want it actually free? Post a TikTok or Instagram Reel with #macwall. Hit 2,000 organic views for 50% back or 20,000 views for a full refund. That's the closest thing to a free animated wallpaper app that doesn't compromise your Mac.",
      },
    ],
  },
  {
    slug: "upload-wallpaper-macwall-community",
    pathname: "/blog/upload-wallpaper-macwall-community",
    title: "How to Upload Your Wallpaper to the MacWall Community",
    headline: "Upload Your Wallpaper to the MacWall Community Catalog",
    description:
      "Share your live wallpaper with thousands of Mac users. Upload requirements, the review process, and tips to get your loop featured in MacWall.",
    excerpt:
      "Made a beautiful loop? Get it into MacWall's public catalog, drag, drop, and pass review.",
    category: "guides",
    readMinutes: 5,
    publishedAt: "2026-06-12",
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
          "Seamless loop, the end should flow back into the start",
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
          "Test the loop point, a visible jump is the #1 rejection reason",
          "Export at 4K HEVC if you can; Apple Silicon decodes it for free",
          "Popular likes push your wallpaper up the Most Popular ranking",
        ],
      },
    ],
  },
  {
    slug: "how-to-change-wallpaper-on-mac",
    pathname: "/blog/how-to-change-wallpaper-on-mac",
    title: "How to Change Wallpaper on Mac (macOS Tahoe, Sequoia & Older)",
    headline: "How to Change the Wallpaper on a Mac",
    description:
      "Change your Mac wallpaper in System Settings, from Photos, Finder, or Safari, set one per display, rotate it automatically, and add a live video wallpaper.",
    excerpt:
      "Every way to change the desktop wallpaper on a Mac, for every macOS version, plus how to make it move.",
    category: "guides",
    readMinutes: 6,
    publishedAt: "2026-09-28",
    keywords: [
      "how to change wallpaper on mac",
      "how to change mac wallpaper",
      "how to change desktop wallpaper on mac",
      "how to set wallpaper on mac",
      "how to change wallpaper on macbook air",
      "how to set a photo as wallpaper on mac",
      "how to change lock screen wallpaper on mac",
    ],
    sections: [
      {
        type: "p",
        text: "**To change the wallpaper on a Mac, open System Settings, click Wallpaper in the sidebar, and choose a picture.** It applies immediately. On macOS Monterey and older, the same option lives in System Preferences under Desktop & Screen Saver. You can also right-click any image in Finder and choose **Set Desktop Picture**.",
      },
      {
        type: "h2",
        text: "Change wallpaper in System Settings (macOS Ventura to Tahoe)",
      },
      {
        type: "ol",
        items: [
          "Click the Apple menu, then **System Settings**.",
          "Select **Wallpaper** in the sidebar.",
          "Pick one of Apple's wallpapers, a Dynamic Desktop, a color, or scroll to **Your Photos** or **Pictures**.",
          "To use your own folder, click **Add Folder or Album**, then choose the folder.",
          "Choose how the image fits: Fill Screen, Fit to Screen, Stretch to Fill Screen, Center, or Tile.",
        ],
      },
      {
        type: "p",
        text: "This works the same on MacBook Air, MacBook Pro, iMac, Mac mini, and Mac Studio. If the Wallpaper pane is greyed out, the Mac is managed by an organization profile that locks the desktop picture.",
      },
      { type: "h2", text: "Change wallpaper on macOS Monterey and older" },
      {
        type: "ol",
        items: [
          "Open the Apple menu, then **System Preferences**.",
          "Click **Desktop & Screen Saver**, then the **Desktop** tab.",
          "Choose an image from Apple, Photos, or a folder on the left, and pick a fit option.",
        ],
      },
      {
        type: "h2",
        text: "Set a photo as wallpaper from Photos, Finder, or Safari",
      },
      {
        type: "ul",
        items: [
          "**Photos**: select a photo, click the Share button, and choose **Set Wallpaper**.",
          "**Finder**: right-click (or Control-click) an image file and choose **Set Desktop Picture**.",
          "**Safari**: right-click an image on a web page and choose **Use Image as Desktop Picture**.",
        ],
      },
      { type: "h2", text: "Use a different wallpaper on each display" },
      {
        type: "p",
        text: "With more than one monitor connected, System Settings shows a wallpaper choice for each display. Select the display at the top of the Wallpaper pane, then pick its image. Each Space (desktop in Mission Control) can also carry its own wallpaper: switch to the Space first, then change the picture.",
      },
      { type: "h2", text: "Rotate wallpapers automatically" },
      {
        type: "p",
        text: "Add a folder or album in the Wallpaper pane, then turn on the shuffle or **Change picture** option and choose an interval such as every hour or every day. Dynamic Desktop wallpapers change on their own through the day, following the time or your light and dark appearance setting.",
      },
      { type: "h2", text: "Change the Lock Screen wallpaper" },
      {
        type: "p",
        text: "Since macOS Sonoma, the Lock Screen shows the same wallpaper as your main display, so changing the desktop wallpaper changes the Lock Screen too. macOS has no separate Lock Screen picture setting. On macOS 26 (Tahoe) and later, apps like MacWall can put a moving video on the Lock Screen and Screen Saver through Apple's wallpaper APIs. See the [Lock Screen live wallpaper guide](/blog/lock-screen-live-wallpaper-macos).",
      },
      { type: "h2", text: "Make your Mac wallpaper move" },
      {
        type: "p",
        text: "macOS cannot use a video as a desktop wallpaper on its own. A live wallpaper app fills that gap. [MacWall](/download) plays 4K video loops behind your windows with hardware decoding, pauses on battery and in full-screen apps, and has a catalog of 1,000+ curated loops, from [anime](/wallpapers/anime) and [cars](/wallpapers/cars) to [rain](/wallpapers/collections/rain) and [space](/wallpapers/space). Full steps: [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).",
      },
      { type: "h2", text: "Pick the right image size" },
      {
        type: "p",
        text: "A wallpaper looks sharpest at your display's physical resolution: 2560×1664 on a 13-inch MacBook Air, 3024×1964 on a 14-inch MacBook Pro, 5120×2880 on a 5K display. Every model is listed in [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
    ],
    faq: [
      {
        question: "Why can't I change the wallpaper on my Mac?",
        answer:
          "The most common cause is a configuration profile installed by a school or employer that locks the desktop picture. Check System Settings > Privacy & Security > Profiles. Otherwise, restart the Mac and try again from System Settings > Wallpaper.",
      },
      {
        question:
          "Can I have a different Lock Screen and desktop wallpaper on Mac?",
        answer:
          "Not with built-in settings. Since macOS Sonoma the Lock Screen mirrors the main display's wallpaper. On macOS 26 and later, a live wallpaper app such as MacWall can set a separate moving Lock Screen and Screen Saver.",
      },
      {
        question: "Can I set a video or GIF as my Mac wallpaper?",
        answer:
          "Not natively. macOS only supports still images and Dynamic Desktop files. A live wallpaper app like MacWall plays MP4, MOV, and GIF files as the desktop wallpaper.",
      },
      {
        question: "How do I change the wallpaper on a MacBook Air?",
        answer:
          "The same way as any Mac: Apple menu > System Settings > Wallpaper, then choose an image. On older macOS versions use System Preferences > Desktop & Screen Saver.",
      },
    ],
  },
  {
    slug: "macbook-wallpaper-size",
    pathname: "/blog/macbook-wallpaper-size",
    title: "MacBook Wallpaper Size: Resolution for Every Mac (2026)",
    headline: "MacBook Wallpaper Size for Every Model",
    description:
      "The exact wallpaper size for every MacBook Air, MacBook Pro, iMac, and Apple display, plus the aspect ratio to use and how to size one image for all Macs.",
    excerpt:
      "Native wallpaper dimensions for every current Mac, and one size that fits them all.",
    category: "guides",
    readMinutes: 4,
    publishedAt: "2026-09-28",
    keywords: [
      "macbook wallpaper size",
      "mac wallpaper size",
      "macbook wallpaper dimensions",
      "macbook pro wallpaper dimensions",
      "macbook air wallpaper size",
      "what size is mac wallpaper",
      "imac wallpaper size",
    ],
    sections: [
      {
        type: "p",
        text: "**The best MacBook wallpaper size is the display's native resolution: 2560×1664 for a 13-inch MacBook Air, 2880×1864 for a 15-inch MacBook Air, 3024×1964 for a 14-inch MacBook Pro, and 3456×2234 for a 16-inch MacBook Pro.** If one image has to fit every Mac, use 3456×2234 or larger at roughly a 16:10 ratio and let macOS scale it down.",
      },
      { type: "h2", text: "MacBook Air wallpaper sizes" },
      {
        type: "ul",
        items: [
          "**MacBook Air 13-inch (M2, M3, M4 and later)**: 2560×1664",
          "**MacBook Air 15-inch (M2, M3, M4 and later)**: 2880×1864",
          "**MacBook Air 13-inch (M1, 2020)**: 2560×1600",
          "**MacBook Air 13-inch Retina (Intel, 2018 to 2020)**: 2560×1600",
        ],
      },
      { type: "h2", text: "MacBook Pro wallpaper sizes" },
      {
        type: "ul",
        items: [
          "**MacBook Pro 14-inch (M1 Pro and later)**: 3024×1964",
          "**MacBook Pro 16-inch (M1 Pro and later)**: 3456×2234",
          "**MacBook Pro 13-inch (M1, M2)**: 2560×1600",
          "**MacBook Pro 16-inch (Intel, 2019)**: 3072×1920",
          "**MacBook Pro 15-inch Retina (Intel)**: 2880×1800",
        ],
      },
      { type: "h2", text: "iMac and Apple display wallpaper sizes" },
      {
        type: "ul",
        items: [
          "**iMac 24-inch (M1 and later)**: 4480×2520",
          "**iMac 27-inch 5K (Intel)**: 5120×2880",
          "**Studio Display**: 5120×2880",
          "**Pro Display XDR**: 6016×3384",
          "**4K external monitor**: 3840×2160",
        ],
      },
      { type: "h2", text: "Why the number in System Settings is smaller" },
      {
        type: "p",
        text: 'System Settings > Displays shows a *scaled* resolution such as "looks like 1512×982" on a 14-inch MacBook Pro. The panel really has twice as many pixels in each direction, and macOS renders at that size for sharp Retina text. Size your wallpaper for the physical pixels above, not the scaled number, or it will look soft. The full explanation is in [resolution and displays](/learn/wallpaper-resolution-and-displays).',
      },
      { type: "h2", text: "Aspect ratio and the notch" },
      {
        type: "ul",
        items: [
          "Recent MacBooks are close to **16:10**; external monitors are usually **16:9**. A 16:10 image cropped slightly works on both.",
          "On notched MacBooks the top strip sits behind the menu bar. Keep faces and text out of the top 40 or so pixels of the image.",
          "Desktop icons live on the right edge by default, so a subject on the left or centre stays readable.",
        ],
      },
      { type: "h2", text: "Live wallpaper sizes" },
      {
        type: "p",
        text: "Video wallpapers follow the same rule, but bigger is not free: a 4K loop on a 1080p monitor decodes pixels you never see. [MacWall](/download) catalog loops are mostly 4K or 1440p and scale to each display automatically. Browse [4K live wallpapers](/wallpapers) or read about [4K video wallpaper on Mac](/blog/4k-video-wallpaper-mac).",
      },
    ],
    faq: [
      {
        question: "What size should a MacBook Air wallpaper be?",
        answer:
          "2560×1664 pixels for the 13-inch MacBook Air with M2 or later, 2880×1864 for the 15-inch model, and 2560×1600 for the M1 and Intel Retina models.",
      },
      {
        question: "What size should a MacBook Pro wallpaper be?",
        answer:
          "3024×1964 for the 14-inch MacBook Pro and 3456×2234 for the 16-inch model (M1 Pro and later). Older 13-inch models use 2560×1600.",
      },
      {
        question: "Is a 4K wallpaper good for a MacBook?",
        answer:
          "Yes. A 3840×2160 image is larger than every MacBook panel, so macOS scales it down cleanly. It is 16:9, so a thin strip is cropped on 16:10 MacBook screens.",
      },
      {
        question: "What aspect ratio are Mac wallpapers?",
        answer:
          "Current MacBooks are about 16:10 (slightly taller with the notch area), while iMacs, Apple displays, and most external monitors are 16:9.",
      },
    ],
  },
  {
    slug: "how-to-change-screen-saver-mac",
    pathname: "/blog/how-to-change-screen-saver-mac",
    title: "How to Change the Screen Saver on Mac (and Use a Video)",
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
        text: "**To change the screen saver on a Mac, open System Settings, click Screen Saver in the sidebar, and pick one.** On macOS Monterey and older it is under System Preferences > Desktop & Screen Saver. When the screen saver starts is set separately in System Settings > Lock Screen.",
      },
      { type: "h2", text: "Change the screen saver (macOS Ventura to Tahoe)" },
      {
        type: "ol",
        items: [
          "Open the Apple menu > **System Settings**.",
          "Click **Screen Saver** in the sidebar.",
          "Choose an Aerial (Landscape, Cityscape, Underwater, Earth) or a classic screen saver such as Photos, Message, or Word of the Day.",
          "For Aerials, turn on **Show as wallpaper** to use the same scene as your desktop picture.",
          "Click **Preview** to see it full screen.",
        ],
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
          "System Settings > Screen Saver on macOS Ventura and later, or System Preferences > Desktop & Screen Saver on Monterey and earlier.",
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
    title: "How to Customize Your Mac Desktop: Aesthetic Setup Guide",
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
        text: "Aesthetic should not cost battery. Native apps decode video in hardware and pause when you are on battery or in full screen; browser-based wallpaper tools do not. More in [live wallpaper battery drain on Mac](/blog/live-wallpaper-battery-drain-mac).",
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
