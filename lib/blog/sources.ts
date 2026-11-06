import type { PageSource } from "@/lib/content/sources"

/**
 * Pages the blog cites, read on the date in `accessed`. Each claim in a post
 * that comes from one of these matches the page as it read that day; re-read
 * the page before changing the claim, then move the date.
 */
const READ_2026_11_06 = "2026-11-06"

export const blogSources = {
  appleLockScreenSettings: {
    name: "Change Lock Screen settings on Mac (macOS 27)",
    url: "https://support.apple.com/guide/mac-help/mh11784/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleLockScreenSettings26: {
    name: "Change Lock Screen settings on Mac (macOS Tahoe 26)",
    url: "https://support.apple.com/guide/mac-help/mh11784/26/mac/26",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleLockScreenSettings15: {
    name: "Change Lock Screen settings on Mac (macOS Sequoia 15)",
    url: "https://support.apple.com/guide/mac-help/mh11784/15.0/mac/15.0",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleLoginPicture: {
    name: "Change your login picture on Mac",
    url: "https://support.apple.com/guide/mac-help/change-your-login-picture-mtusr002/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleUseScreenSaver: {
    name: "Use a screen saver on your Mac",
    url: "https://support.apple.com/guide/mac-help/use-a-screen-saver-mchl4b68853d/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleScreenSaverSettings: {
    name: "Change Screen Saver settings on Mac (macOS 27)",
    url: "https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleScreenSaverSettings15: {
    name: "Change Screen Saver settings on Mac (macOS Sequoia 15)",
    url: "https://support.apple.com/guide/mac-help/mchlp1227/15.0/mac/15.0",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleCustomizeWallpaper: {
    name: "Customize the wallpaper on your Mac (macOS 27)",
    url: "https://support.apple.com/guide/mac-help/mchlp3013/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleCustomizeWallpaper26: {
    name: "Customize the wallpaper on your Mac (macOS Tahoe 26)",
    url: "https://support.apple.com/guide/mac-help/mchlp3013/26.0/mac/26",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleCustomizeWallpaper15: {
    name: "Customize the wallpaper on your Mac (macOS Sequoia 15)",
    url: "https://support.apple.com/guide/mac-help/mchlp3013/15.0/mac/15.0",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleWallpaperSettings: {
    name: "Wallpaper settings on Mac (macOS 27)",
    url: "https://support.apple.com/guide/mac-help/mchlp1103/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleWallpaperSettings26: {
    name: "Wallpaper settings on Mac (macOS Tahoe 26)",
    url: "https://support.apple.com/guide/mac-help/mchlp1103/26/mac/26",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleWallpaperSettings15: {
    name: "Wallpaper settings on Mac (macOS Sequoia 15)",
    url: "https://support.apple.com/guide/mac-help/mchlp1103/15.0/mac/15.0",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleWhatsNewMacOS27: {
    name: "What's new in macOS 27",
    url: "https://support.apple.com/guide/mac-help/whats-new-in-macos-27-apd07d671600/mac",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleMacOSVersions: {
    name: "Find out which macOS your Mac is using",
    url: "https://support.apple.com/en-us/109033",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleMacOS27Compatibility: {
    name: "macOS 27 Golden Gate is compatible with these computers",
    url: "https://support.apple.com/en-us/127255",
    publisher: "Apple Support",
    accessed: READ_2026_11_06,
  },
  appleSonomaNewsroom: {
    name: "macOS Sonoma brings new capabilities for elevating productivity and creativity",
    url: "https://www.apple.com/newsroom/2023/06/macos-sonoma-brings-new-capabilities-for-elevating-productivity-and-creativity/",
    publisher: "Apple Newsroom",
    accessed: READ_2026_11_06,
  },
  dynamicWallpaperClubFaq: {
    name: "Frequently Asked Questions about Dynamic Wallpapers",
    url: "https://dynamicwallpaper.club/faq",
    publisher: "Dynamic Wallpaper Club",
    accessed: READ_2026_11_06,
  },
  dynamicWallpaperClubHowTo: {
    name: "How to set a Dynamic Wallpaper on macOS",
    url: "https://dynamicwallpaper.club/how-to",
    publisher: "Dynamic Wallpaper Club",
    accessed: READ_2026_11_06,
  },
} as const satisfies Record<string, PageSource>
