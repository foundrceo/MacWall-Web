/** Shared Tailwind classes for launch banner + navbar chrome (Palmier-style layout). */

export const LAUNCH_BANNER_CLASS =
  "fixed inset-x-0 top-0 z-[51] border-b border-black/10 bg-white md:static md:z-auto"

export const NAVBAR_HEADER_CLASS =
  "fixed inset-x-0 top-[3.25rem] z-50 bg-background/45 backdrop-blur-xl backdrop-saturate-150 sm:top-9 md:sticky md:inset-x-auto md:top-0"

/** `<main>` offset under fixed banner (3.25rem / sm:2.25rem) + nav (3.5rem) on mobile. */
export const MARKETING_MAIN_OFFSET_CLASS =
  "pt-[calc(3.25rem+3.5rem)] sm:pt-[calc(2.25rem+3.5rem)] md:pt-0"

export const MARKETING_PAGE_CLASS =
  "min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground"

export const HERO_PRIMARY_BTN_CLASS =
  "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] font-medium text-black transition-opacity hover:opacity-90"

export const HERO_SECONDARY_BTN_CLASS =
  "inline-flex items-center rounded-full bg-[#222222] px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"

export const HERO_DOWNLOAD_HINT_CLASS =
  "absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap text-center text-[12px] text-muted-foreground"

export const MARKETING_INLINE_LINK_CLASS =
  "text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-white/40"
