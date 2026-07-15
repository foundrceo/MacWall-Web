"use client"

import Link from "next/link"
import { TrackedFooterLink } from "@/components/analytics/tracked-marketing-buttons"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallProCheckoutURL,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { MarketingContainer } from "@/components/macwall-marketing/marketing-primitives"
import { cn } from "@/lib/utils"

export type MacWallMarketingFooterVariant = "dark" | "light"

/** Keyword-rich internal links so comparison pages are crawlable from every page. */
const compareLinks = [
  { href: "/best-live-wallpaper-mac", label: "Best Live Wallpaper for Mac" },
  { href: "/alternatives/wallpaper-engine", label: "Wallpaper Engine for Mac" },
  { href: "/alternatives/macwall-vs-wallper", label: "MacWall vs Wallper" },
  { href: "/alternatives/macwall-vs-wallspace", label: "MacWall vs Wallspace" },
  { href: "/alternatives/macwall-vs-backdrop", label: "MacWall vs Backdrop" },
  {
    href: "/alternatives/macwall-vs-iwallpaper",
    label: "MacWall vs iWallpaper",
  },
  {
    href: "/alternatives/macwall-vs-vivid-walls",
    label: "MacWall vs Vivid Walls",
  },
  {
    href: "/alternatives/lively-wallpaper-mac",
    label: "Lively Wallpaper for Mac",
  },
] as const

export default function MacWallMarketingFooter({
  shopPricingHref = "/pricing",
  variant = "light",
}: Readonly<{
  shopPricingHref?: string
  variant?: MacWallMarketingFooterVariant
}>) {
  const foot = macwallExactCopy.footer
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

  return (
    <footer
      className={cn(
        "pt-8 pb-6",
        light ? "bg-[#f5f5f7] text-[#1d1d1f]" : "bg-[#1d1d1f] text-[#f5f5f7]"
      )}
      data-macwall-footer={variant}
    >
      <MarketingContainer wide>
        <ul
          className={cn(
            "mb-8 space-y-2 border-b pb-8 text-[12px] leading-[1.333]",
            light
              ? "border-black/[0.12] text-[#6e6e73]"
              : "border-white/[0.12] text-[#a1a1a6]"
          )}
        >
          {foot.disclaimerBullets.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>

        <div
          className="MacWallMarketingFooterDesktop"
          role="navigation"
          aria-label="Footer"
        >
          <div>
            <h4 className={titleClass}>{foot.org.name}</h4>
            <p className={linkClass}>
              {foot.org.line1}
              <br />
              {foot.org.line2}
            </p>
          </div>

          <div>
            <h3 className={titleClass}>{foot.shopTitle}</h3>
            <ul className="space-y-2">
              <li>
                <TrackedFooterLink
                  className={linkClass}
                  href={macwallProCheckoutURL}
                  eventName="pricing_click"
                  location="footer_shop_buy"
                  external
                >
                  {foot.shop.buy}
                </TrackedFooterLink>
              </li>
              <li>
                <Link className={linkClass} href={shopPricingHref}>
                  {foot.shop.pricing}
                </Link>
              </li>
              <li>
                <TrackedFooterLink
                  className={linkClass}
                  href={macwallInstallerLatestPath}
                  eventName="download_click"
                  location="footer_shop_download"
                >
                  {foot.shop.download}
                </TrackedFooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={titleClass}>{foot.resourcesTitle}</h3>
            <ul className="space-y-2">
              <li>
                <Link className={linkClass} href="/blog">
                  {foot.resources.blog}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/live-wallpaper-mac">
                  {foot.resources.liveWallpaper}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/download">
                  {foot.resources.download}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/lock-screen-wallpaper">
                  Lock Screen Wallpaper
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={titleClass}>Compare</h3>
            <ul className="space-y-2">
              {compareLinks.map((link) => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={titleClass}>{foot.legalTitle}</h3>
            <ul className="space-y-2">
              <li>
                <Link className={linkClass} href="/privacy">
                  {foot.legal.privacy}
                </Link>
              </li>
              <li>
                <Link className={linkClass} href="/terms">
                  {foot.legal.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={titleClass}>{foot.supportTitle}</h3>
            <ul className="space-y-2">
              <li>
                <a className={linkClass} href={mailtoSupport}>
                  {foot.support.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={titleClass}>{foot.communityTitle}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  className={linkClass}
                  href={macwall.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {foot.community.discord}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile accordion-style footer */}
        <div
          className="MacWallMarketingFooterMobile space-y-0"
          role="navigation"
          aria-label="Footer (mobile)"
        >
          <div className="mb-6">
            <h4 className={titleClass}>{foot.org.name}</h4>
            <p className={linkClass}>
              {foot.org.line1}
              <br />
              {foot.org.line2}
            </p>
          </div>

          {[
            {
              title: foot.shopTitle,
              links: [
                {
                  href: macwallProCheckoutURL,
                  label: foot.shop.buy,
                  external: true,
                },
                { href: shopPricingHref, label: foot.shop.pricing },
                { href: macwallInstallerLatestPath, label: foot.shop.download },
              ],
            },
            {
              title: foot.resourcesTitle,
              links: [
                { href: "/blog", label: foot.resources.blog },
                {
                  href: "/live-wallpaper-mac",
                  label: foot.resources.liveWallpaper,
                },
                { href: "/download", label: foot.resources.download },
                {
                  href: "/lock-screen-wallpaper",
                  label: "Lock Screen Wallpaper",
                },
              ],
            },
            {
              title: "Compare",
              links: [...compareLinks],
            },
            {
              title: foot.legalTitle,
              links: [
                { href: "/privacy", label: foot.legal.privacy },
                { href: "/terms", label: foot.legal.terms },
              ],
            },
            {
              title: foot.supportTitle,
              links: [{ href: mailtoSupport, label: foot.support.email }],
            },
            {
              title: foot.communityTitle,
              links: [
                {
                  href: macwall.discordInvite,
                  label: foot.community.discord,
                  external: true,
                },
              ],
            },
          ].map((section) => (
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
                  <li key={link.label}>
                    {link.href === macwallProCheckoutURL ? (
                      <TrackedFooterLink
                        className={linkClass}
                        href={link.href}
                        eventName="pricing_click"
                        location="footer_mobile_shop"
                        external
                      >
                        {link.label}
                      </TrackedFooterLink>
                    ) : link.href === macwallInstallerLatestPath ? (
                      <TrackedFooterLink
                        className={linkClass}
                        href={link.href}
                        eventName="download_click"
                        location="footer_mobile_download"
                      >
                        {link.label}
                      </TrackedFooterLink>
                    ) : "external" in link && link.external ? (
                      <a
                        className={linkClass}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("mailto:") ? (
                      <a className={linkClass} href={link.href}>
                        {link.label}
                      </a>
                    ) : (
                      <Link className={linkClass} href={link.href}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-6 text-[12px]",
            light ? "border-black/[0.12]" : "border-white/[0.12]"
          )}
        >
          <span className={linkClass}>
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
