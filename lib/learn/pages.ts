import type { SeoContentPage } from "@/lib/content/types"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

/**
 * Evergreen concept explainers — the "what is / how does it work" layer.
 *
 * Deliberately distinct from `/docs` (product tasks) and `/blog` (opinion,
 * comparisons, news) so the three hubs do not compete for the same queries.
 */

export type LearnPage = SeoContentPage & {
  /** Short label for hub cards and breadcrumbs. */
  navLabel: string
  /** One-line answer surfaced on the hub — also the definition an LLM can lift. */
  takeaway: string
}

const updatedAt = "2026-08-02"

function lesson(page: LearnPage): LearnPage {
  return page
}

export const learnPages: LearnPage[] = [
  lesson({
    navLabel: "What is a live wallpaper?",
    takeaway:
      "A live wallpaper is a short video loop rendered at the desktop wallpaper layer instead of a still image.",
    slug: "what-is-a-live-wallpaper",
    pathname: "/learn/what-is-a-live-wallpaper",
    title: "What Is a Live Wallpaper?",
    headline: "What is a live wallpaper?",
    description:
      "A live wallpaper is a looping video rendered at your desktop's wallpaper layer. Here is how it differs from animated, dynamic, and interactive wallpapers.",
    keywords: [
      "what is a live wallpaper",
      "live wallpaper meaning",
      "animated wallpaper vs live wallpaper",
      "dynamic wallpaper mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "A **live wallpaper** is a short video loop drawn where your desktop picture normally sits — behind every icon, window, and menu. Nothing about how you use the Mac changes: you click through it, windows cover it, Mission Control and Stage Manager treat it like any wallpaper. The only difference is that the image moves.",
      },
      { type: "h2", text: "The terms people mix up" },
      {
        type: "ul",
        items: [
          "**Live wallpaper** — a video loop playing continuously at the wallpaper layer. Motion is the point.",
          "**Dynamic wallpaper** — a still image that swaps variants based on time of day or appearance mode. macOS ships several. No motion, just scheduled stills.",
          "**Animated wallpaper** — usually a synonym for live wallpaper, sometimes used for procedural or shader-drawn scenes rendered in real time instead of decoded from video.",
          "**Interactive wallpaper** — reacts to the cursor, audio, or system state. Rare on macOS and much more expensive to run, because the frames cannot be pre-encoded.",
          "**Screen saver** — takes over the whole screen when you are away. It is a different macOS surface from the wallpaper, even when it shows the same footage.",
        ],
      },
      { type: "h2", text: "Why video, not real-time rendering" },
      {
        type: "p",
        text: "A pre-encoded video is by far the cheapest way to put motion on a desktop. Every Mac has dedicated media decoding hardware, so a 4K loop can play without the CPU touching a single pixel. A procedurally rendered scene has to be computed frame by frame, every frame, forever — which is why shader-style wallpapers tend to warm up a laptop and video-based ones do not. That difference is explained in [hardware video decode](/learn/hardware-video-decode).",
      },
      { type: "h2", text: "What makes a loop feel good" },
      {
        type: "ul",
        items: [
          "**Seamless** — the last frame flows into the first. You are going to see this transition hundreds of times a day.",
          "**Slow** — drifting clouds, rain, slow pans. Fast motion in peripheral vision reads as a notification and pulls your eye.",
          "**Low contrast where your icons live** — busy bright areas behind desktop icons make labels hard to read.",
          "**Resolution-matched** — sized to your display, not above it. See [resolution and displays](/learn/wallpaper-resolution-and-displays).",
        ],
      },
      { type: "h2", text: "On macOS specifically" },
      {
        type: "p",
        text: `macOS has no built-in way to set your own video as a desktop wallpaper, which is why apps like ${macwall.name} exist. Desktop playback works on ${macwallMinimumMacOSVersion} and later; live Lock Screen and Screen Saver motion needs ${macwallLockScreenMacOSVersion} or later, because that is when Apple exposed the APIs third-party apps use. More on that in [how macOS wallpapers work](/learn/how-macos-wallpapers-work).`,
      },
    ],
    faq: [
      {
        question: "Do live wallpapers slow down a computer?",
        answer:
          "A video-based live wallpaper decoded on media hardware costs very little, and a well-built app pauses it whenever nothing is visible. Real-time rendered or browser-based wallpapers are the ones that cost real performance.",
      },
      {
        question: "Can a live wallpaper have sound?",
        answer:
          "It should not. Wallpaper audio would play constantly under everything you do, so live wallpaper apps mute the track or strip it entirely.",
      },
      {
        question: "Is a live wallpaper the same as a screen saver?",
        answer:
          "No. A wallpaper sits behind your windows while you work. A screen saver replaces the screen when you step away. macOS treats them as separate surfaces, though both can use the same video.",
      },
    ],
  }),

  lesson({
    navLabel: "How macOS wallpapers work",
    takeaway:
      "macOS composites the wallpaper as its own layer below icons and windows, and only recent versions let third-party apps supply Lock Screen video.",
    slug: "how-macos-wallpapers-work",
    pathname: "/learn/how-macos-wallpapers-work",
    title: "How macOS Wallpapers Work",
    headline: "How macOS wallpapers actually work",
    description:
      "The wallpaper layer, per-display and per-Space assignment, dynamic desktop pictures, and why Lock Screen video needs a recent macOS version.",
    keywords: [
      "how macos wallpaper works",
      "macos wallpaper layer",
      "macos desktop picture",
      "macos lock screen wallpaper api",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "The macOS desktop is a stack of composited layers. The wallpaper is the bottom one — below desktop icons, below every window, below the Dock and menu bar. The window server draws it once and reuses it, which is why a static picture costs essentially nothing.",
      },
      { type: "h2", text: "The layer stack, bottom to top" },
      {
        type: "ol",
        items: [
          "**Wallpaper layer** — your desktop picture or, with a live wallpaper app, a decoded video surface.",
          "**Desktop icons** — Finder draws these in their own layer above the wallpaper.",
          "**Application windows** — everything you actually work in.",
          "**System UI** — menu bar, Dock, Notification Center, Control Center.",
        ],
      },
      {
        type: "p",
        text: "Because a live wallpaper only replaces the bottom layer, nothing above it is affected: click-through, window management, screenshots of windows, and Mission Control all behave identically.",
      },
      { type: "h2", text: "Per-display and per-Space" },
      {
        type: "ul",
        items: [
          "Each connected display holds its own wallpaper assignment, so different monitors can show different content.",
          "Spaces can each carry a wallpaper too — a legacy of macOS letting you theme individual desktops.",
          "Assignments are remembered per display identity. Unplug a monitor, plug it back in, and its wallpaper returns.",
        ],
      },
      { type: "h2", text: "Dynamic desktop pictures" },
      {
        type: "p",
        text: "Apple's built-in dynamic wallpapers are HEIC files containing several images plus metadata describing which to show for a given sun position or appearance mode. They are still images on a schedule — genuinely useful, but not motion. Video wallpaper is a different mechanism entirely.",
      },
      { type: "h2", text: "The Lock Screen is a separate surface" },
      {
        type: "p",
        text: `The Lock Screen and Screen Saver are rendered by the system before your session is unlocked, so an app cannot simply draw into them. Apple added APIs that let apps register a video as a system wallpaper asset in ${macwallLockScreenMacOSVersion}; below that version no third-party app can put motion on the Lock Screen, regardless of what it claims. Once registered, macOS — not the app — plays the loop, which is why applying one takes a moment while the system indexes the asset.`,
      },
      { type: "h2", text: "What this means when you pick an app" },
      {
        type: "ul",
        items: [
          "Apps that use the real wallpaper layer behave like a native wallpaper. Apps that float a borderless window behind your icons only imitate one — and break with Mission Control, screenshots, and Spaces.",
          "A native app needs no Screen Recording, Accessibility, or Full Disk Access permission to set a wallpaper. Being asked for those is a signal something unusual is happening.",
          `${macwall.name} uses the system wallpaper APIs on both surfaces — see [Live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).`,
        ],
      },
    ],
    faq: [
      {
        question: "Can an app change the Lock Screen wallpaper on older macOS?",
        answer:
          `Not with video. The API for registering a video wallpaper asset arrived in ${macwallLockScreenMacOSVersion}. Desktop live wallpapers work on ${macwallMinimumMacOSVersion} and later.`,
      },
      {
        question: "Why does the wallpaper sometimes need a re-apply after a macOS update?",
        answer:
          "Updates can invalidate cached wallpaper assets. Re-applying rewrites the asset, and logging out forces macOS to reload the whole set.",
      },
      {
        question: "Do live wallpapers appear in screenshots?",
        answer:
          "A full-screen capture includes whatever frame is on screen, exactly like a static wallpaper. Window captures are unaffected.",
      },
    ],
  }),

  lesson({
    navLabel: "Hardware video decode",
    takeaway:
      "Apple's media engine decodes H.264 and HEVC in dedicated silicon, so a 4K wallpaper loop costs almost no CPU.",
    slug: "hardware-video-decode",
    pathname: "/learn/hardware-video-decode",
    title: "Hardware Video Decode Explained",
    headline: "Hardware video decode, and why it matters for wallpapers",
    description:
      "How VideoToolbox and Apple's media engine decode video without the CPU, why that makes 4K live wallpapers cheap, and when software decode kicks in.",
    keywords: [
      "hardware video decode",
      "videotoolbox",
      "apple media engine",
      "hevc hardware decode mac",
      "software vs hardware decoding",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "Decoding video means turning compressed data into displayable frames. It can happen in two places: on the general-purpose CPU, or in a fixed-function block of silicon built for exactly this job. Which one your Mac uses is the single biggest factor in what a live wallpaper costs you.",
      },
      { type: "h2", text: "Hardware decode" },
      {
        type: "p",
        text: "Every modern Mac includes a dedicated media engine. Apple exposes it through the **VideoToolbox** framework. Frames are decoded in that block, handed to the GPU as texture surfaces, and composited — the CPU only supervises. This path is dramatically more power-efficient than doing the same math in general-purpose cores, which is why your Mac can play 4K video for hours on battery.",
      },
      { type: "h2", text: "Software decode" },
      {
        type: "p",
        text: "When a codec is not supported in hardware, the decoder falls back to the CPU. Every frame becomes real arithmetic across multiple cores. CPU use climbs, fans may spin up, and battery life drops. Same video, same picture, very different cost.",
      },
      { type: "h2", text: "What decodes in hardware on Mac" },
      {
        type: "ul",
        items: [
          "**H.264 (AVC)** — hardware decoded everywhere. The safest choice.",
          "**HEVC (H.265)** — hardware decoded on modern Macs; smaller files at equal quality.",
          "**ProRes** — hardware decoded on Apple silicon with a media engine. Editing-grade and very large; overkill for a wallpaper.",
          "**AV1** — hardware decode only on the newest Apple silicon. Falls back to software elsewhere.",
          "**VP9 / WebM** — commonly software decoded on macOS. Avoid for wallpapers.",
        ],
      },
      { type: "h2", text: "Why this decides the wallpaper question" },
      {
        type: "p",
        text: "A wallpaper is the one video that plays all day. On the hardware path a 4K loop typically costs a fraction of a percent of CPU — the wallpaper is not what warms your Mac. On the software path the same loop can hold a meaningful slice of several cores indefinitely. This is also why a browser-tab or Electron-based wallpaper tends to cost far more than a native one: extra layers between the file and the media engine, plus a full rendering stack kept alive to display it.",
      },
      { type: "h2", text: "Beyond decoding: not decoding at all" },
      {
        type: "p",
        text: "The cheapest frame is the one never decoded. A well-behaved wallpaper app stops when nothing is visible — display asleep, screen locked, full-screen app in front, or running on battery. Hardware decode plus aggressive pausing is what makes a live wallpaper genuinely free in practice; the rules are listed in [performance and battery](/docs/performance-and-battery).",
      },
      { type: "h2", text: "Check it on your own Mac" },
      {
        type: "ol",
        items: [
          "Open **Activity Monitor** → **CPU** and watch the wallpaper app while a loop plays.",
          "Switch to **Energy** and read **Energy Impact** over a couple of minutes.",
          "Pause playback and confirm both drop to effectively zero.",
          "Compare against a browser tab playing the same clip — the difference is the point.",
        ],
      },
    ],
    faq: [
      {
        question: "How do I know if my video is hardware decoded?",
        answer:
          "Watch CPU usage in Activity Monitor. Hardware decode of a 4K loop stays near zero; software decode shows sustained, obvious CPU across cores.",
      },
      {
        question: "Is HEVC better than H.264 for a wallpaper?",
        answer:
          "Usually yes — roughly half the file size at similar quality, and hardware decoded on modern Macs. Choose H.264 if you need compatibility with very old machines.",
      },
      {
        question: "Does higher frame rate cost more?",
        answer:
          "Yes, proportionally: 60 fps is twice the decode work of 30 fps. For ambient motion, 24–30 fps looks the same and costs half.",
      },
    ],
  }),

  lesson({
    navLabel: "Video formats and codecs",
    takeaway:
      "Encode wallpapers as H.264 or HEVC in an MP4 container, at display resolution, 24–30 fps, with no audio track.",
    slug: "video-formats-and-codecs",
    pathname: "/learn/video-formats-and-codecs",
    title: "Video Formats & Codecs for Wallpapers",
    headline: "Video formats and codecs, explained for wallpapers",
    description:
      "Containers versus codecs, which combinations macOS decodes in hardware, and the exact export settings that make a great live wallpaper loop.",
    keywords: [
      "video codec wallpaper",
      "mp4 vs mov",
      "h264 vs hevc",
      "best video settings live wallpaper",
      "container vs codec",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "Two things get conflated constantly. The **container** is the file wrapper — `.mp4`, `.mov`, `.mkv`, `.webm`. The **codec** is how the picture inside is compressed — H.264, HEVC, ProRes, AV1, VP9. The extension tells you the container; it does not tell you the codec, and the codec is what determines whether your Mac decodes efficiently.",
      },
      { type: "h2", text: "Containers you will meet" },
      {
        type: "ul",
        items: [
          "**MP4** — the universal choice. Broad support, small overhead, works everywhere.",
          "**MOV** — Apple's container. Functionally similar to MP4 and the default from Final Cut and QuickTime.",
          "**M4V** — an MP4 variant from the Apple ecosystem.",
          "**MKV** — flexible and popular for archiving, but the least predictable for native macOS playback.",
          "**WebM** — a web container, usually carrying VP9 or AV1. Poor fit for macOS wallpapers.",
        ],
      },
      { type: "h2", text: "Codecs, ranked for this job" },
      {
        type: "ol",
        items: [
          "**HEVC (H.265)** — best size-to-quality ratio, hardware decoded on modern Macs. First choice.",
          "**H.264 (AVC)** — slightly larger at equal quality, hardware decoded on everything. Safest choice.",
          "**ProRes** — beautiful and enormous. Fine as a master, wasteful as a wallpaper.",
          "**AV1** — excellent compression, but hardware decode only on the newest Apple silicon.",
          "**VP9** — typically software decoded on macOS. Avoid.",
        ],
      },
      { type: "h2", text: "Export recipe for a wallpaper" },
      {
        type: "ul",
        items: [
          "**Container**: MP4.",
          "**Codec**: HEVC, or H.264 if you want maximum compatibility.",
          "**Resolution**: match your display — 3840×2160 for a 4K panel. Never encode above it.",
          "**Frame rate**: 24–30 fps. Ambient motion gains nothing from 60.",
          "**Bitrate**: 8–15 Mbps at 4K is plenty for the slow footage that makes good wallpaper.",
          "**Colour**: Rec. 709, SDR. HDR wallpapers can look washed out or oddly bright next to standard UI.",
          "**Audio**: remove the track entirely.",
          "**Duration**: 5–30 seconds, looping cleanly.",
        ],
      },
      { type: "h2", text: "Making the loop seamless" },
      {
        type: "ol",
        items: [
          "Pick footage with no strong directional change — drifting fog, rain, gentle particle motion, slow pans.",
          "Trim so the first and last frames are visually close.",
          "Crossfade the final half-second into the opening half-second, or mirror the clip for a ping-pong loop.",
          "Preview it looping for a full minute before you commit. Loop points you barely notice once become obvious after ten repeats.",
        ],
      },
      {
        type: "p",
        text: "Ready to use your own file? [Import your own videos](/docs/import-your-own-videos) walks through the drag-and-drop flow.",
      },
    ],
    faq: [
      {
        question: "Is MP4 or MOV better for a live wallpaper?",
        answer:
          "They perform the same on macOS. What matters is the codec inside. MP4 is the more portable wrapper, so prefer it unless you have a reason not to.",
      },
      {
        question: "Should I use a 4K file on a 1080p display?",
        answer:
          "No. You pay extra decode cost for detail the panel cannot show. Encode at the resolution you will actually display.",
      },
      {
        question: "Can I use a GIF as a live wallpaper?",
        answer:
          "You can, but GIF is a terrible video codec — huge files, 256 colours, no hardware decode. Converting to an MP4 loop looks better and costs less.",
      },
    ],
  }),

  lesson({
    navLabel: "Resolution and displays",
    takeaway:
      "Match wallpaper resolution to the panel's native pixels, and prefer one mirrored loop over separate loops on every display.",
    slug: "wallpaper-resolution-and-displays",
    pathname: "/learn/wallpaper-resolution-and-displays",
    title: "Wallpaper Resolution & Multi-Display Setups",
    headline: "Resolution, Retina scaling, and multiple displays",
    description:
      "How Retina scaling changes the resolution you should target, what ultrawide and vertical panels need, and the real cost of a separate loop per display.",
    keywords: [
      "wallpaper resolution mac",
      "retina wallpaper size",
      "ultrawide wallpaper resolution",
      "multi monitor wallpaper mac",
      "4k wallpaper mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "Wallpaper resolution advice usually skips the part that matters on a Mac: the number in System Settings is a *scaled* resolution, not the panel's real pixel count. Target the physical pixels and everything looks right.",
      },
      { type: "h2", text: "Retina scaling in one paragraph" },
      {
        type: "p",
        text: 'A 14-inch MacBook Pro may report a "looks like 1512×982" desktop while the panel is 3024×1964 physical pixels. macOS renders at the higher resolution and scales down, which is what makes text crisp. Your wallpaper should match the **physical** pixels — 3024×1964 here, not 1512×982.',
      },
      { type: "h2", text: "Targets that cover most Macs" },
      {
        type: "ul",
        items: [
          "**MacBook Air / Pro (Retina)** — 3024×1964 or 3456×2234 depending on the model.",
          "**4K external display** — 3840×2160.",
          "**5K display (Studio Display, iMac 27-inch)** — 5120×2880.",
          "**Ultrawide 34-inch** — 3440×1440.",
          "**Vertical / rotated panel** — swap the axes, e.g. 2160×3840.",
          "**When in doubt** — 3840×2160. It downscales cleanly to almost everything.",
        ],
      },
      { type: "h2", text: "Aspect ratio beats pixel count" },
      {
        type: "p",
        text: "A resolution mismatch is only a scaling operation. An aspect ratio mismatch means cropping: a 16:9 loop on a 21:9 ultrawide loses the top and bottom, or gets stretched. Prefer footage in your display's shape, and keep the subject of the shot away from the edges so a crop stays survivable.",
      },
      { type: "h2", text: "Multiple displays" },
      {
        type: "ul",
        items: [
          "**One loop mirrored** — decoded once and drawn on each display. Cheapest option by a wide margin.",
          "**A different loop per display** — decoded once per unique video. Three 4K loops means three times the decode work.",
          "**Mixed resolutions** — encode for the largest panel and let macOS scale down for the rest. Upscaling looks worse than downscaling.",
          "**Vertical secondary display** — give it a dedicated portrait loop rather than cropping a landscape one.",
        ],
      },
      {
        type: "p",
        text: "On a laptop driving two external panels, mirroring one loop is the difference between a wallpaper you never notice and one you do. Per-display setup lives in [set a live wallpaper](/docs/set-a-live-wallpaper).",
      },
      { type: "h2", text: "Legibility, not just sharpness" },
      {
        type: "ul",
        items: [
          "Keep the top-left quiet — that is where desktop icons and their labels sit.",
          "Avoid bright moving highlights near the menu bar, which is translucent.",
          "Low-contrast footage is the practical choice for a wallpaper you work in front of all day.",
        ],
      },
    ],
    faq: [
      {
        question: "What resolution should a Mac live wallpaper be?",
        answer:
          "Match your display's physical pixels — 3840×2160 for a 4K panel, 3024×1964 for a 14-inch MacBook Pro. Going higher only adds decode cost.",
      },
      {
        question: "Can different displays show different live wallpapers?",
        answer:
          "Yes, each display holds its own assignment. Just remember that every unique loop is decoded separately.",
      },
      {
        question: "Do I need an 8K wallpaper for a 5K display?",
        answer:
          "No. Encode at 5120×2880. An 8K file costs far more to decode and shows no additional detail on that panel.",
      },
    ],
  }),

  lesson({
    navLabel: "Battery and energy basics",
    takeaway:
      "A wallpaper's battery cost is decode work times time on screen — pausing when nothing is visible removes almost all of it.",
    slug: "battery-and-energy-basics",
    pathname: "/learn/battery-and-energy-basics",
    title: "Battery & Energy Basics for Live Wallpapers",
    headline: "What a live wallpaper actually costs your battery",
    description:
      "How macOS accounts for energy, why pause rules matter more than codec choice, and how to measure a wallpaper's real battery impact yourself.",
    keywords: [
      "live wallpaper battery drain",
      "macos energy impact",
      "macbook battery wallpaper",
      "measure app battery usage mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "Battery cost is not a property of an app; it is work multiplied by time. A wallpaper does very little work per frame but runs for the entire session, so the question that decides everything is *how many hours is it actually decoding?*",
      },
      { type: "h2", text: "What draws power on a Mac" },
      {
        type: "ul",
        items: [
          "**Display backlight** — normally the single largest consumer. Brightness beats every software setting.",
          "**CPU** — expensive per unit of work, especially sustained load on performance cores.",
          "**GPU** — cheap for compositing, expensive for real-time rendering.",
          "**Media engine** — extremely efficient for video decode. This is the path a good wallpaper uses.",
          "**Radios and disk** — network and storage activity, unrelated to wallpaper except while downloading one.",
        ],
      },
      { type: "h2", text: "Reading Energy Impact honestly" },
      {
        type: "p",
        text: "macOS reports **Energy Impact** in Activity Monitor — a relative score combining CPU time, wakeups, GPU use, and idle behaviour. It is not watts. Use it to compare apps on your own Mac, not to compare numbers between machines. Averaged over several minutes it is a good signal; a single snapshot is noise.",
      },
      { type: "h2", text: "Why pause rules dominate" },
      {
        type: "p",
        text: "Suppose an efficiently decoded 4K loop costs a small fraction of a percent of CPU. Over eight unplugged hours that is still eight hours of *something*. Now add pause-on-battery: the wallpaper stops the moment you unplug and the cost goes to zero. Pause-in-full-screen removes the hours you spend in a full screen editor or a call. Display sleep removes the rest. Real-world battery impact is decided by these rules, not by shaving a megabit off the bitrate.",
      },
      { type: "h2", text: "Measure it on your own Mac" },
      {
        type: "ol",
        items: [
          "Unplug and note the battery percentage and time.",
          "Work normally for an hour with the wallpaper playing, then note the percentage again.",
          "Repeat the same hour of work with the wallpaper paused.",
          "Compare. If the difference is inside normal variance, the wallpaper is not your battery problem.",
          "For a per-app view, check **Energy Impact** in Activity Monitor's Energy tab over a few minutes.",
        ],
      },
      { type: "h2", text: "If you want the longest runtime" },
      {
        type: "ul",
        items: [
          "Turn on **pause on battery** — the single most effective setting.",
          "Mirror one loop across displays instead of decoding several.",
          "Prefer 24–30 fps loops encoded in a hardware-decoded codec.",
          "Let **Low Power Mode** pause playback along with everything else.",
          "Then lower your screen brightness, which will save more than all of the above combined.",
        ],
      },
      {
        type: "p",
        text: `${macwall.name} ships these rules on by default; each one is documented in [performance and battery](/docs/performance-and-battery).`,
      },
    ],
    faq: [
      {
        question: "How much battery does a live wallpaper use?",
        answer:
          "With hardware decode and pause-on-battery enabled, effectively none, because it stops when you unplug. Left running unplugged, expect roughly the cost of a small video playing in a window.",
      },
      {
        question: "Is Energy Impact measured in watts?",
        answer:
          "No. It is a relative score macOS computes from CPU time, wakeups, and GPU use. Compare apps on the same Mac rather than reading it as a power figure.",
      },
      {
        question: "Does a paused wallpaper still use power?",
        answer:
          "No meaningful amount. A paused wallpaper decodes nothing — the last frame is held as a static desktop picture.",
      },
    ],
  }),
]

export function getLearnPage(slug: string): LearnPage | undefined {
  return learnPages.find((page) => page.slug === slug)
}

export function getAllLearnSlugs(): string[] {
  return learnPages.map((page) => page.slug)
}
