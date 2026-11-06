import type { BlogArticleInput } from "@/lib/content/types"
import { macwallMinimumMacOSVersion } from "@/lib/macwall-site"

export const featureArticles: BlogArticleInput[] = [
  {
    slug: "multi-monitor-wallpaper-mac",
    pathname: "/blog/multi-monitor-wallpaper-mac",
    title: "Dual Monitor Wallpaper on Mac: One per Screen",
    headline: "Dual Monitor Wallpaper on Mac",
    description:
      "Wallpapers on two or more Mac displays: what Apple documents, how to split one image across screens, and a different live wallpaper on each display.",
    excerpt:
      "What macOS documents for multiple displays, how to span an image, and live wallpapers per display with MacWall.",
    category: "features",
    publishedAt: "2026-07-13",
    updatedAt: "2026-10-27",
    keywords: [
      "dual monitor wallpaper",
      "dual monitor wallpaper mac",
      "multi monitor wallpaper mac",
      "different wallpaper on each monitor mac",
      "span wallpaper across two monitors mac",
      "ultrawide wallpaper mac",
      "dual monitor live wallpaper macos",
    ],
    sections: [
      {
        type: "p",
        text: "**To put a different live wallpaper on each display of a Mac, select the display in MacWall and set a wallpaper while it is focused; to use one wallpaper on every display with Apple's own settings, turn on Show on all Spaces in System Settings > Wallpaper.** Apple's help pages document that second option, but they do not spell out steps for a different still picture on each display.",
      },
      {
        type: "p",
        text: "This guide sticks to what Apple's pages actually say, then covers what MacWall does on multi-display desks, how to split one image across two screens, and the sizes to use for common Apple display pairs.",
      },
      { type: "h2", text: "What Apple documents for multiple displays" },
      {
        type: "p",
        text: "Apple's Wallpaper settings page for macOS Tahoe 26 and macOS 27 says that if you added desktop spaces or connected more than one display, you can turn on **Show on all Spaces** to use the same wallpaper on every space and display. On macOS Sonoma, the Screen Saver settings had a matching **Show on all Spaces** switch for the screen saver.",
      },
      {
        type: "p",
        text: "Apple's pages do not give a step-by-step method for a different wallpaper on each display, so we are not going to repeat steps we could not verify. If that is what you want, open System Settings > Wallpaper with every display connected and look at the options your version of macOS offers. For still images you can also use the split method further down.",
      },
      { type: "h2", text: "How many displays your Mac can drive" },
      {
        type: "p",
        text: "Before you plan a three-screen wallpaper, check that your Mac supports the displays. Apple's tech specs list these limits for external displays:",
      },
      {
        type: "table",
        columns: ["Mac", "External displays (Apple specs)"],
        rows: [
          [
            "MacBook Air (M5)",
            "Two at up to 6K 60Hz or 4K 144Hz, or one at up to 8K 60Hz, 5K 120Hz, or 4K 240Hz",
          ],
          ["MacBook Air (13-inch, M4, 2025)", "Up to two at up to 6K 60Hz"],
          ["MacBook Air (M1, 2020)", "One at up to 6K 60Hz"],
          ["MacBook Pro (M5)", "Up to two"],
          ["MacBook Pro (M5 Pro)", "Up to three"],
          ["MacBook Pro (M5 Max)", "Up to four"],
          ["MacBook Pro (13-inch, M2, 2022)", "One at up to 6K 60Hz"],
        ],
        caption:
          "Source: Apple tech specs and Apple Support, accessed 27 October 2026.",
      },
      {
        type: "h2",
        text: "A different live wallpaper on each display with MacWall",
      },
      {
        type: "p",
        text: `[MacWall](/download) plays video wallpapers on every connected display, either the same loop everywhere or a different one per screen. It runs on Apple silicon and Intel Macs with ${macwallMinimumMacOSVersion} or later, and multi-display playback is listed among the Pro features on the [pricing page](/pricing).`,
      },
      {
        type: "ol",
        items: [
          "[Download MacWall](/download), install it, and start the free 24-hour trial.",
          "Connect your displays.",
          "To use one loop everywhere, set a wallpaper for all displays.",
          "For a different loop on each screen, select a display in MacWall, then set a wallpaper while that display is focused. Repeat for the next display.",
        ],
      },
      {
        type: "ul",
        items: [
          "**Assignments stick.** If you disconnect a display, MacWall keeps its wallpaper, and it returns when you reconnect.",
          "**Pausing is per display.** When a full-screen app covers one screen, that screen's wallpaper pauses while the others keep playing.",
          "**Ultrawide and portrait screens.** The catalog has an Ultrawide filter, and for a vertical display a dedicated portrait loop looks better than a cropped landscape one.",
          "**Menu bar control.** Pause, resume, stop, or switch wallpapers from the menu bar without opening the main window.",
        ],
      },
      {
        type: "p",
        text: "The full walkthrough is in [set a live wallpaper](/docs/set-a-live-wallpaper), and [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac) covers the first-run steps.",
      },
      { type: "h2", text: "Same loop or different loops: what it costs" },
      {
        type: "p",
        text: "On a multi-display desk the main cost of a live wallpaper is decoding video, so the choice between one loop and several matters more than the number of screens.",
      },
      {
        type: "table",
        columns: ["Setup", "Decode work", "Good for"],
        rows: [
          [
            "Same loop on every display",
            "Decoded once and drawn on each display",
            "Laptops driving external screens, battery use",
          ],
          [
            "A different loop per display",
            "Decoded once per unique video (three 4K loops means three times the work)",
            "Desk Macs on power",
          ],
          [
            "Mixed resolutions",
            "Encode for the largest panel and let the smaller ones scale down",
            "A MacBook next to a 5K display",
          ],
        ],
        caption: "From MacWall's resolution and display guidance.",
      },
      {
        type: "p",
        text: "MacWall does not publish a fixed CPU or battery figure, because the result depends on the Mac, the video, and the number of displays. [Performance and battery](/docs/performance-and-battery) shows how to check MacWall's CPU use in Activity Monitor, and [wallpaper resolution and displays](/learn/wallpaper-resolution-and-displays) explains the trade-offs in more depth.",
      },
      { type: "h2", text: "Span one still image across two screens" },
      {
        type: "p",
        text: "Apple's pages do not describe an option to stretch one picture across two displays. The usual workaround is to make two images that line up:",
      },
      {
        type: "ol",
        items: [
          "Start with a wide image at least as large as both displays side by side. Two Studio Displays, for example, need a 10240 × 2880 canvas.",
          "Cut it into a left and a right piece, each matching its display's native resolution (5120 × 2880 each in that example). The [wallpaper resizer](/tools/wallpaper-resizer) helps with the sizing.",
          "Set the left piece on the left display and the right piece on the right display.",
        ],
      },
      {
        type: "p",
        text: "This works best with two identical displays. A MacBook Pro (254 ppi) next to a Studio Display (218 ppi) shows the same image at different physical sizes, so the two halves will not line up exactly at the seam.",
      },
      { type: "h2", text: "Wallpaper sizes for common Apple display pairs" },
      {
        type: "table",
        columns: ["Pair", "Each display", "Side-by-side canvas"],
        rows: [
          ["Two Studio Displays", "5120 × 2880", "10240 × 2880"],
          [
            "Studio Display XDR and Studio Display",
            "5120 × 2880",
            "10240 × 2880",
          ],
          ["Two Pro Display XDRs", "6016 × 3384", "12032 × 3384"],
          [
            "MacBook Pro 14-inch and Studio Display",
            "3024 × 1964 and 5120 × 2880",
            "Size each display separately",
          ],
          [
            "MacBook Air 13-inch (M4 or M5) and Studio Display",
            "2560 × 1664 and 5120 × 2880",
            "Size each display separately",
          ],
        ],
        caption:
          "Native resolutions from Apple tech specs; canvas widths are the two widths added together.",
      },
      {
        type: "p",
        text: "Every other Mac is listed in [MacBook wallpaper size](/blog/macbook-wallpaper-size). For a third-party monitor, use the native resolution from its maker's spec sheet, or check it with the [screen resolution checker](/tools/screen-resolution).",
      },
      { type: "h2", text: "Tips for a calmer multi-display desk" },
      {
        type: "ul",
        items: [
          "Put a slow loop such as [rain](/wallpapers/collections/rain) or [ocean](/wallpapers/collections/ocean) on the screen you work on.",
          "Save bolder motion, such as [cyberpunk](/wallpapers/collections/cyberpunk) or [JDM cars](/wallpapers/collections/jdm), for a secondary screen.",
          "Match each loop's resolution to its display, so you are not decoding pixels you never see.",
          "On battery, use one loop on every display so it is decoded only once.",
        ],
      },
      {
        type: "p",
        text: "To compare MacWall with other Mac wallpaper apps that offer per-display wallpapers, see the [comparison hub](/compare). The basics of changing a still wallpaper are in [how to change wallpaper on Mac](/blog/how-to-change-wallpaper-on-mac).",
      },
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: [
          "[Wallpaper settings on Mac (macOS 27)](https://support.apple.com/guide/mac-help/mchlp1103/mac), Apple Support, accessed 27 October 2026",
          "[Wallpaper settings on Mac (macOS Tahoe 26)](https://support.apple.com/guide/mac-help/mchlp1103/26/mac/26), Apple Support, accessed 27 October 2026",
          "[Change Screen Saver settings on Mac (macOS Sonoma 14)](https://support.apple.com/guide/mac-help/mchlp1227/14.0/mac/14.0), Apple Support, accessed 27 October 2026",
          "[MacBook Air (13-inch and 15-inch, M5) tech specs](https://www.apple.com/macbook-air/specs/), Apple, accessed 27 October 2026",
          "[MacBook Air (13-inch, M4, 2025) tech specs](https://support.apple.com/en-us/122209), Apple Support, accessed 27 October 2026",
          "[MacBook Air (M1, 2020) tech specs](https://support.apple.com/en-us/111883), Apple Support, accessed 27 October 2026",
          "[MacBook Pro (14-inch and 16-inch, M5 family) tech specs](https://www.apple.com/macbook-pro/specs/), Apple, accessed 27 October 2026",
          "[MacBook Pro (13-inch, M2, 2022) tech specs](https://support.apple.com/en-us/111869), Apple Support, accessed 27 October 2026",
          "[Studio Display tech specs](https://www.apple.com/studio-display/specs/), Apple, accessed 27 October 2026",
          "[Studio Display XDR tech specs](https://www.apple.com/studio-display-xdr/specs/), Apple, accessed 27 October 2026",
          "[Pro Display XDR tech specs](https://support.apple.com/en-us/111892), Apple Support, accessed 27 October 2026",
        ],
      },
    ],
    faq: [
      {
        question: "Can a Mac show a different wallpaper on each monitor?",
        answer:
          "With MacWall, yes: select a display and set a wallpaper while it is focused, and each screen keeps its own loop. Apple's help pages document Show on all Spaces for using one wallpaper everywhere, but they do not give steps for a different picture per display.",
      },
      {
        question: "How do I use the same wallpaper on every display?",
        answer:
          "Turn on Show on all Spaces in System Settings > Wallpaper. Apple says this uses the same wallpaper on every desktop space and every connected display.",
      },
      {
        question:
          "How do I stretch one wallpaper across two monitors on a Mac?",
        answer:
          "Split a wide image into two pieces, each sized to its display's native resolution, and set one piece on each display. It lines up best on two identical displays.",
      },
      {
        question:
          "Do live wallpapers on two monitors use double the resources?",
        answer:
          "Only if the loops are different. MacWall decodes the same loop once for every display that shows it, while each unique loop is decoded separately.",
      },
      {
        question: "What happens to the wallpaper when I unplug a display?",
        answer:
          "MacWall keeps that display's assignment, so its wallpaper comes back when you reconnect it.",
      },
    ],
  },
]
