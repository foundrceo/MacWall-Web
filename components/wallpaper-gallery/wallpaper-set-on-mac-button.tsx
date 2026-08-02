"use client"

import { useCallback } from "react"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { GALLERY_PRIMARY_CTA_CLASS } from "@/lib/public-catalog/chrome"
import { macwallWallpaperDeepLink } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export function WallpaperSetOnMacButton({
  wallpaperId,
  wallpaperName: _wallpaperName,
  className,
}: Readonly<{
  wallpaperId: string
  wallpaperName: string
  className?: string
}>) {
  const handleClick = useCallback(() => {
    trackSiteEventClient("download_click", {
      location: "wallpaper_detail_set_on_mac",
      wallpaper_id: wallpaperId,
    })

    window.location.href = macwallWallpaperDeepLink(wallpaperId)
  }, [wallpaperId])

  return (
    <button
      type="button"
      className={cn(GALLERY_PRIMARY_CTA_CLASS, className)}
      onClick={handleClick}
    >
      Set on Mac
    </button>
  )
}
