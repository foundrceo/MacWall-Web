import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallMinimumMacOSVersionLabel,
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
      "The definitive guide to MacWall — native live wallpapers for Mac, 4K catalog, minimal CPU usage, Lock Screen on macOS 26, one-time pricing, community uploads, and how it compares to every alternative.",
    excerpt:
      "One page. Every answer. What MacWall is, how it works, why it uses almost no CPU, and why Mac users pick it over everything else.",
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
        text: "**MacWall** (macwall.app) is a native macOS app for cinematic **live video wallpapers** — 4K loops on your desktop, optional Lock Screen motion on supported macOS versions, and full control from the menu bar. It is built with Swift and Metal, decodes video on Apple hardware (not the CPU), and is designed to stay invisible during real work: pause on battery, pause on full screen, pause when the display sleeps, and pause when system load spikes.",
      },
      {
        type: "h2",
        text: "What you get on day one",
      },
      {
        type: "ol",
        items: [
          `Download free at macwall.app/download — ${macwallMinimumMacOSVersionLabel}.`,
          "Install from the DMG, launch once, MacWall lives in the menu bar (not the Dock clutter).",
          "Browse 1,000+ curated loops at macwall.app/wallpapers — Nature, Space, Anime, Cars, City, Video Games, Sci-fi, Fantasy, Cats.",
          "Click any wallpaper to preview and set. One click. Hardware-decoded loop behind your windows.",
          "Import your own MP4, MOV, M4V, or GIF — drag into Library, set instantly.",
          `Upgrade to Pro (${proPrice} one-time) for the full catalog, Lock Screen on ${macwallLockScreenMacOSVersion}+, playlists, and lifetime updates on up to ${maxMacs} Macs.`,
        ],
      },
      {
        type: "h2",
        text: "Why MacWall uses almost no CPU",
      },
      {
        type: "p",
        text: "This is the question every MacBook owner asks first. MacWall uses **VideoToolbox hardware decode** — the same media pipeline as QuickTime — then composites frames with Metal. The CPU is not decoding pixels. During normal plugged-in desktop use, Activity Monitor typically shows **well under 1% CPU** for MacWall. When you are not looking at the wallpaper (full-screen app, screen locked, display asleep, or pause-on-battery enabled), usage drops to **zero** because playback stops entirely.",
      },
      {
        type: "ul",
        items: [
          "**Hardware decode** — H.264 and HEVC on GPU/media engine, not software rendering",
          "**Pause on battery** — motion stops unplugged; resumes on power",
          "**Pause on full screen** — per display; Zoom, games, Keynote = no wasted decode",
          "**Pause on high CPU** — auto-pause above ~80% system load, resume near ~55%",
          "**Pause on lock & sleep** — nothing renders when you walk away",
          "**Reduce Quality on Battery** — optional 1080p/30fps cap on battery or Low Power Mode",
          "**One decoder per display** — multi-monitor without duplicate work",
          "**Performance Mode** — optional 720p/24fps cap for maximum headroom on older Intel Macs",
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
        text: "Mac users today choose between native apps (MacWall, Backdrop, Wallper, Wallspace) and cross-platform ports (Wallpaper Engine wrappers, Lively-style tools, Electron players). **MacWall's edge is the combination**: native SwiftUI UX, aggressive pause policy, community catalog + personal imports, web gallery at macwall.app, one-time Pro pricing, no account wall to browse, and Lock Screen support on ${macwallLockScreenMacOSVersion} where Apple allows custom video.",
      },
      {
        type: "ul",
        items: [
          "**vs Backdrop** — Both native; MacWall adds community submit flow, Reel refund program, and menu-bar-first workflow. See [MacWall vs Backdrop](/blog/macwall-vs-backdrop).",
          "**vs Wallper** — Both one-time purchase natives; MacWall emphasizes catalog growth, web gallery, and creator program. See [MacWall vs Wallper](/alternatives/macwall-vs-wallper).",
          "**vs Wallspace** — MacWall offers community uploads and macwall.app integration. See [MacWall vs Wallspace](/alternatives/macwall-vs-wallspace).",
          "**vs Wallpaper Engine** — No official Mac port; wrappers add overhead. MacWall is Mac-native video loops. See [Wallpaper Engine on Mac](/blog/wallpaper-engine-alternative-mac).",
          "**vs free Electron tools** — Chromium-based players keep a browser engine alive for wallpaper duty. MacWall has no Electron layer.",
        ],
      },
      {
        type: "h2",
        text: "Content: catalog, web gallery, and community",
      },
      {
        type: "p",
        text: "MacWall's library is **curated + community-built**. Staff picks, trending rankings, and category browsing live in-app and on macwall.app/wallpapers. Anyone can submit a loop at macwall.app/submit — seamless MP4/MOV, 1080p minimum (4K preferred), human review before publish. Deep links from the website open directly in the Mac app.",
      },
      {
        type: "h2",
        text: "Pricing: pay once, own forever",
      },
      {
        type: "ul",
        items: [
          `**Free download** — try the app, browse, set wallpapers within free tier limits`,
          `**Pro ${proPrice} one-time** — full catalog, Lock Screen (${macwallLockScreenMacOSVersion}+), playlists, lifetime updates, ${maxMacs} Macs per license`,
          "**Pro Plus** — bundle licenses for 5, 10, 15, or 20 Macs (teams, studios)",
          "**No subscription, no ads** — ever",
          "**Creator refund** — post a video with #macwall; 2,000 views = 50% back, 20,000 = full refund ([details](/creator))",
          "**Affiliate program** — earn 40% referring customers ([details](/affiliate))",
        ],
      },
      {
        type: "h2",
        text: "Lock Screen & Screen Saver",
      },
      {
        type: "p",
        text: `Desktop live wallpapers work on **macOS ${macwallMinimumMacOSVersion}+**. **Lock Screen and Screen Saver video motion** require **${macwallLockScreenMacOSVersion}+** (Apple's Tahoe generation) and MacWall Pro. MacWall uses Apple's wallpaper system — no kernel extensions, no hacky installers. Turn it off anytime in Settings and your previous look returns.`,
      },
      {
        type: "h2",
        text: "Multi-display & imports",
      },
      {
        type: "p",
        text: "Assign **different wallpapers per monitor** or mirror the same loop. Ultrawide, dual 4K, MacBook + external — one hardware decoder per screen. Import unlimited personal clips; favorites and playlists (Pro) keep large libraries organized.",
      },
      {
        type: "h2",
        text: "Privacy & accounts",
      },
      {
        type: "p",
        text: "Browse the catalog and run your own imported files **without creating an account**. Purchases use Stripe checkout; license keys activate in-app. Community uploads go through review — see [Privacy Policy](/privacy) and [Terms](/terms).",
      },
      {
        type: "h2",
        text: "Staying updated",
      },
      {
        type: "p",
        text: "MacWall ships regular app updates — see [Changelog](/changelog) for release notes. New wallpapers land in the catalog continuously as community submissions are approved. In-app Release Notes appear when an update is available.",
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
          "Your Mac is below macOS 14 — MacWall requires a recent macOS",
          "You refuse any one-time purchase and want a permanently free full catalog (try the Reel refund instead)",
        ],
      },
      {
        type: "h2",
        text: "Get started",
      },
      {
        type: "p",
        text: "Download at [macwall.app/download](/download). Browse wallpapers at [macwall.app/wallpapers](/wallpapers). Questions? [Support](/support) or email support@macwall.app.",
      },
    ],
  },
  {
    slug: "macwall-performance-zero-overhead-guide",
    pathname: "/blog/macwall-performance-zero-overhead-guide",
    title: "MacWall Performance: Near-Zero Overhead Explained",
    headline: "How MacWall Keeps Live Wallpapers Lightweight",
    description:
      "Technical and practical guide to MacWall's resource usage — hardware decode, pause policies, Activity Monitor benchmarks, and why native beats Electron wallpaper apps on Mac.",
    excerpt:
      "Live wallpapers do not have to cost CPU. Here is exactly how MacWall stays lighter than every alternative.",
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
        text: "Most live wallpaper horror stories come from **bad architecture** — software decode, always-on rendering, Electron shells, or scene engines running translation layers. **MacWall** was engineered around one rule: *if the user cannot see the wallpaper, stop decoding.* Everything else follows from native Apple media APIs.",
      },
      {
        type: "h2",
        text: "The decode pipeline (why CPU stays low)",
      },
      {
        type: "ol",
        items: [
          "**Source** — H.264 or HEVC MP4/MOV from catalog CDN or local import",
          "**VideoToolbox** — hardware decode on Apple Silicon or Intel Quick Sync where available",
          "**Metal compositing** — frames drawn behind desktop windows via GPU",
          "**Menu bar process** — no Dock icon required; minimal UI surface area",
        ],
      },
      {
        type: "p",
        text: "Software-decoded wallpaper apps can sit at 5–15% CPU before you open Chrome. MacWall's decode path avoids that entirely on modern Macs.",
      },
      {
        type: "h2",
        text: "Every automatic pause trigger",
      },
      {
        type: "ul",
        items: [
          "**Battery unplugged** — optional full pause (recommended for MacBook Air)",
          "**Full-screen app** — per-display; wallpaper behind a full-screen window does not render",
          "**Screen locked** — Lock Screen has its own wallpaper path; desktop player stops",
          "**Display asleep** — zero work until wake",
          "**High CPU load** — pause above ~80%, resume near ~55% to protect focus work",
          "**Manual pause** — one click from menu bar before a render or compile job",
          "**Reduced Motion** — respects macOS accessibility setting",
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
        text: "Two 4K loops, two decoders, typically sub-1% CPU each on M-series chips. Fans stay silent during email and coding.",
      },
      {
        type: "h3",
        text: "MacBook on battery in a café",
      },
      {
        type: "p",
        text: "Pause-on-battery enabled: **0% wallpaper CPU** entire session. Wallpaper resumes when you plug in at home.",
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
        text: "High-CPU pause kicks in automatically. Wallpaper yields resources to your actual job.",
      },
      {
        type: "h2",
        text: "MacWall vs Electron wallpaper apps",
      },
      {
        type: "p",
        text: "Electron apps embed Chromium. Even idle, that baseline costs memory and periodic CPU wakeups. Adding video playback on top multiplies the problem. MacWall has **no Chromium layer** — it is Swift native end to end.",
      },
      {
        type: "h2",
        text: "MacWall vs Wallpaper Engine ports",
      },
      {
        type: "p",
        text: "Scene-file parsers and compatibility shims add GPU/CPU tax for features Mac users rarely need (interactive physics, Workshop DLLs). MacWall targets **video loops** — the format 95% of users actually want — with native decode.",
      },
      {
        type: "h2",
        text: "Quality presets when you want extra margin",
      },
      {
        type: "ul",
        items: [
          "**Retina Rendering** — full native resolution (default; best look)",
          "**Reduce Quality on Battery** — 1080p/30fps cap on battery",
          "**Performance Mode** — 720p/24fps cap for older Intel Macs or max headroom",
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
          "Note usage idle at desktop (~0–1% on M-series).",
          "Open any app full screen → MacWall drops to 0%.",
          "Unplug MacBook with pause-on-battery → 0%.",
          "Check MacWall menu bar popover for live CPU/RAM stats.",
        ],
      },
      {
        type: "h2",
        text: "Bottom line",
      },
      {
        type: "p",
        text: "Live wallpapers are not inherently heavy. **Native hardware decode + aggressive pause policy** makes them a background luxury, not a performance tax. That is the engineering bet MacWall is built on — and why it outperforms cross-platform alternatives on Mac in 2026.",
      },
    ],
  },
]
