"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import {
  ArrowRight01Icon,
  CommandLineIcon,
  Download01Icon,
  File01Icon,
  Image01Icon,
  LinkSquare01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { KbdBadge, KbdShortcut } from "@/components/command-palette/kbd-badge"
import { useCommandPalette } from "@/components/command-palette/command-palette-provider"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { markCheckoutStartedInSession } from "@/lib/analytics/retargeting"
import { trackMetaInitiateCheckout } from "@/lib/analytics/meta-client"
import { trackTikTokInitiateCheckoutWithIdentify } from "@/lib/analytics/tiktok-client"
import {
  offerSlugFromCheckoutHref,
  waitForPrefetchedCheckoutUrl,
} from "@/lib/checkout/prefetch-checkout"
import {
  getCommandPaletteStaticItems,
  matchesCommandQuery,
} from "@/lib/command-palette/items"
import {
  COMMAND_PALETTE_FILTERS,
  type CommandPaletteFilter,
  type CommandPaletteItem,
  type CommandPaletteSection,
  type CommandPaletteStaticItem,
} from "@/lib/command-palette/types"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { cn } from "@/lib/utils"

const WALLPAPER_LIMIT = 8
const SEARCH_DEBOUNCE_MS = 400

const springPanel = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
}

/** Layout tokens — shared horizontal axis + compact density. */
const PALETTE = {
  /** Shared left/right padding for search, tabs, section titles, footer. */
  px: "px-4",
  /** Inset so row selection pills don't touch panel edge. */
  rowInset: "mx-1",
  width: "max-w-[540px]",
  panelRadius: "rounded-2xl",
  rowRadius: "rounded-xl",
} as const

const FILTER_ICONS = {
  all: Search01Icon,
  wallpapers: Image01Icon,
  pages: File01Icon,
  actions: CommandLineIcon,
} as const

function filterIndex(filter: CommandPaletteFilter): number {
  return COMMAND_PALETTE_FILTERS.findIndex((entry) => entry.id === filter)
}

function nextFilter(
  filter: CommandPaletteFilter,
  direction: 1 | -1
): CommandPaletteFilter {
  const current = filterIndex(filter)
  const next =
    (current + direction + COMMAND_PALETTE_FILTERS.length) %
    COMMAND_PALETTE_FILTERS.length
  return COMMAND_PALETTE_FILTERS[next]?.id ?? "all"
}

function wallpaperToItem(wallpaper: PublicWallpaper): CommandPaletteItem {
  return {
    id: `wallpaper-${wallpaper.id}`,
    kind: "wallpaper",
    label: wallpaper.name,
    description: wallpaper.category,
    href: wallpaperDetailPath(wallpaper),
    wallpaper,
  }
}

function itemMatchesFilter(
  item: CommandPaletteItem,
  filter: CommandPaletteFilter
): boolean {
  switch (filter) {
    case "all":
      return true
    case "wallpapers":
      return item.kind === "wallpaper"
    case "pages":
      return item.kind === "page"
    case "actions":
      return item.kind === "action"
    default: {
      const _exhaustive: never = filter
      return _exhaustive
    }
  }
}

function ItemIcon({ item }: Readonly<{ item: CommandPaletteItem }>) {
  if (item.kind === "wallpaper") {
    return (
      <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-[#2a2a2c] ring-1 ring-white/[0.08]">
        <Image
          src={item.wallpaper.thumbUrl}
          alt=""
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
        />
      </span>
    )
  }

  const icon =
    item.kind === "page"
      ? File01Icon
      : item.external
        ? LinkSquare01Icon
        : Download01Icon

  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2c] text-white/55 ring-1 ring-white/[0.08]">
      <HugeiconsIcon icon={icon} size={15} strokeWidth={1.75} />
    </span>
  )
}

