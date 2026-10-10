/**
 * AUTO-GENERATED — do not edit.
 * Built from public-safe website git commits by scripts/generate-changelog.mjs
 */
import type { ChangelogRelease } from "@/lib/changelog/types"

export const webAutoChangelogReleases: readonly ChangelogRelease[] = [
  {
    id: "web-2026-10-10",
    version: "2026.10.10",
    date: "2026-10-10T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Clarify public asset licenses and improve download email feedback.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-07",
    version: "2026.10.7",
    date: "2026-10-07T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Gallery, category and collection pages: Download free button and sticky bar.",
          "Public wallpaper gallery with search, SEO, and app deep links.",
          "New share image: headline beside a Mac screen with a live wallpaper.",
          "Hero: new app video, 1080p on wide screens, played at 0.75x.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Get Pro: money-back guarantee and key-by-email lines under every button.",
          "Wallpaper banner: free trial first for browsers that never downloaded.",
          "Install guide: step 4 shows where Try Free is on the first-run paywall.",
          "Send to my Mac: one button, the email field opens in a pop-up.",
          "Help center: topic cards, search, still-stuck contact; help in ⌘K.",
          "Clearer pricing cards, benefits, and upgrade prompts.",
          "Discord members get 10% off on the pricing page.",
          "Phones and Windows: email me the download link; Set on Mac per device.",
          "Hero video: play at 0.6x.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-06",
    version: "2026.10.6",
    date: "2026-10-06T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Homepage: new hero, navbar, category strip and License pop-up.",
          "Homepage: every feature, one rhythm; support FAQ; new 404 and error pages.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Install guide: double-click animation on the DMG in step 1.",
          "Install guide after download, CTA lab.",
          "Homepage: features as rows, Apple-style footer, design labs.",
          "Everything in the app: no scroll-in animation.",
          "Homepage: Playback as a moments table, cleaner feature grid, fewer sections.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-05",
    version: "2026.10.5",
    date: "2026-10-05T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "New MacWall icon on the site: favicons, touch icons, email logo.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-03",
    version: "2026.10.3",
    date: "2026-10-03T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Set on Mac opens the app: top-level macwall:// link, not a hidden iframe.",
          "App update email: send-app-update-emails function.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-02",
    version: "2026.10.2",
    date: "2026-10-02T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "License email: restore the original footnote.",
          "Cashfree: email the key only for orders whose email the buyer typed.",
          "Rights declaration, moderation log and honest attribution on the website.",
          "Wallpaper pages: credit real uploaders only, drop the MacWall catalog label.",
          "Offer a 14-day money-back guarantee on every license.",
          "Stop asking customers to wait before disputing a charge.",
        ],
      },
    ],
  },
  {
    id: "web-2026-10-01",
    version: "2026.10.1",
    date: "2026-10-01T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Add cookie consent for EEA/UK/CH and honor Global Privacy Control.",
          "Add a Contact page with support, billing and company details.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Fill remaining legal gaps: trial, submissions, cookies, vendors, DMCA agent.",
          "Complete the legal pages and show terms at the point of sale.",
          "Show only real social proof and true catalog numbers.",
          "Show OG APPS, LLC as the legal owner of MacWall (#3).",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-28",
    version: "2026.9.28",
    date: "2026-09-28T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Performance: static gallery, lazy palette/modal, leaner preloads.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Pricing: never show a bare $ for non-US currencies.",
          "Send phones and Windows to the send-to-Mac hero instead of the DMG.",
          "Set on Mac opens the app in place, never redirects or auto-downloads.",
          "Player: LCP poster fetchpriority + stuck-timer master fallback.",
          "Checkout hygiene: keep bots out, prune dead pending licenses.",
          "Faster checkout when upgrading to Pro.",
          "Stop serving full-res wallpaper masters; show ≈ USD beside local price (#2).",
          "Pricing page redesign, prerendered with full content.",
          "Limited-time sale banner with responsive layout.",
          "SEO/AEO/GEO: 45 wallpaper collections, richer wallpaper pages, answer-first guides (#1).",
          "Checkout: stop prefilling customer_email so every buyer gets the local-currency option.",
          "Checkout: look up the visitor's country by IP when geo headers are missing.",
          "Stop queueing legacy checkout_started recovery rows.",
          "Use discount@macwall.app for reel refund email.",
          "Reply-To support on license emails.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fix wallpaper previews, Set on Mac deep link, dev preview headers.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-26",
    version: "2026.9.26",
    date: "2026-09-26T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Tighten conversion email CTAs and attribute checkout clicks.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-20",
    version: "2026.9.20",
    date: "2026-09-20T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Allowlist WALL50 so the 50% email offer auto-applies at checkout.",
          "Capture known emails on checkout so abandoned sessions can be recovered.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-19",
    version: "2026.9.19",
    date: "2026-09-19T12:00:00.000Z",
    sections: [
      {
        kind: "fixes",
        items: [
          "Creators tracker, skeleton reveal system, grouped nav, portal popup fix.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-18",
    version: "2026.9.18",
    date: "2026-09-18T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Creator rebuild, instant pricing, capsule buttons, docs polish.",
          "Instant regional pricing via cache, blank until resolved.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-15",
    version: "2026.9.15",
    date: "2026-09-15T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "MacWall Assist live support chat improvements.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-14",
    version: "2026.9.14",
    date: "2026-09-14T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Restore throttled email crons after Resend Pro backfill.",
          "Pause trial and recovery mail crons until license keys catch up.",
          "Scan newest paid licenses when backfilling missing key emails.",
          "Mail trial-ended conversion offers only to people who did not buy.",
          "Tighten pricing hero copy to a one-line conversion pitch.",
          "Ship the Geist marketing site with shared dashed chrome.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fix license key emails failing behind Resend 429s.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-12",
    version: "2026.9.12",
    date: "2026-09-12T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Ship landing refresh, Bend, Stealth CTA, and pricing polish.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-08",
    version: "2026.9.8",
    date: "2026-09-08T12:00:00.000Z",
    sections: [
      {
        kind: "fixes",
        items: [
          "Fix conversion funnel: checkout errors, CTAs, copy, and performance.",
        ],
      },
    ],
  },
  {
    id: "web-2026-09-06",
    version: "2026.9.6",
    date: "2026-09-06T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Remove website visitor chat and public wallpaper upload so support stays in the app.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-30",
    version: "2026.8.30",
    date: "2026-08-30T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Public changelog page synced with shipping updates.",
          "Align the site catalog with the nine app categories.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-27",
    version: "2026.8.27",
    date: "2026-08-27T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Feat: add canonical AI GEO content.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-09",
    version: "2026.8.9",
    date: "2026-08-09T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Raise site minimum to macOS 15 for MacWall 3.5.",
          "Overhaul marketing copy, pricing UX, and hero assets for conversion.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-08",
    version: "2026.8.8",
    date: "2026-08-08T12:00:00.000Z",
    sections: [
      {
        kind: "fixes",
        items: [
          "Fix checkout recovery mail for failed and abandoned payments.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-07",
    version: "2026.8.7",
    date: "2026-08-07T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Remove one-off recovery backfill artifacts now that sends are automatic.",
          "Ship Apple-style license and recovery emails end-to-end.",
          "Call macwall-apns with an explicit service-role fetch.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fix checkout recovery so conversion mail actually sends.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-06",
    version: "2026.8.6",
    date: "2026-08-06T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
          "Show one social-proof toast at a time instead of stacking.",
          "Public changelog page synced with shipping updates.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-04",
    version: "2026.8.4",
    date: "2026-08-04T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Public wallpaper gallery with search, SEO, and app deep links.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "Clearer pricing cards, benefits, and upgrade prompts.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fix blank wallpaper player caused by expired ISR signed URLs.",
          "Fix gallery Back wiping Show more and jumping to the footer.",
        ],
      },
    ],
  },
  {
    id: "web-2026-08-03",
    version: "2026.8.3",
    date: "2026-08-03T12:00:00.000Z",
    sections: [
      {
        kind: "features",
        items: [
          "Add legal hub and policy pages.",
          "Add social proof popups.",
        ],
      },
      {
        kind: "improvements",
        items: [
          "MacWall Assist live support chat improvements.",
          "Remove copyrighted wallpaper from catalog.",
          "Update license.",
          "Cleanup site copy.",
          "Speed up the site a bit.",
          "Public changelog page synced with shipping updates.",
          "Tweak social proof toasts.",
          "Tweak social proof timing.",
          "Tweak license modal.",
          "Tweak hero license modal.",
        ],
      },
      {
        kind: "fixes",
        items: [
          "Fix pricing review avatar build by using name in alt text.",
          "Fix marketing links.",
          "Fix blog thumbs.",
        ],
      },
    ],
  },
]
