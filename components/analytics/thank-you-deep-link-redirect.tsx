"use client"

import { useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import { macwallLicenseActivationDeepLink } from "@/lib/macwall-site"

/**
 * After Stripe success redirect, auto-open MacWall with the license key so buyers
 * skip manual paste. Falls back to the visible CTA if the app is not installed.
 */
export function ThankYouDeepLinkRedirect() {
  const searchParams = useSearchParams()

  const licenseKey = useMemo(() => {
    const raw = searchParams.get("key") ?? searchParams.get("license")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])

  useEffect(() => {
    if (!licenseKey) return

    const deepLink = macwallLicenseActivationDeepLink(licenseKey)
    window.location.href = deepLink
  }, [licenseKey])

  return null
}
