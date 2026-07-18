import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type ProseLayoutWidth = "article" | "wide" | "blog"

const widthClass: Record<ProseLayoutWidth, string> = {
  article: "max-w-[680px]",
  wide: "max-w-[980px]",
  blog: "max-w-[1080px] px-0 pb-0",
}

const skipLinkClass =
  "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[calc(3.25rem+3.5rem+0.75rem)] focus:z-[10000] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-[15px] focus:font-medium focus:text-foreground focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring/40 sm:focus:top-[calc(2.25rem+3.5rem+0.75rem)] md:focus:top-[calc(3.5rem+0.75rem)]"

/** Shared document shell for blog, SEO, and legal pages. */
export function MarketingProseShell({
  width = "article",
  mainId = "prose-main",
  labelledBy,
  children,
  showPageEnd = true,
  showBottomCta = true,
}: Readonly<{
  width?: ProseLayoutWidth
  mainId?: string
  labelledBy?: string
  children: ReactNode
  showPageEnd?: boolean
  showBottomCta?: boolean
}>) {
  return (
    <div className={cn(MARKETING_PAGE_CLASS, "relative")}>
      <MarketingSiteChrome />

      <a href={`#${mainId}`} className={skipLinkClass}>
        Skip to main content
      </a>

      <main
        id={mainId}
        tabIndex={-1}
        aria-labelledby={labelledBy}
        className={cn(
          "mx-auto box-border w-full px-6 pb-14 outline-none md:px-8 md:pb-[4.5rem]",
          MARKETING_MAIN_OFFSET_CLASS,
          "md:pt-20",
          widthClass[width]
        )}
      >
        {children}
      </main>

      {showPageEnd ? (
        <MacWallMarketingPageEnd showBottomCta={showBottomCta} />
      ) : null}
    </div>
  )
}
