"use client"

import { useCallback } from "react"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { GALLERY_PRIMARY_CTA_CLASS } from "@/lib/public-catalog/chrome"
import { macwallOpenWallpaperHref } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export function WallpaperSetOnMacButton({
  wallpaperId,
  wallpaperName,
  className,
}: Readonly<{
  wallpaperId: string
  wallpaperName: string
  className?: string
}>) {
  /**
   * Route through the `/open` HTTPS bridge (not the raw `macwall://` scheme):
   * it attempts `macwall://wallpaper?id=…` so the installed app opens that
   * exact wallpaper, and falls back to the installer download when the app
   * isn't installed — a dead scheme click otherwise.
   */
  const href = macwallOpenWallpaperHref(wallpaperId, { name: wallpaperName })

  const handleClick = useCallback(() => {
    trackSiteEventClient("download_click", {
      location: "wallpaper_detail_set_on_mac",
      wallpaper_id: wallpaperId,
    })
  }, [wallpaperId])

  return (
    <a
      href={href}
      className={cn(GALLERY_PRIMARY_CTA_CLASS, className)}
      onClick={handleClick}
    >
      Set on Mac
    </a>
  )
}
