"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallInstallerLatestPath,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { cn } from "@/lib/utils"

export type MacWallMarketingHeaderVariant = "light" | "dark"

export default function MacWallMarketingHeader({
  variant = "light",
}: Readonly<{ variant?: MacWallMarketingHeaderVariant }>) {
  const dark = variant === "dark"
  const pathname = usePathname()
  const h = macwallExactCopy.header
  const ho = macwallExactCopy.hover

  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState<string | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const scheduleClose = useCallback(() => {
    clearLeave()
    leaveTimer.current = setTimeout(() => setMegaOpen(null), 160)
  }, [])

  useEffect(() => () => clearLeave(), [])

  const navLink = (active: boolean) =>
    cn(
      "text-[12px] transition-colors",
      dark
        ? active
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active
          ? "text-[#1d1d1f]"
          : "text-[#1d1d1f]/65 hover:text-[#1d1d1f]"
    )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-2xl backdrop-saturate-150",
        dark ? "border-white/10 bg-black/80" : "border-black/[0.06] bg-white/80"
      )}
    >
      <div className="MacWallMarketingHeaderBar mx-auto h-[44px] max-w-[1080px]">
        <Link
          href="/"
          className={cn(
            "MacWallMarketingHeaderBrand flex min-w-0 items-center gap-2 text-[14px] tracking-[-0.01em]",
            dark ? "text-white" : "text-[#1d1d1f]"
          )}
        >
          <Image
            alt={h.logoAlt}
            width={20}
            height={20}
            src={macwallAppIconPath}
            className={cn(macwallAppIconRadiusClass, "shrink-0 object-cover")}
            priority={pathname === "/"}
          />
          <span className="truncate font-medium">{macwall.name}</span>
        </Link>

        <nav className="MacWallMarketingHeaderNav" aria-label="Main">
          <Link
            href="/"
            className={cn(
              navLink(pathname === "/"),
              "MacWallMarketingHeaderNavItem"
            )}
          >
            {h.navOverview}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => {
              clearLeave()
              setMegaOpen("community")
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={cn(
                navLink(false),
                "MacWallMarketingHeaderNavItem cursor-default border-0 bg-transparent p-0"
              )}
              aria-expanded={megaOpen === "community"}
            >
              {h.navSocials}
            </button>
          </div>

          <div
            className="relative"
            onMouseEnter={() => {
              clearLeave()
              setMegaOpen("support")
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={cn(
                navLink(false),
                "MacWallMarketingHeaderNavItem cursor-default border-0 bg-transparent p-0"
              )}
              aria-expanded={megaOpen === "support"}
            >
              {h.navSupport}
            </button>
          </div>

          <Link
            href="/blog"
            className={cn(
              navLink(pathname === "/blog" || pathname.startsWith("/blog/")),
              "MacWallMarketingHeaderNavItem"
            )}
          >
            {h.navBlog}
          </Link>

          <Link
            href="/pricing"
            className={cn(
              navLink(pathname === "/pricing"),
              "MacWallMarketingHeaderNavItem"
            )}
          >
            {h.navPricing}
          </Link>
        </nav>

        <div className="MacWallMarketingHeaderActions flex items-center justify-end gap-2">
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            size="sm"
            className="MacWallMarketingHeaderDownload shrink-0"
            location="header_desktop"
          >
            {h.downloadCta}
          </TrackedDownloadButton>

          <button
            type="button"
            className={cn(
              "MacWallMarketingHeaderMenu size-8 shrink-0 items-center justify-center rounded-lg",
              dark ? "text-white" : "text-[#1d1d1f]"
            )}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-[44px] border-b transition-all duration-200",
          dark
            ? "border-white/10 bg-[#1d1d1f]/95"
            : "border-black/[0.06] bg-white/95",
          megaOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
        onMouseEnter={clearLeave}
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto max-w-[1080px] px-6 py-7 md:px-8">
          {megaOpen === "community" ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-[#86868b] uppercase">
                {ho.exploreTitle}
              </p>
              <a
                href={macwall.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-[19px] font-semibold tracking-[-0.01em] hover:underline",
                  dark ? "text-white" : "text-[#1d1d1f]"
                )}
              >
                {ho.links.discord.label}
              </a>
            </div>
          ) : null}
          {megaOpen === "support" ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-[#86868b] uppercase">
                {ho.supportEmailTitle}
              </p>
              <a
                href={mailtoSupport}
                className={cn(
                  "text-[19px] font-semibold tracking-[-0.01em] hover:underline",
                  dark ? "text-white" : "text-[#1d1d1f]"
                )}
              >
                {ho.links.supportMail.label}
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {menuOpen ? (
        <div
          className={cn(
            "MacWallMarketingHeaderMobilePanel border-t px-4 py-5",
            dark
              ? "border-white/10 bg-[#1d1d1f]"
              : "border-black/[0.06] bg-white"
          )}
        >
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            <Link
              href="/"
              className={navLink(pathname === "/")}
              onClick={() => setMenuOpen(false)}
            >
              {h.navOverview}
            </Link>
            <Link
              href="/blog"
              className={navLink(
                pathname === "/blog" || pathname.startsWith("/blog/")
              )}
              onClick={() => setMenuOpen(false)}
            >
              {h.navBlog}
            </Link>
            <Link
              href="/pricing"
              className={navLink(pathname === "/pricing")}
              onClick={() => setMenuOpen(false)}
            >
              {h.navPricing}
            </Link>
            <a
              href={macwall.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className={navLink(false)}
            >
              {ho.links.discord.label}
            </a>
            <a href={mailtoSupport} className={navLink(false)}>
              {ho.links.supportMail.label}
            </a>
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="sm"
              location="header_mobile"
            >
              {h.downloadCta}
            </TrackedDownloadButton>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
