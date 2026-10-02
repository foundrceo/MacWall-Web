"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { PurchaseConversionTracker } from "@/components/analytics/purchase-conversion-tracker"
import {
  MarketingContainer,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { ThankYouSuccessMark } from "@/components/macwall-marketing/thank-you-success-mark"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallLicenseActivationDeepLink,
} from "@/lib/macwall-site"
import { trackWhopEvent } from "@/lib/analytics/whop-client"
import { prosePrimaryBtn } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "paid"
      licenseKey: string | null
      amountMajor: number | null
      currency: string | null
    }
  | { status: "unpaid" }
  | { status: "error" }

function ActivateRedirectBody() {
  const searchParams = useSearchParams()
  const urlKey = useMemo(() => {
    const raw = searchParams.get("key") ?? searchParams.get("license")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])
  const sessionId = useMemo(() => {
    const raw = searchParams.get("session_id")
    const trimmed = raw?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  }, [searchParams])

  // Whop and Cashfree return here with ?key=…&provider=…; the key only works
  // once payment is confirmed, so it is verified like a Stripe session.
  const provider = searchParams.get("provider")
  const whopKey = useMemo(
    () => (provider === "whop" || provider === "cashfree" ? urlKey : null),
    [provider, urlKey]
  )
  const needsVerify = Boolean(sessionId || whopKey)

  const [verify, setVerify] = useState<VerifyState>(() =>
    needsVerify ? { status: "loading" } : { status: "idle" }
  )

  useEffect(() => {
    if (!sessionId && !whopKey) return

    let cancelled = false
    const verifyUrl = sessionId
      ? `/api/checkout/verify-session?session_id=${encodeURIComponent(sessionId)}`
      : `/api/checkout/verify-session?provider=${provider}&key=${encodeURIComponent(whopKey ?? "")}`
    const run = async (attempt = 1): Promise<void> => {
      try {
        const res = await fetch(verifyUrl, { credentials: "same-origin" })
        if (cancelled) return
        if (res.status === 202) {
          // Paid at Whop but the webhook hasn't landed yet: poll ~90s.
          if (attempt >= 45) {
            setVerify({ status: "error" })
            return
          }
          await new Promise((resolve) => setTimeout(resolve, 2000))
          if (!cancelled) await run(attempt + 1)
          return
        }
        if (res.status === 402) {
          setVerify({ status: "unpaid" })
          return
        }
        if (!res.ok) {
          setVerify({ status: "error" })
          return
        }
        const data = (await res.json()) as {
          ok?: boolean
          paid?: boolean
          licenseKey?: string | null
          amountMajor?: number | null
          amountTotal?: number | null
          currency?: string | null
        }
        if (!data.paid) {
          setVerify({ status: "unpaid" })
          return
        }
        const amountMajor =
          typeof data.amountMajor === "number"
            ? data.amountMajor
            : typeof data.amountTotal === "number"
              ? data.amountTotal / 100
              : null
        setVerify({
          status: "paid",
          licenseKey: data.licenseKey?.trim() || urlKey,
          amountMajor,
          currency: data.currency ?? null,
        })
      } catch {
        if (!cancelled) setVerify({ status: "error" })
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [provider, sessionId, urlKey, whopKey])

  const licenseKey =
    verify.status === "paid"
      ? verify.licenseKey
      : !needsVerify
        ? urlKey
        : null

  const deepLink = licenseKey
    ? macwallLicenseActivationDeepLink(licenseKey)
    : macwallLicenseActivationDeepLink()

  const shouldTrackPurchase =
    verify.status === "paid" || (!needsVerify && Boolean(urlKey))

  const conversionAmount =
    verify.status === "paid" && verify.amountMajor != null
      ? verify.amountMajor
      : undefined
  const conversionCurrency =
    verify.status === "paid" ? verify.currency ?? undefined : undefined

  useEffect(() => {
    if (!licenseKey) return
    if (needsVerify && verify.status !== "paid") return
    trackWhopActivatedOnce(licenseKey)
    window.location.replace(deepLink)
  }, [deepLink, licenseKey, needsVerify, verify.status])

  if (verify.status === "loading") {
    return (
      <MarketingContainer>
        <div className="mx-auto max-w-[640px] py-16 text-center md:py-24">
          <SectionTitle as="h1">Confirming your purchase…</SectionTitle>
          <SectionLead className="mx-auto mt-4 max-w-[480px]">
            Hang tight, we&apos;re confirming your payment. This can take a
            few seconds.
          </SectionLead>
        </div>
      </MarketingContainer>
    )
  }

  if (verify.status === "unpaid") {
    return (
      <MarketingContainer>
        <div className="mx-auto max-w-[640px] py-16 text-center md:py-24">
          <SectionTitle as="h1">Payment not completed</SectionTitle>
          <SectionLead className="mx-auto mt-4 max-w-[480px]">
            We couldn&apos;t confirm a paid checkout for this session. If you
            were charged, email {macwall.supportEmail} with your receipt.
          </SectionLead>
          <div className="mt-10 flex justify-center">
            <Link
              href="/pricing"
              className={cn(prosePrimaryBtn, "prose-primary-btn")}
            >
              Back to pricing
            </Link>
          </div>
        </div>
      </MarketingContainer>
    )
  }

  return (
    <MarketingContainer>
      {shouldTrackPurchase ? (
        <PurchaseConversionTracker
          amount={conversionAmount}
          currency={conversionCurrency}
          verified={needsVerify}
        />
      ) : null}
      <div className="mx-auto max-w-[640px] py-16 text-center md:py-24">
        <ThankYouSuccessMark />
        <SectionTitle as="h1" className="mt-4">
          {licenseKey ? "Opening MacWall…" : "Activate MacWall Pro"}
        </SectionTitle>
        <SectionLead className="mx-auto mt-4 max-w-[480px]">
          {licenseKey
            ? "Your license is activating automatically. If MacWall did not open, tap the button below."
            : verify.status === "error"
              ? "We couldn't verify checkout automatically. Open MacWall and paste the key from your purchase email."
              : "Open MacWall to paste your license key from your purchase email."}
        </SectionLead>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href={deepLink}
            className={cn(prosePrimaryBtn, "prose-primary-btn")}
            referrerPolicy="no-referrer"
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
    <MarketingRail>
      <Suspense fallback={null}>
        <ActivateRedirectBody />
      </Suspense>
    </MarketingRail>
  )
}

/** One `activated` per key per tab, so reloading /activate does not recount. */
function trackWhopActivatedOnce(licenseKey: string) {
  const storageKey = `mw_whop_activated_${licenseKey}`
  try {
    if (window.sessionStorage.getItem(storageKey)) return
    window.sessionStorage.setItem(storageKey, "1")
  } catch {
    // Storage blocked: still report the activation.
  }
  trackWhopEvent("activated")
}
