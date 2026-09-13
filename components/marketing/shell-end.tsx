"use client"

import { usePathname } from "next/navigation"

import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"

const HIDE_CLOSING_CTA = new Set([
  "/thank-you",
  "/activate",
  "/open",
  "/tiktok",
  "/creator",
])

export function MarketingShellEnd() {
  const pathname = usePathname()
  const showBottomCta = !HIDE_CLOSING_CTA.has(pathname)

  return <MacWallMarketingPageEnd showBottomCta={showBottomCta} />
}
