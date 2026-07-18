"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import {
  macwall,
  macwallInstallerLatestPath,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { NAVBAR_HEADER_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"

function DiscordIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 12.683 12.683 0 00-.608 1.25 18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

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
      <a
        href={macwall.discordInvite}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        className="hidden items-center justify-center rounded-md p-0.5 text-white transition-opacity hover:opacity-70 sm:inline-flex"
      >
        <DiscordIcon className="size-3.5" />
      </a>
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

export default function Navbar() {
  const pathname = usePathname()
  const h = macwallExactCopy.header
  const ho = macwallExactCopy.hover
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass =
    "text-[15px] text-white transition-opacity hover:opacity-70"

  const navItems = [
    { href: "/", label: h.navOverview, active: pathname === "/" },
    {
      href: "/pricing",
      label: h.navPricing,
      active: pathname === "/pricing",
    },
    {
      href: "/live-wallpaper-mac",
      label: "Features",
      active: pathname === "/live-wallpaper-mac",
    },
    {
      href: "/blog",
      label: h.navBlog,
      active: pathname === "/blog" || pathname.startsWith("/blog/"),
    },
  ] as const

  return (
    <header className={NAVBAR_HEADER_CLASS}>
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
        className="mx-auto hidden h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 md:grid"
        aria-label="Main"
      >
        <div className="flex h-full items-center justify-self-start">
          <BrandLink />
        </div>
        <ul className="flex items-center gap-7 justify-self-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={navLinkClass}>
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
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={macwall.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass}
              >
                {ho.links.discord.label}
              </a>
            </li>
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
