import type { ReactNode } from "react"

export type ProseLayoutWidth = "article" | "wide" | "blog"

/** Kept for call-site compatibility. Inner pages now stack MarketingTitleSection + MarketingBodySection. */
export function MarketingProseShell({
  labelledBy,
  children,
}: Readonly<{
  width?: ProseLayoutWidth
  labelledBy?: string
  children: ReactNode
  mainId?: string
  showPageEnd?: boolean
  showBottomCta?: boolean
}>) {
  return <div aria-labelledby={labelledBy}>{children}</div>
}
