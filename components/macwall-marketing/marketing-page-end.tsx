import MacWallMarketingBottomCta from "@/components/macwall-marketing/marketing-bottom-cta"
import { SiteFooter } from "@/components/macwall-marketing/site-footer"
import { HideOnPaths } from "@/components/marketing/hide-on-paths"

/** Bottom CTA + footer rail: identical on home, pricing, terms, and privacy. */
export default function MacWallMarketingPageEnd({
  showBottomCta = true,
  showFooter = true,
  bottomCtaHiddenOn = [],
}: Readonly<{
  showBottomCta?: boolean
  showFooter?: boolean
  /** Pathnames where the closing CTA is left out. */
  bottomCtaHiddenOn?: readonly string[]
}>) {
  return (
    <>
      {showBottomCta ? (
        <HideOnPaths paths={bottomCtaHiddenOn}>
          <MacWallMarketingBottomCta />
        </HideOnPaths>
      ) : null}
      {showFooter ? <SiteFooter /> : null}
    </>
  )
}
