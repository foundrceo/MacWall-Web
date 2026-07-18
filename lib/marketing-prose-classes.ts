/** Tailwind prose layout shared across SEO, blog, and legal pages (Cursor dark theme). */

export const proseHero = "mb-10 text-center md:mb-14"

export const proseHeroTitle =
  "text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground"

export const proseHeroLead =
  "mx-auto mt-4 max-w-[640px] text-[17px] leading-[1.55] text-muted-foreground md:text-[19px]"

export const proseHeroIntro =
  "mx-auto max-w-[640px] text-left text-[17px] leading-[1.55] text-muted-foreground sm:text-center"

export const proseHeroMeta = "mt-3 text-[14px] text-marketing-muted"

export const proseDivider = "my-10 h-px bg-border"

export const proseArticle = "mx-auto"

export const proseBody = "space-y-5"

export const proseH2 =
  "scroll-mt-28 text-[28px] font-semibold leading-[1.12] tracking-[-0.02em] text-foreground md:text-[32px]"

export const proseH3 =
  "text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground"

export const proseP = "text-[17px] leading-[1.6] text-foreground/75"

export const proseUl = "space-y-2 pl-0"

export const proseUlItem =
  "flex gap-2 text-[17px] leading-[1.6] text-foreground/75"

export const proseUlBullet = "text-muted-foreground"

export const proseOl =
  "list-decimal space-y-2 pl-5 text-[17px] leading-[1.6] text-foreground/75"

export const proseFaq = "mt-0"

export const proseFaqTitle =
  "text-[28px] font-semibold tracking-[-0.02em] text-foreground md:text-[32px]"

export const proseFaqList =
  "mt-8 divide-y divide-border border-t border-border"

export const proseFaqItem = "py-5"

export const proseFaqQuestion =
  "text-[17px] font-semibold text-foreground md:text-[19px]"

export const proseFaqAnswer =
  "mt-2 text-[17px] leading-[1.55] text-foreground/70"

export const proseBreadcrumbs = "mb-8"

export const proseBreadcrumbsList =
  "flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground"

export const proseBreadcrumbsItem = "inline-flex items-center gap-1.5"

export const proseBreadcrumbsSep = "text-border"

export const proseBreadcrumbsLink =
  "text-muted-foreground transition-colors hover:text-foreground"

export const proseBreadcrumbsCurrent = "text-foreground"

export const proseActionRow =
  "mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"

export const prosePrimaryBtn =
  "inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-[15px] font-medium text-background no-underline transition outline-none hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const proseGhostBtn =
  "inline-flex items-center justify-center rounded-full border border-border bg-transparent px-6 py-3 text-[15px] font-medium text-foreground no-underline transition outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const proseLinkInline =
  "font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground/50"

export const proseLinkProse =
  "[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:font-medium [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:text-foreground [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:decoration-foreground/25 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:underline-offset-4 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:transition-colors hover:[&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:decoration-foreground/50 [&_a:not(.prose-primary-btn):not(.prose-ghost-btn)]:break-words"
