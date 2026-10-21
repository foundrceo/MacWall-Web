import type { ReactNode } from "react"

export type ProseLayoutWidth = "article" | "wide" | "blog"

/** Old wrapper; inner pages use MarketingTitleSection + MarketingBodySection. */
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
