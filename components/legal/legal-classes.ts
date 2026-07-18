/**
 * Shared typography and link styles for /privacy and /terms (Cursor dark theme).
 */
export const legalTextPrimary = "text-foreground"

export const legalTextSecondary = "text-muted-foreground"

export const legalTextTertiary = "text-marketing-muted"

export const legalBorderSubtle = "border-border"

export const legalLinkProse =
  "[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:font-medium [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:text-foreground [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:decoration-foreground/25 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline-offset-4 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:transition-colors hover:[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:decoration-foreground/50 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:break-words"

/** Vertical rhythm between legal sections inside the article column. */
export const legalArticle = "space-y-12 md:space-y-14"

export const legalSectionBody =
  "mt-5 space-y-4 text-[17px] leading-[1.6] text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground"

export const legalBulletList =
  "m-0 list-none space-y-3 p-0 [&_li]:relative [&_li]:pl-5 [&_li]:text-[17px] [&_li]:leading-[1.6] [&_li]:text-muted-foreground [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-muted-foreground [&_li]:before:content-['•'] [&_strong]:font-semibold [&_strong]:text-foreground"
