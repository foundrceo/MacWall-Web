"use client"

import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import { aiSummaryProviders } from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import type {
  MarketingFooterColumn,
  MarketingFooterSocialLink,
} from "@/lib/marketing-footer-nav"
import { cn } from "@/lib/utils"

/**
 * The footer as a Mac screen: a menu bar whose menus hold the footer links,
 * a live wallpaper behind, and a Dock with the app, the socials and the AI
 * assistants. Menus open on click (and follow the pointer once one is open,
 * like macOS); the links stay in the page while closed.
 */
export function MacDesktop({
  menus,
  socials,
  wallpaper,
  headline,
  blurb,
}: Readonly<{
  menus: readonly MarketingFooterColumn[]
  socials: readonly MarketingFooterSocialLink[]
  wallpaper: { src: string; poster: string; name: string }
  headline: string
  blurb: string
}>) {
  const [open, setOpen] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpen(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="relative isolate h-[30rem] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-[34rem] lg:h-[38rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <DeferredVideo src={wallpaper.src} poster={wallpaper.poster} label="" />
        <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-black/55" />
      </div>

      {/* Menu bar */}
      <div
        ref={barRef}
        className="relative z-20 flex h-8 items-center bg-black/35 px-1.5 text-[13px] text-white backdrop-blur-xl sm:px-2.5"
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 font-semibold outline-none hover:bg-white/15 focus-visible:bg-white/20"
        >
          <MacWallAppIcon size={15} aria-hidden />
          MacWall
        </Link>
        {menus.map((menu) => {
          const isOpen = open === menu.title
          return (
            <div key={menu.title} className="relative">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setOpen(isOpen ? null : menu.title)}
                onPointerEnter={() => {
                  if (open && !isOpen) setOpen(menu.title)
                }}
                className={cn(
                  "rounded-[5px] px-2 py-0.5 outline-none focus-visible:bg-white/20",
                  isOpen ? "bg-white/20" : "hover:bg-white/10"
                )}
              >
                {menu.title}
              </button>
              <ul
                role="menu"
                aria-label={menu.title}
                className={cn(
                  "absolute top-full left-0 mt-1 min-w-52 rounded-lg bg-[#262626]/85 p-1 shadow-[0_12px_40px_rgb(0_0_0/0.5)] ring-1 ring-white/15 backdrop-blur-2xl",
                  isOpen ? "block" : "hidden"
                )}
              >
                {menu.links.map((link) => (
                  <li key={link.href} role="none">
                    <Link
                      role="menuitem"
                      href={link.href}
                      onClick={() => setOpen(null)}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="block rounded-[5px] px-2.5 py-1 text-[13px] text-white/90 outline-none hover:bg-[#0a84ff] hover:text-white focus-visible:bg-[#0a84ff] focus-visible:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <MenuBarClock />
      </div>

      {/* Desktop */}
      <div className="flex h-[calc(100%-2rem)] flex-col items-center px-6 pt-[12%] text-center">
        <p className="font-display text-4xl tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] md:text-6xl">
          {headline}
        </p>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80 [text-shadow:0_1px_12px_rgb(0_0_0/0.5)]">
          {blurb}
        </p>
        <p className="mt-2 text-[12px] text-white/55">
          Now playing: {wallpaper.name}
        </p>
      </div>

      {/* Dock */}
      <nav
        aria-label="Dock"
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-end gap-1 rounded-[18px] bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-2xl sm:gap-1.5"
      >
        <DockItem label="MacWall" href="/" running>
          <MacWallAppIcon size={44} aria-hidden className="size-9 sm:size-11" />
        </DockItem>
        <DockDivider />
        {socials.map((social) => (
          <DockItem
            key={social.label}
            label={social.label}
            href={social.href}
            external
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-[10px] text-white sm:size-11 sm:rounded-[12px]",
                socialTile[social.brand]
              )}
            >
              <MarketingSocialBrandIcon brand={social.brand} className="size-5" />
            </span>
          </DockItem>
        ))}
        <DockDivider />
        {aiSummaryProviders.map(({ key, name, Icon, href, label }) => (
          <DockItem
            key={key}
            label={`Ask ${name}`}
            ariaLabel={label}
            href={href}
            external
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-[10px] sm:size-11 sm:rounded-[12px]",
                aiTile[key]
              )}
            >
              <Icon className="size-5" />
            </span>
          </DockItem>
        ))}
      </nav>
    </div>
  )
}

/** Dock tiles in each app's own colours, like real app icons. */
const socialTile: Record<MarketingFooterSocialLink["brand"], string> = {
  Discord: "bg-[#5865f2]",
  Instagram:
    "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
  TikTok: "bg-black ring-1 ring-white/15",
}

const aiTile: Record<(typeof aiSummaryProviders)[number]["key"], string> = {
  chatgpt: "bg-white text-black",
  gemini: "bg-linear-to-br from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white",
  perplexity: "bg-[#1f6f78] text-white",
}

function DockItem({
  label,
  ariaLabel,
  href,
  external,
  running,
  children,
}: Readonly<{
  label: string
  ariaLabel?: string
  href: string
  external?: boolean
  running?: boolean
  children: ReactNode
}>) {
  const className =
    "group relative flex flex-col items-center rounded-[12px] outline-none transition-transform duration-200 ease-out hover:-translate-y-2 hover:scale-110 focus-visible:-translate-y-2 focus-visible:scale-110"
  const inner = (
    <>
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-black/70 px-2 py-0.5 text-[12px] whitespace-nowrap text-white opacity-0 ring-1 ring-white/10 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
      {children}
      {running ? (
        <span aria-hidden className="absolute -bottom-1 size-1 rounded-full bg-white/80" />
      ) : null}
    </>
  )
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel ?? label}
      className={className}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} aria-label={ariaLabel ?? label} className={className}>
      {inner}
    </Link>
  )
}

function DockDivider() {
  return <span aria-hidden className="mx-0.5 h-8 w-px self-center bg-white/20 sm:h-9" />
}

const clockFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
})

function subscribeClock(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000)
  return () => window.clearInterval(timer)
}

/** The menu bar clock, in the visitor's own time; empty on the server. */
function MenuBarClock() {
  const now = useSyncExternalStore(
    subscribeClock,
    () => clockFormat.format(new Date()),
    () => null
  )
  return (
    <span className="ml-auto hidden pr-2 text-[13px] text-white/90 tabular-nums sm:block">
      {now}
    </span>
  )
}
