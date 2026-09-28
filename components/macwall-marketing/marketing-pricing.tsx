"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { PricingPagePlans } from "@/components/macwall-marketing/pricing-page-plans"

type PricingUrlState = {
  checkoutError: string | null
  promo: string | null
  until: string | null
}

const EMPTY_URL_STATE: PricingUrlState = {
  checkoutError: null,
  promo: null,
  until: null,
}

function withCheckoutPromo(
  url: string,
  promo: string | null,
  until: string | null
): string {
  if (!promo && !until) return url
  try {
    const parsed = new URL(url, "https://macwall.app")
    if (promo) parsed.searchParams.set("promo", promo)
    if (until) parsed.searchParams.set("until", until)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

/**
 * Reads `?checkout_error=`, `?promo=` and `?until=`. Isolated in its own
 * Suspense boundary so `/pricing` prerenders with the full page in the HTML:
 * in a static route `useSearchParams()` renders client-only up to the nearest
 * boundary, and that must be this empty component, not the pricing content.
 */
function PricingUrlParams({
  onChange,
}: Readonly<{ onChange: (state: PricingUrlState) => void }>) {
  const searchParams = useSearchParams()
  const checkoutError = searchParams.get("checkout_error")?.trim() || null
  const promo = searchParams.get("promo")?.trim().toUpperCase() || null
  const until = searchParams.get("until")?.trim() || null

  useEffect(() => {
    onChange({ checkoutError, promo, until })
  }, [onChange, checkoutError, promo, until])

  return null
}

export default function MacWallMarketingPricingPage() {
  const pricing = useMarketingPricing()
  const [urlState, setUrlState] = useState(EMPTY_URL_STATE)
  const checkoutUrl = withCheckoutPromo(
    pricing.checkoutUrl,
    urlState.promo,
    urlState.until
  )

  return (
    <>
      <Suspense fallback={null}>
        <PricingUrlParams onChange={setUrlState} />
      </Suspense>
      <PricingPagePlans
        checkoutUrl={checkoutUrl}
        checkoutError={urlState.checkoutError}
      />
    </>
  )
}
