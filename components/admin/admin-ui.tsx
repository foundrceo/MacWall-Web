"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"
import { useCallback } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AdminSkeleton } from "@/components/admin/admin-skeleton-reveal"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const iconSizes = { sm: 22, md: 32, lg: 56 } as const

export function AdminAppIcon({
  size = "sm",
  className,
}: Readonly<{ size?: keyof typeof iconSizes; className?: string }>) {
  return (
    <MacWallAppIcon
      size={iconSizes[size]}
      className={className}
      priority={size === "lg"}
    />
  )
}

export function AdminAppMark({ subtitle }: Readonly<{ subtitle?: string }>) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="relative flex shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 -m-1 rounded-xl bg-[var(--admin-glow-blue)] blur-md"
        />
        <AdminAppIcon className="relative" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold tracking-tight text-[var(--admin-fg)]">
          {macwall.name}
        </p>
        {subtitle ? (
          <p className="truncate text-[11px] font-medium tracking-wider text-[var(--admin-muted)] uppercase">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/* --- Spotlight -----------------------------------------------------------
 * 21st.dev-style pointer-tracking glow. Sets --mx/--my so the
 * `.admin-spotlight::before` radial follows the cursor. Pointer-only
 * enhancement — content is identical without JS/mouse.
 * ---------------------------------------------------------------------- */

export function AdminSpotlight({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  const onMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`)
    el.style.setProperty("--my", `${event.clientY - rect.top}px`)
  }, [])

  return (
    <div onMouseMove={onMove} className={cn("admin-spotlight", className)}>
      {children}
    </div>
  )
}

/* --- Badges --------------------------------------------------------------
 * A single tone scale so status colours never drift between pages.
 * Text uses the -fg variants (4.5:1+ on tinted surfaces).
 * ---------------------------------------------------------------------- */

export type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet"

const toneClass: Record<Tone, string> = {
  neutral:
    "border-[var(--admin-border)] bg-[var(--admin-fill)] text-[var(--admin-fg-soft)]",
  blue: "border-transparent bg-[var(--admin-blue-soft)] text-[var(--admin-blue-fg)]",
  green:
    "border-transparent bg-[var(--admin-green-soft)] text-[var(--admin-green-fg)]",
  amber:
    "border-transparent bg-[var(--admin-amber-soft)] text-[var(--admin-amber-fg)]",
  red: "border-transparent bg-[var(--admin-red-soft)] text-[var(--admin-red-fg)]",
  violet:
    "border-transparent bg-[var(--admin-violet-soft)] text-[var(--admin-violet-fg)]",
}

export function AdminBadge({
  tone = "neutral",
  className,
  children,
}: Readonly<{ tone?: Tone; className?: string; children: ReactNode }>) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[11px] font-medium whitespace-nowrap",
        toneClass[tone],
        className
      )}
    >
      {children}
    </Badge>
  )
}

/** Small coloured dot — for inline live/idle status next to a label. */
export function AdminStatusDot({
  tone = "neutral",
  pulse,
  label,
}: Readonly<{ tone?: Tone; pulse?: boolean; label?: string }>) {
  const dot: Record<Tone, string> = {
    neutral: "bg-[var(--admin-border-strong)]",
    blue: "bg-[var(--admin-blue)]",
    green: "bg-[var(--admin-green)]",
    amber: "bg-[var(--admin-amber)]",
    red: "bg-[var(--admin-red)]",
    violet: "bg-[var(--admin-violet)]",
  }
  return (
    <span
      className="relative flex size-1.5 shrink-0"
      aria-hidden={label ? undefined : true}
    >
      {pulse ? (
        <span
          aria-hidden
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none",
            dot[tone]
          )}
        />
      ) : null}
      <span className={cn("inline-flex size-1.5 rounded-full", dot[tone])} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}

/* --- Structure ----------------------------------------------------------- */

export function SectionHeading({
  title,
  description,
  action,
  className,
}: Readonly<{
  title: string
  description?: string
  action?: ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--admin-fg)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-[13px] text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/** Card header used by every panel — title left, optional action right. */
export function PanelHeader({
  title,
  description,
  action,
  className,
}: Readonly<{
  title: string
  description?: string
  action?: ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn(
        // min-h matches a header holding a 32px control, so panel headers sitting
        // side by side line up whether they hold text or a segmented control
        "flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--admin-border)] px-5 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="text-[13px] font-semibold tracking-tight text-[var(--admin-fg)]">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 max-w-xl truncate text-xs leading-relaxed text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  )
}

/* --- Metrics -------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
}: Readonly<{
  label: string
  value: number | string
  hint?: string
  icon?: ReactNode
  trend?: { value: number; label?: string }
  className?: string
}>) {
  const trendUp = (trend?.value ?? 0) >= 0
  const numeric = typeof value === "number"

  return (
    <div className={className}>
      <AdminSpotlight className="h-full">
        <Card className="admin-lift h-full gap-0 rounded-2xl border-[var(--admin-border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-xs font-medium text-[var(--admin-muted)]">
              {label}
            </p>
            {trend ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                  trendUp
                    ? "bg-[var(--admin-green-soft)] text-[var(--admin-green-fg)]"
                    : "bg-[var(--admin-red-soft)] text-[var(--admin-red-fg)]"
                )}
              >
                <span aria-hidden>{trendUp ? "↑" : "↓"}</span>
                <span className="sr-only">
                  {trendUp ? "Increased by " : "Decreased by "}
                </span>
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            ) : icon ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-gradient-to-b from-[var(--admin-fill-hover)] to-[var(--admin-fill)] text-[var(--admin-fg-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {icon}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[1.625rem] leading-none font-semibold tracking-tight text-[var(--admin-fg)] tabular-nums">
            {numeric ? (
              <NumberFlow
                value={value}
                format={{
                  maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
                }}
              />
            ) : (
              value
            )}
          </p>
          {hint ? (
            <p className="mt-1.5 truncate text-xs text-[var(--admin-muted)]">
              {hint}
            </p>
          ) : trend?.label ? (
            <p className="mt-1.5 truncate text-xs text-[var(--admin-muted)]">
              {trend.label}
            </p>
          ) : null}
        </Card>
      </AdminSpotlight>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card
      className="h-full gap-0 rounded-2xl p-4"
      role="status"
      aria-label="Loading metric"
    >
      <div className="flex items-start justify-between gap-3">
        <AdminSkeleton className="h-3.5 w-24 rounded-md" />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-fill)]">
          <AdminSkeleton className="size-4 rounded" />
        </span>
      </div>
      <AdminSkeleton className="mt-2 h-7 w-20 rounded-md" />
      <AdminSkeleton className="mt-1.5 h-3 w-28 rounded-md" />
      <span className="sr-only">Loading…</span>
    </Card>
  )
}

/* --- Avatar --------------------------------------------------------------- */

const avatarPalette = [
  "bg-[var(--admin-blue-soft)] text-[var(--admin-blue-fg)]",
  "bg-[var(--admin-green-soft)] text-[var(--admin-green-fg)]",
  "bg-[var(--admin-amber-soft)] text-[var(--admin-amber-fg)]",
  "bg-[var(--admin-violet-soft)] text-[var(--admin-violet-fg)]",
  "bg-[var(--admin-red-soft)] text-[var(--admin-red-fg)]",
  "bg-[#163238] text-[#5eead4]",
]

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function initialsFromName(name?: string | null) {
  const trimmed = name?.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?"
}

export function AdminAvatar({
  name,
  size = "md",
  className,
}: Readonly<{
  name?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}>) {
  const palette =
    avatarPalette[hashString(name?.trim() || "anon") % avatarPalette.length]
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-white/10 select-none",
        palette,
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-10 text-sm",
        className
      )}
    >
      {initialsFromName(name)}
    </span>
  )
}

/* --- Misc ----------------------------------------------------------------- */

/** Key/value pair used in detail panels. */
export function AdminInfoGrid({
  items,
  columns = 2,
}: Readonly<{
  items: Array<{ label: string; value: ReactNode }>
  columns?: 2 | 3
}>) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-medium tracking-wider text-[var(--admin-muted)] uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 truncate text-[13px] font-medium text-[var(--admin-fg)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
