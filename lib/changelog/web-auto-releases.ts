/**
 * AUTO-GENERATED — do not edit.
 * Built from public-safe website git commits by scripts/generate-changelog.mjs
 */
import type { ChangelogRelease } from "@/lib/changelog/types"

export const webAutoChangelogReleases: readonly ChangelogRelease[] = [
  {
    id: "web-2026-09-18",
    version: "2026.9.18",
    date: "2026-09-18T12:00:00.000Z",
    sections: [
      {
        kind: "improvements",
        items: [
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
