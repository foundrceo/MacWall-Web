"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  captureMetaClickIdFromUrl,
  trackMetaViewContent,
} from "@/lib/analytics/meta-client"
import {
  captureTikTokClickIdFromUrl,
  trackTikTokViewContent,
} from "@/lib/analytics/tiktok-client"
import { captureMarketingAttributionFromUrl } from "@/lib/analytics/marketing-attribution"

const VIEW_CONTENT_PATHS = new Set(["/", "/pricing", "/tiktok"])

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return
    captureMetaClickIdFromUrl()
    captureTikTokClickIdFromUrl()
    captureMarketingAttributionFromUrl()
    trackSiteEventClient("page_view", { page: pathname })

    if (VIEW_CONTENT_PATHS.has(pathname)) {
      trackMetaViewContent()
      trackTikTokViewContent()
    }
  }, [pathname])

  return null
}
