import type { Metadata } from "next"
import Link from "next/link"

import { legalLinkProse } from "@/components/legal/legal-classes"
import { LEGAL_COMPANY_HREF } from "@/components/legal/legal-entity"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const PAGE_DESCRIPTION = `Contact ${macwall.name} support: license keys, activation, billing and refunds. We reply by email within 1 to 2 business days.`

export const metadata: Metadata = {
  title: "Contact",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/contact" },
}

/**
 * Customer-service contact page: payment processors expect support details,
 * the legal business name and an address to be easy to find on the site.
 */
export default function ContactPage() {
  return (
    <>
      <MarketingTitleSection className="text-center" aria-labelledby="contact-title">
        <h1 id="contact-title" className={cn(landingPageH1, "md:text-4xl")}>
          Contact
        </h1>
        <p className={cn(landingPageLead, "mx-auto text-center")}>
          Questions about your license, activation or a payment? We&apos;re
          here to help.
        </p>
      </MarketingTitleSection>
      <MarketingBodySection>
        <div
          className={cn(
            "mx-auto max-w-2xl space-y-6 px-6 py-10 text-muted-foreground lg:px-8",
            legalLinkProse
          )}
        >
          <section className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Support</h2>
            <p>
              Email{" "}
              <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>
              . We reply within 1 to 2 business days, usually sooner. For
              license or payment questions, write from the email you paid with
              so we can find your purchase.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">
              Billing and refunds
            </h2>
            <p>
              {macwall.name} Pro is a one-time purchase with no subscription.
              If something is wrong with a charge, email us and we&apos;ll fix
              it, usually within 1 to 2 business days. See the{" "}
              <Link href="/legal/refund">Refund Policy</Link> and{" "}
              <Link href="/legal/terms">Terms of Service</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Help docs</h2>
            <p>
              Setup, activation and moving a license to a new Mac are covered
              in the <Link href="/docs">docs</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">Company</h2>
            <p>
              {macwall.name} is a product of {macwall.legalCompanyName},{" "}
              {macwall.legalCompanyDescriptor}.
              <br />
              Mailing address: {macwall.legalMailingAddress}
              <br />
              Full details: <Link href={LEGAL_COMPANY_HREF}>company information</Link>.
            </p>
          </section>
        </div>
      </MarketingBodySection>
    </>
  )
}
