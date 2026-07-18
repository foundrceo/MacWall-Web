import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"
import type { ReactNode } from "react"

export const dynamic = "force-static"

/** Marketing routes use Tailwind-only chrome and Cursor-style dark theme. */
export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const catalogOrigin = getCatalogSupabaseOrigin()
  const mediaOrigin = getR2PublicBaseUrl()

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <link rel="preconnect" href={mediaOrigin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={mediaOrigin} />
      <link rel="preconnect" href={catalogOrigin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={catalogOrigin} />
      {children}
    </div>
  )
}
