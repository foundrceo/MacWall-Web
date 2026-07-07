import MacWallMarketingBottomCta from "@/components/macwall-marketing/marketing-bottom-cta"
import MacWallMarketingFooter from "@/components/macwall-marketing/marketing-footer"

/** Bottom CTA + footer rail — identical on home, pricing, terms, and privacy. */
export default function MacWallMarketingPageEnd() {
  return (
    <>
      <MacWallMarketingBottomCta />
      <MacWallMarketingFooter variant="light" shopPricingHref="/pricing" />
    </>
  )
}
