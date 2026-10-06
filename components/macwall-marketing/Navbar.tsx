"use client"

import { ArrowUpRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import {
  LANDING_SHELL_CLASS,
  landingShellPad,
  landingShellRules,
} from "@/components/macwall-marketing/landing-type"
import {
  macwall,
  macwallInstallerLatestPath,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import {
  getMarketingNavItems,
  getMarketingSecondaryNavItems,
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

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const navDownloadClass = cn(
  "inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-medium text-black no-underline transition-colors hover:bg-white/90",
  focusRing
)

const iconButtonClass = cn(
  "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground",
  focusRing
)

/** Large full-width CTA used inside the mobile sheet. */
const sheetCtaClass = cn(
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-black no-underline transition-colors hover:bg-white/90",
  focusRing
)

function EarnBadge() {
  return (
    <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] leading-none font-medium text-emerald-300">
      Earn 40%
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const menuId = useId()
  const ho = macwallMarketingCopy.hover
  /** The path the menu was opened on; navigating anywhere closes it. */
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname
  const closeMenu = () => setMenuPath(null)

  const withActive = (items: ReturnType<typeof getMarketingNavItems>) =>
    items.map((item) => ({
      ...item,
      active: isMarketingNavActive(pathname, item.href),
    }))
  const navItems = withActive(getMarketingNavItems())
  const secondaryItems = withActive(getMarketingSecondaryNavItems())

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPath(null)
    }
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setMenuPath(null)
    }
    // The sheet covers the page, so the page underneath must not scroll.
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", onResize)
    return () => {
      root.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", onResize)
    }
  }, [menuOpen])

  return (
    <header className="navbar-header fixed inset-x-0 top-[var(--marketing-banner-height)] z-50 w-full lg:sticky lg:top-0">
      <div className={LANDING_SHELL_CLASS}>
        <nav
          className={cn(
            landingShellRules,
            landingShellPad,
            "flex h-14 items-center justify-between gap-4"
          )}
          aria-label="Main"
        >
          <div className="flex min-w-0 items-center gap-6">
            <MacWallBrandLink variant="nav" priority />
            <ul className="hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
                      focusRing,
                      item.active
                        ? "bg-white/[0.08] text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {item.earnBadge ? <EarnBadge /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <a
              href={macwall.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the MacWall Discord"
              className={cn(iconButtonClass, "hidden sm:inline-flex")}
            >
              <DiscordIcon className="size-[15px]" />
            </a>
            {/* A .dmg is no use on a phone; phones get the menu's CTA instead. */}
            <div className="mw-when-desktop ms-1">
              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="pill"
                location="header_desktop"
                className={navDownloadClass}
              >
                <AppleIcon />
                Download
              </TrackedDownloadButton>
            </div>
            <button
              type="button"
              className={cn(iconButtonClass, "ms-0.5 text-foreground lg:hidden")}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
            >
              <span className="relative block h-3 w-4" aria-hidden>
                <span
                  className={cn(
                    "absolute inset-x-0 top-0.5 h-[1.5px] rounded-full bg-current transition-transform duration-200",
                    menuOpen && "translate-y-[4px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0.5 h-[1.5px] rounded-full bg-current transition-transform duration-200",
                    menuOpen && "-translate-y-[4px] -rotate-45"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="absolute inset-x-0 top-full h-[calc(100dvh-var(--marketing-chrome-height))] overflow-y-auto overscroll-contain bg-background animate-in fade-in-0 slide-in-from-top-2 duration-200 lg:hidden"
        >
          <div className={cn(LANDING_SHELL_CLASS, "flex min-h-full flex-col")}>
            <div
              className={cn(
                landingShellRules,
                landingShellPad,
                "flex flex-1 flex-col pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              )}
            >
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li
                    key={item.href}
                    className="border-b border-dashed border-border"
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={item.active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-3 py-4 text-lg tracking-tight transition-colors",
                        item.active
                          ? "text-foreground"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        {item.label}
                        {item.earnBadge ? <EarnBadge /> : null}
                      </span>
                      <ChevronRight
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid grid-cols-2 gap-6 text-[15px] text-muted-foreground">
                <div className="flex flex-col">
                  <p className="pb-1 text-xs text-muted-foreground/70">
                    Read
                  </p>
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={item.active ? "page" : undefined}
                      className={cn(
                        "py-2 transition-colors hover:text-foreground",
                        item.active && "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="pb-1 text-xs text-muted-foreground/70">
                    Talk to us
                  </p>
                  <a
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 py-2 transition-colors hover:text-foreground"
                  >
                    <DiscordIcon className="size-4" />
                    Discord
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                  <a
                    href={mailtoSupport}
                    onClick={closeMenu}
                    className="truncate py-2 transition-colors hover:text-foreground"
                  >
                    {ho.links.supportMail.label}
                  </a>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="mw-when-desktop">
                  <TrackedDownloadButton
                    href={macwallInstallerLatestPath}
                    size="pill"
                    location="header_mobile"
                    className={sheetCtaClass}
                    onClick={closeMenu}
                  >
                    <AppleIcon className="size-4" />
                    Download for Mac
                  </TrackedDownloadButton>
                </div>
                <div className="mw-when-mobile">
                  <Link
                    href="/pricing"
                    onClick={closeMenu}
                    className={sheetCtaClass}
                  >
                    See pricing
                  </Link>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Free for 24 hours. No card needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
