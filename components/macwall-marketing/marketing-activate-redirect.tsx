"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import { PurchaseConversionTracker } from "@/components/analytics/purchase-conversion-tracker"
import {
  MarketingContainer,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { ThankYouSuccessMark } from "@/components/macwall-marketing/thank-you-success-mark"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallLicenseActivationDeepLink,
} from "@/lib/macwall-site"
import { prosePrimaryBtn } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"

function ActivateRedirectBody() {
  const searchParams = useSearchParams()
  const licenseKey = useMemo(() => {
    const raw = searchParams.get("key") ?? searchParams.get("license")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])
  const sessionId = useMemo(() => {
    const raw = searchParams.get("session_id")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])

  const deepLink = licenseKey
    ? macwallLicenseActivationDeepLink(licenseKey)
    : macwallLicenseActivationDeepLink()

  const shouldTrackPurchase = Boolean(licenseKey || sessionId)

  useEffect(() => {
    if (!licenseKey) return
    window.location.replace(deepLink)
  }, [deepLink, licenseKey])

  return (
    <MarketingContainer>
      {shouldTrackPurchase ? <PurchaseConversionTracker /> : null}
      <div className="mx-auto max-w-[640px] py-16 text-center md:py-24">
        <ThankYouSuccessMark />
        <SectionTitle as="h1" className="mt-4">
          {licenseKey ? "Opening MacWall…" : "Activate MacWall Pro"}
        </SectionTitle>
        <SectionLead className="mx-auto mt-4 max-w-[480px]">
          {licenseKey
            ? "Your license is activating automatically. If MacWall did not open, tap the button below."
            : "Open MacWall to paste your license key from your purchase email."}
        </SectionLead>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href={deepLink}
            className={cn(prosePrimaryBtn, "prose-primary-btn")}
          >
            Open MacWall
          </Link>
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            location="activate_page"
            size="lg"
            className="border border-border bg-transparent text-foreground hover:bg-surface"
          >
            Download for Mac
          </TrackedDownloadButton>
        </div>

        {licenseKey ? (
          <p className="mx-auto mt-6 max-w-[440px] font-mono text-[13px] leading-relaxed break-all text-muted-foreground">
            {licenseKey}
          </p>
        ) : null}

        <p className="mx-auto mt-8 max-w-[440px] text-[14px] text-muted-foreground">
          Need help? Email{" "}
          <a
            href={`mailto:${macwall.supportEmail}`}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {macwall.supportEmail}
          </a>
        </p>
      </div>
    </MarketingContainer>
  )
}

export default function MarketingActivateRedirect() {
  return (
    <Suspense fallback={null}>
      <ActivateRedirectBody />
    </Suspense>
  )
}
