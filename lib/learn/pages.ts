import {
  appleSources,
  sourcesBlocks,
  type PageSource,
} from "@/lib/content/sources"
import type { SeoContentPage } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallImportFormatsLabel,
  macwallImportFormatsOrLabel,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallPermissions,
  macwallPlaybackModes,
  macwallTrial,
} from "@/lib/macwall-site"

/**
 * Evergreen concept explainers, the "what is / how does it work" layer.
 *
 * Deliberately distinct from `/docs` (product tasks) and `/blog` (opinion,
 * comparisons, news) so the three hubs do not compete for the same queries.
 */

export type LearnPage = SeoContentPage & {
  /** Short label for hub cards and breadcrumbs. */
  navLabel: string
  /** One-line answer surfaced on the hub: also the definition an LLM can lift. */
  takeaway: string
  publishedAt: string
  /** Day this page's text last changed. */
  updatedAt: string
  /** Primary sources for platform claims, listed at the end of the page. */
  sources?: readonly PageSource[]
}

const updatedAt = "2026-08-02"

/** Appends the page's Sources list to its sections. */
function lesson(page: LearnPage): LearnPage {
  return {
    ...page,
    sections: [...page.sections, ...sourcesBlocks(page.sources)],
  }
}

/** Day the sources below were read for the pages that cite them. */
const LEARN_SOURCES_ACCESSED = "2026-11-06"

