import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"

/** Pages that end without the closing download CTA (they are the next step). */
const HIDE_CLOSING_CTA = [
  "/thank-you",
  "/activate",
  "/open",
  "/tiktok",
  "/creator",
] as const

/**
 * The end of every marketing page: closing CTA and footer. A server
 * component, so the footer ships as HTML only; the CTA is hidden on the
 * pages above by a small client wrapper (HideOnPaths).
 */
export function MarketingShellEnd() {
  return <MacWallMarketingPageEnd bottomCtaHiddenOn={HIDE_CLOSING_CTA} />
}
