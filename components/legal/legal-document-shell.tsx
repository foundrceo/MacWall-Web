import type { ReactNode } from "react"
import MacWallMarketingFooter from "@/components/macwall-marketing/marketing-footer"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import {
  legalBorderSubtle,
  legalLinkProse,
  legalPageBg,
  legalTextPrimary,
  legalTextSecondary,
} from "@/components/legal/legal-classes"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const skipLinkClass =
  "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[calc(52px+0.75rem)] focus:z-[10000] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[15px] focus:font-medium focus:text-[#0071e3] focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40"

export function LegalDocumentShell({
  variant,
  intro,
  children,
}: Readonly<{
  variant: "privacy" | "terms"
  intro: ReactNode
  children: ReactNode
}>) {
  const heading =
    variant === "privacy"
      ? `${macwall.name} Privacy Policy`
      : `${macwall.name} Terms of Use`

  const titleId = "legal-document-title"

  return (
    <div className={cn("relative min-h-screen", legalPageBg, legalTextPrimary)}>
      <MacWallMarketingHeader variant="light" />

      <a href="#legal-document-main" className={skipLinkClass}>
        Skip to main content
      </a>

      <main
        id="legal-document-main"
        tabIndex={-1}
        aria-labelledby={titleId}
        className={cn(
          "mx-auto max-w-[680px] px-6 pb-32 outline-none md:px-8 md:pb-40",
          legalLinkProse,
          "pt-[max(8.5rem,calc(env(safe-area-inset-top)+6.75rem))] md:pt-[max(10rem,calc(env(safe-area-inset-top)+7.5rem))]"
        )}
      >
        <header className="text-center">
          <h1
            id={titleId}
            className={cn(
              "text-[34px] font-semibold tracking-tight md:text-[48px] md:leading-[1.06]",
              legalTextPrimary
            )}
          >
            {heading}
          </h1>
          <div
            className={cn(
              "mx-auto mt-10 max-w-[640px] space-y-5 text-left text-[17px] leading-[1.47] sm:text-center",
              legalTextSecondary,
              legalLinkProse
            )}
          >
            {intro}
          </div>
        </header>

        <hr
          className={cn("my-14 border-0 border-t md:my-20", legalBorderSubtle)}
        />

        <article
          className={cn("space-y-16 md:space-y-[4.5rem]", legalLinkProse)}
        >
          {children}
        </article>
      </main>

      <MacWallMarketingFooter variant="light" shopPricingHref="/pricing" />
    </div>
  )
}
