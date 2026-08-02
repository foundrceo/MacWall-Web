import type { ChangelogRelease } from "@/lib/changelog/types"

/**
 * FROZEN historical seed for /changelog (v1.3 → last hand-shipped window).
 *
 * Do NOT edit this for new releases. Shipping is fully automated:
 *   1. Publish Mac build → update R2 `releases/version.json` (version + notes)
 *   2. Optional: append structured releases to R2 `releases/changelog.json`
 *   3. /changelog merges seed + feed + live updater on every request
 *   4. Leak filter drops internal lines automatically
 */
export const curatedChangelogReleases: readonly ChangelogRelease[] = [
  {
    id: "v2.9",
    version: "2.9",
    build: 1,
    date: "2026-07-24T09:35:56.000Z",
    sections: [
      {
        kind: "highlights",
        items: [
          "Major stability update with bug fixes across the board.",
          "Browse the full wallpaper gallery and set wallpapers from macwall.app.",
          "MacWall Assist live support chat.",
        ],
      },
      {
        kind: "features",
        items: [
          "Open wallpapers from macwall.app links directly in MacWall.",
          "Pro+ licenses now support 10, 15, or 20 Macs.",
          "Redesigned Settings with a native sidebar layout.",
          "In-app Release Notes sheet when updates are available.",
          "Command palette to jump anywhere instantly (⌘K).",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Refreshed app icon to match macwall.app.",
          "Simplified Settings rows and window layout.",
          "Paywall and upgrade flow polish in Settings.",
          "Limited-time sale banner with responsive layout.",
          "Faster checkout when upgrading to Pro.",
          "Discord members get 10% off on the pricing page.",
          "Live Support can share images in conversations.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Smoother Assist chat handoff with fewer duplicate tickets.",
        ],
      },
    ],
  },
  {
    id: "v2.8",
    version: "2.8",
    date: "2026-07-20T17:18:40.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Affiliate partner program page for creators.",
          "Animated pricing amounts on the plans page.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Faster wallpaper browsing and extension performance.",
          "Smoother video wallpaper playback and system integration.",
          "Refreshed homepage, blog, pricing, and submit flows.",
          "Discord community link restored across macwall.app.",
        ],
      },
    ],
  },
  {
    id: "v2.7",
    version: "2.7",
    date: "2026-07-13T14:49:39.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Three clear tiers: Free, Pro, and Pro+.",
          "Dedicated Reel Refund page with step-by-step instructions.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Improved wallpaper management and catalog performance.",
          "Pricing page redesigned with cleaner plan cards.",
          "All paid plans are now permanent — no annual subscriptions.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Reel Refund steps now show complete instructions.",
        ],
      },
    ],
  },
  {
    id: "v2.6",
    version: "2.6",
    date: "2026-07-04T15:14:32.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Pro plan covers 1 Mac; Pro+ adds multi-Mac licensing.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Onboarding resumes at the paywall after relaunch.",
          "Updated onboarding video playback.",
          "Renamed Pro Max to Pro+ across plans and license copy.",
          "Paywall footer links moved below the buy button.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Pricing page layout fixed on smaller screens.",
        ],
      },
    ],
  },
  {
    id: "v2.5",
    version: "2.5",
    date: "2026-06-28T18:09:23.000Z",
    sections: [
      {
        kind: "highlights",
        items: [
          "In-app support chat with image attachments.",
          "Web support center for help without leaving macwall.app.",
        ],
      },
      {
        kind: "features",
        items: [
          "Submit feedback and report wallpaper issues from inside MacWall.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Onboarding polish and clearer apply progress HUD.",
          "More reliable wallpaper extension after sleep and wake.",
          "Menu bar preview stays in sync with your wallpaper.",
          "App updates moved to a capsule in the title bar.",
          "Checkout supports more payment methods.",
          "License keys arrive faster after purchase.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Extension reliability fixes across apply and restart.",
        ],
      },
    ],
  },
  {
    id: "v2.4",
    version: "2.4",
    date: "2026-06-26T05:56:20.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Smoother wallpaper apply and caching with MacWallExtension.",
          "Submit your own wallpapers for the MacWall catalog.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Premium browse grid and hero typography.",
          "Faster caching for wallpapers and thumbnails.",
          "Faster wallpaper video loading across the catalog.",
          "Copy updated for macOS 26 Tahoe compatibility.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fixed live wallpaper freezes and black desktop after sleep.",
          "Wallpaper apply sync with System Settings improved.",
          "Reduced black flashes when switching wallpapers.",
        ],
      },
    ],
  },
  {
    id: "v2.3",
    version: "2.3",
    date: "2026-06-14T18:58:51.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Lock Screen wallpaper support enhanced for latest macOS.",
          "Clearer refund policy and footer links.",
          "Sharper homepage tagline and social sharing cards.",
          "More guides for live wallpapers on Mac.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Social preview images show the correct title and artwork.",
        ],
      },
    ],
  },
  {
    id: "v2.2",
    version: "2.2",
    date: "2026-06-13T12:24:30.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "New blog with Mac wallpaper guides.",
          "Homepage walkthrough showing how MacWall works.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Improved playback sync and pause handling.",
          "Enhanced video controls and tooltips.",
          "Smoother hero and lock-screen demo videos.",
          "Purchase confirmation page after buying a license.",
        ],
      },
    ],
  },
  {
    id: "v2.1",
    version: "2.1",
    date: "2026-06-12T19:06:44.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Improved trial and license storage reliability.",
          "Gallery previews load faster with sharper thumbnails.",
          "Updated homepage, pricing copy, and navigation.",
        ],
      },
    ],
  },
  {
    id: "v2.0",
    version: "2.0",
    date: "2026-06-10T17:37:53.000Z",
    sections: [
      {
        kind: "highlights",
        items: [
          "Buy and activate Pro with checkout built into MacWall.",
          "macwall.app launches with wallpaper previews and download.",
        ],
      },
      {
        kind: "features",
        items: [
          "Pro upsell modal after trial ends.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Polished onboarding paywall layout.",
          "Cleaner marketing layout and updated branding.",
          "Improved page titles and descriptions for sharing.",
        ],
      },
    ],
  },
  {
    id: "v1.9",
    version: "1.9",
    date: "2026-06-08T15:42:38.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Free tier with curated wallpaper access.",
          "24-hour Pro trial to explore the full catalog.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Redesigned onboarding and conversion flow.",
        ],
      },
    ],
  },
  {
    id: "v1.6",
    version: "1.6",
    date: "2026-06-07T04:20:50.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Menu bar popover to preview and control wallpapers.",
          "Lock Screen wallpaper integration.",
          "Multi-display audio routing.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Battery-aware pause on low power.",
          "Better playback sync across displays.",
          "Display picker for choosing which screen to wallpaper.",
        ],
      },
    ],
  },
  {
    id: "v1.4",
    version: "1.4",
    date: "2026-06-05T06:55:29.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Community wallpaper uploads with video submission.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Smoother video playback and lower memory use.",
          "Custom window chrome and cleaner layout.",
          "Optional 120 FPS playback on supported displays.",
          "Factory reset option in Settings.",
        ],
      },
    ],
  },
  {
    id: "v1.3",
    version: "1.3",
    date: "2026-06-04T23:31:35.000Z",
    sections: [
      {
        kind: "highlights",
        items: [
          "MacWall launches on macOS with a live 4K wallpaper engine.",
        ],
      },
      {
        kind: "features",
        items: [
          "Onboarding walkthrough for first-time setup.",
          "Built-in updater for one-click app updates.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Video quality and frame rate controls in Settings.",
          "Wallpapers cache locally for faster replay.",
          "Transition effects when switching wallpapers.",
        ],
      },
    ],
  },
] as const

export const CHANGELOG_TOTAL_PUBLIC_ENTRIES = curatedChangelogReleases.reduce(
  (sum, release) =>
    sum +
    release.sections.reduce(
      (sectionSum, section) => sectionSum + section.items.length,
      0
    ),
  0
)
