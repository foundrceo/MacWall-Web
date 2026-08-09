/**
 * AUTO-GENERATED — do not edit.
 * Built from public-safe website git commits by scripts/generate-changelog.mjs
 */
import type { ChangelogRelease } from "@/lib/changelog/types"

export const webAutoChangelogReleases: readonly ChangelogRelease[] = [
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
