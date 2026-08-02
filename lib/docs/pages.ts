import type { SeoContentPage } from "@/lib/content/types"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"

/**
 * Product documentation — task-oriented "how do I…" pages.
 *
 * Intent split that keeps these from cannibalising other surfaces:
 * `/docs` answers *how to use MacWall*, `/learn` explains *concepts*, and
 * `/blog` covers opinion, comparisons, and news.
 */

export type DocsSectionId =
  | "getting-started"
  | "wallpapers"
  | "pro"
  | "troubleshooting"
  | "developers"

export type DocsPage = SeoContentPage & {
  section: DocsSectionId
  /** Short label for hub cards and breadcrumbs. */
  navLabel: string
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

const proPrice = macwall.pro.price
const maxMacs = macwall.maxLicensedMacs
const updatedAt = "2026-08-02"

function doc(page: DocsPage): DocsPage {
  return page
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
      "Download the MacWall DMG, install it, grant the one permission macOS asks for, and get a live wallpaper running in under two minutes.",
    keywords: [
      "install macwall",
      "macwall setup",
      "macwall dmg",
      "live wallpaper mac install",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: `MacWall is a native macOS app distributed as a signed and notarised DMG. There is no App Store build, no account, and no installer bundle of extras. Requirements: ${macwallMinimumMacOSVersionLabel}. Live Lock Screen and Screen Saver playback additionally needs ${macwallLockScreenMacOSVersion} or later.`,
      },
      { type: "h2", text: "Install steps" },
      {
        type: "ol",
        items: [
          "Download the latest build from [macwall.app/download](/download). The link always serves the current release.",
          "Open the downloaded `.dmg` and drag **MacWall** into your Applications folder.",
          "Eject the disk image, then launch MacWall from Applications or Spotlight.",
          "On first launch macOS asks to confirm an app downloaded from the internet — click **Open**. The build is Developer ID signed and notarised by Apple.",
          "MacWall installs itself as a menu bar app. Look for the icon in the right side of your menu bar; it does not sit in the Dock.",
        ],
      },
      { type: "h2", text: "First wallpaper" },
      {
        type: "ol",
        items: [
          "Click the MacWall menu bar icon, then **Open MacWall**.",
          "Pick any wallpaper from Featured, Newest, or a category.",
          "Click **Set wallpaper**. MacWall downloads the loop, then starts hardware-decoded playback behind your windows.",
        ],
      },
      { type: "h2", text: "Permissions MacWall asks for" },
      {
        type: "ul",
        items: [
          "**Screen wallpaper access** — required to replace the desktop picture. macOS grants this through the standard wallpaper APIs.",
          "**Notifications (optional)** — used only for download-complete and update prompts. Declining changes nothing else.",
          "**No Full Disk Access, no Accessibility, no Screen Recording.** If any app asks for those to set a wallpaper, it is not MacWall.",
        ],
      },
      { type: "h2", text: "Updates" },
      {
        type: "p",
        text: "Auto-update is on by default. MacWall checks a signed updater feed and installs releases in place — the same feed that drives [the changelog](/changelog). You can also re-download the current build at any time from [/download](/download); installing over an existing copy keeps your library, favourites, and license.",
      },
    ],
    faq: [
      {
        question: "Does MacWall work on Intel Macs?",
        answer: `Yes. MacWall ships a universal binary for Apple silicon and Intel, and requires ${macwallMinimumMacOSVersionLabel}. Hardware video decode is used on both architectures.`,
      },
      {
        question: "Do I need an account to use MacWall?",
        answer:
          "No. The free tier works immediately after install with no sign-up. A Pro license is a key you activate — still no account, no password, no email wall.",
      },
      {
        question: "Where does MacWall store downloaded wallpapers?",
        answer:
          "In MacWall's application support folder inside your user Library. Removing the app and that folder removes every cached video — see [Uninstall MacWall](/docs/uninstall-macwall).",
      },
    ],
  }),

  doc({
    section: "getting-started",
    navLabel: "Menu bar controls",
    slug: "menu-bar-controls",
    pathname: "/docs/menu-bar-controls",
    title: "MacWall Menu Bar Controls",
    headline: "Control playback from the menu bar",
    description:
      "Pause, resume, stop, shuffle, and switch live wallpapers from the MacWall menu bar item without opening the full window.",
    keywords: [
      "macwall menu bar",
      "pause live wallpaper mac",
      "macwall controls",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "MacWall's primary interface is the menu bar item. Everything you need during a work day — pausing motion before a call, switching a loop, muting playback — is one click away, and the main window stays closed.",
      },
      { type: "h2", text: "What the menu offers" },
      {
        type: "ul",
        items: [
          "**Pause / Resume** — freezes the current frame. A paused wallpaper decodes nothing and costs no measurable CPU or GPU.",
          "**Stop** — ends playback and restores your previous static desktop picture.",
          "**Next wallpaper** — advances through the active playlist or your favourites.",
          "**Open MacWall** — opens the full browsing window for the catalog, library, and settings.",
          "**Settings** — pause rules, per-display behaviour, Music Sync, launch at login, and license status.",
        ],
      },
      { type: "h2", text: "Behaviour worth knowing" },
      {
        type: "ul",
        items: [
          "Closing the MacWall window does not stop the wallpaper. Playback is owned by the background service, not the UI.",
          "Quitting MacWall from the menu restores your static desktop picture, so you never get stuck on a frozen frame.",
          "**Launch at login** is off until you enable it in Settings. With it on, MacWall restores your last wallpaper before you reach the desktop.",
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
          "The icon is how you reach playback controls, so MacWall keeps it visible. Use a menu bar manager if you want it tucked into an overflow area — MacWall keeps working while hidden.",
      },
      {
        question: "Does pausing keep the wallpaper on screen?",
        answer:
          "Yes. Pause holds the current video frame as your desktop picture, so the look stays and decoding stops entirely.",
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
      "Browse the MacWall catalog, preview a loop, and set it as your desktop live wallpaper — including per-display setups on multi-monitor Macs.",
    keywords: [
      "set live wallpaper mac",
      "macwall wallpaper",
      "multi monitor live wallpaper mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: `Every wallpaper in MacWall is a 4K video loop. Setting one replaces your desktop picture with hardware-decoded playback; your icons, windows, Stage Manager, and Mission Control behave exactly as before. The catalog spans ${macwall.categories.length} categories — ${macwall.categories.join(", ")}.`,
      },
      { type: "h2", text: "From the app" },
      {
        type: "ol",
        items: [
          "Open MacWall and browse **Featured**, **Newest**, **Popular**, or a category.",
          "Click a wallpaper to open its detail view and preview the loop.",
          "Click **Set wallpaper**. First use downloads the video; after that it is cached locally and applies instantly.",
        ],
      },
      { type: "h2", text: "From the web gallery" },
      {
        type: "p",
        text: "You can also browse the full catalog at [macwall.app/wallpapers](/wallpapers) in any browser. Each detail page has a **Set on Mac** link that hands the wallpaper to the installed app through a `macwall://` deep link. If MacWall is not installed yet, the same link offers the download instead.",
      },
      { type: "h2", text: "Multiple displays" },
      {
        type: "ul",
        items: [
          "**Same loop everywhere** — one wallpaper mirrored across every connected display, decoded once.",
          "**Different loop per display** — select a display in MacWall, then set a wallpaper while it is focused.",
          "Disconnecting a display keeps its assignment. Reconnect it later and the wallpaper returns.",
        ],
      },
      { type: "h2", text: "Playlists and shuffle" },
      {
        type: "p",
        text: "Pro adds playlists: group favourites and let MacWall rotate them on an interval you choose. Rotation happens at the video layer, so switching loops does not touch your desktop layout or reset window positions.",
      },
    ],
    faq: [
      {
        question: "Will a live wallpaper cover my desktop icons?",
        answer:
          "No. MacWall renders at the wallpaper layer, below icons and windows, using the same compositing position as a static desktop picture.",
      },
      {
        question: "Does the loop keep playing in full screen apps?",
        answer:
          "By default MacWall pauses when a full screen app covers the display, because nothing is visible to animate. You can turn that rule off in Settings.",
      },
      {
        question: "How many wallpapers are in the catalog?",
        answer:
          "Over 1,000 curated loops, with new sets published regularly. Free includes a rotating selection; Pro unlocks the full cloud catalog.",
      },
    ],
  }),

  doc({
    section: "wallpapers",
    navLabel: "Import your own videos",
    slug: "import-your-own-videos",
    pathname: "/docs/import-your-own-videos",
    title: "Import Your Own Video as a Mac Wallpaper",
    headline: "Use your own video as a live wallpaper",
    description:
      "Drag any MP4, MOV, M4V, or GIF into MacWall to use it as a Mac live wallpaper, plus the encoding settings that keep playback smooth and efficient.",
    keywords: [
      "custom live wallpaper mac",
      "mp4 wallpaper mac",
      "own video wallpaper mac",
      "gif wallpaper mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "MacWall is not limited to the catalog. Any local video can become your wallpaper, and imported files stay on your Mac — nothing is uploaded when you import.",
      },
      { type: "h2", text: "Import a file" },
      {
        type: "ol",
        items: [
          "Open MacWall and go to **Library**.",
          "Drag your video into the window, or use **Import** and pick a file.",
          "Click the imported item, then **Set wallpaper**.",
        ],
      },
      { type: "h2", text: "Supported formats" },
      {
        type: "ul",
        items: [
          "**MP4 / M4V** with H.264 or HEVC — the best choice, both decode on Apple hardware.",
          "**MOV** with H.264, HEVC, or ProRes. ProRes works but is far larger than it needs to be for a wallpaper.",
          "**GIF** — converted on import to a video loop so playback stays efficient.",
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
          "**Audio**: strip it. MacWall does not play wallpaper audio, and the track only inflates the file.",
        ],
      },
      { type: "h2", text: "Why seamless loops matter" },
      {
        type: "p",
        text: "A wallpaper repeats hundreds of times an hour in your peripheral vision, so any cut at the loop point becomes the only thing you notice. Pick footage whose first and last frames are close — slow pans, drifting clouds, rain, particle drift — or crossfade the ends before exporting.",
      },
    ],
    faq: [
      {
        question: "Are imported videos uploaded anywhere?",
        answer:
          "No. Imports are read from disk and stay local. If you want a wallpaper published to the public catalog, submit it deliberately at [/submit](/submit).",
      },
      {
        question: "Is there a file size limit for imports?",
        answer:
          "No hard limit, but large ProRes files use more disk and more decode bandwidth. An HEVC export usually gives identical on-screen quality at a fraction of the size.",
      },
      {
        question: "Can I import videos on the free tier?",
        answer:
          "Yes. Importing your own MP4 and MOV clips works without Pro. Pro unlocks the full cloud catalog, playlists, and Lock Screen motion.",
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
    description:
      `Turn on MacWall's live Lock Screen and Screen Saver playback on ${macwallLockScreenMacOSVersion} and later, and understand the macOS limits behind it.`,
    keywords: [
      "live lock screen mac",
      "macos live screen saver",
      "macos 26 lock screen wallpaper",
      "macwall lock screen",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: `Live Lock Screen and Screen Saver playback is a Pro feature and requires ${macwallLockScreenMacOSVersion} or later. Below that version, macOS does not expose the wallpaper APIs that let a third-party app supply Lock Screen video, so MacWall keeps desktop-only playback.`,
      },
      { type: "h2", text: "Turn it on" },
      {
        type: "ol",
        items: [
          "Activate Pro — see [License and activation](/docs/license-and-activation).",
          "Open MacWall → **Settings** → **Lock Screen**.",
          "Enable **Live Lock Screen & Screen Saver**.",
          "Pick the wallpaper you want on the Lock Screen. It can be the same loop as your desktop or a different one.",
          "Lock your Mac (**Control-Command-Q**) to confirm the motion applies.",
        ],
      },
      { type: "h2", text: "How macOS handles it" },
      {
        type: "ul",
        items: [
          "macOS treats the Lock Screen video as a system wallpaper asset, so the loop is registered with the system rather than drawn by MacWall in real time.",
          "The Screen Saver and Lock Screen share the same asset — which is why enabling one shows motion in both.",
          "Applying a Lock Screen wallpaper takes a moment the first time: macOS re-encodes and indexes the asset before it appears.",
        ],
      },
      { type: "h2", text: "If motion does not appear" },
      {
        type: "ol",
        items: [
          "Confirm you are on a supported macOS version — System Settings → General → About.",
          "Confirm Pro is active in MacWall → Settings.",
          "Re-apply the wallpaper. If macOS cached a stale asset, re-applying replaces it.",
          "Check System Settings → Screen Saver: if another screen saver was selected after MacWall applied its asset, macOS uses that instead.",
          "Log out and back in. This is the reliable way to force macOS to reload wallpaper assets.",
        ],
      },
      {
        type: "p",
        text: `Still nothing? Send your macOS version and MacWall version to [${macwall.supportEmail}](mailto:${macwall.supportEmail}) — behaviour here changes between macOS betas and we track it per build in [the changelog](/changelog).`,
      },
    ],
    faq: [
      {
        question: "Does the Lock Screen video drain battery while locked?",
        answer:
          "The Lock Screen asset is played by macOS, and the display sleeps quickly once locked. When the display is asleep nothing is decoded. Desktop playback is separately governed by MacWall's pause rules.",
      },
      {
        question: "Can I get a live Lock Screen on macOS 14 or 15?",
        answer:
          `No app can. The API that lets third-party apps supply Lock Screen video did not exist before ${macwallLockScreenMacOSVersion}. Desktop live wallpapers work fine on macOS 14 and later.`,
      },
      {
        question: "Can the Lock Screen and desktop use different wallpapers?",
        answer:
          "Yes. Choose them independently in Settings — a calm loop for the Lock Screen and something busier on the desktop is a common setup.",
      },
    ],
  }),

  doc({
    section: "pro",
    navLabel: "License and activation",
    slug: "license-and-activation",
    pathname: "/docs/license-and-activation",
    title: "MacWall License & Activation",
    headline: "Activate your MacWall Pro license",
    description:
      `How MacWall Pro licensing works: one-time ${proPrice} purchase, instant key activation, up to ${maxMacs} Macs, and how to move a license to a new machine.`,
    keywords: [
      "macwall license",
      "macwall pro activation",
      "macwall license key",
      "transfer macwall license",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: `MacWall Pro is a one-time ${proPrice} purchase — not a subscription. You get a license key, lifetime updates, and activation on up to ${maxMacs} Macs you own. There is no account to create and no recurring charge.`,
      },
      { type: "h2", text: "Activate after purchase" },
      {
        type: "ol",
        items: [
          "Complete checkout from [/pricing](/pricing). Payment is processed by Stripe; MacWall never sees your card details.",
          "Stripe returns you to the activation page, which verifies the payment server-side and shows your license key.",
          "Click **Activate on this Mac**. That opens MacWall and applies the key automatically.",
          "Prefer manual entry? Open MacWall → **Settings** → **License**, paste the key, and click **Activate**.",
        ],
      },
      { type: "h2", text: "Lost your key" },
      {
        type: "p",
        text: `Your key is in the receipt Stripe emailed you. If you cannot find it, email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) from the address you paid with and we will resend it.`,
      },
      { type: "h2", text: "Move a license to a new Mac" },
      {
        type: "ul",
        items: [
          `A base license covers ${maxMacs} activations. Under that limit, just enter the same key on the new Mac.`,
          "At the limit, deactivate an old Mac in MacWall → Settings → License, which frees a slot immediately.",
          `No longer have the old Mac? Email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) with your key and we will release the seat.`,
          "Need more machines — a studio, a family, a lab? The Pro+ pack raises the limit; see [/pricing](/pricing).",
        ],
      },
      { type: "h2", text: "What Pro unlocks" },
      { type: "ul", items: [...macwall.proIncludedFeatures] },
      { type: "h2", text: "Refunds" },
      {
        type: "p",
        text: `If MacWall does not work on your Mac, email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) and we will refund you — the exact terms live in [Terms](/terms). Separately, the [creator program](/creator) refunds your purchase for posting a MacWall video that reaches the view thresholds.`,
      },
    ],
    faq: [
      {
        question: "Is MacWall Pro a subscription?",
        answer: `No. The permanent license is a single ${proPrice} payment with lifetime updates. An optional lower-cost annual plan exists for people who prefer it, but the one-time license is the default.`,
      },
      {
        question: "Does the license work offline?",
        answer:
          "Yes. Activation needs a network connection once. After that Pro features work offline; only browsing the cloud catalog requires internet.",
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
    headline: "Tune performance, CPU, and battery behaviour",
    description:
      "Every MacWall pause rule explained — battery, full screen, display sleep, high CPU — plus how to verify real CPU usage in Activity Monitor.",
    keywords: [
      "live wallpaper cpu usage mac",
      "macwall battery",
      "macwall performance settings",
      "mac wallpaper battery drain",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "MacWall's design goal is that you forget it is running. Video frames are decoded by Apple's media hardware through VideoToolbox and composited with Metal, so the CPU is not decoding pixels — and when nothing is visible, playback stops instead of running in the background.",
      },
      { type: "h2", text: "Pause rules" },
      {
        type: "ul",
        items: [
          "**Pause on battery** — stops playback whenever the Mac is unplugged. The single highest-impact setting on a laptop.",
          "**Pause in full screen** — a full screen app covers the wallpaper, so decoding it is pure waste.",
          "**Pause on display sleep / lock** — always on. Nothing decodes while the screen is off.",
          "**Pause on high CPU** — yields automatically during exports, compiles, and other heavy work, then resumes when load drops.",
          "**Pause on Low Power Mode** — follows the system energy preference you already set.",
        ],
      },
      { type: "h2", text: "Verify it yourself" },
      {
        type: "ol",
        items: [
          "Open **Activity Monitor** → **CPU** tab.",
          "Search for `MacWall` and watch the **% CPU** column with a wallpaper playing.",
          "Switch to the **Energy** tab and check **Energy Impact** over a few minutes.",
          "Pause from the menu bar and watch both values fall to effectively zero.",
        ],
      },
      {
        type: "p",
        text: "On a normal plugged-in desktop session, MacWall typically sits well under 1% CPU. Paused, it decodes nothing at all. The methodology and numbers are broken down in [the performance guide](/blog/macwall-performance-zero-overhead-guide).",
      },
      { type: "h2", text: "If usage looks higher than expected" },
      {
        type: "ul",
        items: [
          "**Check the source video.** A 60 fps 8K import costs far more to decode than a 4K 30 fps loop. Re-encode using the guidance in [Import your own videos](/docs/import-your-own-videos).",
          "**Check codec support.** Unusual codecs can fall back to software decode. H.264 and HEVC always use hardware.",
          "**Count displays.** Separate loops on several 4K panels multiply decode work; mirroring one loop decodes once.",
          "**Check for a competing wallpaper app.** Two apps fighting over the wallpaper layer will both keep working — and both keep drawing.",
        ],
      },
    ],
    faq: [
      {
        question: "Will a live wallpaper drain my MacBook battery?",
        answer:
          "With pause-on-battery enabled the answer is effectively no, because playback stops the moment you unplug. With it disabled, expect a modest cost similar to a small video playing in a window.",
      },
      {
        question: "Does MacWall run when the lid is closed?",
        answer:
          "No. Display sleep stops playback unconditionally, and closing the lid sleeps the display.",
      },
      {
        question: "Does MacWall affect gaming performance?",
        answer:
          "Games run full screen, and pause-in-full-screen stops the wallpaper there. Combined with pause-on-high-CPU, MacWall stays out of the way during demanding work.",
      },
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
      "Wallpaper not showing, playback stuck on one frame, downloads failing, black screen after a macOS update — with the fix for each.",
    keywords: [
      "macwall not working",
      "live wallpaper not showing mac",
      "macwall troubleshooting",
      "mac wallpaper black screen",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "Most issues come from one of four causes: macOS cached the previous wallpaper, a pause rule is doing exactly what you asked, another wallpaper app is competing for the same layer, or a macOS update changed wallpaper behaviour. Work through the matching section below.",
      },
      { type: "h2", text: "Wallpaper does not appear" },
      {
        type: "ol",
        items: [
          "Check the MacWall menu bar item — if it shows **Paused**, resume.",
          "Confirm no pause rule is active: unplugged with pause-on-battery on, or a full screen app in front.",
          "Re-apply the wallpaper from MacWall. This overwrites a stale macOS wallpaper asset.",
          "Quit and relaunch MacWall.",
          "Log out and back in, which forces macOS to reload wallpaper assets.",
        ],
      },
      { type: "h2", text: "Playback is frozen on one frame" },
      {
        type: "p",
        text: "A frozen frame is what a paused wallpaper looks like — that is deliberate, not a crash. Resume from the menu bar. If it re-pauses immediately, a rule is firing: battery, high CPU, or Low Power Mode. Review them in [Performance and battery](/docs/performance-and-battery).",
      },
      { type: "h2", text: "Downloads fail or stall" },
      {
        type: "ul",
        items: [
          "Catalog videos are served over HTTPS from a CDN. A VPN, corporate proxy, or content filter can block them — try with it off.",
          "Confirm free disk space. 4K loops are large and a failed write looks like a stalled download.",
          "Retry from the wallpaper's detail view; MacWall resumes rather than restarting from zero.",
        ],
      },
      { type: "h2", text: "Black desktop after a macOS update" },
      {
        type: "ol",
        items: [
          "Update MacWall first — [/download](/download) always serves the current build, and wallpaper behaviour changes between macOS releases.",
          "Set a plain static wallpaper in System Settings, then re-apply your MacWall wallpaper. This clears a broken asset.",
          "If the desktop stays black, restart. macOS occasionally needs one restart after a wallpaper subsystem change.",
        ],
      },
      { type: "h2", text: "Lock Screen motion missing" },
      {
        type: "p",
        text: "Lock Screen playback needs Pro and a supported macOS version. The full checklist is in [Live Lock Screen and Screen Saver](/docs/live-lock-screen-and-screen-saver).",
      },
      { type: "h2", text: "Still stuck" },
      {
        type: "p",
        text: `Email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) with your macOS version, Mac model, MacWall version, and what you already tried. The [Discord community](${macwall.discordInvite}) is often faster for setup questions.`,
      },
    ],
    faq: [
      {
        question: "Can I run MacWall alongside another wallpaper app?",
        answer:
          "Not reliably. Two apps writing the wallpaper layer will override each other and both keep consuming resources. Quit the other app before troubleshooting MacWall.",
      },
      {
        question: "How do I report a bug?",
        answer:
          `Email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) with your macOS and MacWall versions and steps to reproduce. Fixes ship in the next release and are listed in [the changelog](/changelog).`,
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
      "Remove MacWall and every cached wallpaper video from your Mac, restore your static desktop picture, and keep your license for later.",
    keywords: [
      "uninstall macwall",
      "remove macwall mac",
      "delete live wallpaper app mac",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
    sections: [
      {
        type: "p",
        text: "MacWall installs no kernel extensions, no launch daemons, and no background installer. Removing it is a normal app removal plus one support folder if you also want the cached videos gone.",
      },
      { type: "h2", text: "Remove the app" },
      {
        type: "ol",
        items: [
          "Click the MacWall menu bar icon → **Quit MacWall**. Quitting restores your previous static desktop picture.",
          "Open **Applications** and move **MacWall** to the Trash.",
          "Empty the Trash.",
        ],
      },
      { type: "h2", text: "Remove cached wallpapers and settings" },
      {
        type: "ol",
        items: [
          "In Finder press **Shift-Command-G** and go to `~/Library/Application Support/`.",
          "Delete the **MacWall** folder — this is where downloaded and imported loops are cached.",
          "Go to `~/Library/Preferences/` and delete the MacWall `.plist` file to clear settings.",
          "Empty the Trash and restart if you want the wallpaper subsystem fully reset.",
        ],
      },
      { type: "h2", text: "Your license after uninstalling" },
      {
        type: "p",
        text: `A Pro license belongs to you, not to the install. Keep the key: reinstalling and re-entering it restores Pro. If you are uninstalling to free an activation slot, deactivate in Settings → License **before** removing the app, or email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) and we will release the seat.`,
      },
    ],
    faq: [
      {
        question: "Does uninstalling change my desktop wallpaper back?",
        answer:
          "Yes. Quitting MacWall restores the static picture you had before, so you never end up on a frozen frame or a black desktop.",
      },
      {
        question: "Do I lose imported videos?",
        answer:
          "Your original files are untouched wherever you keep them. Only MacWall's cached copies in Application Support are removed.",
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
      "Read-only MacWall endpoints for the wallpaper catalog and release metadata, plus the RSS, JSON Feed, llms.txt, and API catalog documents that describe this site.",
    keywords: [
      "macwall api",
      "wallpaper api",
      "macwall rss feed",
      "macwall llms.txt",
      "api catalog",
    ],
    publishedAt: "2026-08-02",
    updatedAt,
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
          "`q` — free-text search across name and tags.",
          `\`category\` — one of ${macwall.categories.join(", ")}.`,
          "`tag` — filter by a single tag.",
          "`sort` — `newest` (default), `popular`, or `older`.",
          "`page` — 1-based page number, default `1`.",
          "`limit` — items per page, default `24`.",
        ],
      },
      {
        type: "p",
        text: "Returns `{ wallpapers, total, page, limit, hasMore }`. Each wallpaper includes `id`, `name`, `category`, `tags`, `resolution`, `durationSeconds`, `fileSizeBytes`, `thumbUrl`, `videoUrl`, `isPro`, `isFeatured`, `likeCount`, and `createdAt`. Pro assets are marked with `isPro` and require a license in the app to use.",
      },
      { type: "h2", text: "Releases: GET /api/installers/releases/version.json" },
      {
        type: "p",
        text: "Current release metadata — `version`, optional `build`, a download `url`, and optional `notes`. This is the same feed the in-app updater reads and the source for [the changelog](/changelog). It is intentionally uncached so a new build is visible immediately.",
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
          "[/.well-known/api-catalog](/.well-known/api-catalog) — RFC 9727 API catalog in `application/linkset+json`.",
          "[/openapi.json](/openapi.json) — OpenAPI 3.1 description of the endpoints above.",
          "[/llms.txt](/llms.txt) — curated Markdown index of the whole site for language models.",
          "[/llms-full.txt](/llms-full.txt) — every content page concatenated as one Markdown document.",
          "[/rss.xml](/rss.xml), [/atom.xml](/atom.xml), [/feed.json](/feed.json) — blog feeds in RSS 2.0, Atom 1.0, and JSON Feed 1.1.",
          "[/sitemap.xml](/sitemap.xml) and [/robots.txt](/robots.txt) — crawl surface.",
          "[/ai.txt](/ai.txt) and [/crawlers](/crawlers) — AI and crawler usage policy.",
        ],
      },
      { type: "h2", text: "Markdown twin of every page" },
      {
        type: "p",
        text: "Append `.md` to any content URL to get a clean Markdown version with YAML frontmatter — for example `/blog/what-is-macwall-complete-guide.md` or `/docs/public-api.md`. These responses are `text/markdown` and `noindex`, so they exist for agents and pipelines without competing with the HTML page in search.",
      },
      { type: "h2", text: "Fair use" },
      {
        type: "ul",
        items: [
          "Cache responses and keep request rates reasonable — these endpoints are shared infrastructure, not a bulk export.",
          "Hotlinking video files is discouraged; link to the wallpaper page or the app deep link instead.",
          "Wallpaper videos are licensed for use inside MacWall and are not redistributable — see [Terms](/terms).",
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
          "Response shapes are additive — new fields may appear, existing ones are not renamed or removed without notice in [the changelog](/changelog).",
      },
      {
        question: "Can I use the catalog data in my own app?",
        answer:
          `Metadata, yes, with attribution and a link back to macwall.app. The wallpaper videos themselves are licensed for MacWall use only. Ask first at [${macwall.supportEmail}](mailto:${macwall.supportEmail}).`,
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
