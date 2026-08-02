/**
 * Shared Tailwind chrome for the public wallpaper gallery.
 * Apple-inspired: capsules for controls, continuous media radii, crisp type.
 */

/** Space from breadcrumb row to page title (H1). */
export const GALLERY_TITLE_AFTER_BREADCRUMB_CLASS = "mt-5"

/** Gallery title block bottom padding (before category chips / media). */
export const GALLERY_TITLE_BLOCK_BOTTOM_CLASS = "pb-4"

/** Subtitle spacing below H1. */
export const GALLERY_SUBTITLE_AFTER_TITLE_CLASS = "mt-2"

/** Search / filter controls below title + subtitle. */
export const GALLERY_CONTROLS_AFTER_TITLE_BLOCK_CLASS = "mt-5"

/** Capsule control — chips, pills, CTAs. */
export const GALLERY_CAPSULE_CLASS = "rounded-full"

/** Continuous media corner (Apple-like, ~22px). */
export const GALLERY_MEDIA_RADIUS_CLASS = "rounded-[22px]"

/** Soft panel radius (aside / grouped surfaces). */
export const GALLERY_PANEL_RADIUS_CLASS = "rounded-[22px]"

/** Soft surface fill used on chips / panels / search. */
export const GALLERY_SURFACE_CLASS =
  "border-0 bg-white/[0.08] shadow-none ring-0"

export const GALLERY_SURFACE_HOVER_CLASS =
  "hover:bg-white/[0.12]"

/** Primary body text — full white. */
export const GALLERY_TEXT_PRIMARY_CLASS = "text-white"

/** Secondary copy — readable, not washed out. */
export const GALLERY_TEXT_SECONDARY_CLASS = "text-white/72"

/** Tertiary / meta labels. */
export const GALLERY_TEXT_TERTIARY_CLASS = "text-white/55"

/** Hairline divider. */
export const GALLERY_DIVIDER_CLASS = "bg-white/[0.08]"

/** Capsule search field — custom clear only (no native WebKit cancel). */
export const GALLERY_SEARCH_INPUT_CLASS =
  "h-11 w-full rounded-full border-0 bg-white/[0.08] py-0 pl-11 text-[15px] text-white shadow-none ring-0 placeholder:text-white/45 focus-visible:border-0 focus-visible:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-white/25 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden"

/** Inactive capsule chip — icon + label. */
export const GALLERY_CHIP_CLASS =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border-0 bg-white/[0.08] px-3.5 text-[13px] font-normal text-white/70 shadow-none ring-0 transition duration-200 ease-out hover:bg-white/[0.12] hover:text-white focus-visible:ring-2 focus-visible:ring-white/25"

/** Active capsule chip (inverted) — icon + label. */
export const GALLERY_CHIP_ACTIVE_CLASS =
  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border-0 bg-white px-3.5 text-[13px] font-normal text-black shadow-none ring-0 transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/50"

/** Sort dropdown panel — dark Apple-like menu (no Select checkmarks). */
export const GALLERY_SORT_MENU_CLASS =
  "flex min-w-[var(--radix-dropdown-menu-trigger-width)] flex-col gap-0.5 rounded-xl border-0 bg-[#2a2a2c]/95 p-1 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-xl"

/** Sort dropdown row — consistent height and inset from panel edge. */
export const GALLERY_SORT_MENU_ITEM_CLASS =
  "h-8 min-h-8 cursor-pointer gap-0 rounded-[10px] px-2.5 py-0 text-[13px] font-normal focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10"

/** Quick-filter tag under search. */
export const GALLERY_TRY_TAG_CLASS =
  "inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[13px] text-white/55 transition duration-200 hover:bg-white/[0.07] hover:text-white/85"

/** Active quick-filter tag. */
export const GALLERY_TRY_TAG_ACTIVE_CLASS =
  "bg-white/[0.12] text-white hover:bg-white/[0.14] hover:text-white"

/** Sort trigger capsule. */
export const GALLERY_SORT_TRIGGER_CLASS =
  "h-9 min-w-[7.25rem] rounded-full border-0 bg-white/[0.08] px-3 text-[13px] text-white/70 shadow-none ring-0 hover:bg-white/[0.12] hover:text-white focus-visible:ring-2 focus-visible:ring-white/25"

/** Secondary capsule button (share / load more). */
export const GALLERY_CAPSULE_BTN_CLASS =
  "h-10 rounded-full border-0 bg-white/[0.08] px-5 font-sans text-[14px] font-normal text-white/70 shadow-none ring-0 hover:bg-white/[0.12] hover:text-white focus-visible:ring-2 focus-visible:ring-white/25"

/** Primary capsule CTA (Set on Mac). */
export const GALLERY_PRIMARY_CTA_CLASS =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 font-sans text-[14px] font-normal text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
