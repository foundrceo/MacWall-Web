"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import {
  macwallInstallerLatestPath,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { NAVBAR_HEADER_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"


function NavActions({
  menuOpen,
  onMenuToggle,
  className,
}: Readonly<{
  menuOpen: boolean
  onMenuToggle: () => void
  className?: string
}>) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <TrackedDownloadButton
        href={macwallInstallerLatestPath}
        size="sm"
        location="header_desktop"
        className="inline-flex h-7 items-center rounded-full bg-white px-2.5 text-[13px] font-medium text-black transition-opacity hover:opacity-90"
      >
        Download
      </TrackedDownloadButton>
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center text-white transition-opacity hover:opacity-70 md:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          {menuOpen ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
    </div>
  )
}

function BrandLink() {
  return <MacWallBrandLink variant="nav" priority />
}

function EarnBadge({
  className,
}: Readonly<{
  className?: string
}>) {
  return (
    <span
      aria-hidden
      className={cn(
        "nav-earn-text font-semibold leading-none tracking-wide text-emerald-400",
        className
      )}
    >
      Earn 40%
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const h = macwallExactCopy.header
  const ho = macwallExactCopy.hover
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass =
    "text-[15px] text-white transition-opacity hover:opacity-70"

  const navItems: ReadonlyArray<{
    href: string
    label: string
    active: boolean
    earnBadge?: boolean
  }> = [
    { href: "/", label: h.navOverview, active: pathname === "/" },
    {
      href: "/pricing",
      label: h.navPricing,
      active: pathname === "/pricing" || pathname.startsWith("/pricing/"),
    },
    {
      href: "/submit",
      label: h.navSubmit,
      active: pathname === "/submit" || pathname.startsWith("/submit/"),
    },
    {
      href: "/affiliate",
      label: h.navAffiliate,
      active: pathname === "/affiliate" || pathname.startsWith("/affiliate/"),
      earnBadge: true,
    },
    {
      href: "/blog",
      label: h.navBlog,
      active: pathname === "/blog" || pathname.startsWith("/blog/"),
    },
  ]

  return (
    <header className={cn(NAVBAR_HEADER_CLASS, "overflow-visible")}>
      <nav
        className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 md:hidden"
        aria-label="Main"
      >
        <BrandLink />
        <NavActions
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
        />
      </nav>

      <nav
        className="mx-auto hidden h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center overflow-visible px-4 sm:px-6 md:grid"
        aria-label="Main"
      >
        <div className="flex h-full items-center justify-self-start">
          <BrandLink />
        </div>
        <ul className="flex items-center gap-7 justify-self-center overflow-visible">
          {navItems.map((item) => (
            <li key={item.href} className="overflow-visible">
              <Link
                href={item.href}
                className={cn(
                  navLinkClass,
                  item.earnBadge && "relative inline-block"
                )}
              >
                {item.earnBadge ? (
                  <EarnBadge className="pointer-events-none absolute -top-2.5 right-0 text-[10px]" />
                ) : null}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <NavActions
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          className="justify-self-end"
        />
      </nav>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-background/95 px-4 py-5 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navLinkClass,
                    item.earnBadge && "inline-flex items-center gap-2"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  {item.earnBadge ? (
                    <EarnBadge className="text-[11px]" />
                  ) : null}
                </Link>
              </li>
            ))}
            <li>
              <a href={mailtoSupport} className={navLinkClass}>
                {ho.links.supportMail.label}
              </a>
            </li>
            <li>
              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="sm"
                location="header_mobile"
                className="w-full justify-center rounded-full bg-white text-black hover:opacity-90"
              >
                {h.downloadCta}
              </TrackedDownloadButton>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
