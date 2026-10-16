/**
 * Recordings the home page still needs. A slot without `src` renders as an
 * empty framed space that names what goes there. To fill one, upload the
 * video to R2 under `assets/hero/` (see `marketing-assets-urls.ts`), set `src`,
 * and put a small `poster` in `public/hero/`.
 *
 * Videos: H.264 MP4, muted, a clean loop, about 1600 px wide, under ~4 MB.
 */

import { MARKETING_MUSIC_SYNC_VIDEO_MP4_URL } from "@/lib/marketing-assets-urls"

export type MarketingMediaSlot = {
  /** Short name shown on the empty frame and used as the accessible label. */
  label: string
  /** What the recording shows. Shown small on the empty frame. */
  note: string
  src?: string
  poster?: string
}

export const marketingMediaSlots = {
  musicSync: {
    label: "Music Sync: synced lyrics on the Lock Screen",
    note: "A song playing in Apple Music or Spotify: the desktop visual moving on the beat, then the Lock Screen player or lyrics.",
    src: MARKETING_MUSIC_SYNC_VIDEO_MP4_URL,
    poster: "/hero/music-sync-poster.avif",
  },
} satisfies Record<string, MarketingMediaSlot>

export type MarketingMediaSlotId = keyof typeof marketingMediaSlots
