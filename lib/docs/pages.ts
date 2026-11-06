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
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersionLabel,
  macwallPermissions,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"
import { formatPriceCents, proPriceFor } from "@/lib/pricing/sale-aware-price"

/**
 * Product documentation: task-oriented "how do I…" pages.
 *
 * Intent split that keeps these from cannibalising other surfaces:
 * `/docs` answers *how to use MacWall*, `/learn` explains *concepts*, and
 * `/blog` covers opinion, comparisons, and news.
 *
 * Every product fact here matches the shipped app (4.1.0) and comes from the
 * constants in lib/macwall-site.ts where one exists. Give a page a new
 * `updatedAt` only when its own text changes.
 */

export type DocsSectionId =
  "getting-started" | "wallpapers" | "pro" | "troubleshooting" | "developers"

export type DocsPage = SeoContentPage & {
  section: DocsSectionId
  /** Short label for hub cards and breadcrumbs. */
  navLabel: string
  publishedAt: string
  /** Day this page's text last changed (per page, never a shared date). */
  updatedAt: string
  /** Primary sources for platform claims, listed at the end of the page. */
  sources?: readonly PageSource[]
}

export const DOCS_SECTION_LABELS: Record<DocsSectionId, string> = {
  "getting-started": "Getting started",
  wallpapers: "Wallpapers",
  pro: "Pro & licensing",
  troubleshooting: "Troubleshooting",
  developers: "Developers",
}

export const DOCS_SECTION_ORDER: readonly DocsSectionId[] = [
  "getting-started",
  "wallpapers",
  "pro",
  "troubleshooting",
  "developers",
] as const

const maxMacs = macwall.maxLicensedMacs
/** Regular prices: they don't move with sales. Today's price is on /pricing. */
const proRegularPrice = formatPriceCents(proPriceFor("default").regularCents)
const proIndiaRegularPrice = formatPriceCents(proPriceFor("india").regularCents)

const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app
const playbackPath = macwallPlaybackModes.settingsPath
/** "The MacWall process uses 0% CPU after you quit; macOS still decodes the video." */
const systemPlaybackCpuSentence = `${systemPlayback.cpu.charAt(0).toUpperCase()}${systemPlayback.cpu.slice(1)}.`
const power = macwallBatteryPolicy
const supportLink = `[${macwall.supportEmail}](mailto:${macwall.supportEmail})`

/** Appends the page's Sources list to its sections. */
function doc(page: DocsPage): DocsPage {
  return {
    ...page,
    sections: [...page.sections, ...sourcesBlocks(page.sources)],
  }
}

