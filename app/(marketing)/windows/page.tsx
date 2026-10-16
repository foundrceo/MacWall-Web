import type { Metadata } from "next"
import Link from "next/link"

import { legalLinkProse } from "@/components/legal/legal-classes"
import {
  landingPageH1,
  landingPageLead,
} from "@/components/macwall-marketing/landing-type"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { WindowsWaitlistForm } from "@/components/macwall-marketing/windows-waitlist-form"
import { macwall } from "@/lib/macwall-site"
import { canonicalSitePath } from "@/lib/site-url"
import { cn } from "@/lib/utils"
import {
  WINDOWS_PREORDER_MAX_DEVICES,
  windowsWaitlistPath,
} from "@/lib/windows/preorder.shared"

const PAGE_DESCRIPTION = `${macwall.name} is coming to Windows. One ${macwall.name} Pro license works on Mac and Windows. Reserve early access now and get your key by email the day the Windows app launches.`

export const metadata: Metadata = {
  title: "MacWall for Windows",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath(windowsWaitlistPath) },
}

const STEPS = [
  {
    title: "Reserve today",
    body: "Pay once with Stripe. You get a confirmation email right away.",
  },
  {
    title: "Wait for launch",
    body: "No key yet and nothing to install. We'll email you when it's ready.",
  },
  {
    title: "Get your key at launch",
    body: `On launch day we email your ${macwall.name} Pro key. It works on up to ${WINDOWS_PREORDER_MAX_DEVICES} devices, Mac or PC.`,
  },
] as const

export default function WindowsWaitlistPage() {
  return (
    <>
      <MarketingTitleSection aria-labelledby="windows-title">
        <div className="mx-auto flex max-w-2xl flex-col items-start px-2 py-10 md:py-16">
          <p className="text-[13px] tracking-tight text-muted-foreground">
            Early access
          </p>
          <h1 id="windows-title" className={cn(landingPageH1, "mt-2")}>
            {macwall.name} is coming to Windows
          </h1>
          <p className={landingPageLead}>
            Live wallpapers for your PC, from the team behind {macwall.name}.
            One {macwall.name} Pro license works on both Mac and Windows.
            Reserve your spot now.
          </p>
          <WindowsWaitlistForm className="mt-8 max-w-lg" />
        </div>
      </MarketingTitleSection>
      <MarketingBodySection>
        <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-8">
          <h2 className="text-lg font-medium text-foreground">How it works</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-muted/40 p-5"
              >
                <span className="text-[13px] text-muted-foreground">
                  {index + 1}
                </span>
                <p className="mt-1 font-medium text-foreground">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div
            className={cn(
              "mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground",
              legalLinkProse
            )}
          >
            <p>
              <span className="text-foreground">
                Already have {macwall.name} Pro?
              </span>{" "}
              You don&apos;t need to reserve. Your license will work on Windows
              too, at no extra cost.
            </p>
            <p>
              Changed your mind? Email{" "}
              <a href={`mailto:${macwall.supportEmail}`}>
                {macwall.supportEmail}
              </a>{" "}
              from the address you paid with and we&apos;ll refund you in full,
              any time before launch.
            </p>
            <p>
              On a Mac? <Link href="/download">Download {macwall.name}</Link>{" "}
              today.
            </p>
          </div>
        </div>
      </MarketingBodySection>
    </>
  )
}
