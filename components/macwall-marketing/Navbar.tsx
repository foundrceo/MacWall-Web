"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { LANDING_SHELL_CLASS, pillCtaNavClass } from "@/components/macwall-marketing/landing-type"
import {
  macwall,
  macwallInstallerLatestPath,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import {
  getMarketingNavItems,
  isMarketingNavActive,
} from "@/lib/marketing-nav"
import { cn } from "@/lib/utils"

function DiscordIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("size-4 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 12.3 12.3 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.099.246.198.373.292a.077.077 0 01-.007.128 12.3 12.3 0 01-1.873.891.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function EarnBadge() {
  return (
    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] leading-none font-medium text-white">
      Earn 40%
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const menuId = useId()
  const h = macwallMarketingCopy.header
  const ho = macwallMarketingCopy.hover
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = getMarketingNavItems().map((item) => ({
    ...item,
    active: isMarketingNavActive(pathname, item.href),
  }))

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  return (
    <header className="navbar-header fixed inset-x-0 top-[var(--marketing-banner-height)] z-50 w-full lg:sticky lg:top-0">
      <nav
        className={cn(LANDING_SHELL_CLASS, "flex h-14 items-center justify-between")}
        aria-label="Main"
      >
        <div className="flex min-w-0 items-center gap-8">
          <MacWallBrandLink variant="nav" priority />
          <ul className="hidden items-center gap-6 text-[14px] leading-5 text-landing-muted lg:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 transition-colors hover:text-white",
                    item.active && "text-white"
                  )}
                >
                  {item.label}
                  {item.earnBadge ? <EarnBadge /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href={macwall.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join Discord"
            className="hidden text-landing-muted transition-colors hover:text-white sm:inline-flex"
          >
            <DiscordIcon />
          </a>
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            size="sm"
            location="header_desktop"
            className={pillCtaNavClass}
          >
            Download
          </TrackedDownloadButton>
          <button
            type="button"
            className="flex size-8 items-center justify-center text-zinc-300 hover:text-white lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id={menuId}
          className="absolute top-full left-1/2 w-screen -translate-x-1/2 bg-card lg:hidden"
        >
          <div
            className={cn(
              LANDING_SHELL_CLASS,
              "flex flex-col gap-1 py-3"
            )}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 py-2 text-[13px] text-zinc-300 hover:text-white"
              >
                {item.label}
                {item.earnBadge ? <EarnBadge /> : null}
              </Link>
            ))}
            <a
              href={macwall.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 py-2 text-[13px] text-[#5865F2] hover:opacity-80"
            >
              <DiscordIcon />
              Join Discord
            </a>
            <a
              href={mailtoSupport}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[13px] text-zinc-300 hover:text-white"
            >
              {ho.links.supportMail.label}
            </a>
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="sm"
              location="header_mobile"
              className={cn(pillCtaNavClass, "mt-1 w-fit")}
              onClick={() => setMenuOpen(false)}
            >
              {h.downloadCta}
            </TrackedDownloadButton>
          </div>
        </div>
      ) : null}
    </header>
  )
}
