import MarketingShellBodyClass from "@/components/macwall-marketing/marketing-body-class"
import { MARKETING_SHELL_STYLESHEETS } from "@/lib/marketing-shell/assets"
import type { ReactNode } from "react"

export const dynamic = "force-static"

/** Vendored layout CSS ships from `/public/marketing-shell` so first paint has module class names. */
export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {MARKETING_SHELL_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <MarketingShellBodyClass />
      {children}
    </>
  )
}
