"use client"

import Link from "next/link"
import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"

import { PurchaseConversionTracker } from "@/components/analytics/purchase-conversion-tracker"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { ThankYouSuccessMark } from "@/components/macwall-marketing/thank-you-success-mark"
import {
  MarketingContainer,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallThankYouCopy as copy } from "@/lib/macwall-thank-you-copy"
import {
  MARKETING_PAGE_CLASS,
  MARKETING_INLINE_LINK_CLASS,
} from "@/lib/marketing-chrome"
import { prosePrimaryBtn } from "@/lib/marketing-prose-classes"
import { macwall, mailtoSupport } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

function ThankYouActions() {
  const searchParams = useSearchParams()
  const licenseKey = useMemo(() => {
    const raw = searchParams.get("key") ?? searchParams.get("license")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])

  const openAppHref = licenseKey
    ? copy.openAppWithKeyHref(licenseKey)
    : copy.openAppHref

  return (
    <section className="mx-auto mt-10 max-w-[520px] pb-16 text-center md:pb-20">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link href={openAppHref} className={cn(prosePrimaryBtn, "prose-primary-btn")}>
          {copy.openAppCta}
        </Link>
        <TrackedDownloadButton
          href={copy.downloadHref}
          size="lg"
          location="thank_you"
          className="border border-border bg-transparent text-foreground hover:bg-surface"
        >
          {copy.downloadCta}
        </TrackedDownloadButton>
      </div>

      {licenseKey ? (
        <p className="mx-auto mt-5 max-w-[440px] text-[14px] leading-[1.5] text-muted-foreground">
          Your license is ready — tap{" "}
          <strong className="font-semibold text-foreground">Open MacWall</strong>{" "}
          to activate Pro instantly.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        <p className="text-[14px] leading-[1.5] text-muted-foreground">
          {copy.supportLabel}{" "}
          <Link
            href={mailtoSupport}
            className={cn(MARKETING_INLINE_LINK_CLASS, "whitespace-nowrap")}
          >
            {macwall.supportEmail}
          </Link>
        </p>
        <p className="mx-auto max-w-[400px] text-[14px] leading-[1.5] text-muted-foreground">
          {copy.supportHint}
        </p>
        <p className="inline-flex items-center justify-center gap-1.5 pt-1 text-[13px] leading-[1.4] text-marketing-muted">
          <Mail className="size-3.5 shrink-0" aria-hidden />
          <span>License email usually arrives within a few minutes</span>
        </p>
      </div>
    </section>
  )
}

export default function MacWallMarketingThankYouPage() {
  return (
    <div className={MARKETING_PAGE_CLASS}>
      <Suspense fallback={null}>
        <PurchaseConversionTracker />
      </Suspense>
      <MarketingSiteChrome />
      <main className={MARKETING_MAIN_OFFSET_CLASS}>
        <MarketingContainer>
          <div className="mx-auto max-w-[640px] text-center">
            <ThankYouSuccessMark />
            <SectionTitle as="h1" className="mt-1">
              {copy.title}
            </SectionTitle>
            <SectionLead className="mx-auto mt-4 max-w-[520px] md:mt-5">
              {copy.lead}
            </SectionLead>
          </div>

          <section
            className="mx-auto mt-12 max-w-[720px] md:mt-14"
            aria-labelledby="thank-you-steps-title"
          >
            <h2
              id="thank-you-steps-title"
              className="text-center text-[13px] font-semibold tracking-[0.08em] text-marketing-muted uppercase"
            >
              {copy.stepsTitle}
            </h2>
            <ol className="mt-6 space-y-3">
              {copy.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[20px] border border-border bg-surface px-5 py-4"
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[14px] font-semibold text-foreground"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[15px] leading-[1.47] text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Suspense fallback={null}>
            <ThankYouActions />
          </Suspense>
        </MarketingContainer>
      </main>
      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
