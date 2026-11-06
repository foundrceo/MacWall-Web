import { blogSources } from "@/lib/blog/sources"
import { sourcesBlocks } from "@/lib/content/sources"
import type { BlogArticleInput } from "@/lib/content/types"
import {
  macwallCatalog,
  macwallImportFormatsLabel,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"

export const macosArticles: BlogArticleInput[] = [
  {
    slug: "macos-wallpapers",
    pathname: "/blog/macos-wallpapers",
    title: "macOS Wallpapers: macOS 27, Tahoe and Sequoia",
    headline: "macOS wallpapers: Golden Gate, Tahoe and Sequoia",
    description:
      "Where to find the wallpapers in macOS 27 Golden Gate, macOS 26 Tahoe and macOS 15 Sequoia, what each version includes, and how to use them elsewhere.",
    excerpt:
      "Every wallpaper category in macOS 27, Tahoe and Sequoia, where the files live, how they changed, and how to add motion.",
    category: "macos",
    publishedAt: "2026-11-06",
    keywords: [
      "macos wallpapers",
      "macos 27 wallpaper",
      "macos tahoe wallpaper",
      "macos sequoia wallpaper",
      "macos 26 wallpaper",
      "macos golden gate wallpaper",
      "macos default wallpaper",
    ],
    sections: [
      {
        type: "p",
        text: "**The wallpapers that come with macOS 27 Golden Gate, macOS 26 Tahoe and macOS 15 Sequoia are all in System Settings > Wallpaper, grouped into categories: Dynamic Wallpapers, aerials, Shuffle Aerials, Pictures and Colors, plus your own photos.** macOS 27 adds a Mac category. On Tahoe and later the aerials animate as you lock or unlock; on Sequoia they are still images on the desktop.",
      },
      {
        type: "p",
        text: "This page compares the three versions from Apple's own help pages, read on 6 November 2026. Apple doesn't publish a list of every wallpaper's name, so for the exact set on your Mac, open Wallpaper settings and scroll. Apple lists macOS 27.2, 26.7.2 and 15.8.2 as the latest release of each. MacWall runs on all three.",
      },
      { type: "h2", text: "Wallpaper categories by macOS version" },
      {
        type: "table",
        columns: [
          "Category",
          "macOS 27 Golden Gate",
          "macOS 26 Tahoe",
          "macOS 15 Sequoia",
        ],
        rows: [
          ["Dynamic Wallpapers", "Yes", "Yes", "Yes"],
          ["Your Photos", "Yes", "Yes", "Add Photo, Add Folder or Album"],
          [
            "Landscape, Cityscape, Underwater, Earth aerials",
            "Animate as you lock or unlock",
            "Animate as you lock or unlock",
            "Still images on the desktop",
          ],
          ["Mac", "Yes", "No", "No"],
          ["Shuffle Aerials", "Yes", "Yes", "Yes"],
          ["Pictures", "Yes", "Yes", "Yes"],
          ["Colors", "Yes", "Yes", "Yes"],
          [
            "Clock Appearance",
            "In Wallpaper settings",
            "In Wallpaper settings",
            "In Lock Screen settings",
          ],
        ],
        caption:
          "From Apple Support's Customize the wallpaper and Wallpaper settings pages for each version, read 6 November 2026.",
      },
      { type: "h2", text: "macOS 27 Golden Gate wallpapers" },
      {
        type: "p",
        text: 'macOS 27 keeps Tahoe\'s categories and adds **Mac**: Apple describes it as animated gradient pill shapes that spell "Mac", and you choose their color. It appears as a screen saver too, where the shapes shift through color tones. As on Tahoe, the aerials animate as you lock or unlock, and the aerial you pick is also your screen saver by default.',
      },
      {
        type: "p",
        text: "Apple's own summary of macOS 27 mentions one more change that affects how a wallpaper looks: you can customize Liquid Glass, from ultraclear to fully tinted, in Appearance settings. A tinted setting lets less of the wallpaper show through menus and the Dock. macOS 27 runs only on Macs with Apple silicon.",
      },
      { type: "h2", text: "macOS 26 Tahoe wallpapers" },
      {
        type: "p",
        text: "Tahoe brought the categories macOS 27 builds on: Dynamic Wallpapers, Your Photos, the four aerial collections, Shuffle Aerials, Pictures and Colors. It is the version where aerial wallpapers started animating as you lock or unlock, and where **Clock Appearance** moved into Wallpaper settings to set the large clock's font, weight and placement. Tahoe's translucent Liquid Glass look picks up color from the wallpaper, so darker, calmer pictures keep menu text readable. The details, including where the files are stored, are in [macOS Tahoe wallpapers](/blog/macos-tahoe-wallpapers).",
      },
      { type: "h2", text: "macOS 15 Sequoia wallpapers" },
      {
        type: "p",
        text: "On Sequoia the aerials are still images on the desktop, and the motion lives in the screen saver. Screen Saver is its own item in the System Settings sidebar, and turning on **Show as wallpaper** there uses a still aerial or macOS image as your desktop picture. In Wallpaper settings, aerials, Shuffle Aerials and Dynamic Wallpapers have the reverse switch, **Show as screen saver**. Your own images come in through **Add Photo** or **Add Folder or Album**, and photos can shuffle at an interval you choose, in random order if you like. The large clock is set in Lock Screen settings under **Show large clock**.",
      },
      {
        type: "p",
        text: `Sequoia is the oldest version MacWall runs on: ${macwallMinimumMacOSVersion} or later for desktop live wallpapers. Lock Screen and screen saver video need ${macwallLockScreenMacOSVersion} or later, so on Sequoia MacWall plays the desktop only.`,
      },
      { type: "h2", text: "Where the wallpaper files are" },
      {
        type: "p",
        text: "The still wallpapers that ship with macOS are image files in **/System/Library/Desktop Pictures**. Some wallpapers aren't installed until you pick one: Apple's pages note that when a download icon appears next to a wallpaper or aerial, you click it to download and use it. To open the folder, choose Go > Go to Folder in the Finder and type the path.",
      },
      { type: "h2", text: "Use a newer macOS wallpaper on an older Mac" },
      {
        type: "p",
        text: "Apple's wallpapers are part of macOS and licensed for use on your Macs, so we don't host copies. If one of your Macs runs the newer version, copy the image file from /System/Library/Desktop Pictures on that Mac, then on the older Mac Control-click the file in the Finder and choose **Set Desktop Picture**. This works for still images; the moving aerials aren't picture files in that folder, so they don't copy over. The general steps are in [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac).",
      },
      { type: "h2", text: "Dynamic, aerial and live wallpapers" },
      {
        type: "ul",
        items: [
          "**Dynamic Wallpapers** brighten and darken with the time of day where you are. They are still images; [dynamic wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac) explains how they work and how to make your own.",
          "**Aerials** are Apple's slow-motion footage: on macOS 26 and 27 they move as you lock or unlock, not while you work.",
          `**Live wallpapers** play a video on the desktop the whole time it is visible. macOS has no setting for that; [MacWall](/download) adds it with ${macwallCatalog.liveCountLabel} 4K loops, and on ${macwallLockScreenMacOSVersion} or later it puts the video on the Lock Screen and screen saver too.`,
        ],
      },
      {
        type: "p",
        text: "For the Lock Screen on macOS 27 specifically, see [Lock Screen live wallpaper on macOS 27](/blog/macos-27-lock-screen-live-wallpaper). Sizes for every Mac display are in [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
      ...sourcesBlocks([
        blogSources.appleCustomizeWallpaper,
        blogSources.appleCustomizeWallpaper26,
        blogSources.appleCustomizeWallpaper15,
        blogSources.appleWallpaperSettings,
        blogSources.appleWallpaperSettings26,
        blogSources.appleWallpaperSettings15,
        blogSources.appleScreenSaverSettings,
        blogSources.appleScreenSaverSettings15,
        blogSources.appleLockScreenSettings15,
        blogSources.appleWhatsNewMacOS27,
        blogSources.appleMacOSVersions,
        blogSources.appleMacOS27Compatibility,
      ]),
    ],
    faq: [
      {
        question: "Where are the macOS wallpapers?",
        answer:
          "In System Settings > Wallpaper on macOS 15, 26 and 27. The still image files that ship with macOS are in /System/Library/Desktop Pictures; some wallpapers download the first time you pick them.",
      },
      {
        question: "What's new in macOS 27 wallpapers?",
        answer:
          'macOS 27 adds a Mac category, animated gradient pill shapes that spell "Mac" in a color you choose, and lets you tune Liquid Glass from ultraclear to fully tinted in Appearance settings.',
      },
      {
        question: "Do macOS wallpapers move?",
        answer:
          "On macOS 26 and 27 the aerial wallpapers animate as you lock or unlock. On Sequoia they are still on the desktop and move as screen savers. A video that plays on the desktop needs an app such as MacWall.",
      },
      {
        question:
          "Can I use the macOS Tahoe or macOS 27 wallpaper on an older Mac?",
        answer:
          "The still images can be copied from /System/Library/Desktop Pictures on one of your Macs that runs the newer version and set with Set Desktop Picture. The moving aerials don't copy over.",
      },
    ],
  },
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
    publishedAt: "2026-07-13",
    updatedAt: "2026-11-06",
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
      { type: "h2", text: "What each macOS version can do" },
      {
        type: "table",
        columns: [
          "",
          "macOS 14 Sonoma",
          "macOS 15 Sequoia",
          "macOS 26 Tahoe",
          "macOS 27 Golden Gate",
        ],
        rows: [
          [
            "Apple's aerials",
            "Screen savers that settle into the desktop after you log in",
            "Still images on the desktop; motion as screen savers",
            "Animate as you lock or unlock",
            "Animate as you lock or unlock",
          ],
          ["MacWall on the desktop", "No", "Yes", "Yes", "Yes"],
          [
            "MacWall on the Lock Screen and screen saver",
            "No",
            "No",
            "Yes",
            "Yes",
          ],
          ["Latest release (Apple)", "14.8.9", "15.8.2", "26.7.2", "27.2"],
        ],
        caption:
          "Aerial behavior from Apple Newsroom (Sonoma) and Apple Support (Sequoia, Tahoe, macOS 27); latest releases from Apple Support, read 6 November 2026.",
      },
      {
        type: "p",
        text: "Moving to Sequoia is enough for live wallpapers on the desktop. The Lock Screen and screen saver need Tahoe or later, and macOS 27 runs only on Macs with Apple silicon, so an Intel Mac that can update stops at Tahoe.",
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
        text: "Some older Macs stop at Sonoma. On those, stay with Apple's Aerial and dynamic wallpapers. Third-party live wallpaper apps also set their own minimum macOS version, so check each app's requirements before you buy; MacWall's are listed on the [download page](/download), and the [comparison hub](/compare) lists the minimum macOS of other Mac wallpaper apps.",
      },
      ...sourcesBlocks([
        blogSources.appleSonomaNewsroom,
        blogSources.appleWallpaperSettings15,
        blogSources.appleCustomizeWallpaper26,
        blogSources.appleCustomizeWallpaper,
        blogSources.appleMacOSVersions,
        blogSources.appleMacOS27Compatibility,
      ]),
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
    slug: "macos-27-beta-live-wallpaper-not-working",
    pathname: "/blog/macos-27-beta-live-wallpaper-not-working",
    title: "Live Wallpaper Stopped After a macOS Update? Fixes",
    headline:
      "Live wallpaper or Lock Screen video stopped after a macOS update: fixes",
    description:
      "Live wallpaper black, frozen or gone after updating macOS, including macOS 27? The fixes in order, from updating MacWall to resetting it.",
    excerpt:
      "A black desktop, a frozen Lock Screen or Apple's default wallpaper after a macOS update: what causes it and the fixes, in order.",
    category: "macos",
    publishedAt: "2026-07-15",
    updatedAt: "2026-11-06",
    keywords: [
      "live wallpaper not working after macos update",
      "live wallpaper not working macos 27",
      "macos 27 lock screen wallpaper",
      "macos 27 screen saver video",
      "mac wallpaper black after update",
      "lock screen video not working mac",
    ],
    sections: [
      {
        type: "p",
        text: "**If your live wallpaper or Lock Screen video stopped after a macOS update, update MacWall first (Settings → About → Check Now), make sure it is running from Applications, then click Set Wallpaper again.** Most cases end there. The rest of this guide goes through the remaining fixes in order, from the quickest to a full reset.",
      },
      {
        type: "p",
        text: `A major macOS release can change how the system wallpaper and the Lock Screen work, and updates can invalidate wallpaper files the system had cached. The macOS 27 beta did both: Lock Screen and Screen Saver video built for macOS 26 could stop without an error. Today MacWall's Lock Screen and Screen Saver video works on macOS 26 Tahoe and macOS 27 Golden Gate, in both playback modes. Apple lists macOS 27.2 as the latest release, and macOS 27 runs only on Apple silicon Macs.`,
      },
      { type: "h2", text: "What you might be seeing" },
      {
        type: "ul",
        items: [
          "**A black or blank desktop** where the wallpaper was.",
          "**A frozen frame**: the wallpaper shows but doesn't move, on the desktop or the Lock Screen.",
          "**Apple's default wallpaper or aerial** on the Lock Screen or as the screen saver instead of your video.",
          "**The Lock Screen still moves but the desktop doesn't**, or the other way round.",
        ],
      },
      { type: "h2", text: "Fix it, in this order" },
      {
        type: "ol",
        items: [
          "**Update MacWall.** Open Settings → About and click **Check Now**. MacWall updates itself while it is open, and fixes for new macOS versions arrive this way; a frozen Lock Screen after waking is fixed in the latest version.",
          "**Open it from Applications.** If MacWall runs from the DMG, eject the disk image and open the copy in your Applications folder. Running it from the DMG is a common cause of black flashes.",
          "**Quit other live wallpaper apps.** Two apps setting the wallpaper at once fight over it.",
          "**Set the wallpaper again.** Make sure MacWall is running (its icon is in the menu bar), open your wallpaper and click **Set Wallpaper**. After a macOS update this rewrites the wallpaper files the system had cached.",
          "**Check the screen saver.** On macOS 26 and 27, if you picked another screen saver in System Settings > Wallpaper > Screen Saver after MacWall set its own, macOS shows that one.",
          "**Log out and back in**, then lock your Mac with Control-Command-Q to test the Lock Screen.",
        ],
      },
      { type: "h2", text: "If only the Lock Screen is wrong" },
      {
        type: "ul",
        items: [
          `**Check your macOS version** (Apple menu > About This Mac). MacWall's Lock Screen video needs ${macwallLockScreenMacOSVersion} or later; on macOS 15 the Lock Screen shows a still from your wallpaper.`,
          "**Check Pro or the trial is active** in MacWall's Settings → MacWall Pro. Lock Screen video needs one of them.",
          `**Check the playback mode** in ${macwallPlaybackModes.settingsPath}. With ${macwallPlaybackModes.systemWallpaper.setting}, the Lock Screen plays the desktop's wallpaper on its own. With ${macwallPlaybackModes.app.setting}, **Show on Lock Screen and screen saver** must be on in Settings → Lock Screen.`,
          "**Frozen on purpose?** With System Wallpaper, turning off **Play the wallpaper while locked** makes the Lock Screen hold its frame to save battery.",
          "**The screen goes dark after a few seconds**: that is macOS turning the display off on the Lock Screen. Lengthen **Turn display off on battery when inactive** and **on power adapter when inactive** in System Settings > Lock Screen.",
        ],
      },
      { type: "h2", text: "If only your own video is black" },
      {
        type: "p",
        text: "Videos with ProRes, AV1 or VP9 inside are converted when you set them, and the wallpaper can look black until that finishes. Wait for it, or re-export the clip as H.264 or HEVC; [how to use a video as your wallpaper](/blog/how-to-use-video-as-wallpaper-mac) has the settings.",
      },
      { type: "h2", text: "Last resort: reset MacWall" },
      {
        type: "p",
        text: "If nothing above helps, open MacWall's Settings → General and choose **Reset MacWall**. It removes downloaded wallpapers, your own videos and MacWall's settings, and gives your Mac its own wallpaper back; your license, favorites and support chats stay. Keep copies of your own videos before you reset, then set a wallpaper again. **Uninstall MacWall** in the same place also puts your own wallpaper back before it moves the app to the Trash.",
      },
      {
        type: "p",
        text: "Still stuck? In MacWall choose Help > **Chat with Support**, or email support@macwall.app with your macOS version and MacWall version. Fixed issues are listed in the [changelog](/changelog).",
      },
      { type: "h2", text: "Before the next macOS update" },
      {
        type: "ul",
        items: [
          "Update MacWall before you update macOS, so the newest fixes are already in place.",
          `On macOS 26 or later, ${macwallPlaybackModes.systemWallpaper.setting} playback starts the wallpaper again by itself after a MacWall update.`,
          "Betas change system behavior between builds. On a Mac you rely on, wait for the release.",
        ],
      },
      {
        type: "p",
        text: "More on the macOS 27 Lock Screen is in [Lock Screen live wallpaper on macOS 27](/blog/macos-27-lock-screen-live-wallpaper), and the general troubleshooting guide is [troubleshooting](/docs/troubleshooting).",
      },
      ...sourcesBlocks([
        blogSources.appleMacOSVersions,
        blogSources.appleMacOS27Compatibility,
        blogSources.appleLockScreenSettings,
      ]),
    ],
    faq: [
      {
        question: "Why did my live wallpaper stop after updating macOS?",
        answer:
          "Major macOS updates can change how the system wallpaper and Lock Screen work and can invalidate cached wallpaper files. Update MacWall, then set the wallpaper again.",
      },
      {
        question: "Does MacWall work on macOS 27?",
        answer: `Yes. ${macwallSupportedMacOS.summary}`,
      },
      {
        question: "Why is my Mac wallpaper black after an update?",
        answer:
          "Usually the wallpaper app is outdated, running from its disk image, or a converted video is still being prepared. Update MacWall, open it from Applications and click Set Wallpaper again.",
      },
      {
        question: "How do I get Apple's default Lock Screen back?",
        answer:
          "Choose Stop Wallpaper from the MacWall menu bar icon and pick a wallpaper in System Settings > Wallpaper. Reset MacWall and Uninstall MacWall in MacWall's Settings → General also put your own wallpaper back.",
      },
    ],
  },
  {
    slug: "macos-27-lock-screen-live-wallpaper",
    pathname: "/blog/macos-27-lock-screen-live-wallpaper",
    title: "macOS 27 Lock Screen Live Wallpaper Guide",
    headline: "Lock Screen Live Wallpaper on macOS 27",
    description:
      "Put a moving video on the macOS 27 Golden Gate Lock Screen and screen saver: what Apple offers, MacWall's two playback modes, setup and battery.",
    excerpt:
      "What macOS 27 does on its own, and how to put your own video on the Lock Screen and screen saver with MacWall.",
    category: "macos",
    publishedAt: "2026-07-15",
    updatedAt: "2026-11-06",
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
        text: `**On macOS 27 Golden Gate, Apple's aerial wallpapers animate as you lock or unlock, but only with Apple's footage. To put your own video or a looping wallpaper on the Lock Screen and screen saver, use MacWall with Pro (or its ${macwallTrial.name}): set a wallpaper, and with System Wallpaper playback the Lock Screen plays it too.** MacWall's Lock Screen video works on macOS 27 and on macOS 26 Tahoe, in both of its playback modes.`,
      },
      { type: "h2", text: "What macOS 27 does on its own" },
      {
        type: "ul",
        items: [
          "**Aerials**: the Landscape, Cityscape, Underwater and Earth wallpapers animate as you lock or unlock your Mac, and the aerial you choose is also your screen saver by default.",
          "**One picture for both**: the Lock Screen shows your desktop wallpaper. Apple's Wallpaper settings have no separate Lock Screen picture.",
          "**Clock Appearance**: in Wallpaper settings you choose whether the large clock shows on the Lock Screen only or on the screen saver too, and its font and weight.",
          '**New in macOS 27**: a Mac category of gradient pill shapes that spell "Mac", as a wallpaper and as a screen saver.',
        ],
      },
      {
        type: "p",
        text: "The rest of the Lock Screen, from the message to the login picture, is covered in [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac). For a list of every wallpaper category in macOS 27 compared with Tahoe and Sequoia, see [macOS wallpapers](/blog/macos-wallpapers).",
      },
      { type: "h2", text: "What MacWall adds" },
      {
        type: "ul",
        items: [
          `Any of the ${macwallCatalog.liveCountLabel} catalog loops, or your own ${macwallImportFormatsLabel} video with Pro, on the Lock Screen.`,
          "The same video as the screen saver: one setting covers both.",
          "Playback by macOS itself, the way it plays Apple's aerials, not a window drawn over the Lock Screen.",
          "Sound on the Lock Screen with System Wallpaper playback, if the wallpaper has sound and you turned it on.",
        ],
      },
      { type: "h2", text: "Requirements" },
      {
        type: "ul",
        items: [
          `**macOS**: Lock Screen and Screen Saver video needs ${macwallLockScreenMacOSVersion} or later, including macOS 27. Desktop live wallpapers work from ${macwallMinimumMacOSVersion}.`,
          "**Mac**: MacWall runs on Apple silicon and Intel Macs, but macOS 27 itself runs only on Apple silicon, per [Apple's compatibility list](https://support.apple.com/en-us/127255). On an Intel Mac, the Lock Screen video works on macOS 26.",
          `**License**: MacWall Pro, or the ${macwallTrial.name}, which includes the Lock Screen.`,
        ],
      },
      { type: "h2", text: "Set it up" },
      {
        type: "p",
        text: `MacWall has two playback modes in **${macwallPlaybackModes.settingsPath}**, and the Lock Screen works a little differently in each.`,
      },
      {
        type: "h3",
        text: `With ${macwallPlaybackModes.systemWallpaper.setting} (the default on macOS 26 and 27)`,
      },
      {
        type: "ol",
        items: [
          "Open a wallpaper in MacWall and click **Set Wallpaper**.",
          "Lock your Mac with **Control-Command-Q**. The Lock Screen and the screen saver play the same wallpaper as the desktop, even while MacWall is closed.",
          "Optional: in MacWall's Settings → Lock Screen, turn on **Play only on the Lock Screen**. The desktop then rests on a still frame, and the wallpaper moves when you lock your Mac or the screen saver starts, then slows to a stop when you unlock, like Apple's aerials.",
        ],
      },
      { type: "h3", text: `With ${macwallPlaybackModes.app.setting}` },
      {
        type: "ol",
        items: [
          "In MacWall's Settings → Lock Screen, turn on **Show on Lock Screen and screen saver**.",
          "Open a wallpaper and use the menu next to **Set Wallpaper**: Desktop & Lock Screen, Desktop Only or Lock Screen Only.",
          "For a different wallpaper on the Lock Screen than on the desktop, choose **Lock Screen Only** for it.",
          "Lock with Control-Command-Q to check. The first apply takes a moment while MacWall converts the wallpaper into a Lock Screen video for macOS.",
        ],
      },
      {
        type: "p",
        text: "Which to choose: System Wallpaper keeps playing after you quit MacWall and adds sound on the Lock Screen; MacWall App lets the Lock Screen and desktop show different wallpapers. The full setup reference is [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver), and if the Lock Screen goes black or stops moving, [how Lock Screen video works on macOS Tahoe](/learn/how-macos-tahoe-lock-screen-video-works) explains why.",
      },
      { type: "h2", text: "Battery while locked" },
      {
        type: "p",
        text: `With ${macwallPlaybackModes.systemWallpaper.setting}, the Lock Screen keeps playing unless you turn off **Play the wallpaper while locked** in Settings → Lock Screen; off, it holds the frame it was on, which saves battery. With ${macwallPlaybackModes.app.setting} the desktop stops while the Mac is locked. Either way, once the display sleeps nothing is decoded, and how soon that happens is set in System Settings > Lock Screen with **Turn display off on battery when inactive** and **on power adapter when inactive**.`,
      },
      { type: "h2", text: "If Lock Screen video stops after an update" },
      {
        type: "p",
        text: "The macOS 27 beta changed how system wallpapers work, and Lock Screen video built only for macOS 26 stopped playing without an error. If yours stops after a macOS or MacWall update, update MacWall (Settings → About → Check Now), set the wallpaper again and lock your Mac. The full list of fixes is in [live wallpaper stopped after a macOS update](/blog/macos-27-beta-live-wallpaper-not-working).",
      },
      ...sourcesBlocks([
        blogSources.appleCustomizeWallpaper,
        blogSources.appleWallpaperSettings,
        blogSources.appleLockScreenSettings,
        blogSources.appleMacOS27Compatibility,
      ]),
    ],
    faq: [
      {
        question: "Can I set a live wallpaper on the macOS 27 Lock Screen?",
        answer:
          "Apple's aerials animate as you lock or unlock. For your own video or a looping catalog wallpaper on the Lock Screen and screen saver, use MacWall Pro or its free 24-hour trial.",
      },
      {
        question: "Does MacWall's Lock Screen video work on macOS 27?",
        answer:
          "Yes. It works on macOS 26 Tahoe and macOS 27 Golden Gate, in both the System Wallpaper and MacWall App playback modes.",
      },
      {
        question:
          "Can the macOS 27 Lock Screen show a different wallpaper than the desktop?",
        answer: `Not with Apple's settings. With MacWall's ${macwallPlaybackModes.app.setting} playback, choose Lock Screen Only from the menu next to Set Wallpaper.`,
      },
      {
        question: "Does macOS 27 run on Intel Macs?",
        answer:
          "No. Apple lists only Macs with Apple silicon as compatible with macOS 27. MacWall's Lock Screen video works on Intel Macs that run macOS 26.",
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
    publishedAt: "2026-09-28",
    updatedAt: "2026-11-06",
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
        text: "**macOS Tahoe (macOS 26) wallpapers live in System Settings > Wallpaper, where Apple's Tahoe designs sit alongside Dynamic Wallpapers, the aerials and your own photos.** On Tahoe the aerials animate as you lock or unlock, and MacWall's Lock Screen and screen saver video starts with this version. Apple's current version is macOS 27 Golden Gate, whose Wallpaper settings add a Mac category to the same list; [macOS wallpapers](/blog/macos-wallpapers) compares macOS 27, Tahoe and Sequoia side by side.",
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
          "**Dynamic Wallpapers**: images that brighten and darken with the time of day where you are, or follow your Light and Dark appearance. No motion.",
          "**Aerial wallpapers**: slow-motion footage of landscapes, cities, the sea and Earth. Apple says they animate as you lock or unlock your Mac, and the aerial you choose is also your screen saver by default.",
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
        text: "The Lock Screen is drawn by the system before you log in, so an app can't simply paint over it. MacWall's Lock Screen video uses the system wallpaper support in macOS 26 and later: macOS plays the video itself, on the Lock Screen and as the screen saver, the way it plays Apple's aerials. That is why MacWall needs Tahoe or later for it, with Pro or the free 24-hour trial. Setup is covered in [live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver), and the rest of the Lock Screen in [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac).",
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
          "Apple's help pages do not describe a separate Lock Screen picture: the Lock Screen shows your wallpaper. MacWall Pro on macOS 26 or later can put a moving video on the Lock Screen and screen saver, and in its MacWall App playback mode a different one from the desktop.",
      },
    ],
  },
]