function FilterTabs({
  active,
  onChange,
  reduceMotion,
}: Readonly<{
  active: CommandPaletteFilter
  onChange: (filter: CommandPaletteFilter) => void
  reduceMotion: boolean | null
}>) {
  return (
    <LayoutGroup id="command-palette-filters">
      <div
        role="tablist"
        aria-label="Filter results"
        className={cn("flex flex-wrap gap-1.5 pb-3", PALETTE.px)}
      >
        {COMMAND_PALETTE_FILTERS.map((filter) => {
          const selected = active === filter.id
          const FilterIcon = FILTER_ICONS[filter.id]
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(filter.id)}
              className={cn(
                "relative inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium transition-colors",
                selected ? "text-white/90" : "text-white/42 hover:text-white/62"
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="command-palette-filter-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.12]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 500, damping: 38 }
                  }
                />
              ) : null}
              <HugeiconsIcon
                icon={FilterIcon}
                size={12}
                strokeWidth={1.75}
                className="relative z-[1] shrink-0"
              />
              <span className="relative z-[1]">{filter.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

function ResultRow({
  item,
  selected,
  optionId,
  onSelect,
  onHover,
  reduceMotion,
  index,
}: Readonly<{
  item: CommandPaletteItem
  selected: boolean
  optionId: string
  onSelect: (item: CommandPaletteItem) => void
  onHover: () => void
  reduceMotion: boolean | null
  index: number
}>) {
  return (
    <motion.li
      layout="position"
      className={PALETTE.rowInset}
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.018,
        duration: reduceMotion ? 0 : 0.14,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        id={optionId}
        type="button"
        role="option"
        aria-selected={selected}
        onMouseEnter={onHover}
        onClick={() => onSelect(item)}
        className={cn(
          "flex min-h-[44px] w-full items-center gap-3 px-2.5 py-2 text-left transition-colors duration-100",
          PALETTE.rowRadius,
          selected ? "bg-white/[0.1]" : "hover:bg-white/[0.05]"
        )}
      >
        <ItemIcon item={item} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-sans text-[13px] leading-snug font-semibold text-white/92">
            {item.label}
          </span>
          {item.description ? (
            <span className="mt-0.5 block truncate font-sans text-[11px] leading-snug text-white/42">
              {item.description}
            </span>
          ) : null}
        </span>
        {item.kind === "wallpaper" && item.wallpaper.isPro ? (
          <span className="shrink-0 rounded-full bg-white/[0.08] px-1.5 py-0.5 font-sans text-[9px] font-medium tracking-wide text-white/50 uppercase">
            Pro
          </span>
        ) : null}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={13}
          strokeWidth={1.75}
          className="shrink-0 text-white/28"
        />
      </button>
    </motion.li>
  )
}

function FooterHint({
  label,
  children,
  wide,
}: Readonly<{ label: string; children: ReactNode; wide?: boolean }>) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <KbdBadge wide={wide}>{label}</KbdBadge>
      <span>{children}</span>
    </span>
  )
}

function subscribeNoop() {
  return () => {}
}

function CommandPaletteDialogContent({
  setOpen,
  reduceMotion,
}: Readonly<{
  setOpen: (open: boolean) => void
  reduceMotion: boolean | null
}>) {
  const router = useRouter()
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<CommandPaletteFilter>("all")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [wallpapers, setWallpapers] = useState<PublicWallpaper[]>([])
  const [wallpapersLoading, setWallpapersLoading] = useState(false)

  const staticItems = useMemo(() => getCommandPaletteStaticItems(), [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setWallpapersLoading(true)
      try {
        const params = new URLSearchParams({
          limit: String(WALLPAPER_LIMIT),
        })
        const trimmed = query.trim()
        if (trimmed) {
          params.set("q", trimmed)
        } else {
          params.set("sort", "popular")
        }

        const response = await fetch(`/api/wallpapers?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        const data = (await response.json()) as {
          wallpapers?: PublicWallpaper[]
        }
        setWallpapers(data.wallpapers ?? [])
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      } finally {
        setWallpapersLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  const filteredStaticPages = useMemo(
    () => staticItems.pages.filter((item) => matchesCommandQuery(item, query)),
    [query, staticItems.pages]
  )

  const filteredStaticActions = useMemo(
    () =>
      staticItems.actions.filter((item) => matchesCommandQuery(item, query)),
    [query, staticItems.actions]
  )

  const wallpaperItems = useMemo(
    () => wallpapers.map(wallpaperToItem),
    [wallpapers]
  )

  const sections = useMemo((): CommandPaletteSection[] => {
    const next: CommandPaletteSection[] = []

    if (filter === "all" || filter === "pages") {
      const pages = filteredStaticPages.filter((item) =>
        itemMatchesFilter(item, filter)
      )
      if (pages.length > 0) {
        next.push({ id: "pages", title: "Pages", items: pages })
      }
    }

    if (filter === "all" || filter === "actions") {
      const actions = filteredStaticActions.filter((item) =>
        itemMatchesFilter(item, filter)
      )
      if (actions.length > 0) {
        next.push({ id: "actions", title: "Actions", items: actions })
      }
    }

    if (filter === "all" || filter === "wallpapers") {
      const items = wallpaperItems.filter((item) =>
        itemMatchesFilter(item, filter)
      )
      if (items.length > 0 || wallpapersLoading) {
        next.push({
          id: "wallpapers",
          title: query.trim() ? "Wallpapers" : "Popular wallpapers",
          items,
        })
      }
    }

    return next
  }, [
    filter,
    filteredStaticActions,
    filteredStaticPages,
    query,
    wallpaperItems,
    wallpapersLoading,
  ])

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections]
  )

  const activeIndex =
    flatItems.length === 0 ? 0 : Math.min(selectedIndex, flatItems.length - 1)

  const activeOptionId =
    flatItems.length > 0
      ? `${listboxId}-option-${flatItems[activeIndex]?.id ?? activeIndex}`
      : undefined

  const runItem = useCallback(
    (item: CommandPaletteItem) => {
      if (item.kind !== "wallpaper") {
        const staticItem = item as CommandPaletteStaticItem
        if (staticItem.analyticsEvent) {
          trackSiteEventClient(staticItem.analyticsEvent, {
            location: staticItem.analyticsLocation ?? "command_palette",
          })
        }
      }

      setOpen(false)

      if (item.kind !== "wallpaper") {
        const staticItem = item as CommandPaletteStaticItem
        if (staticItem.external) {
          window.open(staticItem.href, "_blank", "noopener,noreferrer")
          return
        }

        if (staticItem.href.startsWith("mailto:")) {
          window.location.href = staticItem.href
          return
        }

        // Same POST → Stripe URL path as TrackedLink (never router.push the API route).
        const checkoutOffer = offerSlugFromCheckoutHref(staticItem.href)
        if (checkoutOffer) {
          markCheckoutStartedInSession()
          trackMetaInitiateCheckout()
          void trackTikTokInitiateCheckoutWithIdentify()
          void waitForPrefetchedCheckoutUrl(checkoutOffer)
            .then((url) => {
              if (url?.startsWith("https://")) {
                window.location.assign(url)
                return
              }
              window.location.assign(
                "/pricing?checkout_error=Could%20not%20start%20checkout.%20Please%20try%20again."
              )
            })
            .catch(() => {
              window.location.assign(
                "/pricing?checkout_error=Could%20not%20start%20checkout.%20Please%20try%20again."
              )
            })
          return
        }
      }

      router.push(item.href)
    },
    [router, setOpen]
  )

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelectedIndex((current) =>
        flatItems.length === 0 ? 0 : (current + 1) % flatItems.length
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelectedIndex((current) =>
        flatItems.length === 0
          ? 0
          : (current - 1 + flatItems.length) % flatItems.length
      )
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const item = flatItems[activeIndex]
      if (item) runItem(item)
      return
    }

    if (event.key === "Tab") {
      event.preventDefault()
      setFilter((current) => nextFilter(current, event.shiftKey ? -1 : 1))
      setSelectedIndex(0)
      return
    }

    const shortcutFilter = COMMAND_PALETTE_FILTERS.find(
      (entry) => entry.shortcut === event.key
    )
    if (shortcutFilter && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      setFilter(shortcutFilter.id)
      setSelectedIndex(0)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className={cn(
        "overflow-hidden border border-white/[0.08] bg-[#1c1c1e]/96 font-sans text-white shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl",
        PALETTE.panelRadius
      )}
      style={{ WebkitBackdropFilter: "blur(32px) saturate(1.15)" }}
    >
      {/* Search row */}
      <div className={cn(PALETTE.px, "pt-4 pb-2.5")}>
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Search01Icon}
            size={17}
            strokeWidth={1.75}
            className="shrink-0 text-white/38"
          />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search wallpapers, pages, and actions…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent py-1 font-sans text-[14px] leading-snug text-white outline-none placeholder:text-white/32"
          />
          <KbdBadge wide>Esc</KbdBadge>
        </div>
      </div>

      <FilterTabs
        active={filter}
        onChange={(next) => {
          setFilter(next)
          setSelectedIndex(0)
        }}
        reduceMotion={reduceMotion}
      />

      {/* Results body */}
      <div
        className={cn(
          "max-h-[min(48vh,26rem)] overflow-y-auto pb-3",
          PALETTE.px
        )}
      >
        {flatItems.length === 0 && !wallpapersLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#2a2a2c] text-white/48 ring-1 ring-white/[0.08]">
              <HugeiconsIcon icon={Image01Icon} size={17} strokeWidth={1.75} />
            </span>
            <p className="font-sans text-[13px] font-semibold text-white/82">
              No results found
            </p>
            <p className="max-w-[16rem] font-sans text-[11px] leading-relaxed text-white/38">
              Try another search term or switch filters with Tab.
            </p>
          </div>
        ) : (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Command palette results"
            className="space-y-3"
          >
            {sections.map((section) => (
              <section key={section.id} aria-label={section.title}>
                <div className="flex items-center gap-2 pt-0.5 pb-1 first:pt-0">
                  <h3 className="font-sans text-[10px] font-semibold tracking-[0.06em] text-white/38 uppercase">
                    {section.title}
                  </h3>
                  {section.id === "wallpapers" && wallpapersLoading ? (
                    <span className="font-sans text-[10px] text-white/28">
                      Searching…
                    </span>
                  ) : null}
                </div>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const flatIndex = flatItems.findIndex(
                      (entry) => entry.id === item.id
                    )
                    return (
                      <ResultRow
                        key={item.id}
                        item={item}
                        selected={flatIndex === activeIndex}
                        optionId={`${listboxId}-option-${item.id}`}
                        onSelect={runItem}
                        onHover={() => setSelectedIndex(flatIndex)}
                        reduceMotion={reduceMotion}
                        index={Math.max(flatIndex, 0)}
                      />
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.06] py-3",
          PALETTE.px
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[10px] text-white/42">
          <FooterHint label="↵">Open</FooterHint>
          <FooterHint label="↑↓">Navigate</FooterHint>
          <FooterHint label="Tab" wide>
            Filter
          </FooterHint>
        </div>
        <span className="inline-flex items-center gap-1.5 font-sans text-[10px] text-white/32">
          <span>MacWall</span>
          <span aria-hidden className="text-white/18">
            ·
          </span>
          <KbdShortcut />
        </span>
      </div>
    </div>
  )
}

export function CommandPaletteDialog() {
  const { open, session, setOpen } = useCommandPalette()
  const reduceMotion = useReducedMotion()
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  if (!isClient) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="command-palette"
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[min(16vh,7rem)] sm:px-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
          aria-hidden={false}
        >
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
            style={{ WebkitBackdropFilter: "blur(12px)" }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            role="presentation"
            className={cn("relative z-[1] w-full", PALETTE.width)}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.965, y: -10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, scale: 0.975, y: -6 }
            }
            transition={reduceMotion ? { duration: 0 } : springPanel}
          >
            <CommandPaletteDialogContent
              key={session}
              setOpen={setOpen}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
