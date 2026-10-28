/**
 * Legal page typography, matching PostMesh's /legal reading layout: one
 * 680px column, no rails or boxes, 16/28 body (17/1.75 from sm), numbered
 * section headings, underlined links.
 */
export const legalTextPrimary = "text-foreground"

export const legalTextSecondary = "text-muted-foreground"

export const legalTextTertiary = "text-marketing-muted"

export const legalBorderSubtle = "border-hairline"

/** The reading column. */
export const legalColumn =
  "mx-auto w-full max-w-[680px] min-w-0 px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24"

/** Centered page title, as on PostMesh. */
export const legalH1 =
  "font-display text-[36px] leading-[44px] font-normal tracking-tight text-balance text-foreground sm:text-[48px] sm:leading-[58px]"

export const legalLinkProse =
  "[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:text-foreground [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:decoration-1 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline-offset-4 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:transition-colors hover:[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:text-ink-3 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:break-words"

/** Body text for the whole document; sections number themselves. */
export const legalArticle =
  "flex flex-col gap-6 text-base leading-7 text-ink-2 [counter-reset:legal-section] sm:text-[17px] sm:leading-[1.75] [&_strong]:font-medium [&_strong]:text-foreground"

/** Section heading: "1. Title", numbered by CSS so pages need no edits. */
export const legalH2 =
  "mt-10 scroll-mt-24 font-display text-2xl leading-8 font-normal tracking-tight text-balance text-foreground [counter-increment:legal-section] before:content-[counter(legal-section)_'._']"

export const legalSectionBody = "flex flex-col gap-6"

export const legalBulletList =
  "flex list-disc flex-col gap-2 pl-6 marker:text-ink-2 [&_li]:pl-1"
