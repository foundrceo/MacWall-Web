import Image from "next/image"
import type { ReactNode } from "react"
import {
  ArrowRight02Icon,
  Cursor01Icon,
  Folder01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export type HowStep = (typeof macwallMarketingCopy.landing.steps)[number]

/**
 * One visual language for all three steps: the same window, one focal idea
 * at a readable size. Install shows the drag to Applications, Pick a search
 * finding the wallpaper, Set a button that downloads and sets it.
 *
 * Contents follow the window's own width (container queries) in three
 * tiers: narrow (tablet columns), regular (phones, lg), and large (21rem+,
 * desktop columns), so each window stays filled in proportion.
 */
function MockWindow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="@container relative h-full w-full overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/[0.07]">
      <div className="flex h-6 items-center gap-1.5 px-3 @min-[21rem]:h-7 @min-[21rem]:px-3.5">
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
      </div>
      {children}
    </div>
  )
}

/** Every visual sits in a box this tall so the arrow lands on their centers. */
const FLOW_VISUAL = "flex h-20 items-center justify-center @min-[21rem]:h-24"

/** The window body: everything below the title bar. */
const WINDOW_BODY = "flex h-[calc(100%-1.5rem)] @min-[21rem]:h-[calc(100%-1.75rem)]"

function FlowArrow() {
  return (
    <div className={FLOW_VISUAL} aria-hidden>
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        size={20}
        className="text-white/30 @min-[21rem]:size-6"
      />
    </div>
  )
}

function FlowItem({
  visual,
  label,
}: Readonly<{ visual: ReactNode; label: string }>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={FLOW_VISUAL}>{visual}</div>
      <span className="text-[11px] whitespace-nowrap text-muted-foreground @min-[17rem]:text-[12px] @min-[21rem]:text-[13px]">
        {label}
      </span>
    </div>
  )
}

function Flow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MockWindow>
      {/* Top-aligned row: every visual shares one center line with the arrow. */}
      <div className={cn(WINDOW_BODY, "items-center justify-center")}>
        <div className="flex items-start gap-2.5 @min-[17rem]:gap-6 @min-[21rem]:gap-8">
          {children}
        </div>
      </div>
    </MockWindow>
  )
}

export function InstallVisual() {
  return (
    <Flow>
      <FlowItem
        visual={
          <MacWallAppIcon
            size={80}
            className="!size-[60px] @min-[21rem]:!size-[76px]"
          />
        }
        label="MacWall"
      />
      <FlowArrow />
      <FlowItem
        visual={
          <span className="flex size-[60px] items-center justify-center rounded-[16px] bg-white/[0.06] @min-[21rem]:size-[76px] @min-[21rem]:rounded-[20px]">
            <HugeiconsIcon
              icon={Folder01Icon}
              size={30}
              strokeWidth={1.75}
              className="text-white/70 @min-[21rem]:size-9"
              aria-hidden
            />
          </span>
        }
        label="Applications"
      />
    </Flow>
  )
}

/**
 * Steps 2 and 3 tell one story: Autumn Forest is found by search, then set.
 * Small local copies keep this section off the catalog CDN.
 */
const PICKED = { slug: "autumn-forest", name: "Autumn Forest" } as const

const SEARCH_RESULTS = [
  { slug: "autumn-forest", name: "Autumn Forest", category: "Nature" },
  { slug: "snowy-pines", name: "Snowy Pine Forest", category: "Nature" },
  { slug: "rainy-shop", name: "Rainy Forest Shop", category: "Anime" },
] as const

