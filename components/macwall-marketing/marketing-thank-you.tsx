"use client"

import Link from "next/link"
import { Mail } from "lucide-react"

import { PurchaseConversionTracker } from "@/components/analytics/purchase-conversion-tracker"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import { ThankYouSuccessMark } from "@/components/macwall-marketing/thank-you-success-mark"
import {
  MarketingContainer,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallThankYouCopy as copy } from "@/lib/macwall-thank-you-copy"
import { macwall, mailtoSupport } from "@/lib/macwall-site"

export default function MacWallMarketingThankYouPage() {
  return (
    <div className="MacWallMarketingPage min-h-screen bg-white">
      <PurchaseConversionTracker />
      <MacWallMarketingHeader variant="light" />
      <main className="pt-14 md:pt-20">
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
              className="text-center text-[13px] font-semibold tracking-[0.08em] text-[#86868b] uppercase"
            >
              {copy.stepsTitle}
            </h2>
            <ol className="mt-6 space-y-3">
              {copy.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[20px] bg-[#f5f5f7] px-5 py-4"
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[15px] leading-[1.47] text-[#86868b]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mx-auto mt-10 max-w-[520px] pb-16 text-center md:pb-20">
            <TrackedDownloadButton
              href={copy.downloadHref}
              size="lg"
              location="thank_you"
            >
              {copy.downloadCta}
            </TrackedDownloadButton>

            <div className="mt-4 space-y-3">
              <p className="text-[14px] leading-[1.5] text-[#86868b]">
                {copy.supportLabel}{" "}
                <Link
                  href={mailtoSupport}
                  className="MacWallMarketingInlineLink whitespace-nowrap"
                >
                  {macwall.supportEmail}
                </Link>
              </p>
              <p className="mx-auto max-w-[400px] text-[14px] leading-[1.5] text-[#86868b]">
                {copy.supportHint}
              </p>
              <p className="inline-flex items-center justify-center gap-1.5 pt-1 text-[13px] leading-[1.4] text-[#86868b]">
                <Mail className="size-3.5 shrink-0" aria-hidden />
                <span>License email usually arrives within a few minutes</span>
              </p>
            </div>
          </section>
        </MarketingContainer>
      </main>
      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