/** Primary pages the learn explainers cite beyond the shared Apple set. */
const learnSources = {
  customizeWallpaper: {
    name: "Customize the wallpaper on your Mac",
    url: "https://support.apple.com/guide/mac-help/choose-your-desktop-picture-mchlp3013/mac",
    publisher: "Apple Support",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  useScreenSaver: {
    name: "Use a screen saver on your Mac",
    url: "https://support.apple.com/guide/mac-help/use-a-screen-saver-mchl4b68853d/mac",
    publisher: "Apple Support",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  lockScreenSettings: {
    name: "Change Lock Screen settings on Mac",
    url: "https://support.apple.com/guide/mac-help/change-lock-screen-settings-on-mac-mh11784/mac",
    publisher: "Apple Support",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  tahoeCompatibility: {
    name: "macOS Tahoe 26 is compatible with these computers",
    url: "https://support.apple.com/en-us/122867",
    publisher: "Apple Support",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  bootCamp: {
    name: "Install Windows 10 on your Mac with Boot Camp Assistant",
    url: "https://support.apple.com/en-us/102622",
    publisher: "Apple Support",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  metal: {
    name: "Metal Overview",
    url: "https://developer.apple.com/metal/",
    publisher: "Apple Developer",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  hevcTemporalLevel: {
    name: "kCMSampleAttachmentKey_HEVCTemporalLevelInfo",
    url: "https://developer.apple.com/documentation/coremedia/kcmsampleattachmentkey_hevctemporallevelinfo",
    publisher: "Apple Developer",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  baseLayerFrameRate: {
    name: "kVTCompressionPropertyKey_BaseLayerFrameRate",
    url: "https://developer.apple.com/documentation/videotoolbox/kvtcompressionpropertykey_baselayerframerate",
    publisher: "Apple Developer",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  wallpaperEngineSteam: {
    name: "Wallpaper Engine on Steam",
    url: "https://store.steampowered.com/app/431960/Wallpaper_Engine/",
    publisher: "Steam",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  wallpaperEngineMacHelp: {
    name: "Wallpaper Engine on Linux or Mac OS",
    url: "https://help.wallpaperengine.io/en/functionality/linuxmacos.html",
    publisher: "Wallpaper Engine",
    accessed: LEARN_SOURCES_ACCESSED,
  },
  wallpaperEngineDocs: {
    name: "Wallpaper Engine Designer Documentation",
    url: "https://docs.wallpaperengine.io/en/",
    publisher: "Wallpaper Engine",
    accessed: LEARN_SOURCES_ACCESSED,
  },
} as const satisfies Record<string, PageSource>

const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app
/** "Full Disk Access, Accessibility or Screen Recording" */
const neverAskedPermissions = `${macwallPermissions.never.slice(0, -1).join(", ")} or ${macwallPermissions.never[macwallPermissions.never.length - 1]}`

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
        text: "A **live wallpaper** is a short video loop drawn where your desktop picture normally sits, behind every icon, window, and menu. Nothing about how you use the Mac changes: you click through it, windows cover it, Mission Control and Stage Manager treat it like any wallpaper. The only difference is that the image moves.",
      },
      { type: "h2", text: "The terms people mix up" },
      {
        type: "ul",
        items: [
          "**Live wallpaper**: a video loop playing continuously at the wallpaper layer. Motion is the point.",
          "**Dynamic wallpaper**: a still image that swaps variants based on time of day or appearance mode. macOS ships several. No motion, just scheduled stills.",
          "**Animated wallpaper**: usually a synonym for live wallpaper, sometimes used for procedural or shader-drawn scenes rendered in real time instead of decoded from video.",
          "**Interactive wallpaper**: reacts to the cursor, audio, or system state. Rare on macOS and much more expensive to run, because the frames cannot be pre-encoded.",
          "**Screen saver**: takes over the whole screen when you are away. It is a different macOS surface from the wallpaper, even when it shows the same footage.",
        ],
      },
      { type: "h2", text: "Why video, not real-time rendering" },
      {
        type: "p",
        text: "A pre-encoded video is by far the cheapest way to put motion on a desktop. Every Mac has dedicated media decoding hardware, so a 4K loop can play without the CPU touching a single pixel. A procedurally rendered scene has to be computed frame by frame, every frame, forever, which is why shader-style wallpapers tend to warm up a laptop and video-based ones do not. That difference is explained in [hardware video decode](/learn/hardware-video-decode).",
      },
      { type: "h2", text: "What makes a loop feel good" },
      {
        type: "ul",
        items: [
          "**Seamless**: the last frame flows into the first. You are going to see this transition hundreds of times a day.",
          "**Slow**: drifting clouds, rain, slow pans. Fast motion in peripheral vision reads as a notification and pulls your eye.",
          "**Low contrast where your icons live**: busy bright areas behind desktop icons make labels hard to read.",
          "**Resolution-matched**: sized to your display, not above it. See [resolution and displays](/learn/wallpaper-resolution-and-displays).",
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
        text: "The macOS desktop is a stack of composited layers. The wallpaper is the bottom one, below desktop icons, below every window, below the Dock and menu bar. The window server draws it once and reuses it, which is why a static picture costs essentially nothing.",
      },
      { type: "h2", text: "The layer stack, bottom to top" },
      {
        type: "ol",
        items: [
          "**Wallpaper layer**: your desktop picture or, with a live wallpaper app, a decoded video surface.",
          "**Desktop icons**: Finder draws these in their own layer above the wallpaper.",
          "**Application windows**: everything you actually work in.",
          "**System UI**: menu bar, Dock, Notification Center, Control Center.",
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
          "Spaces can each carry a wallpaper too, a legacy of macOS letting you theme individual desktops.",
          "Assignments are remembered per display identity. Unplug a monitor, plug it back in, and its wallpaper returns.",
        ],
      },
      { type: "h2", text: "Dynamic desktop pictures" },
      {
        type: "p",
        text: "Apple's built-in dynamic wallpapers are HEIC files containing several images plus metadata describing which to show for a given sun position or appearance mode. They are still images on a schedule, genuinely useful, but not motion. Video wallpaper is a different mechanism entirely.",
      },
      { type: "h2", text: "The Lock Screen is a separate surface" },
      {
        type: "p",
        text: `The Lock Screen and Screen Saver are rendered by the system before your session is unlocked, so an app cannot simply draw into them. Apple added APIs that let apps register a video as a system wallpaper asset in ${macwallLockScreenMacOSVersion}; below that version no third-party app can put motion on the Lock Screen, regardless of what it claims. Once registered, macOS plays the loop rather than the app, which is why applying one takes a moment while the system indexes the asset.`,
      },
      { type: "h2", text: "What this means when you pick an app" },
      {
        type: "ul",
        items: [
          "Apps that use the real wallpaper layer behave like a native wallpaper. Apps that float a borderless window behind your icons only imitate one, and break with Mission Control, screenshots, and Spaces.",
          "A native app needs no Screen Recording, Accessibility, or Full Disk Access permission to set a wallpaper. Being asked for those is a signal something unusual is happening.",
          `${macwall.name} uses the system wallpaper APIs on both surfaces. See [Live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).`,
        ],
      },
    ],
    faq: [
      {
        question: "Can an app change the Lock Screen wallpaper on older macOS?",
        answer: `Not with video. The API for registering a video wallpaper asset arrived in ${macwallLockScreenMacOSVersion}. Desktop live wallpapers work on ${macwallMinimumMacOSVersion} and later.`,
      },
      {
        question:
          "Why does the wallpaper sometimes need a re-apply after a macOS update?",
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
      "Apple's media engine can decode supported H.264 and HEVC video in dedicated hardware, reducing the CPU work required for a 4K wallpaper loop.",
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
        text: "Every modern Mac includes a dedicated media engine. Apple exposes it through the **VideoToolbox** framework. Frames are decoded in that block, handed to the GPU as texture surfaces, and composited. The CPU only supervises. This path is dramatically more power-efficient than doing the same math in general-purpose cores, which is why your Mac can play 4K video for hours on battery.",
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
          "**H.264 (AVC)**: hardware decoded everywhere. The safest choice.",
          "**HEVC (H.265)**: hardware decoded on modern Macs; smaller files at equal quality.",
          "**ProRes**: hardware decoded on Apple silicon with a media engine. Editing-grade and very large; overkill for a wallpaper.",
          "**AV1**: hardware decode only on the newest Apple silicon. Falls back to software elsewhere.",
          "**VP9 / WebM**: commonly software decoded on macOS. Avoid for wallpapers.",
        ],
      },
      { type: "h2", text: "Why this decides the wallpaper question" },
      {
        type: "p",
        text: "A wallpaper is the one video that plays all day. On the hardware path a 4K loop typically costs a fraction of a percent of CPU, the wallpaper is not what warms your Mac. On the software path the same loop can hold a meaningful slice of several cores indefinitely. This is also why a browser-tab or Electron-based wallpaper tends to cost far more than a native one: extra layers between the file and the media engine, plus a full rendering stack kept alive to display it.",
      },
      { type: "h2", text: "Beyond decoding: not decoding at all" },
      {
        type: "p",
        text: "The cheapest frame is the one never decoded. A well-behaved wallpaper app stops when nothing is visible: display asleep, screen locked, full-screen app in front, or the battery running low. Hardware decode plus aggressive pausing is what makes a live wallpaper genuinely free in practice; the rules are listed in [performance and battery](/docs/performance-and-battery).",
      },
      { type: "h2", text: "Check it on your own Mac" },
      {
        type: "ol",
        items: [
          "Open **Activity Monitor** → **CPU** and watch the wallpaper app while a loop plays.",
          "Switch to **Energy** and read **Energy Impact** over a couple of minutes.",
          "Pause playback and confirm both drop to effectively zero.",
          "Compare against a browser tab playing the same clip, the difference is the point.",
        ],
      },
    ],
    faq: [
      {
        question: "How do I know if my video is hardware decoded?",
        answer:
          "Watch CPU and Energy Impact in Activity Monitor while the loop plays, then compare supported H.264 or HEVC media with an unsupported source. Hardware decoding should reduce sustained CPU work, but the exact reading depends on the Mac, video, displays, and settings.",
      },
      {
        question: "Is HEVC better than H.264 for a wallpaper?",
        answer:
          "Usually yes, roughly half the file size at similar quality, and hardware decoded on modern Macs. Choose H.264 if you need compatibility with very old machines.",
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
        text: "Two things get conflated constantly. The **container** is the file wrapper: `.mp4`, `.mov`, `.mkv`, `.webm`. The **codec** is how the picture inside is compressed: H.264, HEVC, ProRes, AV1, VP9. The extension tells you the container; it does not tell you the codec, and the codec is what determines whether your Mac decodes efficiently.",
      },
      { type: "h2", text: "Containers you will meet" },
      {
        type: "ul",
        items: [
          "**MP4**: the universal choice. Broad support, small overhead, works everywhere.",
          "**MOV**: Apple's container. Functionally similar to MP4 and the default from Final Cut and QuickTime.",
          "**M4V**: an MP4 variant from the Apple ecosystem.",
          "**MKV**: flexible and popular for archiving, but the least predictable for native macOS playback.",
          "**WebM**: a web container, usually carrying VP9 or AV1. Poor fit for macOS wallpapers.",
        ],
      },
      { type: "h2", text: "Codecs, ranked for this job" },
      {
        type: "ol",
        items: [
          "**HEVC (H.265)**: best size-to-quality ratio, hardware decoded on modern Macs. First choice.",
          "**H.264 (AVC)**: slightly larger at equal quality, hardware decoded on everything. Safest choice.",
          "**ProRes**: beautiful and enormous. Fine as a master, wasteful as a wallpaper.",
          "**AV1**: excellent compression, but hardware decode only on the newest Apple silicon.",
          "**VP9**: typically software decoded on macOS. Avoid.",
        ],
      },
      { type: "h2", text: "Export recipe for a wallpaper" },
      {
        type: "ul",
        items: [
          "**Container**: MP4.",
          "**Codec**: HEVC, or H.264 if you want maximum compatibility.",
          "**Resolution**: match your display, 3840×2160 for a 4K panel. Never encode above it.",
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
          "Pick footage with no strong directional change: drifting fog, rain, gentle particle motion, slow pans.",
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
          "You can, but GIF is a terrible video codec, huge files, 256 colours, no hardware decode. Converting to an MP4 loop looks better and costs less.",
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
        text: "Wallpaper resolution advice usually skips the part that matters on a Mac: the number in System Settings is a *scaled* resolution, not the panel's real pixel count. Target the physical pixels and everything looks right. For the exact pixel dimensions of every MacBook, iMac, and Apple display, see [MacBook wallpaper size](/blog/macbook-wallpaper-size).",
      },
      { type: "h2", text: "Retina scaling in one paragraph" },
      {
        type: "p",
        text: 'A 14-inch MacBook Pro may report a "looks like 1512×982" desktop while the panel is 3024×1964 physical pixels. macOS renders at the higher resolution and scales down, which is what makes text crisp. Your wallpaper should match the **physical** pixels, 3024×1964 here, not 1512×982.',
      },
      { type: "h2", text: "Targets that cover most Macs" },
      {
        type: "ul",
        items: [
          "**MacBook Air / Pro (Retina)**: 3024×1964 or 3456×2234 depending on the model.",
          "**4K external display**: 3840×2160.",
          "**5K display (Studio Display, iMac 27-inch)**: 5120×2880.",
          "**Ultrawide 34-inch**: 3440×1440.",
          "**Vertical / rotated panel**: swap the axes, e.g. 2160×3840.",
          "**When in doubt**: 3840×2160. It downscales cleanly to almost everything.",
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
          "**One loop mirrored**: decoded once and drawn on each display. Cheapest option by a wide margin.",
          "**A different loop per display**: decoded once per unique video. Three 4K loops means three times the decode work.",
          "**Mixed resolutions**: encode for the largest panel and let macOS scale down for the rest. Upscaling looks worse than downscaling.",
          "**Vertical secondary display**: give it a dedicated portrait loop rather than cropping a landscape one.",
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
          "Keep the top-left quiet, because that is where desktop icons and their labels sit.",
          "Avoid bright moving highlights near the menu bar, which is translucent.",
          "Low-contrast footage is the practical choice for a wallpaper you work in front of all day.",
        ],
      },
    ],
    faq: [
      {
        question: "What resolution should a Mac live wallpaper be?",
        answer:
          "Match your display's physical pixels, 3840×2160 for a 4K panel, 3024×1964 for a 14-inch MacBook Pro. Going higher only adds decode cost.",
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
      "A wallpaper's battery cost is decode work times time on screen, so pausing when nothing is visible removes almost all of it.",
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
          "**Display backlight**: normally the single largest consumer. Brightness beats every software setting.",
          "**CPU**: expensive per unit of work, especially sustained load on performance cores.",
          "**GPU**: cheap for compositing, expensive for real-time rendering.",
          "**Media engine**: extremely efficient for video decode. This is the path a good wallpaper uses.",
          "**Radios and disk**: network and storage activity, unrelated to wallpaper except while downloading one.",
        ],
      },
      { type: "h2", text: "Reading Energy Impact honestly" },
      {
        type: "p",
        text: "macOS reports **Energy Impact** in Activity Monitor, a relative score combining CPU time, wakeups, GPU use, and idle behaviour. It is not watts. Use it to compare apps on your own Mac, not to compare numbers between machines. Averaged over several minutes it is a good signal; a single snapshot is noise.",
      },
      { type: "h2", text: "Why pause rules dominate" },
      {
        type: "p",
        text: "Suppose an efficiently decoded 4K loop costs a small fraction of a percent of CPU. Over eight unplugged hours that is still eight hours of *something*. Now add a pause rule for running on battery: the wallpaper holds its frame whenever the Mac is unplugged and the cost goes to zero. Pause-in-full-screen removes the hours you spend in a full screen editor or a call. Display sleep removes the rest. Real-world battery impact is decided by these rules, not by shaving a megabit off the bitrate.",
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
          `Turn on **${macwallBatteryPolicy.pauseOnBattery.label}** (it ${macwallBatteryPolicy.pauseOnBattery.detail}), or **${macwallBatteryPolicy.lowerQualityOnBattery.label}** if you want motion unplugged.`,
          "Mirror one loop across displays instead of decoding several.",
          "Prefer 24–30 fps loops encoded in a hardware-decoded codec.",
          "Then lower your screen brightness, which will save more than all of the above combined.",
        ],
      },
      {
        type: "p",
        text: `${macwall.name} turns on ${macwallBatteryPolicy.pauseBehindFullScreen.label} by default; the battery rules are opt-in under ${macwallBatteryPolicy.settingsPath}. Each one is documented in [performance and battery](/docs/performance-and-battery).`,
      },
    ],
    faq: [
      {
        question: "How much battery does a live wallpaper use?",
        answer: `With hardware decode it is roughly the cost of a small video playing in a window, less with ${macwallBatteryPolicy.lowerQualityOnBattery.label} turned on, and none while ${macwallBatteryPolicy.pauseOnBattery.label} holds the frame on battery. We have not published a measured battery test yet.`,
      },
      {
        question: "Is Energy Impact measured in watts?",
        answer:
          "No. It is a relative score macOS computes from CPU time, wakeups, and GPU use. Compare apps on the same Mac rather than reading it as a power figure.",
      },
      {
        question: "Does a paused wallpaper still use power?",
        answer:
          "No meaningful amount. A paused wallpaper decodes nothing, the last frame is held as a static desktop picture.",
      },
    ],
  }),

  lesson({
    navLabel: "Live vs dynamic vs aerial",
    takeaway:
      "Dynamic wallpapers are stills that change with the time of day, aerials are Apple videos that move as you lock or unlock, and live wallpapers are video loops that play on the desktop all day.",
    slug: "live-vs-dynamic-vs-aerial-wallpapers-mac",
    pathname: "/learn/live-vs-dynamic-vs-aerial-wallpapers-mac",
    title: "Live vs Dynamic vs Aerial Wallpapers on Mac",
    headline: "Live, dynamic and aerial wallpapers on Mac, explained",
    description:
      "How macOS Dynamic Wallpapers, Apple's aerials and video live wallpapers work: what each file is, who plays it, when it moves and what it costs in CPU.",
    keywords: [
      "live vs dynamic wallpaper mac",
      "aerial wallpaper mac",
      "dynamic wallpaper heic",
      "what is an aerial wallpaper",
      "mac wallpaper types",
      "do aerial wallpapers use battery",
    ],
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06",
    sections: [
      {
        type: "p",
        text: "macOS offers three kinds of changing wallpaper. A **Dynamic Wallpaper** is a HEIC image whose stills brighten and darken with the time of day. An **aerial** is Apple's own video that animates as you lock or unlock, then rests as a still. A **live wallpaper** is a video loop that keeps playing behind your windows while you work.",
      },
      {
        type: "table",
        columns: [
          "",
          "What the file is",
          "When it moves",
          "Who plays it",
          "Work while you use the Mac",
        ],
        rows: [
          [
            "**Dynamic Wallpaper**",
            "One HEIC image holding several stills and timing metadata",
            "It doesn't; it brightens and darkens through the day",
            "macOS",
            "None between picture changes",
          ],
          [
            "**Aerial**",
            "A 4K HEVC video that macOS downloads from Apple",
            "As you lock or unlock, and as the screen saver",
            "macOS, with Apple's aerial player",
            "None on the unlocked desktop",
          ],
          [
            "**Live wallpaper**",
            "A video loop, usually H.264 or HEVC in an MP4 or MOV file",
            "Continuously, behind your windows",
            "A wallpaper app",
            "Hardware decoding while the desktop is visible",
          ],
        ],
        caption:
          "Apple's descriptions are from its Mac User Guide for macOS 26 and 27. File details were checked on macOS 27.2.",
      },
      {
        type: "h2",
        text: "Dynamic Wallpapers: one image file, several stills",
      },
      {
        type: "p",
        text: "A Dynamic Wallpaper is a single HEIC image file that holds several versions of the same scene, plus metadata telling macOS which one to show. Apple describes them as images that brighten and darken based on the time of day for your current location. Some instead carry a light and a dark version that follow your Light or Dark appearance. When you pick one, the menu next to its name offers:",
      },
      {
        type: "ul",
        items: [
          "**Dynamic**: gradually brightens and darkens with the time of day where you are.",
          "**Automatic**: switches from light to dark at sunset when Appearance is set to Auto.",
          "**Light (Still)** and **Dark (Still)**: one fixed version of the picture.",
        ],
      },
      {
        type: "p",
        text: "There is no video in a Dynamic Wallpaper. macOS changes the picture as the hours pass and draws a still in between, so it costs what any desktop picture costs. Some download from Apple the first time you choose them. The history and setup steps are in [dynamic vs live wallpaper on Mac](/blog/dynamic-wallpaper-vs-live-wallpaper-mac); apps that build your own HEIC files are compared on [Dynamic Wallpaper Club](/alternatives/dynamic-wallpaper-club) and [24 Hour Wallpaper](/alternatives/24-hour-wallpaper).",
      },
      {
        type: "h2",
        text: "Aerials: Apple's video, played as you lock and unlock",
      },
      {
        type: "p",
        text: "Aerials are Apple's slow-motion films, grouped as Landscape, Cityscape, Underwater and Earth. Apple's guide for macOS 26 and 27 says they animate as you lock or unlock your Mac, and that by default the aerial you pick is also your screen saver, played in slow motion. **Shuffle Aerials** is different: stills that change at an interval you set.",
      },
      {
        type: "p",
        text: "Each aerial is a 4K HEVC video that macOS downloads from Apple when you first choose it, and Apple's own player decodes it. You can't add a video of your own in System Settings: custom wallpaper there means photos, image files, folders and albums.",
      },
      {
        type: "p",
        text: "The video decodes only while it moves: on the Lock Screen, during the lock and unlock transitions, and while the screen saver runs. Once you are working, the desktop shows a still, so an aerial adds no decode work while you use the Mac.",
      },
      { type: "h2", text: "Live wallpapers: a video loop behind your windows" },
      {
        type: "p",
        text: "A live wallpaper is a video loop, usually H.264 or HEVC in an MP4 or MOV file, that keeps playing at the desktop's wallpaper layer while you work. macOS has no setting for it, so it takes an app. Playback goes through Apple's Video Toolbox, which decodes supported H.264 and HEVC video in dedicated hardware; [hardware video decode](/learn/hardware-video-decode) explains why that matters.",
      },
      {
        type: "p",
        text: `This is the only one of the three that does decode work all day, for as long as the desktop is visible. How much depends on resolution, frame rate, how many displays play their own loop and what the app pauses for. ${macwall.name}, for example, pauses behind full-screen apps by default and stops while your displays sleep. On ${macwallLockScreenMacOSVersion} or later an app can also hand its video to macOS so it plays on the Lock Screen, the subject of [how Lock Screen video works on macOS Tahoe](/learn/how-macos-tahoe-lock-screen-video-works).`,
      },
      { type: "h2", text: "What each one costs in CPU" },
      {
        type: "ul",
        items: [
          "**Dynamic Wallpaper**: nothing between picture changes, because there is no video to decode.",
          "**Aerial**: decode work while it plays on the Lock Screen and as the screen saver; none on the unlocked desktop.",
          "**Live wallpaper**: continuous hardware decoding while the desktop is visible, and none while the app has it paused, because a paused wallpaper decodes no frames.",
          "**Real-time rendered wallpaper** (shader scenes, game-engine scenes, web pages): the most expensive kind, because every frame is computed instead of decoded. It is the model behind Wallpaper Engine's scene wallpapers on Windows; see [why Wallpaper Engine doesn't run on Mac](/learn/why-wallpaper-engine-doesnt-run-on-mac).",
        ],
      },
      {
        type: "p",
        text: "These are relative costs, not measurements. For figures from your own Mac, open Activity Monitor's Energy tab and compare a few minutes with the wallpaper playing and paused. [Battery and energy basics](/learn/battery-and-energy-basics) walks through the test, and [live wallpaper CPU usage on Mac](/blog/live-wallpaper-cpu-usage-mac) covers what drives the CPU number.",
      },
      { type: "h2", text: "Which one fits" },
      {
        type: "ul",
        items: [
          "**A desktop that follows the day without motion**: a Dynamic Wallpaper.",
          "**Motion only when you lock or step away**: an aerial, or an aerial screen saver over any wallpaper.",
          "**Motion while you work, your own clips, or a different loop per display**: a live wallpaper app. Screen saver options are covered in [how to change the screen saver on Mac](/blog/how-to-change-screen-saver-mac).",
        ],
      },
    ],
    faq: [
      {
        question: "Is a dynamic wallpaper the same as a live wallpaper?",
        answer:
          "No. A Dynamic Wallpaper is a set of stills in one HEIC file that macOS changes with the time of day or your Light or Dark appearance. A live wallpaper is a video loop that plays continuously behind your windows, and it needs an app.",
      },
      {
        question: "Do aerial wallpapers move on the desktop?",
        answer:
          "Not while you work. Apple says aerials animate as you lock or unlock your Mac and can play in slow motion as your screen saver. Once you are on the desktop, the aerial rests as a still.",
      },
      {
        question: "Can I set my own video as a Mac wallpaper without an app?",
        answer:
          "No. System Settings accepts photos, image files, folders and albums as custom wallpaper, not video files. Playing your own video as a wallpaper takes a live wallpaper app.",
      },
      {
        question: "Which type of wallpaper uses the least battery?",
        answer:
          "A Dynamic Wallpaper, because nothing is decoded between picture changes. An aerial decodes only while it plays on the Lock Screen or as the screen saver. A live wallpaper decodes for as long as it plays on the desktop, which is why a good app pauses it whenever it can't be seen.",
      },
    ],
    sources: [
      learnSources.customizeWallpaper,
      appleSources.wallpaperSettings,
      learnSources.useScreenSaver,
      appleSources.videoToolbox,
      appleSources.activityMonitorEnergy,
    ],
  }),

  lesson({
    navLabel: "Why Wallpaper Engine isn't on Mac",
    takeaway:
      "Wallpaper Engine is Windows software with its own DirectX 11 renderer, and its developer says there are no immediate plans for a Mac version.",
    slug: "why-wallpaper-engine-doesnt-run-on-mac",
    pathname: "/learn/why-wallpaper-engine-doesnt-run-on-mac",
    title: "Why Wallpaper Engine Doesn't Run on Mac",
    headline: "Why Wallpaper Engine doesn't run on a Mac",
    description:
      "Wallpaper Engine is Windows-only, per its Steam page and official help. Why a Mac port isn't simple, which wallpaper types can move over, and the Mac options.",
    keywords: [
      "does wallpaper engine work on mac",
      "wallpaper engine mac",
      "why is wallpaper engine not on mac",
      "wallpaper engine macos",
      "wallpaper engine scenes on mac",
      "wallpaper engine alternative mac",
    ],
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06",
    sections: [
      {
        type: "p",
        text: "**Wallpaper Engine doesn't run on a Mac because it is Windows software.** Its Steam page lists only Windows 10 and Windows 11 and requires DirectX 11, and its official help page says the app is available for Windows and Android with no immediate plans for other platforms. On a Mac you need a native wallpaper app or macOS's own options.",
      },
      { type: "h2", text: "What the developer says" },
      {
        type: "p",
        text: "Wallpaper Engine's help article on Linux and macOS explains that the core of the app is custom-written software that works closely with the operating system, so each platform needs its own tailored version rather than a quick port. The developer says that work isn't economically viable for macOS or Linux at the moment, points to Steam's hardware survey, where Windows dominates, and says it watches those numbers in case that changes. It built a free Android companion app first because far more of its users have Android devices.",
      },
      {
        type: "p",
        text: "The Steam store page agrees: it describes the app as live wallpapers for the Windows desktop, its system requirements name only Windows 10, Windows 11 and DirectX 11, and it lists no macOS build.",
      },
      { type: "h2", text: "Why a Mac version isn't a simple port" },
      {
        type: "ul",
        items: [
          "**Graphics**: scene wallpapers are drawn in real time by Wallpaper Engine's own renderer, which needs DirectX 11, Microsoft's graphics API for Windows. Macs draw 3D graphics through Apple's Metal, so that renderer would have to be rebuilt, not just recompiled.",
          "**The wallpaper layer**: Windows and macOS assemble the desktop in different ways. A Mac app has to work with macOS's own wallpaper layer and, for the Lock Screen, with the system wallpaper on macOS 26 and later. See [how macOS wallpapers work](/learn/how-macos-wallpapers-work).",
          "**Application wallpapers**: some wallpapers are Windows programs running in place of the desktop picture. Windows programs don't run on macOS, so these can't come across at all.",
          "**Browsing and editing**: the developer notes that a desktop port would need the full Workshop browsing and editing experience, which its Android companion app doesn't have to carry.",
        ],
      },
      {
        type: "h2",
        text: "Wallpaper Engine's wallpaper types, and which can move to a Mac",
      },
      {
        type: "table",
        columns: ["Type", "What it is", "On a Mac"],
        rows: [
          [
            "**Scene**",
            "A project made in the Wallpaper Engine Editor and drawn in real time",
            "No. Only Wallpaper Engine can render a scene",
          ],
          [
            "**Video**",
            "A pre-rendered video file; Workshop uploads are MP4",
            "Its video file can play in a Mac video wallpaper app, if you have the right to use it",
          ],
          [
            "**Web**",
            "A page built with HTML, CSS and JavaScript",
            "Not as a Wallpaper Engine item. A web-page wallpaper app such as [Plash](/alternatives/plash) shows a website instead",
          ],
          [
            "**Application**",
            "A Windows program running as the wallpaper",
            "No. Windows programs don't run on macOS",
          ],
        ],
        caption:
          "Types from Wallpaper Engine's designer documentation and Steam page.",
      },
      {
        type: "p",
        text: `Wallpaper Engine plays local videos in MP4, WebM, AVI, M4V, MOV or WMV, per its Steam page. A Mac wallpaper app may take fewer: ${macwall.name} adds ${macwallImportFormatsLabel} files, so convert other formats to an H.264 or HEVC MP4 first. [Video formats and codecs](/learn/video-formats-and-codecs) has the export settings.`,
      },
      { type: "h2", text: "What works on a Mac instead" },
      {
        type: "ul",
        items: [
          "**macOS's own motion**: aerials that animate as you lock or unlock, Dynamic Wallpapers that follow the time of day, and slow-motion screen savers, all free in System Settings → Wallpaper. [Live vs dynamic vs aerial wallpapers](/learn/live-vs-dynamic-vs-aerial-wallpapers-mac) explains the difference.",
          `**A native video wallpaper app**: the closest match for Wallpaper Engine's video wallpapers. It plays loops at macOS's wallpaper layer and, on ${macwallLockScreenMacOSVersion} or later, can put them on the Lock Screen. ${macwall.name} is one, with ${macwallCatalog.liveCountLabel} curated loops, most in 4K. The [Wallpaper Engine for Mac comparison](/alternatives/wallpaper-engine) and [live wallpaper apps for Mac, compared](/best-live-wallpaper-mac) cover the others.`,
          "**A web-page wallpaper**: for Wallpaper Engine's web wallpapers, an app that shows a website on the desktop, such as [Plash](/alternatives/plash).",
          "**Windows on the Mac**: Boot Camp installs Windows alongside macOS on Intel-based Macs, and virtual machine apps run Windows in a window. Either way Wallpaper Engine animates the Windows desktop, not the macOS desktop behind your Mac apps.",
        ],
      },
      { type: "h2", text: "Bringing wallpapers you already have" },
      {
        type: "ol",
        items: [
          "Find the video files you made yourself, or that a creator has allowed you to use. Workshop wallpapers belong to the people who made them.",
          "Scene, web and application wallpapers don't convert by copying or renaming files. If a scene is your own work, recording it on Windows as a seamless video loop is the nearest you can get, without the interactivity.",
          `Convert anything that isn't ${macwallImportFormatsOrLabel} to an H.264 or HEVC MP4 at your display's resolution.`,
          `Import it into a Mac wallpaper app. In ${macwall.name} that needs Pro; [import your own videos](/docs/import-your-own-videos) walks through it.`,
        ],
      },
    ],
    faq: [
      {
        question: "Is there a Mac version of Wallpaper Engine?",
        answer:
          "No. Wallpaper Engine's Steam page lists Windows 10 and Windows 11 only, and its official help says it is available for Windows and Android with no immediate plans for macOS or Linux.",
      },
      {
        question: "Will Wallpaper Engine come to Mac?",
        answer:
          "Its developer says a port isn't economically viable at the moment, because the app is custom software tailored closely to Windows, but that it keeps an eye on Steam's platform statistics in case that changes.",
      },
      {
        question:
          "Can I run Wallpaper Engine in a Windows virtual machine on my Mac?",
        answer:
          "Even where Windows runs on a Mac, in a virtual machine or with Boot Camp on an Intel Mac, Wallpaper Engine animates the Windows desktop. It never reaches the macOS desktop behind your Mac apps.",
      },
      {
        question: "Can I use my Wallpaper Engine wallpapers on a Mac?",
        answer:
          "Only the video ones, and only if you made them or have the creator's permission. Scene, web and application wallpapers need Wallpaper Engine itself to run.",
      },
      {
        question: "Why can't a Mac app open Wallpaper Engine scenes?",
        answer:
          "Scenes are projects for Wallpaper Engine's own real-time renderer, which runs on Windows with DirectX 11. A Mac app would have to rebuild that renderer for Apple's Metal, so native Mac apps play video loops instead.",
      },
    ],
    sources: [
      learnSources.wallpaperEngineSteam,
      learnSources.wallpaperEngineMacHelp,
      learnSources.wallpaperEngineDocs,
      learnSources.bootCamp,
      learnSources.metal,
    ],
  }),

  lesson({
    navLabel: "Lock Screen video on Tahoe",
    takeaway:
      "On macOS 26 Tahoe and later the Lock Screen shows the system wallpaper and macOS plays it itself, so a video handed to the system keeps moving there after the app that set it quits.",
    slug: "how-macos-tahoe-lock-screen-video-works",
    pathname: "/learn/how-macos-tahoe-lock-screen-video-works",
    title: "How macOS Tahoe Lock Screen Video Works",
    headline: "How Lock Screen video works on macOS Tahoe",
    description:
      "Why the macOS 26 Lock Screen can play video, the two ways apps hand a video to it, what you need, and how to fix a Lock Screen that goes black after you unlock.",
    keywords: [
      "macos tahoe lock screen video",
      "macos 26 lock screen wallpaper",
      "live lock screen mac",
      "mac lock screen black after unlock",
      "lock screen video mac",
      "macos 27 lock screen video",
    ],
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06",
    sections: [
      {
        type: "p",
        text: `On macOS 26 Tahoe and later, the Lock Screen shows the system wallpaper, and macOS plays it rather than the app that installed it. An app gets video there in one of two ways: as a wallpaper extension macOS runs, or as a custom aerial that Apple's own player plays. ${macwall.name}'s Lock Screen video needs ${macwallLockScreenMacOSVersion} or later.`,
      },
      { type: "h2", text: "What the Lock Screen shows" },
      {
        type: "p",
        text: "The Lock Screen is drawn by macOS before you unlock, so no app window can appear on it. It shows the wallpaper chosen in System Settings → Wallpaper. Apple's guide for macOS 26 and 27 says its aerial wallpapers animate as you lock or unlock your Mac, and that by default the aerial you pick also becomes your screen saver. The screen saver is its own choice under Wallpaper → Screen Saver, and the large clock can sit on the Lock Screen alone or on both.",
      },
      {
        type: "p",
        text: "That is why a desktop video on its own never reaches the Lock Screen. A window behind your icons works while you are signed in, but the Lock Screen only plays what macOS holds as the system wallpaper, so the video has to be handed to the system.",
      },
      { type: "h2", text: "Two ways an app hands macOS a video" },
      {
        type: "ol",
        items: [
          `**A wallpaper extension.** macOS loads the app's extension and gives it the desktop, Lock Screen and screen saver to draw on. One video plays on all three with the same frame, sound included, and keeps playing after the app quits or the Mac restarts. This is ${macwall.name}'s **${systemPlayback.setting}** mode.`,
          `**A custom aerial.** The app converts the video into the format Apple's aerials use, 10-bit HEVC with no audio, and adds it to the system's list of aerials, so Apple's own player shows it on the Lock Screen and as the screen saver. The app can still play something else on the desktop in its own window. This is ${macwall.name}'s **${appPlayback.setting}** mode.`,
        ],
      },
      {
        type: "p",
        text: `You choose between them in ${macwall.name}'s **${macwallPlaybackModes.settingsPath}**; new installs on macOS 26 and later start on ${systemPlayback.setting}. [Live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver) has the steps for each mode, and [how to change the Lock Screen on Mac](/blog/how-to-change-lock-screen-on-mac) is the full walkthrough.`,
      },
      { type: "h2", text: "What you need" },
      {
        type: "ul",
        items: [
          `**${macwallLockScreenMacOSVersion} or later.** Check under Apple menu → About This Mac. Apple's compatibility list for macOS Tahoe 26 still includes some Intel Macs; macOS 27 needs Apple silicon.`,
          `**On ${macwallMinimumMacOSVersion}**, ${macwall.name} plays the desktop only, and the Lock Screen shows a still from your wallpaper.`,
          `**${macwall.name} Pro or the ${macwallTrial.name}**, which includes the Lock Screen.`,
          `**No extra permission.** Putting a video on the desktop or Lock Screen needs no ${neverAskedPermissions} permission.`,
          `**A moment the first time, with ${appPlayback.setting} only.** Converting a 4K video takes several seconds, and the wallpaper's page shows "Preparing the Lock Screen…" with a percentage. Setting the same wallpaper again uses the saved conversion.`,
        ],
      },
      { type: "h2", text: "Why the Lock Screen goes black after you unlock" },
      {
        type: "p",
        text: "Apple's aerial player speeds the video up and slows it down as your Mac locks and unlocks. To do that it reads each frame's HEVC temporal level, a label Apple's Core Media framework attaches to say where a frame sits in the video's hierarchy of frame dependencies. A movie whose frames lack those labels plays on the first lock, fails at unlock, and the next lock is black.",
      },
      {
        type: "p",
        text: `In ${macwall.name}'s testing, the encoder labelled every frame only when its base layer frame rate was exactly half the video's frame rate. Rounding that value, 12 instead of 11.988 for a 23.976 fps clip, left every frame unlabelled. Current ${macwall.name} builds encode at a standard constant frame rate with the base layer at exactly half, check the converted movie, convert again at 30 fps if the labels are missing, report an error rather than install a movie that would go black, and re-check the installed Lock Screen video at launch. With ${systemPlayback.setting} playback there is no aerial conversion at all.`,
      },
      { type: "h2", text: "Fix a black or frozen Lock Screen" },
      {
        type: "ol",
        items: [
          `**Update ${macwall.name}** in Settings → About → Check Now, then open it once. It re-checks the Lock Screen video and converts it again if an earlier build made it.`,
          "**Set the wallpaper again.**",
          "**Quit other live wallpaper apps.** Two apps that each keep their own video on the Lock Screen compete for the same system wallpaper choice.",
          "**Check System Settings → Wallpaper → Screen Saver.** If you picked another screen saver after setting a video, macOS shows that one.",
          `**Switch ${macwallPlaybackModes.settingsPath} to ${systemPlayback.setting}**, which skips the aerial conversion entirely.`,
          "**Log out and back in**, then lock your Mac with Control-Command-Q.",
        ],
      },
      {
        type: "p",
        text: `Two things look like faults but aren't. If the screen turns off rather than freezing, that is macOS: System Settings → Lock Screen sets how long the Mac waits on battery and on a power adapter. And a still frame can be a setting: with ${systemPlayback.setting}, turning off **Play the wallpaper while locked**, or **${macwallBatteryPolicy.pauseOnBattery.label}** while the Mac is unplugged, holds the frame on the Lock Screen too.`,
      },
      {
        type: "p",
        text: "Still stuck? [Troubleshooting](/docs/troubleshooting) covers desktop problems, [how macOS wallpapers work](/learn/how-macos-wallpapers-work) covers the layers underneath, and [the macOS 27 Lock Screen guide](/blog/macos-27-lock-screen-live-wallpaper) covers the newest release.",
      },
    ],
    faq: [
      {
        question:
          "Why does my Mac's Lock Screen video go black after I unlock?",
        answer:
          "Usually because the video was converted without an HEVC temporal level on every frame. Apple's aerial player needs those levels to slow the video down and speed it up at lock and unlock, so the first lock plays and the next one is black. Updating the app and setting the wallpaper again rebuilds the video.",
      },
      {
        question: `Does Lock Screen video keep playing after I quit ${macwall.name}?`,
        answer: `Yes, in both playback modes, because macOS plays it. With ${systemPlayback.setting} the desktop keeps moving too; with ${appPlayback.setting} the desktop holds a still until ${macwall.name} opens again.`,
      },
      {
        question: "Can the Lock Screen and desktop show different videos?",
        answer: `With ${appPlayback.setting} playback, yes: choose Lock Screen Only from the menu next to Set Wallpaper. With ${systemPlayback.setting} the Lock Screen always shows the desktop's wallpaper, because macOS plays one wallpaper on both.`,
      },
      {
        question: "Does the Lock Screen video play sound?",
        answer: `Only with ${systemPlayback.setting} playback, when the wallpaper's sound is on. A custom aerial has no audio track, so with ${appPlayback.setting} the Lock Screen is silent.`,
      },
      {
        question: "Can I get Lock Screen video on macOS 15 Sequoia?",
        answer: `Not with ${macwall.name}. Its Lock Screen video needs ${macwallLockScreenMacOSVersion} or later; on macOS 15 the Lock Screen shows a still from your wallpaper while the desktop keeps playing.`,
      },
    ],
    sources: [
      learnSources.customizeWallpaper,
      appleSources.wallpaperSettings,
      appleSources.screenSaverSettings,
      learnSources.lockScreenSettings,
      learnSources.tahoeCompatibility,
      appleSources.macOS27Compatibility,
      learnSources.hevcTemporalLevel,
      learnSources.baseLayerFrameRate,
    ],
  }),
]

export function getLearnPage(slug: string): LearnPage | undefined {
  return learnPages.find((page) => page.slug === slug)
}

export function getAllLearnSlugs(): string[] {
  return learnPages.map((page) => page.slug)
}
