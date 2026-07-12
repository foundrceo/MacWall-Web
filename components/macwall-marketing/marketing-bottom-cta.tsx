"use client"

import Image from "next/image"
import Link from "next/link"
import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import {
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallProCheckoutURL,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/** Shared pre-footer CTA — same layout on every marketing page. */
export default function MacWallMarketingBottomCta() {
  const uf = macwallExactCopy.underFooter
  const h = macwallExactCopy.header
  const price = macwallExactCopy.pricing

  return (
    <section
      className="MacWallBottomCta"
      aria-labelledby="macwall-bottom-cta-title"
    >
      <div className="MacWallCtaCluster">
        <Image
          alt={h.logoAlt}
          width={56}
          height={56}
          src={macwallAppIconPath}
          className={cn(
            macwallAppIconRadiusClass,
            "MacWallCtaIcon object-cover"
          )}
        />
        <h2 id="macwall-bottom-cta-title" className="MacWallCtaTitle">
          {uf.title}
        </h2>
        <p className="MacWallCtaBody">{uf.body}</p>
        <div className="MacWallCtaActions">
          <TrackedPricingButton
            href={macwallProCheckoutURL}
            size="lg"
            location="bottom_cta"
          >
            {uf.cta}
          </TrackedPricingButton>
          <Link href="/pricing#reel-refund" className="MacWallCtaSecondaryBtn">
            {pricingCopy.bottomCtaReel}
          </Link>
        </div>
        <p className="MacWallCtaMeta">{price.priceLine}</p>
      </div>
    </section>
  )
}
