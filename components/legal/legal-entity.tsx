import Link from "next/link"

import { macwall } from "@/lib/macwall-site"

/**
 * Default "Who we are" text at the end of legal pages that don't have to name
 * the company: "we" points to the Terms, the one page that names the seller.
 * The legal name appears only where the law needs it (Terms, Privacy,
 * GDPR, CCPA, DMCA agent).
 */
export function LegalCompanyNotice() {
  return (
    <p>
      In this policy, &ldquo;{macwall.name},&rdquo; &ldquo;we,&rdquo;
      &ldquo;us&rdquo; and &ldquo;our&rdquo; mean the company that makes and
      sells {macwall.name}, named in our{" "}
      <Link href="/legal/terms#who-we-are">Terms of Service</Link>. Contact:{" "}
      <a href={`mailto:${macwall.supportEmail}`}>{macwall.supportEmail}</a>.
    </p>
  )
}
