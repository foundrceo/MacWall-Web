"use client"

import Link from "next/link"
import { TrackedFooterLink } from "@/components/analytics/tracked-marketing-buttons"
import { macwall, mailtoSupport } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  footerAnalyticsLocation,
  getMarketingFooterSections,
  type FooterNavLink,
} from "@/lib/marketing-footer-nav"
import { MarketingContainer } from "@/components/macwall-marketing/marketing-primitives"
import { cn } from "@/lib/utils"

export type MacWallMarketingFooterVariant = "dark" | "light"

function FooterBrandBlock({
  titleClass,
  linkClass,
}: Readonly<{
  titleClass: string
  linkClass: string
}>) {
  const org = macwallExactCopy.footer.org

  return (
    <div className="MacWallMarketingFooterBrand">
      <h3 className={titleClass}>{org.name}</h3>
      <ul className="mt-2 space-y-2">
        <li>
          <a className={linkClass} href={macwall.website}>
            {org.website}
          </a>
        </li>
        <li>
          <a className={linkClass} href={mailtoSupport}>
            {macwall.supportEmail}
          </a>
        </li>
      </ul>
    </div>
  )
}

function FooterNavLinkItem({
  link,
  sectionTitle,
  linkClass,
  mobile,
}: Readonly<{
  link: FooterNavLink
  sectionTitle: string
  linkClass: string
  mobile: boolean
}>) {
  const location = footerAnalyticsLocation(sectionTitle, link.kind, mobile)

  if (link.kind === "pricing") {
    return (
      <TrackedFooterLink
        className={linkClass}
        href={link.href}
        eventName="pricing_click"
        location={location}
        external
      >
        {link.label}
      </TrackedFooterLink>
    )
  }

  if (link.kind === "download") {
    return (
      <TrackedFooterLink
        className={linkClass}
        href={link.href}
        eventName="download_click"
        location={location}
      >
        {link.label}
      </TrackedFooterLink>
    )
  }

  if (link.kind === "external") {
    return (
      <a
        className={linkClass}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link className={linkClass} href={link.href}>
      {link.label}
    </Link>
  )
}

function FooterSection({
  title,
  links,
  titleClass,
  linkClass,
  mobile = false,
}: Readonly<{
  title: string
  links: readonly FooterNavLink[]
  titleClass: string
  linkClass: string
  mobile?: boolean
}>) {
  return (
    <div>
      <h3 className={titleClass}>{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <FooterNavLinkItem
              link={link}
              sectionTitle={title}
              linkClass={linkClass}
              mobile={mobile}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MacWallMarketingFooter({
  shopPricingHref = "/pricing",
  variant = "light",
}: Readonly<{
  shopPricingHref?: string
  variant?: MacWallMarketingFooterVariant
}>) {
  const foot = macwallExactCopy.footer
  const sections = getMarketingFooterSections(shopPricingHref)
  const year = new Date().getFullYear()
  const light = variant === "light"

  const linkClass = cn(
    "text-[12px] leading-[1.333] transition-opacity hover:opacity-70",
    light ? "text-[#424245]" : "text-[#a1a1a6]"
  )

  const titleClass = cn(
    "mb-3 text-[12px] font-semibold",
    light ? "text-[#1d1d1f]" : "text-[#f5f5f7]"
  )

  const disclaimerClass = cn(
    "MacWallMarketingFooterDisclaimer mb-8 space-y-2 border-b pb-8 text-[12px] leading-[1.333]",
    light
      ? "border-black/[0.12] text-[#6e6e73]"
      : "border-white/[0.12] text-[#a1a1a6]"
  )

  return (
    <footer
      className={cn(
        "pt-8 pb-6",
        light ? "bg-[#f5f5f7] text-[#1d1d1f]" : "bg-[#1d1d1f] text-[#f5f5f7]"
      )}
      data-macwall-footer={variant}
    >
      <MarketingContainer wide>
        <ul className={disclaimerClass}>
          {foot.disclaimerBullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>

        <nav className="MacWallMarketingFooterDesktop" aria-label="Footer">
          <FooterBrandBlock titleClass={titleClass} linkClass={linkClass} />
          {sections.map((section) => (
            <FooterSection
              key={section.title}
              title={section.title}
              links={section.links}
              titleClass={titleClass}
              linkClass={linkClass}
            />
          ))}
        </nav>

        <nav
          className="MacWallMarketingFooterMobile"
          aria-label="Footer (mobile)"
        >
          <FooterBrandBlock titleClass={titleClass} linkClass={linkClass} />

          {sections.map((section) => (
            <details
              key={section.title}
              className={cn(
                "group border-t py-3",
                light ? "border-black/[0.12]" : "border-white/[0.12]"
              )}
            >
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold [&::-webkit-details-marker]:hidden",
                  light ? "text-[#1d1d1f]" : "text-[#f5f5f7]"
                )}
              >
                {section.title}
                <svg
                  className="size-3 transition-transform group-open:rotate-90"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
                </svg>
              </summary>
              <ul className="mt-3 space-y-2 pb-2">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.href}-mobile`}>
                    <FooterNavLinkItem
                      link={link}
                      sectionTitle={section.title}
                      linkClass={linkClass}
                      mobile
                    />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>

        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-6 text-[12px]",
            light
              ? "border-black/[0.12] text-[#424245]"
              : "border-white/[0.12] text-[#a1a1a6]"
          )}
        >
          <span>
            © {year} {foot.copyrightName}. All rights reserved.
          </span>
          <span
            className={cn("MacWallMarketingFooterPipe", linkClass)}
            aria-hidden
          >
            |
          </span>
          <Link className={linkClass} href="/terms">
            {foot.legal.terms}
          </Link>
          <span className={linkClass} aria-hidden>
            |
          </span>
          <Link className={linkClass} href="/privacy">
            {foot.legal.privacy}
          </Link>
        </div>
      </MarketingContainer>
    </footer>
  )
}
