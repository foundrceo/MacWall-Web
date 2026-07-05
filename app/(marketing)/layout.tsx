import { WALLPER_ORIGIN, WALLPER_STYLESHEETS } from "@/lib/wallper/cdn"
import WallperStylesLoader from "@/components/wallper-exact/WallperStylesLoader"
import type { ReactNode } from "react"

/**
 * Wallper clone CSS must load in the initial HTML (not only after hydration)
 * so hashed module classes resolve on first paint.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <link rel="preconnect" href={WALLPER_ORIGIN} crossOrigin="" />
      {WALLPER_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <WallperStylesLoader />
      {children}
    </>
  )
}
