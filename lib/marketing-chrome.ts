/** Shared Tailwind classes for launch banner + navbar chrome (Palmier-style layout). */

/** Fixed banner height — keep copy on one line so nav offset stays accurate. */
export const LAUNCH_BANNER_HEIGHT = "h-9"

export const LAUNCH_BANNER_CLASS = `fixed inset-x-0 top-0 z-[51] ${LAUNCH_BANNER_HEIGHT} border-b border-black/10 bg-white lg:static lg:z-auto`

/** Nav sits directly under the fixed banner on small screens; sticky from `lg`. */
export const NAVBAR_HEADER_CLASS =
  "fixed inset-x-0 top-9 z-50 bg-background/45 backdrop-blur-xl backdrop-saturate-150 lg:sticky lg:inset-x-auto lg:top-0"

/** `<main>` offset under fixed banner (2.25rem) + nav (3.5rem) below `lg`. */
export const MARKETING_MAIN_OFFSET_CLASS = "pt-[calc(2.25rem+3.5rem)] lg:pt-0"

export const MARKETING_PAGE_CLASS =
  "min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground"

/** Consistent page gutters across marketing sections. */
export const MARKETING_CONTAINER_CLASS =
  "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10"

/** Narrower content rail used by features / community. */
export const MARKETING_SECTION_CLASS =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10"

export const HERO_PRIMARY_BTN_CLASS =
  "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] font-medium text-black transition-opacity hover:opacity-90"

export const HERO_SECONDARY_BTN_CLASS =
  "inline-flex items-center rounded-full bg-[#222222] px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"

export const HERO_DOWNLOAD_HINT_CLASS =
  "mt-1.5 text-center text-[12px] text-muted-foreground"

export const MARKETING_INLINE_LINK_CLASS =
  "text-[#0066cc] no-underline transition-opacity hover:underline hover:opacity-80"
