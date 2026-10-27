import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSVersionLabel,
  macwallCatalog,
} from "@/lib/macwall-site"
import type { BlogArticle } from "@/lib/content/types"

const proPrice = macwall.pro.price
const maxMacs = macwall.maxLicensedMacs

export const overviewArticles: BlogArticle[] = [
  {
    slug: "what-is-macwall-complete-guide",
    pathname: "/blog/what-is-macwall-complete-guide",
    title: "What Is MacWall? The Complete Guide (2026)",
    headline: "What Is MacWall? Everything You Need to Know",
    description:
      "What MacWall is: native live wallpapers for Mac, a 4K catalog, hardware-decoded playback, Lock Screen video on macOS 26, and one-time pricing.",
    excerpt:
      "One page. Every answer. What MacWall is, how it works, and how hardware decoding and pause rules reduce resource use.",
    category: "features",
    readMinutes: 14,
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-01",
    keywords: [
      "what is macwall",
      "macwall app",
      "macwall review 2026",
      "live wallpaper mac app",
      "macwall complete guide",
      "best wallpaper app mac",
    ],
    sections: [
      {
        type: "p",
        text: "**MacWall** (macwall.app) is a native macOS app for cinematic **live video wallpapers**: 4K loops on your desktop, optional Lock Screen motion on supported macOS versions, and full control from the menu bar. It is built with Swift and Metal, decodes video on Apple hardware (not the CPU), and is designed to stay invisible during real work: pause on battery, pause on full screen, pause when the display sleeps, and pause when system load spikes.",
      },
      {
        type: "h2",
        text: "What you get on day one",
      },
      {
        type: "ol",
        items: [
          `Download free at macwall.app/download, ${macwallMinimumMacOSVersionLabel}.`,
          "Install from the DMG, launch once, MacWall lives in the menu bar (not the Dock clutter).",
          `Browse ${macwallCatalog.liveCountLabel} curated loops at macwall.app/wallpapers: Anime, Nature, Cars, Gaming, Space, Heroes, Dark, Abstract, Others.`,
          "Click any wallpaper to preview and set. One click. Hardware-decoded loop behind your windows.",
          "With Pro, import your own MP4, MOV, M4V, or GIF. Drag it into Library and set it.",
          `Upgrade to Pro (${proPrice} one-time) for the full catalog, Lock Screen on ${macwallLockScreenMacOSVersion}+, Shuffle and Day Schedule, and lifetime updates on up to ${maxMacs} Macs.`,
        ],
      },
      {
        type: "h2",
        text: "How MacWall reduces CPU work",
      },
      {
        type: "p",
        text: "This is the question every MacBook owner asks first. MacWall uses **VideoToolbox hardware decode**: the same media pipeline as QuickTime, then composites frames with Metal. With a supported codec, most pixel decoding runs on dedicated media hardware instead of the CPU. Actual Activity Monitor and Energy Impact readings vary with the Mac, source video, display setup, and settings. When playback pauses for a full-screen app, display sleep, high load, or a battery rule, the wallpaper video decoder stops until playback resumes.",
      },
      {
        type: "ul",
        items: [
          "**Hardware decode**: H.264 and HEVC on GPU/media engine, not software rendering",
          "**Pause on battery** (optional): motion stops on battery once Low Power Mode is on or the battery is low; resumes on power",
          "**Pause on full screen**: per display; Zoom, games, Keynote = no wasted decode",
          "**Pause on high CPU**: auto-pause above ~80% system load, resume near ~55%",
          "**Pause on lock & sleep**: nothing renders when you walk away",
          "**Reduce Quality on Battery**: optional 1080p/30fps cap on battery or Low Power Mode",
          "**Shared players**: displays showing the same loop share one decoder",
          "**Performance preset**: optional 1280-pixel, 30fps cap for extra headroom on older Intel Macs",
        ],
      },
      {
        type: "p",
        text: "For a deeper breakdown with competitor context, read our [CPU usage comparison](/blog/live-wallpaper-cpu-usage-mac) and [battery guide](/blog/live-wallpaper-battery-drain-mac).",
      },
      {
        type: "h2",
        text: "MacWall vs other Mac wallpaper apps (2026)",
      },
      {
        type: "p",
        text: `Mac users today choose between native apps (MacWall, Backdrop, Wallspace) and workarounds for Windows-only tools such as Wallpaper Engine and Lively Wallpaper. **MacWall's case is the combination**: a native Swift app, pause rules on by default, a community catalog plus personal imports, a web gallery at macwall.app, one-time Pro pricing, no account needed to browse, and Lock Screen video on ${macwallLockScreenMacOSVersion} or later. The [comparison hub](/compare) lays out the differences.`,
      },
      {
        type: "ul",
        items: [
          "**vs Backdrop**: Both native; MacWall adds community submit flow, Reel refund program, and menu-bar-first workflow. See [MacWall vs Backdrop](/alternatives/macwall-vs-backdrop).",
          "**vs Wallspace**: MacWall offers community uploads and macwall.app integration. See [MacWall vs Wallspace](/alternatives/macwall-vs-wallspace).",
          "**vs Wallpaper Engine**: Its Steam page lists Windows only, with no Mac version; wrappers add overhead. MacWall is Mac-native video loops. See [Wallpaper Engine on Mac](/alternatives/wallpaper-engine).",
          "**vs free Electron tools**: Chromium-based players keep a browser engine alive for wallpaper duty. MacWall has no Electron layer.",
        ],
      },
      {
        type: "h2",
        text: "Content: catalog, web gallery, and community",
      },
      {
        type: "p",
        text: "MacWall's library is **curated + community-built**. Staff picks, trending rankings, and category browsing live in-app and on macwall.app/wallpapers. Anyone can submit a loop from the upload panel in the Mac app: a clean-looping MP4 or MOV, 1080p minimum (4K preferred), with human review before it is published. Deep links from the website open directly in the Mac app.",
      },
      {
        type: "h2",
        text: "Pricing: pay once, own forever",
      },
      {
        type: "ul",
        items: [
          `**Free download**: a 24-hour trial of the full catalog and live Lock Screen, then keep browsing the catalog`,
          `**Pro ${proPrice} one-time**: full catalog, Lock Screen (${macwallLockScreenMacOSVersion}+), Shuffle and Day Schedule, lifetime updates, ${maxMacs} Macs per license`,
          "**Pro+**: the same features on 5 or 10 Macs (families, teams, studios)",
          "**No subscription, no ads**: ever",
          "**Creator refund**: post a video with #macwall; 2,000 views = 50% back, 20,000 = full refund ([details](/creator))",
          "**Affiliate program**: earn 40% referring customers ([details](/affiliate))",
        ],
      },
      {
        type: "h2",
        text: "Lock Screen & Screen Saver",
      },
      {
        type: "p",
        text: `Desktop live wallpapers work on **${macwallMinimumMacOSVersion} or later**. **Lock Screen and Screen Saver video motion** require **${macwallLockScreenMacOSVersion}+** (Apple's Tahoe generation) and MacWall Pro. MacWall uses Apple's wallpaper system, so there are no kernel extensions and no hacky installers. Turn it off anytime in Settings and your previous look returns.`,
      },
      {
        type: "h2",
        text: "Multi-display & imports",
      },
      {
        type: "p",
        text: "Assign **different wallpapers per monitor** or mirror the same loop. Ultrawide, dual 4K, MacBook plus external: screens showing the same loop share one player. Import your own clips with Pro; favorites and Shuffle keep large libraries organized.",
      },
      {
        type: "h2",
        text: "Privacy & accounts",
      },
      {
        type: "p",
        text: "Browse the catalog and run your own imported files **without creating an account**. Purchases use Stripe checkout; license keys activate in-app. Community uploads go through review. See [Privacy Policy](/legal/privacy) and [Terms](/legal/terms).",
      },
      {
        type: "h2",
        text: "Staying updated",
      },
      {
        type: "p",
        text: "MacWall ships regular app updates. See [Changelog](/changelog) for release notes. New wallpapers land in the catalog continuously as community submissions are approved. In-app Release Notes appear when an update is available.",
      },
      {
        type: "h2",
        text: "Who MacWall is for",
      },
      {
        type: "ul",
        items: [
          "Mac users who want **cinematic motion** without a monthly subscription",
          "MacBook owners who need **smart pause** so wallpaper never fights battery life",
          "Multi-monitor desks that want **per-display loops**",
          "Creators who import their own clips or share loops with the community",
          "Anyone leaving Wallpaper Engine or heavy Electron tools for a **native Mac experience**",
        ],
      },
      {
        type: "h2",
        text: "Who should skip it",
      },
      {
        type: "ul",
        items: [
          "You need interactive game-like Wallpaper Engine scenes (MacWall focuses on video loops)",
          "Your Mac is below macOS 15, and MacWall requires a recent macOS",
          "You refuse any one-time purchase and want a permanently free full catalog (try the Reel refund instead)",
        ],
      },
      {
        type: "h2",
        text: "Get started",
      },
      {
        type: "p",
        text: "Download at [macwall.app/download](/download). Browse wallpapers at [macwall.app/wallpapers](/wallpapers). Questions? Read the [docs](/docs) or email support@macwall.app.",
      },
    ],
  },
  {
    slug: "macwall-performance-zero-overhead-guide",
    pathname: "/blog/macwall-performance-zero-overhead-guide",
    title: "MacWall Performance: Hardware Decode, Pause Rules",
    headline: "How MacWall Keeps Live Wallpapers Lightweight",
    description:
      "MacWall's resource use explained: hardware decode, every pause rule and its default, and how to check its CPU use on your own Mac in a minute.",
    excerpt:
      "How MacWall uses native hardware decoding and visibility-aware pause rules to reduce playback overhead.",
    category: "comparisons",
    readMinutes: 10,
    publishedAt: "2026-08-01",
    keywords: [
      "macwall performance",
      "macwall cpu usage",
      "lightweight live wallpaper mac",
      "hardware decode wallpaper macos",
      "live wallpaper zero cpu mac",
    ],
    sections: [
      {
        type: "p",
        text: "Most complaints about live wallpapers come from **architecture**: software decode, always-on rendering, Electron shells, or scene engines running translation layers. **MacWall** was engineered around one rule: *if the user cannot see the wallpaper, stop decoding.* Everything else follows from native Apple media APIs.",
      },
      {
        type: "h2",
        text: "The decode pipeline (why CPU stays low)",
      },
      {
        type: "ol",
        items: [
          "**Source**: H.264 or HEVC MP4/MOV from catalog CDN or local import",
          "**VideoToolbox**: hardware decode on Apple Silicon or Intel Quick Sync where available",
          "**Metal compositing**: frames drawn behind desktop windows via GPU",
          "**Menu bar process**: no Dock icon required; minimal UI surface area",
        ],
      },
      {
        type: "p",
        text: "Software decoding keeps CPU cores busy for as long as the video plays. Handing decode to the media engine is what keeps a native wallpaper light; we have not published a measured comparison, so the check at the end of this guide is the honest test.",
      },
      {
        type: "h2",
        text: "Every automatic pause trigger",
      },
      {
        type: "ul",
        items: [
          "**Low Power Mode or low battery**: optional full pause (recommended for MacBook Air)",
          "**Full-screen app** (on by default): per display; a wallpaper behind a full-screen window does not render",
          "**Screen locked**: Lock Screen has its own wallpaper path; desktop player stops",
          "**Display asleep**: zero work until wake",
          "**High CPU load** (optional, off by default): pause above 80% system CPU, resume at 55%",
          "**Manual pause**: one click from menu bar before a render or compile job",
        ],
      },
      {
        type: "h2",
        text: "Real-world scenarios",
      },
      {
        type: "h3",
        text: "Desk Mac, plugged in, dual monitors",
      },
      {
        type: "p",
        text: "Two different 4K loops mean two decoders, so roughly twice the decode work of one; the same loop on both displays shares one player. Open the menu bar popover to see what MacWall itself is using.",
      },
      {
        type: "h3",
        text: "MacBook on battery in a café",
      },
      {
        type: "p",
        text: "Turn on Low Power Mode with pause-on-battery enabled and the wallpaper stops decoding for the rest of the session. It resumes when you plug in at home.",
      },
      {
        type: "h3",
        text: "Zoom call full screen",
      },
      {
        type: "p",
        text: "MacWall pauses the covered display. Your wallpaper is not decoding behind the call.",
      },
      {
        type: "h3",
        text: "Final Cut or Xcode stress test",
      },
      {
        type: "p",
        text: "Turn on Pause when busy in Settings > Battery & Performance and the wallpaper yields to your build or render once system CPU passes 80%.",
      },
      {
        type: "h2",
        text: "MacWall vs Electron wallpaper apps",
      },
      {
        type: "p",
        text: "Electron apps embed Chromium. Even idle, that baseline costs memory and periodic CPU wakeups. Adding video playback on top multiplies the problem. MacWall has **no Chromium layer**: it is Swift native end to end.",
      },
      {
        type: "h2",
        text: "MacWall vs Wallpaper Engine ports",
      },
      {
        type: "p",
        text: "Scene-file parsers and compatibility shims add GPU/CPU tax for features Mac users rarely need (interactive physics, Workshop DLLs). MacWall targets **video loops** with native decode, and skips interactive scenes entirely.",
      },
      {
        type: "h2",
        text: "Quality presets when you want extra margin",
      },
      {
        type: "ul",
        items: [
          "**Retina Rendering**: full native resolution (best look)",
          "**Lower quality on battery** (optional): 1080p/30fps cap on battery",
          "**Performance preset**: 1280-pixel, 30fps cap for older Intel Macs or maximum headroom",
        ],
      },
      {
        type: "h2",
        text: "Verify yourself in 60 seconds",
      },
      {
        type: "ol",
        items: [
          "Install MacWall, set a 4K catalog wallpaper.",
          "Open Activity Monitor → CPU tab → search MacWall.",
          "Note MacWall's CPU use while the wallpaper plays at the desktop.",
          "Open any app full screen: playback pauses and MacWall's CPU use drops.",
          "Turn on Low Power Mode with pause-on-battery enabled: playback stops.",
          "Check MacWall menu bar popover for live CPU/RAM stats.",
        ],
      },
      {
        type: "h2",
        text: "Bottom line",
      },
      {
        type: "p",
        text: "Live wallpapers are not inherently heavy. **Native hardware decode + aggressive pause policy** makes them a light background task rather than a performance cost. That is the engineering bet MacWall is built on.",
      },
    ],
  },
]
