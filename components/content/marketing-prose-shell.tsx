import MacWallMarketingAnnouncementBar from "@/components/macwall-marketing/marketing-announcement-bar"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import { legalPageBg, legalTextPrimary } from "@/components/legal/legal-classes"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type ProseLayoutWidth = "article" | "wide" | "blog"

const widthClass: Record<ProseLayoutWidth, string> = {
  article: "MacWallProseMain--article",
  wide: "MacWallProseMain--wide",
  blog: "MacWallProseMain--blog",
}

const skipLinkClass =
  "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[calc(52px+0.75rem)] focus:z-[10000] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[15px] focus:font-medium focus:text-[#0071e3] focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40"

/** Shared Apple-style document shell for blog, SEO, and legal pages. */
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
    <div
      className={cn(
        "MacWallMarketingPage MacWallProsePage relative min-h-screen",
        legalPageBg,
        legalTextPrimary
      )}
    >
      <MacWallMarketingHeader variant="light" />
      <MacWallMarketingAnnouncementBar />

      <a href={`#${mainId}`} className={skipLinkClass}>
        Skip to main content
      </a>

      <main
        id={mainId}
        tabIndex={-1}
        aria-labelledby={labelledBy}
        className={cn(
          "MacWallProseMain MacWallProseMainOffset outline-none",
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
