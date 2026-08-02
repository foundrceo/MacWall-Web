/**
 * Public gallery typography (MacWall).
 *
 * - Geist (`font-sans font-normal`) for UI, cards, meta, controls.
 * - Instrument Serif (`font-serif`) ONLY for large display H1s (~30px+).
 */

export const WALLPAPER_SECTION_FONT_CLASS = "font-sans font-normal text-white"

export const WALLPAPER_DISPLAY_HEADING_CLASS =
  "font-serif text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.08] tracking-[-0.025em] text-white text-balance"

/** Detail page H1 — wider layout, max two lines. */
export const WALLPAPER_DETAIL_HEADING_CLASS =
  "font-serif text-[clamp(1.875rem,3.6vw,2.625rem)] font-normal leading-[1.12] tracking-[-0.025em] text-white text-balance line-clamp-2"

export const WALLPAPER_SECTION_HEADING_CLASS =
  "!font-sans text-[clamp(1.35rem,2.5vw,1.75rem)] font-normal tracking-[-0.02em] text-white"

/** Instrument Serif section titles (e.g. “More like this”). */
export const WALLPAPER_SECTION_SERIF_HEADING_CLASS =
  "font-serif text-[clamp(1.5rem,2.5vw,1.875rem)] font-normal leading-[1.12] tracking-[-0.02em] text-white"

export const WALLPAPER_UI_TEXT_CLASS = "font-sans font-normal"
