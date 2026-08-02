"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { macwallInstallerLatestPath, mailtoSupport } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { NAVBAR_HEADER_CLASS } from "@/lib/marketing-chrome"
import { cn } from "@/lib/utils"

/** Banner (h-9) + nav (h-14) — sheet fills the rest of the viewport. */
const MOBILE_MENU_TOP = "top-[calc(2.25rem+3.5rem)]"

function MenuIcon({
  open,
  reduceMotion,
}: Readonly<{
  open: boolean
  reduceMotion: boolean | null
}>) {
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <span className="relative block size-5" aria-hidden>
      <motion.span
        className="absolute left-0.5 top-[5px] h-[1.5px] w-4 rounded-full bg-current"
        animate={open ? { y: 5.5, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0.5 top-[9.25px] h-[1.5px] w-4 rounded-full bg-current"
        animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0.5 top-[13.5px] h-[1.5px] w-4 rounded-full bg-current"
        animate={open ? { y: -5.5, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
    </span>
  )
}

function NavActions({
  menuOpen,
  onMenuToggle,
  reduceMotion,
  className,
}: Readonly<{
  menuOpen: boolean
  onMenuToggle: () => void
  reduceMotion: boolean | null
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
        className="relative z-[70] inline-flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
      >
        <MenuIcon open={menuOpen} reduceMotion={reduceMotion} />
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
        "nav-earn-text leading-none font-semibold tracking-wide text-emerald-400",
        className
      )}
    >
      Earn 40%
    </span>
  )
}

function MobileNavSheet({
  menuId,
  open,
  reduceMotion,
  navItems,
  supportLabel,
  downloadLabel,
  onClose,
}: Readonly<{
  menuId: string
  open: boolean
  reduceMotion: boolean | null
  navItems: ReadonlyArray<{
    href: string
    label: string
    active: boolean
    earnBadge?: boolean
  }>
  supportLabel: string
  downloadLabel: string
  onClose: () => void
}>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="nav-sheet"
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={cn(
            "fixed inset-x-0 bottom-0 z-[90] flex flex-col lg:hidden",
            MOBILE_MENU_TOP,
            "border-t border-white/10 bg-[#050505]/80 backdrop-blur-[32px] backdrop-saturate-150"
          )}
          style={{ WebkitBackdropFilter: "blur(32px) saturate(1.5)" }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="flex min-h-0 flex-1 flex-col"
            initial={reduceMotion ? false : { y: -16, opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: -10, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-5 sm:px-6">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.05 + index * 0.04,
                    duration: 0.26,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-3.5 text-[17px] text-white transition hover:bg-white/[0.08]",
                      item.active && "bg-white/[0.1]"
                    )}
                    onClick={onClose}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      {item.label}
                      {item.earnBadge ? (
                        <EarnBadge className="text-[11px]" />
                      ) : null}
                    </span>
                    {item.active ? (
                      <span
                        className="size-1.5 rounded-full bg-white"
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.26,
                  duration: 0.26,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <a
                  href={mailtoSupport}
                  className="flex items-center rounded-xl px-3.5 py-3.5 text-[17px] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                  onClick={onClose}
                >
                  {supportLabel}
                </a>
              </motion.li>
            </ul>

            <motion.div
              className="mx-auto w-full max-w-7xl border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0 : 0.18,
                duration: 0.26,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="sm"
                location="header_mobile"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium text-black hover:opacity-90"
                onClick={onClose}
              >
                {downloadLabel}
              </TrackedDownloadButton>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const menuId = useId()
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

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        NAVBAR_HEADER_CLASS,
        "relative overflow-visible",
        menuOpen &&
          "z-[91] bg-[#050505]/80 backdrop-blur-[32px] lg:z-50 lg:bg-background/45 lg:backdrop-blur-xl"
      )}
    >
      <nav
        className="relative z-[2] mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:hidden"
        aria-label="Main"
      >
        <BrandLink />
        <NavActions
          menuOpen={menuOpen}
          reduceMotion={reduceMotion}
          onMenuToggle={() => setMenuOpen((open) => !open)}
        />
      </nav>

      <nav
        className="relative z-[2] mx-auto hidden h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center overflow-visible px-4 sm:px-6 lg:grid lg:px-6 xl:px-8"
        aria-label="Main"
      >
        <div className="flex h-full items-center justify-self-start">
          <BrandLink />
        </div>
        <ul className="flex items-center gap-4 justify-self-center overflow-visible xl:gap-7">
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
          reduceMotion={reduceMotion}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          className="justify-self-end"
        />
      </nav>

      <MobileNavSheet
        menuId={menuId}
        open={menuOpen}
        reduceMotion={reduceMotion}
        navItems={navItems}
        supportLabel={ho.links.supportMail.label}
        downloadLabel={h.downloadCta}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  )
}
