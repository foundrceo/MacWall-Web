"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const WallpaperPurchaseBanner = dynamic(
  () =>
    import("@/components/wallpaper-gallery/wallpaper-purchase-banner").then(
      (m) => m.WallpaperPurchaseBanner
    ),
  { ssr: false }
)

/** Client boundary — wallpaper dwell → Stripe banner after hydration. */
export function WallpaperPurchaseBannerMount() {
  return (
    <Suspense fallback={null}>
      <WallpaperPurchaseBanner />
    </Suspense>
  )
}
