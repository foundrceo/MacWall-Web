import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type ProseLayoutWidth = "article" | "wide" | "blog"

const widthClass: Record<ProseLayoutWidth, string> = {
  article: "marketing-prose-rail",
  wide: "w-full max-w-[980px]",
  blog: "w-full max-w-[1080px]",
}

/** Shared document shell for blog, SEO, and legal pages. */
export function MarketingProseShell({
  width = "article",
  mainId = "main-content",
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
    <div className="marketing-page relative">
      <MarketingSiteChrome />

      <a href={`#${mainId}`} className="marketing-skip-link">
        Skip to main content
      </a>

      <main
        id={mainId}
        tabIndex={-1}
        aria-labelledby={labelledBy}
        className="marketing-main"
      >
        <div className={cn(widthClass[width])}>{children}</div>
      </main>

      {showPageEnd ? (
        <MacWallMarketingPageEnd showBottomCta={showBottomCta} />
      ) : null}
    </div>
  )
}
