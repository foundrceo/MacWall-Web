/**
 * Forced light-theme styles for /privacy and /terms.
 * Kept separate from `globals.css` tokens so legal pages stay readable when
 * the root layout uses `.dark`.
 */
export const legalPageBg = "bg-white"

export const legalTextPrimary = "text-[#1d1d1f]"

export const legalTextSecondary = "text-[#424245]"

export const legalTextTertiary = "text-[#6e6e73]"

export const legalBorderSubtle = "border-[#d2d2d7]"

/** Inline link treatment inside prose blocks (matches Apple marketing blue). */
export const legalLinkProse =
  "[&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:font-medium [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:text-[#0071e3] [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:underline [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:decoration-[#0071e3]/35 [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:underline-offset-[3px] [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:transition-colors hover:[&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:decoration-[#0071e3] [&_a:not(.MacWallProsePrimaryBtn):not(.MacWallProseGhostBtn)]:break-words"

export const legalSectionBody =
  "mt-5 space-y-4 text-[17px] leading-[1.6] text-[#424245] [&_strong]:font-semibold [&_strong]:text-[#1d1d1f]"

export const legalBulletList =
  "m-0 list-none space-y-3 p-0 text-[17px] leading-[1.6] text-[#424245] [&_strong]:font-semibold [&_strong]:text-[#1d1d1f]"