export const docsPages: DocsPage[] = [
  doc({
    section: "getting-started",
    navLabel: "Install MacWall",
    slug: "install-macwall",
    pathname: "/docs/install-macwall",
    title: "Install MacWall on Mac",
    headline: "Install MacWall on your Mac",
    description:
      "Download the MacWall DMG, move it to Applications, open it from there and get a live wallpaper running in about two minutes. Works on macOS 15, 26 and 27.",
    keywords: [
      "install macwall",
      "macwall setup",
      "macwall dmg",
      "live wallpaper mac install",
      "macwall macos 27",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: `MacWall is a native macOS app distributed as a signed and notarized DMG. There is no App Store build, no account and no installer bundle of extras. ${macwallSupportedMacOS.summary}`,
      },
      { type: "h2", text: "Install steps" },
      {
        type: "ol",
        items: [
          "Download the latest build from [macwall.app/download](/download). The link always serves the current release.",
          "Open the downloaded `.dmg` and drag **MacWall** into your Applications folder.",
          "Eject the disk image, then open MacWall from Applications or Spotlight. Running it from the disk image is a common cause of setup problems.",
          "On first launch macOS asks you to confirm an app downloaded from the internet: click **Open**. The build is Developer ID signed and notarized by Apple.",
          "MacWall lives in the menu bar: look for its mountain icon on the right. The Dock icon shows only while a MacWall window is open.",
        ],
      },
      { type: "h2", text: "First wallpaper" },
      {
        type: "ol",
        items: [
          "Click the MacWall menu bar icon, then **Open MacWall**.",
          "Pick any wallpaper from **Home** or **Explore**, or press **⌘K** to search.",
          "Click **Set Wallpaper**. MacWall downloads the video once, then plays it on your desktop with hardware decoding.",
        ],
      },
      {
        type: "p",
        text: `Every Mac gets one ${macwallTrial.name} of ${macwallTrial.includesLabel}. It asks for your email address but never a card, and importing your own videos needs Pro. It is the easiest window to evaluate MacWall or film a [creator video](/creator).`,
      },
      { type: "h2", text: "Permissions" },
      {
        type: "ul",
        items: [
          `**No ${macwallPermissions.never.join(", no ")}.** Setting a wallpaper needs none of them. If an app asks for those to set a wallpaper, it is not MacWall.`,
          `**Music Sync (optional)**: asks for ${macwallPermissions.musicSync.join(" and ")}, to read the track playing in Apple Music or Spotify and to move with the beat. Nothing is recorded or stored.`,
          "**Notifications and Open at login (optional)**: offered during setup. Change them later in System Settings → Notifications and in MacWall → Settings → General.",
        ],
      },
      { type: "h2", text: "Updates" },
      {
        type: "p",
        text: "MacWall updates itself while it's open and restarts when the update is ready; **Settings → About → Check Now** looks right away. Every release is listed in [the changelog](/changelog). You can also download the current build at any time from [/download](/download); installing over an existing copy keeps your library, favorites and license.",
      },
    ],
    faq: [
      {
        question: "Does MacWall work on Intel Macs?",
        answer: `Yes. MacWall ships a universal binary for Apple silicon and Intel and needs ${macwallMinimumMacOSVersionLabel}. macOS 27 itself runs only on Apple silicon, so Intel Macs use MacWall on macOS 15 or 26. Hardware video decoding is used on both.`,
      },
      {
        question: "Does MacWall work on macOS 27 Golden Gate?",
        answer: `Yes. MacWall runs on ${macwallSupportedMacOS.label}. Live Lock Screen and Screen Saver video works on macOS 26 and 27. macOS 27 itself needs an Apple silicon Mac.`,
      },
      {
        question: "Do I need an account to use MacWall?",
        answer:
          "No. There is no account or password. The free 24-hour trial asks for your email address but never a card, and a Pro license is a key you activate.",
      },
      {
        question: "Where does MacWall store downloaded wallpapers?",
        answer:
          "In the MacWall folder inside ~/Library/Application Support. Settings → Storage shows how much space it uses. See [Uninstall MacWall](/docs/uninstall-macwall) to remove it.",
      },
    ],
    sources: [appleSources.macOS27Compatibility, appleSources.findMacOSVersion],
  }),

  doc({
    section: "getting-started",
    navLabel: "Menu bar controls",
    slug: "menu-bar-controls",
    pathname: "/docs/menu-bar-controls",
    title: "MacWall Menu Bar Controls",
    headline: "Control playback from the menu bar",
    description:
      "Play, pause, skip, mute, shuffle and stop live wallpapers from the MacWall menu bar icon without opening the full window.",
    keywords: [
      "macwall menu bar",
      "pause live wallpaper mac",
      "macwall controls",
      "quit macwall",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: "MacWall lives in the menu bar. Click its mountain icon for the wallpaper that's playing and the controls you need during a workday, like pausing before a call or switching wallpapers, while the main window stays closed.",
      },
      { type: "h2", text: "What the menu offers" },
      {
        type: "ul",
        items: [
          "**Play / Pause**: a paused wallpaper keeps its last frame and decodes nothing until you press Play.",
          "**Previous and Next**: switch to the previous or next wallpaper.",
          "**Sound**: turns the wallpaper's sound on or off. Only wallpapers with sound play audio.",
          "**Favorite** and **recent wallpapers**: save the one that's playing, or click a recent one to set it again.",
          "**Shuffle** and **Music Sync** switches, and a **Displays** menu showing what plays on each display.",
          "**Open MacWall** and the **⋯** menu: Keyboard Shortcuts, Settings, Stop Wallpaper and Quit MacWall.",
        ],
      },
      { type: "h2", text: "Good to know" },
      {
        type: "ul",
        items: [
          "Closing the MacWall window doesn't quit MacWall or stop the wallpaper. MacWall keeps running in the menu bar.",
          "**Stop Wallpaper** gives your own macOS wallpaper back. **Pause** keeps the current frame instead.",
          `**Quit MacWall** depends on the playback mode (${playbackPath}): with ${systemPlayback.setting} playback (${systemPlayback.minimumMacOS}+) the wallpaper keeps moving after you quit and after a restart; with ${appPlayback.setting} playback the desktop holds a still frame until MacWall opens again.`,
          `**Open at login** (Settings → General) starts MacWall when you log in, which ${appPlayback.setting} playback needs to keep your desktop moving.`,
          "**Shortcuts in every app**: ⌃⌥⌘P plays or pauses, ⌃⌥⌘M turns sound on or off.",
          "Hid the icon? Open MacWall from Applications, then turn on **Show MacWall in the menu bar** in Settings → General.",
        ],
      },
      {
        type: "p",
        text: "If you want motion to stop automatically instead of manually, use the pause rules described in [Performance and battery settings](/docs/performance-and-battery).",
      },
    ],
    faq: [
      {
        question: "Can I hide the MacWall menu bar icon?",
        answer:
          "Yes. Turn off Show MacWall in the menu bar in Settings → General. MacWall keeps working; to get back to it, open MacWall from Applications.",
      },
      {
        question: "Does pausing keep the wallpaper on screen?",
        answer:
          "Yes. Pause holds the current frame on your desktop and stops decoding until you press Play.",
      },
      {
        question: "Does the wallpaper keep playing after I quit MacWall?",
        answer: `With ${systemPlayback.setting} playback on ${systemPlayback.minimumMacOS} or later, yes: macOS plays it, even after a restart. With ${appPlayback.setting} playback the desktop holds a still frame until MacWall opens again. To get your own wallpaper back, choose Stop Wallpaper.`,
      },
    ],
  }),

  doc({
    section: "wallpapers",
    navLabel: "Set a live wallpaper",
    slug: "set-a-live-wallpaper",
    pathname: "/docs/set-a-live-wallpaper",
    title: "Set a Live Wallpaper on Mac",
    headline: "Set a live wallpaper on your desktop",
    description:
      "Pick a wallpaper in MacWall, set it on one display or all of them, and choose between System Wallpaper and MacWall App playback on macOS 26 and later.",
    keywords: [
      "set live wallpaper mac",
      "macwall wallpaper",
      "multi monitor live wallpaper mac",
      "macwall system wallpaper",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: `MacWall wallpapers are video loops, most in 4K. Setting one replaces your desktop picture with hardware-decoded playback; your icons and windows sit on top as usual. The catalog spans ${macwall.categories.length} categories: ${macwall.categories.join(", ")}.`,
      },
      { type: "h2", text: "From the app" },
      {
        type: "ol",
        items: [
          "Open MacWall and browse **Home** or **Explore**, or press **⌘K** to search.",
          "Click a wallpaper to open it and preview the loop.",
          "Click **Set Wallpaper**. The first time, MacWall downloads the full video; after that it plays from your Mac with no internet.",
        ],
      },
      {
        type: "p",
        text: "**Save to Library** downloads a wallpaper without setting it.",
      },
      { type: "h2", text: "Playback modes: System Wallpaper or MacWall App" },
      {
        type: "p",
        text: `On ${macwallLockScreenMacOSVersion} and later, ${playbackPath} offers two ways to play, and you can switch any time. The homepage calls them ${systemPlayback.marketing} and ${appPlayback.marketing}. Before macOS 26, MacWall always uses ${appPlayback.setting}.`,
      },
      {
        type: "ul",
        items: [
          `**${systemPlayback.setting}** (${systemPlayback.minimumMacOS}+, the default for new installs): ${systemPlayback.summary} ${systemPlaybackCpuSentence}`,
          `**${appPlayback.setting}** (${appPlayback.minimumMacOS}+): ${appPlayback.summary} Turn on Open at login (Settings → General) to keep it running.`,
        ],
      },
      { type: "h2", text: "From the web gallery" },
      {
        type: "p",
        text: "You can also browse the full catalog at [macwall.app/wallpapers](/wallpapers) in any browser. Each wallpaper page has a **Set on Mac** button that opens that wallpaper in MacWall, which asks before downloading it. If MacWall isn't installed yet, the page offers the download instead.",
      },
      { type: "h2", text: "Multiple displays" },
      {
        type: "ul",
        items: [
          "**Every display**: Set Wallpaper applies to all displays, and the same wallpaper stays in sync across them.",
          "**One display**: open a wallpaper, click the arrow next to **Set Wallpaper** and pick a display under Display.",
          "**Settings → Displays** shows what plays on each display.",
          "MacWall remembers each display's wallpaper for each monitor setup, so unplugging and reconnecting a display brings its wallpaper back.",
          "**Fill screen** crops the edges and **Fit to screen** shows the whole wallpaper (Settings → Wallpaper).",
        ],
      },
      { type: "h2", text: "Shuffle and Day Schedule" },
      {
        type: "p",
        text: `Shuffle changes the wallpaper every 15 minutes, 1, 4 or 12 hours, or once a day, choosing from your favorites, your downloads or everything you've saved. Day Schedule, in Playlists, changes the wallpaper at times of day you set, like alarms; turning on Shuffle turns it off. Shuffle waits while your Mac is locked, its displays sleep or ${power.pauseOnBattery.label} holds the wallpaper. Switching wallpapers never moves your windows or desktop icons.`,
      },
    ],
    faq: [
      {
        question: "Will a live wallpaper cover my desktop icons?",
        answer:
          "No. MacWall plays behind your desktop icons and windows, where a static desktop picture would be.",
      },
      {
        question: "Does the loop keep playing in full screen apps?",
        answer: `No. By default MacWall pauses a display that a full-screen app covers, because nothing there is visible. Turn off ${power.pauseBehindFullScreen.label} in ${power.settingsPath} to change that.`,
      },
      {
        question: "How many wallpapers are in the catalog?",
        answer: `${macwallCatalog.liveCountLabel} curated loops, most in 4K, with new ones added regularly. Every Mac gets a ${macwallTrial.name} of ${macwallTrial.includesLabel}; after that, Pro keeps them unlocked.`,
      },
      {
        question: "Which playback mode should I use?",
        answer: `On macOS 26 or later, ${systemPlayback.setting} if you want the wallpaper to keep playing with MacWall closed and the same wallpaper on the Lock Screen. ${appPlayback.setting} if you want a different Lock Screen wallpaper. On macOS 15, MacWall always uses ${appPlayback.setting}.`,
      },
    ],
    sources: [appleSources.wallpaperSettings],
  }),

  doc({
    section: "wallpapers",
    navLabel: "Import your own videos",
    slug: "import-your-own-videos",
    pathname: "/docs/import-your-own-videos",
    title: "Import Your Own Video as a Mac Wallpaper",
    headline: "Use your own video as a live wallpaper",
    description: `Add your own ${macwallImportFormatsLabel} videos to MacWall as private live wallpapers with Pro, plus the export settings that keep playback smooth and efficient.`,
    keywords: [
      "custom live wallpaper mac",
      "mp4 wallpaper mac",
      "own video wallpaper mac",
      "mov wallpaper mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: "MacWall isn't limited to the catalog. With Pro, your own videos can become wallpapers. Added privately, they stay on your Mac and only you see them.",
      },
      { type: "h2", text: "Add a video" },
      {
        type: "ol",
        items: [
          "In MacWall, choose **Upload Wallpaper** (⌘N).",
          "Pick **Private**, then drag your videos in or click **Choose Videos**. You can add up to 10 at a time.",
          "Add them to your Library, then open one and click **Set Wallpaper**.",
        ],
      },
      { type: "h2", text: "Supported formats" },
      {
        type: "ul",
        items: [
          `**${macwallImportFormatsLabel}** with H.264 or HEVC inside, the best choice: both decode on Apple's media hardware.`,
          "**ProRes, AV1 or VP9 inside**: MacWall converts these when you set them, and the wallpaper can look black until that finishes. Export H.264 or HEVC instead.",
          "**GIFs and still images** can't be added as private wallpapers. Convert a GIF to an MP4 first.",
        ],
      },
      { type: "h2", text: "Encoding settings that look and run best" },
      {
        type: "ul",
        items: [
          "**Resolution**: match your display, or 3840×2160 for a 4K panel. Encoding above your panel resolution wastes decode work with no visible gain.",
          "**Frame rate**: 24–30 fps is plenty for ambient motion and noticeably cheaper than 60 fps.",
          "**Codec**: HEVC (H.265) for the smallest file at equal quality; H.264 for maximum compatibility.",
          "**Length**: 5–30 seconds that loops cleanly. Short seamless loops beat long clips with a visible jump.",
          "**Audio**: keep it only if you want sound. MacWall plays a wallpaper's sound only when you turn it on (player bar, menu bar or Settings → Sound) and remembers that for each wallpaper. Otherwise strip the track to keep the file small.",
        ],
      },
      { type: "h2", text: "Why seamless loops matter" },
      {
        type: "p",
        text: "A wallpaper repeats hundreds of times an hour in your peripheral vision, so any cut at the loop point becomes the only thing you notice. Pick footage whose first and last frames are close: slow pans, drifting clouds, rain, particle drift, or crossfade the ends before exporting.",
      },
      { type: "h2", text: "Share a wallpaper with everyone" },
      {
        type: "p",
        text: "To submit a video to the public catalog, choose **Upload Wallpaper** → **Public**. Every upload is reviewed before it appears in Community, and **Submissions** shows whether each one is pending, approved or rejected. Public uploads need at least 1920×1080 and at most 300 MB.",
      },
    ],
    faq: [
      {
        question: "Are imported videos uploaded anywhere?",
        answer:
          "No. Videos you add under Private stay on your Mac and only you see them. Only what you submit under Public is uploaded, for review before it appears in the catalog.",
      },
      {
        question: "Is there a file size limit for imports?",
        answer:
          "Not for private videos, but large ProRes files use more disk and take a while to convert. An HEVC export usually gives the same on-screen quality at a fraction of the size. Public submissions are capped at 300 MB.",
      },
      {
        question: "Can I import videos without Pro?",
        answer: `No. Adding your own videos needs Pro; it isn't part of the ${macwallTrial.name}, which covers ${macwallTrial.includesLabel}.`,
      },
      {
        question: "Can I use a GIF as a live wallpaper?",
        answer: `Not directly. MacWall adds video files (${macwallImportFormatsLabel}). Convert the GIF to an H.264 or HEVC MP4 first, which also makes it smaller and smoother.`,
      },
    ],
  }),

  doc({
    section: "wallpapers",
    navLabel: "Live Lock Screen",
    slug: "live-lock-screen-and-screen-saver",
    pathname: "/docs/live-lock-screen-and-screen-saver",
    title: "Live Lock Screen & Screen Saver on macOS",
    headline: "Enable live Lock Screen and Screen Saver motion",
    description: `Turn on MacWall's live Lock Screen and Screen Saver playback on ${macwallLockScreenMacOSVersion} and later, including macOS 27, in either playback mode.`,
    keywords: [
      "live lock screen mac",
      "macos live screen saver",
      "macos 26 lock screen wallpaper",
      "macos 27 lock screen wallpaper",
      "macwall lock screen",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: `Live Lock Screen and Screen Saver playback needs Pro (or the free trial) and ${macwallLockScreenMacOSVersion} or later, including macOS 27. On macOS 15 MacWall plays the desktop only, and the Lock Screen shows a still from your wallpaper. How the Lock Screen works depends on the playback mode in **${playbackPath}**.`,
      },
      { type: "h2", text: `With ${systemPlayback.setting} playback` },
      {
        type: "ul",
        items: [
          "Set a wallpaper as usual. The Lock Screen and screen saver show the same wallpaper as the desktop, sound included, even while MacWall is closed.",
          "**Play only on the Lock Screen** (Settings → Lock Screen): your desktop rests on a still frame, and the wallpaper moves when you lock your Mac or the screen saver starts, then slows to a stop when you unlock, like Apple's Aerials.",
          "**Play the wallpaper while locked**: turn it off and the Lock Screen holds the frame it was on, which saves battery.",
          `For a different wallpaper on the Lock Screen, switch to ${appPlayback.setting} playback.`,
        ],
      },
      { type: "h2", text: `With ${appPlayback.setting} playback` },
      {
        type: "ol",
        items: [
          "Activate Pro. See [License and activation](/docs/license-and-activation).",
          "Open MacWall → **Settings** → **Lock Screen** and turn on **Show on Lock Screen and screen saver**.",
          "Set a wallpaper as usual. The menu next to **Set Wallpaper** picks Desktop & Lock Screen, Desktop Only or Lock Screen Only.",
          "For a different Lock Screen wallpaper, open it, click the arrow next to **Set Wallpaper** and choose **Lock Screen Only**.",
          "Lock your Mac (**Control-Command-Q**) to check it.",
        ],
      },
      {
        type: "p",
        text: "**Lock Screen only** in Settings → Lock Screen makes Set Wallpaper change only the Lock Screen. macOS then shows a still of that wallpaper on the desktop, because it uses one picture for both.",
      },
      { type: "h2", text: "How macOS handles it" },
      {
        type: "ul",
        items: [
          `With ${systemPlayback.setting}, MacWall's wallpaper extension is the system wallpaper: macOS runs it on the desktop, Lock Screen and screen saver.`,
          `With ${appPlayback.setting}, MacWall converts the wallpaper into a Lock Screen video that macOS plays itself, the way it plays Apple's Aerials, so the first apply takes a moment.`,
          "The screen saver and the Lock Screen show the same video.",
        ],
      },
      { type: "h2", text: "If motion does not appear" },
      {
        type: "ol",
        items: [
          "Confirm you are on macOS 26 or later: Apple menu → About This Mac.",
          "Confirm Pro (or the trial) is active in MacWall → Settings → MacWall Pro.",
          "Update MacWall (Settings → About → Check Now), then set the wallpaper again.",
          "On macOS 26 and 27, check System Settings → Wallpaper → Screen Saver: if you picked another screen saver after MacWall set its own, macOS shows that one.",
          "Log out and back in, then lock your Mac again.",
          "If motion plays at first but the Lock Screen goes black after you unlock, read [how Lock Screen video works on macOS Tahoe](/learn/how-macos-tahoe-lock-screen-video-works).",
        ],
      },
      {
        type: "p",
        text: `Still nothing? Send your macOS version and MacWall version to ${supportLink}. Behavior here can change between macOS releases; fixes are listed in [the changelog](/changelog).`,
      },
    ],
    faq: [
      {
        question: "Does the Lock Screen video drain battery while locked?",
        answer: `With ${systemPlayback.setting} playback the Lock Screen plays the wallpaper unless you turn off Play the wallpaper while locked, which holds the frame and saves battery. Once the display sleeps nothing is decoded. With ${appPlayback.setting} playback the desktop stops while the Mac is locked.`,
      },
      {
        question: "Can I get a live Lock Screen on macOS 15?",
        answer: `Not with MacWall. Its Lock Screen video needs ${macwallLockScreenMacOSVersion} or later; on macOS 15 the Lock Screen shows a still from your wallpaper. Desktop live wallpapers work on macOS 15 and later.`,
      },
      {
        question: "Does live Lock Screen work on macOS 27?",
        answer:
          "Yes. Live Lock Screen and Screen Saver video works on macOS 26 Tahoe and macOS 27 Golden Gate, in both playback modes.",
      },
      {
        question: "Can the Lock Screen and desktop use different wallpapers?",
        answer: `Yes, with ${appPlayback.setting} playback: open a wallpaper, click the arrow next to Set Wallpaper and choose Lock Screen Only. With ${systemPlayback.setting} playback the Lock Screen always shows the desktop's wallpaper.`,
      },
    ],
    sources: [
      appleSources.screenSaverSettings,
      appleSources.wallpaperSettings,
      appleSources.findMacOSVersion,
    ],
  }),

  doc({
    section: "pro",
    navLabel: "License and activation",
    slug: "license-and-activation",
    pathname: "/docs/license-and-activation",
    title: "MacWall License & Activation",
    headline: "Activate your MacWall Pro license",
    description: `How MacWall Pro licensing works: a one-time purchase, instant key activation, up to ${maxMacs} Macs, and how to move a license to a new Mac.`,
    keywords: [
      "macwall license",
      "macwall pro activation",
      "macwall license key",
      "transfer macwall license",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: `MacWall Pro is a one-time purchase, not a subscription: ${proRegularPrice} at the regular price for up to ${maxMacs} Macs, or ${proIndiaRegularPrice} in India, and less during sales. [Pricing](/pricing) shows today's price for your region. You get a license key, lifetime updates and activation on up to ${maxMacs} Macs you own, with no account and no recurring charge. Every Mac can try MacWall first with a ${macwallTrial.name}.`,
      },
      { type: "h2", text: "Activate after purchase" },
      {
        type: "ol",
        items: [
          "Complete checkout from [/pricing](/pricing). Payment is processed by Stripe; MacWall never sees your card details.",
          "Stripe returns you to the activation page, which verifies the payment and shows your license key.",
          "MacWall opens and applies the key by itself. If it doesn't open, click **Open MacWall** on that page.",
          "Prefer to paste it? Open MacWall → **Settings** → **MacWall Pro** → **Enter License Key…** and paste the key, or the whole line from the email.",
          "Bought inside MacWall with **Pay Once**? Pro turns on by itself a few moments after you pay; keep MacWall open.",
        ],
      },
      { type: "h2", text: "Lost your key" },
      {
        type: "p",
        text: `Your key (it starts with MW-) is in the email we send from licenses@macwall.app right after payment. Search for MacWall or "MW-", and check Spam and Promotions. Still missing? Email ${supportLink} from the address you paid with and we will resend it.`,
      },
      { type: "h2", text: "Move a license to a new Mac" },
      {
        type: "ul",
        items: [
          `One Pro key works on ${maxMacs} Macs. Under that limit, just enter the same key on the new Mac.`,
          "At the limit, open **Settings → MacWall Pro** on the old Mac and click **Unlink**, which frees its place at once.",
          `No longer have the old Mac? Email ${supportLink} with your key and we will release it.`,
          "Need more machines for a studio, a family or a lab? Pro+ covers 5 or 10 Macs; see [/pricing](/pricing).",
        ],
      },
      { type: "h2", text: "What Pro unlocks" },
      { type: "ul", items: [...macwall.proIncludedFeatures] },
      { type: "h2", text: "Refunds" },
      {
        type: "p",
        text: `Every license has a ${macwall.refundWindowDays}-day money-back guarantee. Email ${supportLink} within ${macwall.refundWindowDays} days of purchase for a full refund, no reason needed; details are in the [Refund Policy](/legal/refund). Separately, the [creator program](/creator) refunds your purchase for posting a MacWall video that reaches the view thresholds.`,
      },
    ],
    faq: [
      {
        question: "Is MacWall Pro a subscription?",
        answer: `No. Pro is a single payment with lifetime updates: ${proRegularPrice} at the regular price for ${maxMacs} Macs (${proIndiaRegularPrice} in India). The annual plan is retired for new purchases.`,
      },
      {
        question: "Does the license work offline?",
        answer:
          "Yes. Activation needs an internet connection, and downloaded wallpapers play offline. If your Mac has been offline for a long time, MacWall asks you to reconnect so it can check the license, never to pay again.",
      },
      {
        question: "Do I need to buy again for a new macOS version?",
        answer:
          "No. Lifetime updates mean new releases, including support for new macOS versions and new Pro features, are included.",
      },
    ],
  }),

  doc({
    section: "pro",
    navLabel: "Performance and battery",
    slug: "performance-and-battery",
    pathname: "/docs/performance-and-battery",
    title: "MacWall Performance & Battery Settings",
    headline: "Tune performance, CPU, and battery behavior",
    description:
      "MacWall 4.1.0 pause rules: full-screen apps, display sleep, Pause on battery, Lower quality on battery and Pause when busy, and how to check CPU use.",
    keywords: [
      "live wallpaper cpu usage mac",
      "macwall battery",
      "macwall performance settings",
      "mac wallpaper battery drain",
      "pause on battery",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: "MacWall's design goal is that you forget it is running. Video frames are decoded by the Mac's media hardware through Apple's video frameworks rather than by the CPU, and when nobody can see the wallpaper, playback stops instead of running in the background.",
      },
      { type: "h2", text: "Pause rules" },
      {
        type: "ul",
        items: [
          `**${power.pauseBehindFullScreen.label}** (on by default): a display covered by a full-screen app, or by windows over the whole desktop, stops decoding until the wallpaper is visible again.`,
          "**Displays asleep**: always. Nothing decodes while the displays sleep.",
          `**Screen locked**: with ${appPlayback.setting} playback the desktop stops while the Mac is locked. With ${systemPlayback.setting} playback the Lock Screen plays the wallpaper unless you turn off Play the wallpaper while locked.`,
          `**${power.pauseOnBattery.label}** (off by default): since 4.1.0 it ${power.pauseOnBattery.detail}, even while MacWall is closed. Pressing Play overrides it until you plug in or unplug again. Through 4.0.9 it acted only in Low Power Mode or at the low-battery warning.`,
          `**${power.lowerQualityOnBattery.label}** (off by default): ${power.lowerQualityOnBattery.detail}. With ${appPlayback.setting} playback it caps the wallpaper at 1920 pixels and 30 fps. It's not needed while ${power.pauseOnBattery.label} is on, since the wallpaper is already paused then.`,
          `**${power.pauseWhenBusy.label}** (off by default): ${power.pauseWhenBusy.detail}, then plays again when the load drops.`,
        ],
      },
      {
        type: "p",
        text: `All of these live in ${power.settingsPath}. A paused wallpaper keeps its last frame and starts again on its own.`,
      },
      { type: "h2", text: "Playback mode and CPU" },
      {
        type: "p",
        text: `On ${macwallLockScreenMacOSVersion} and later, **${systemPlayback.setting}** playback (${playbackPath}) lets macOS play the wallpaper, so MacWall can stay closed: ${systemPlayback.cpu}. With **${appPlayback.setting}** playback MacWall plays the video itself and stays open.`,
      },
      { type: "h2", text: "Verify it yourself" },
      {
        type: "ol",
        items: [
          "Open **Activity Monitor** → **CPU** tab.",
          "Search for `MacWall` and watch the **% CPU** column with a wallpaper playing.",
          "Switch to the **Energy** tab and check **Energy Impact** over a few minutes.",
          "Pause from the menu bar and watch both values drop.",
        ],
      },
      {
        type: "p",
        text: `With ${systemPlayback.setting} playback the video is decoded by macOS's wallpaper process rather than by the MacWall app, so compare the whole Mac's CPU and energy use, not just MacWall's row. Readings vary by Mac, source video, display setup and settings; use the steps above to measure your own setup. What drives the cost, and how to compare readings, is in [live wallpaper CPU and battery use](/blog/live-wallpaper-cpu-usage-mac).`,
      },
      { type: "h2", text: "If usage looks higher than expected" },
      {
        type: "ul",
        items: [
          "**Check the source video.** A 60 fps 8K import costs far more to decode than a 4K 30 fps loop. Re-encode using the guidance in [Import your own videos](/docs/import-your-own-videos).",
          "**Check the codec.** H.264 and HEVC decode in hardware. AV1 needs a recent Apple silicon Mac, and ProRes or VP9 imports are converted first.",
          "**Count displays.** Displays showing the same video share one player, so only a display with its own wallpaper adds decode work. Several 4K displays with different loops cost more than one.",
          "**Quit other wallpaper apps.** On macOS 26 there is one system wallpaper, and another app setting its own replaces MacWall's.",
        ],
      },
    ],
    faq: [
      {
        question: "Will a live wallpaper drain my MacBook battery?",
        answer: `Expect a modest cost, similar to a small video playing in a window. ${power.lowerQualityOnBattery.label} reduces it, and ${power.pauseOnBattery.label} stops it entirely whenever your Mac is unplugged. We have not published a measured battery test yet.`,
      },
      {
        question: "Does MacWall pause in Low Power Mode?",
        answer: `Not by itself since 4.1.0. Turn on ${power.pauseOnBattery.label} to hold the frame whenever your Mac is unplugged, which covers Low Power Mode on battery. ${power.lowerQualityOnBattery.label} also decodes less in Low Power Mode.`,
      },
      {
        question: "Does MacWall run when the lid is closed?",
        answer:
          "Not on the built-in display: closing the lid turns it off, and nothing is decoded for it. With an external display and the lid closed, the wallpaper keeps playing on the external display.",
      },
      {
        question: "Does MacWall affect gaming performance?",
        answer: `Games usually run full screen, and ${power.pauseBehindFullScreen.label} (on by default) stops the wallpaper there. Turn on ${power.pauseWhenBusy.label} for heavy work in a window.`,
      },
    ],
    sources: [
      appleSources.videoToolbox,
      appleSources.activityMonitorEnergy,
      appleSources.powerModes,
    ],
  }),

  doc({
    section: "troubleshooting",
    navLabel: "Fix common issues",
    slug: "troubleshooting",
    pathname: "/docs/troubleshooting",
    title: "MacWall Troubleshooting",
    headline: "Fix the most common MacWall issues",
    description:
      "Wallpaper not showing, playback stuck on one frame, downloads failing, black screen after a macOS update, with the fix for each.",
    keywords: [
      "macwall not working",
      "live wallpaper not showing mac",
      "macwall troubleshooting",
      "mac wallpaper black screen",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: "Most issues come from one of four causes: MacWall is out of date or running from the disk image, a pause rule is doing exactly what you asked, another wallpaper app is replacing MacWall's, or a macOS update changed wallpaper behavior. Work through the matching section below.",
      },
      { type: "h2", text: "Wallpaper does not appear" },
      {
        type: "ol",
        items: [
          "Update MacWall (Settings → About → Check Now). Most apply errors are fixed in the latest version.",
          "Make sure MacWall is in Applications and opened from there, not from the disk image, and quit other live wallpaper apps.",
          "Check the MacWall menu bar icon. If the wallpaper is paused, press Play.",
          `Check the pause rules: a full-screen app in front, ${power.pauseOnBattery.label} while unplugged, or ${power.pauseWhenBusy.label} during heavy work.`,
          `If MacWall says macOS didn't start the wallpaper, click **Use MacWall App** on that message, or choose ${appPlayback.setting} in ${playbackPath}.`,
          "Click **Set Wallpaper** again.",
        ],
      },
      { type: "h2", text: "Playback is frozen on one frame" },
      {
        type: "p",
        text: `A frozen frame is what a paused wallpaper looks like. That is deliberate, not a crash. Press Play in the menu bar. If it pauses again right away, a rule is firing: a full-screen app, ${power.pauseOnBattery.label} while unplugged, or ${power.pauseWhenBusy.label}. Review them in [Performance and battery](/docs/performance-and-battery).`,
      },
      { type: "h2", text: "Downloads fail or stall" },
      {
        type: "ul",
        items: [
          "Catalog videos are served over HTTPS from a CDN. A VPN, corporate proxy, or content filter can block them, so try with it off.",
          "Confirm free disk space. 4K loops are large, and Settings → Storage → Clear Cache can free room.",
          "Retry from the wallpaper's page; MacWall resumes where the download stopped rather than starting from zero.",
        ],
      },
      { type: "h2", text: "Black desktop after a macOS update" },
      {
        type: "ol",
        items: [
          "Update MacWall first. [/download](/download) always serves the current build, and wallpaper behavior changes between macOS releases.",
          "Make sure MacWall is running (its icon is in the menu bar), then click **Set Wallpaper** again.",
          "Your own ProRes, AV1 or VP9 video can stay black while MacWall converts it. Give it a moment, or re-export it as H.264 or HEVC.",
          "If the desktop stays black, restart your Mac and set the wallpaper again.",
        ],
      },
      { type: "h2", text: "Lock Screen motion missing" },
      {
        type: "p",
        text: "Lock Screen playback needs Pro (or the trial) and macOS 26 or later. The full checklist is in [Live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).",
      },
      { type: "h2", text: "Still stuck" },
      {
        type: "p",
        text: `Use **Settings → Help & Support** inside MacWall, or email ${supportLink} with your macOS version, Mac model, MacWall version and what you already tried. The [Discord community](${macwall.discordInvite}) is often faster for setup questions.`,
      },
    ],
    faq: [
      {
        question: "Can I run MacWall alongside another wallpaper app?",
        answer:
          "Not reliably. On macOS 26 there is one system wallpaper: another wallpaper app, or a still image set in System Settings, replaces MacWall's. Quit the other app, then click Set Wallpaper in MacWall.",
      },
      {
        question: "How do I report a bug?",
        answer: `Email ${supportLink} with your macOS and MacWall versions and steps to reproduce. Fixes ship in the next release and are listed in [the changelog](/changelog).`,
      },
    ],
  }),

  doc({
    section: "troubleshooting",
    navLabel: "Uninstall MacWall",
    slug: "uninstall-macwall",
    pathname: "/docs/uninstall-macwall",
    title: "Uninstall MacWall",
    headline: "Uninstall MacWall completely",
    description:
      "Remove MacWall from your Mac, get your own wallpaper back on the desktop and Lock Screen, delete its downloaded videos and keep your license for later.",
    keywords: [
      "uninstall macwall",
      "remove macwall mac",
      "delete live wallpaper app mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-11-05",
    sections: [
      {
        type: "p",
        text: "MacWall installs no kernel extensions and no launch daemons. The cleanest way to remove it is built in: **Uninstall MacWall** gives your own wallpaper back, takes MacWall out of Login Items, deletes its downloads, caches and settings, turns off its wallpaper extension and moves the app to the Trash.",
      },
      { type: "h2", text: "Uninstall from MacWall's settings" },
      {
        type: "ol",
        items: [
          "Click the MacWall menu bar icon → **⋯** → **Settings**.",
          "Open **General** and click **Uninstall…** next to Uninstall MacWall, then confirm.",
          "MacWall lists anything it couldn't remove, then quits. Empty the Trash when you're ready.",
        ],
      },
      { type: "h2", text: "Remove it by hand" },
      {
        type: "ol",
        items: [
          "In the menu bar choose **⋯** → **Stop Wallpaper**. This gives your own macOS wallpaper back; quitting alone doesn't, because with System Wallpaper playback the wallpaper keeps playing after you quit.",
          "Choose **⋯** → **Quit MacWall**.",
          "Open **Applications** and move **MacWall** to the Trash.",
          "In Finder press **Shift-Command-G**, go to `~/Library/Application Support/` and delete the **MacWall** folder, where downloaded and added videos are kept. Do the same in `~/Library/Caches/`.",
          "To clear settings too, delete `com.macwall.ogapps.plist` from `~/Library/Preferences/`.",
          "If you turned on Open at login, remove MacWall in System Settings → General → Login Items & Extensions.",
        ],
      },
      { type: "h2", text: "Your license after uninstalling" },
      {
        type: "p",
        text: `A Pro license belongs to you, not to the install, and uninstalling doesn't unlink it. Keep the key: reinstalling and entering it restores Pro. To free one of your ${maxMacs} Macs, click **Unlink** in Settings → MacWall Pro **before** removing the app, or email ${supportLink} and we will release it.`,
      },
    ],
    faq: [
      {
        question: "Does uninstalling change my desktop wallpaper back?",
        answer:
          "Yes, with Uninstall MacWall in Settings → General, or with Stop Wallpaper in the menu bar before you remove the app by hand. Both put back the wallpaper you had before MacWall.",
      },
      {
        question: "Do I lose imported videos?",
        answer:
          "Your original files stay wherever you keep them. Uninstalling removes only MacWall's own copies.",
      },
      {
        question: "What's the difference between Reset and Uninstall?",
        answer:
          "Reset MacWall (Settings → General) removes downloads, your own videos and settings but keeps your license and favorites, so you can start over. Uninstall MacWall removes the app and its files completely.",
      },
    ],
  }),

  doc({
    section: "developers",
    navLabel: "Public API & feeds",
    slug: "public-api",
    pathname: "/docs/public-api",
    title: "MacWall Public API & Machine-Readable Feeds",
    headline: "Public API and machine-readable feeds",
    description:
      "Read-only MacWall endpoints for the wallpaper catalog and release metadata, plus the RSS, JSON Feed, llms.txt and API catalog documents for this site.",
    keywords: [
      "macwall api",
      "wallpaper api",
      "macwall rss feed",
      "macwall llms.txt",
      "api catalog",
    ],
    publishedAt: "2026-08-02",
    updatedAt: "2026-10-27",
    sections: [
      {
        type: "p",
        text: "MacWall publishes a small read-only HTTP surface plus a set of discovery documents. Everything below is public, unauthenticated, JSON or text, and CDN-cached. Machine clients should start at [/.well-known/api-catalog](/.well-known/api-catalog), which links to every endpoint and its OpenAPI description.",
      },
      { type: "h2", text: "Catalog: GET /api/wallpapers" },
      {
        type: "p",
        text: "Paginated public wallpaper catalog. Same data that powers [the web gallery](/wallpapers).",
      },
      {
        type: "ul",
        items: [
          "`q`: case-insensitive search across name, id, category and resolution.",
          `\`category\`: one of ${macwall.categories.join(", ")}.`,
          "`tag`: filter by a single tag.",
          "`sort`: `newest` (default), `popular`, or `older`.",
          "`page`: 1-based page number, default `1`.",
          "`limit`: items per page, default `24`, at most `60`.",
        ],
      },
      {
        type: "p",
        text: "Returns `{ wallpapers, total, page, limit, hasMore }`. Each wallpaper includes `id`, `name`, `category`, `tags`, `resolution`, `durationSeconds`, `fileSizeBytes`, `videoKey`, `thumbKey`, `thumbUrl`, `videoUrl`, `likeCount`, and `createdAt`. A page past the end returns `200` with an empty `wallpapers` array and `hasMore: false`. `videoUrl` is a downscaled, silent web preview, not the source file; full-resolution wallpapers are only available in the app.",
      },
      {
        type: "h2",
        text: "Releases: GET /api/installers/releases/version.json",
      },
      {
        type: "p",
        text: "Current release metadata: `version`, optional `build`, a download `url`, and optional `notes`. This is the same feed the in-app updater reads and the source for [the changelog](/changelog). It is intentionally uncached so a new build is visible immediately.",
      },
      { type: "h2", text: "Installer: GET /download/latest" },
      {
        type: "p",
        text: "Stable path that `302`-redirects to the current signed DMG. Link to this rather than a versioned file so your link never goes stale.",
      },
      { type: "h2", text: "Discovery documents" },
      {
        type: "ul",
        items: [
          "[/ai-info](/ai-info) and [/ai-info.md](/ai-info.md): canonical product facts, limitations, source precedence, and assistant guidance.",
          "[/.well-known/api-catalog](/.well-known/api-catalog): RFC 9727 API catalog in `application/linkset+json`.",
          "[/openapi.json](/openapi.json): OpenAPI 3.1 description of the endpoints above.",
          "[/llms.txt](/llms.txt): curated Markdown index of the whole site for language models.",
          "[/llms-full.txt](/llms-full.txt): combined long-form product, documentation, learning, blog, and comparison text.",
          "[/rss.xml](/rss.xml), [/atom.xml](/atom.xml), [/feed.json](/feed.json): blog feeds in RSS 2.0, Atom 1.0, and JSON Feed 1.1.",
          "[/sitemap.xml](/sitemap.xml) and [/robots.txt](/robots.txt): crawl surface.",
          "[/ai.txt](/ai.txt) and [/crawlers](/crawlers): AI and crawler usage policy.",
        ],
      },
      { type: "h2", text: "Markdown twin of every page" },
      {
        type: "p",
        text: "Append `.md` to any content URL to get a clean Markdown version with YAML frontmatter, for example `/blog/what-is-macwall-complete-guide.md` or `/docs/public-api.md`. These responses are `text/markdown` and `noindex`, so they exist for agents and pipelines without competing with the HTML page in search.",
      },
      { type: "h2", text: "Fair use" },
      {
        type: "ul",
        items: [
          "Cache responses and keep request rates reasonable. These endpoints are shared infrastructure, not a bulk export.",
          "Hotlinking video files is discouraged; link to the wallpaper page or the app deep link instead.",
          "Wallpaper videos are licensed for use inside MacWall and are not redistributable. See [Terms](/legal/terms).",
          "Send a descriptive `User-Agent` with a contact URL so we can reach you before rate limiting you.",
        ],
      },
    ],
    faq: [
      {
        question: "Do I need an API key?",
        answer:
          "No. These endpoints are public and unauthenticated. There is no write API and no user data exposed.",
      },
      {
        question: "Is the API versioned?",
        answer:
          "Response shapes are additive: new fields may appear, existing ones are not renamed or removed without notice in [the changelog](/changelog).",
      },
      {
        question: "Can I use the catalog data in my own app?",
        answer: `Metadata, yes, with attribution and a link back to macwall.app. The wallpaper videos themselves are licensed for MacWall use only. Ask first at ${supportLink}.`,
      },
    ],
  }),
]

export function getDocsPage(slug: string): DocsPage | undefined {
  return docsPages.find((page) => page.slug === slug)
}

export function getAllDocsSlugs(): string[] {
  return docsPages.map((page) => page.slug)
}

/** Newest `updatedAt` across the docs, for the hub's dateModified. */
export function docsLastUpdatedIso(): string {
  return docsPages
    .map((page) => page.updatedAt)
    .reduce((latest, iso) => (iso > latest ? iso : latest))
}

export function docsPagesBySection(): {
  id: DocsSectionId
  label: string
  pages: DocsPage[]
}[] {
  return DOCS_SECTION_ORDER.map((id) => ({
    id,
    label: DOCS_SECTION_LABELS[id],
    pages: docsPages.filter((page) => page.section === id),
  })).filter((group) => group.pages.length > 0)
}
