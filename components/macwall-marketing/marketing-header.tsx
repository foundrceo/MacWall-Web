"use client"

import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

export type MacWallMarketingHeaderVariant = "dark" | "light"

/** Top marketing nav (home, pricing, legal, …). */
export default function MacWallMarketingHeader({
  variant = "dark",
}: Readonly<{ variant?: MacWallMarketingHeaderVariant }>) {
  const light = variant === "light"
  const pathname = usePathname()
  const overviewActive = pathname === "/"
  const pricingActive = pathname === "/pricing"

  const h = macwallExactCopy.header
  const ho = macwallExactCopy.hover
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHover, setNavHover] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const scheduleClose = useCallback(() => {
    clearLeave()
    leaveTimer.current = setTimeout(() => setNavHover(false), 180)
  }, [])

  useEffect(() => () => clearLeave(), [])

  const keepMegaOpen = useCallback(() => {
    clearLeave()
    setNavHover(true)
  }, [])

  const navItem = (active: boolean) =>
    active
      ? light
        ? "Header_activeBlack__Q4QG5"
        : "Header_active__oXKOc"
      : "Header_navLink__UiCPW"

  const headerSurface = light
    ? "Header_header_white__oghaD"
    : "Header_header_black__igo2e"

  return (
    <header className={headerSurface}>
      <div
        className="Header_container__Kzpza"
        style={{ opacity: 1, transform: "none" }}
      >
        <div
          className={clsx("Header_left__wL_E2", light && "Header_black__ssOR6")}
          style={{ opacity: 1, transform: "none" }}
        >
          <Link className="Header_logo__49F8E" href="/">
            <Image
              alt={h.logoAlt}
              width={28}
              height={28}
              decoding="async"
              src={macwallAppIconPath}
              className={`${macwallAppIconRadiusClass} object-cover`}
              style={{ color: "transparent" }}
              priority={pathname === "/"}
            />
            {macwall.name} for macOS
          </Link>
        </div>
        <div
          className="Header_right__WR_Le"
          style={{ opacity: 1, transform: "none" }}
        >
          <button
            type="button"
            className="Header_mobile_icon__Talq4"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                color: light ? "rgba(0, 0, 0, 0.65)" : "rgb(255, 255, 255)",
                transform: menuOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <path d="M18.78 15.78a.749.749 0 0 1-1.06 0L12 10.061 6.28 15.78a.749.749 0 1 1-1.06-1.06l6.25-6.25a.749.749 0 0 1 1.06 0l6.25 6.25a.749.749 0 0 1 0 1.06Z" />
            </svg>
          </button>
          <div
            className={clsx(
              "Header_navigation_header__bvCmS",
              light && "Header_black__ssOR6",
              menuOpen && "max-[830px]:![display:flex]"
            )}
          >
            <Link className={navItem(overviewActive)} href="/">
              {h.navOverview}
            </Link>
            <div onMouseEnter={keepMegaOpen}>
              <button
                type="button"
                className="Header_navButton__utV_Q"
                aria-expanded={navHover}
                aria-haspopup="true"
              >
                {h.navSocials}
              </button>
            </div>
            <div onMouseEnter={keepMegaOpen}>
              <button
                type="button"
                className="Header_navButton__utV_Q"
                aria-expanded={navHover}
                aria-haspopup="true"
              >
                {h.navSupport}
              </button>
            </div>
            <Link className={navItem(pricingActive)} href="/pricing">
              {h.navPricing}
            </Link>
          </div>
          <div className="Header_user_buttons__pvlG6">
            <Link
              className="SecondaryButton_secondaryButton__F7442"
              href={macwallInstallerLatestPath}
              style={{
                fontSize: 12,
                fontWeight: 500,
                width: "max-content",
                padding: "3px 10px",
                backgroundColor: "rgb(0, 113, 227)",
              }}
            >
              <span>{h.downloadCta}</span>
            </Link>
          </div>
        </div>
      </div>
      <div
        className="HoverMenu_active__LgeG3"
        style={{
          display: navHover ? "flex" : "none",
          opacity: navHover ? 1 : 0,
          transform: navHover ? "none" : "translateY(8px)",
        }}
        onMouseEnter={keepMegaOpen}
        onMouseLeave={scheduleClose}
      >
        <div
          className={
            light ? "HoverMenu_contentBlack___1Gr3" : "HoverMenu_content__v2B7L"
          }
        >
          <div className="HoverMenu_container__4i6wf">
            <div className="HoverMenu_block__9R02a">
              <p
                className={
                  light
                    ? "HoverMenu_blackHeading__xquPy"
                    : "HoverMenu_heading__WpMMp"
                }
              >
                {ho.exploreTitle}
              </p>
              <div className="HoverMenu_links__AjMzs">
                <a
                  className={
                    light
                      ? "HoverMenu_blackLinks__jF7Ps"
                      : "HoverMenu_link__SaLDK"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  title={ho.links.discord.title}
                  href={macwall.discordInvite}
                >
                  <span>{ho.links.discord.label}</span>
                </a>
              </div>
            </div>
            <div className="HoverMenu_block__9R02a">
              <p
                className={
                  light
                    ? "HoverMenu_blackHeading__xquPy"
                    : "HoverMenu_heading__WpMMp"
                }
              >
                {ho.supportEmailTitle}
              </p>
              <div className="HoverMenu_links__AjMzs">
                <a
                  className={
                    light
                      ? "HoverMenu_blackLinks__jF7Ps"
                      : "HoverMenu_link__SaLDK"
                  }
                  title={ho.links.supportMail.title}
                  href={mailtoSupport}
                >
                  <span>{ho.links.supportMail.label}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