/** Raycast-style search: a query typed, results with thumbs, top one ready. */
export function PickSearchVisual() {
  return (
    <MockWindow>
      <div
        className={cn(
          WINDOW_BODY,
          "flex-col justify-center gap-2 px-2.5 pb-2.5 @min-[21rem]:gap-2.5 @min-[21rem]:px-3.5 @min-[21rem]:pb-3.5"
        )}
      >
        <div className="flex h-7 shrink-0 items-center gap-2 rounded-lg bg-white/[0.06] px-2.5 @min-[21rem]:h-9 @min-[21rem]:px-3">
          <HugeiconsIcon
            icon={Search01Icon}
            size={13}
            strokeWidth={2}
            className="text-white/45 @min-[21rem]:size-4"
            aria-hidden
          />
          <span className="text-[12px] text-white @min-[21rem]:text-[13px]">
            forest
          </span>
          <span
            className="mw-caret -ml-1.5 h-3.5 w-px bg-white @min-[21rem]:h-4"
            aria-hidden
          />
          <kbd className="ml-auto font-sans text-[10px] text-white/35 @min-[21rem]:text-[11px]">
            ⌘K
          </kbd>
        </div>
        <ul className="flex flex-col gap-1">
          {SEARCH_RESULTS.map((result, index) => (
            <li
              key={result.slug}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-1.5 @min-[21rem]:h-10 @min-[21rem]:gap-3 @min-[21rem]:rounded-lg @min-[21rem]:px-2",
                index === 0 && "bg-white/[0.08]"
              )}
            >
              <span className="relative block aspect-[16/10] w-9 shrink-0 overflow-hidden rounded-[4px] @min-[21rem]:w-12 @min-[21rem]:rounded-[5px]">
                <Image
                  src={`/how/${result.slug}-sm.jpg`}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <span
                className={cn(
                  "min-w-0 truncate text-[12px] @min-[21rem]:text-[13px]",
                  index === 0 ? "text-white" : "text-white/70"
                )}
              >
                {result.name}
              </span>
              <span className="ml-auto shrink-0 text-[10px] text-white/35 @min-[21rem]:text-[11px]">
                {index === 0 ? (
                  <kbd className="rounded bg-white/10 px-1 py-px font-sans text-white/70">
                    ↵
                  </kbd>
                ) : (
                  result.category
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </MockWindow>
  )
}

/**
 * One button, three states on a loop: Set → Downloading (filling) → Set.
 * Reduced motion holds the first state.
 */
export function SetButtonVisual() {
  return (
    <MockWindow>
      <div
        className={cn(
          WINDOW_BODY,
          "flex-col items-center justify-center gap-4 @min-[21rem]:gap-5"
        )}
      >
        <span className="relative block aspect-[16/10] w-28 overflow-hidden rounded-lg shadow-lg ring-1 shadow-black/40 ring-white/10 @min-[21rem]:w-36 @min-[21rem]:rounded-xl">
          <Image
            src={`/how/${PICKED.slug}-sm.jpg`}
            alt=""
            fill
            sizes="144px"
            className="object-cover"
          />
        </span>
        <span className="relative block h-9 w-44 overflow-hidden rounded-full bg-white/[0.07] text-[12px] ring-1 ring-white/10 @min-[21rem]:h-10 @min-[21rem]:w-52 @min-[21rem]:text-[13px]">
          <span className="mw-set-state mw-set-state-1 absolute inset-0 flex items-center justify-center bg-white font-medium text-black">
            Set as wallpaper
            <HugeiconsIcon
              icon={Cursor01Icon}
              size={15}
              strokeWidth={2}
              className="absolute right-6 -bottom-1 fill-white text-black"
              aria-hidden
            />
          </span>
          <span className="mw-set-state mw-set-state-2 absolute inset-0 flex items-center justify-center text-white">
            <span className="mw-set-fill absolute inset-y-0 left-0 bg-white/15" aria-hidden />
            <span className="relative">Downloading…</span>
          </span>
          <span className="mw-set-state mw-set-state-3 absolute inset-0 flex items-center justify-center gap-1.5 bg-white font-medium text-black">
            <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={3} aria-hidden />
            Wallpaper set
          </span>
        </span>
      </div>
    </MockWindow>
  )
}

export const STEP_VISUALS: Record<HowStep["id"], () => ReactNode> = {
  download: InstallVisual,
  browse: PickSearchVisual,
  set: SetButtonVisual,
}
