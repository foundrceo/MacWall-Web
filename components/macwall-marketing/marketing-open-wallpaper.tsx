"use client"

import { Suspense, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  macwallInstallerLatestPath,
  macwallWallpaperDeepLink,
} from "@/lib/macwall-site"

const INSTALL_FALLBACK_MS = 1750

function OpenWallpaperRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wallpaperId = useMemo(() => {
    const raw = searchParams.get("id")?.trim()
    return raw && raw.length > 0 ? raw : null
  }, [searchParams])

  useEffect(() => {
    if (!wallpaperId) {
      router.replace("/wallpapers")
      return
    }

    const deepLink = macwallWallpaperDeepLink(wallpaperId)

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(fallbackTimer)
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
    }

    const fallbackTimer = setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      if (document.visibilityState === "visible") {
        window.location.href = macwallInstallerLatestPath
      }
    }, INSTALL_FALLBACK_MS)

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.location.replace(deepLink)

    return () => {
      clearTimeout(fallbackTimer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [router, wallpaperId])

  return null
}

export default function MarketingOpenWallpaper() {
  return (
    <Suspense fallback={null}>
      <OpenWallpaperRedirect />
    </Suspense>
  )
}
