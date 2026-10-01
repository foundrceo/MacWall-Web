import Link from "next/link"

import { legalTextPrimary } from "@/components/legal/legal-classes"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/** Anchor on the legal hub that holds the full company record. */
export const LEGAL_COMPANY_HREF = "/legal#company" as const

/**
 * One-paragraph notice shown on every legal page: names the company behind
 * MacWall and defines "we" so each policy binds OG APPS, LLC.
 */
export function LegalOperatorNotice({ className }: Readonly<{ className?: string }>) {
  return (
    <p
      className={cn(
        "rounded-lg border border-dashed border-border bg-card/50 px-4 py-3 text-sm",
        className
      )}
    >
      {macwall.name} is a product and trade name of{" "}
      <strong className={legalTextPrimary}>{macwall.legalCompanyName}</strong>,{" "}
      {macwall.legalCompanyDescriptor}. In this policy, &ldquo;{macwall.name}
      ,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our&rdquo; mean{" "}
      {macwall.legalCompanyName}. See{" "}
      <Link href={LEGAL_COMPANY_HREF}>company information</Link>.
    </p>
  )
}

/** Full company record: the facts a customer, bank or regulator would check. */
export function LegalEntityDetails() {
  const rows: Array<[string, string]> = [
    ["Legal name", macwall.legalCompanyName],
    ["Entity type", "Limited liability company (LLC), State of Delaware, USA"],
    ["Delaware file number", macwall.legalCompanyFileNumber],
    ["Formed", macwall.legalCompanyFormedLabel],
    [
      "Registered office and agent",
      `${macwall.legalRegisteredAgent}, ${macwall.legalRegisteredOffice}`,
    ],
    ["Mailing address", macwall.legalMailingAddress],
    ["Products", `${macwall.name} (macOS app and ${macwall.website.replace(/^https?:\/\//, "")})`],
    ["Payment processor", `${macwall.paymentProcessor} (whop.com)`],
    ["Contact", macwall.supportEmail],
  ]

  return (
    <dl className="m-0 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className={cn("font-medium", legalTextPrimary)}>{label}</dt>
          <dd className="m-0 break-words">
            {label === "Contact" ? (
              <a href={`mailto:${value}`}>{value}</a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
