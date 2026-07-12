"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { trackSiteEventClient } from "@/lib/analytics/client"

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return
    trackSiteEventClient("page_view", { page: pathname })
  }, [pathname])

  return null
}
