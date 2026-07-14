"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  captureTikTokClickIdFromUrl,
  trackTikTokViewContent,
} from "@/lib/analytics/tiktok-client"

const TIKTOK_VIEW_CONTENT_PATHS = new Set(["/", "/pricing"])

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return
    captureTikTokClickIdFromUrl()
    trackSiteEventClient("page_view", { page: pathname })

    if (TIKTOK_VIEW_CONTENT_PATHS.has(pathname)) {
      trackTikTokViewContent()
    }
  }, [pathname])

  return null
}
