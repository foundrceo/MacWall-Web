import type { ReactNode } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
      <AdminAppIcon />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-[var(--admin-fg)]">
          {macwall.name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-[var(--admin-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/* --- Badges --------------------------------------------------------------
 * A single tone scale so status colours never drift between pages.
 * ---------------------------------------------------------------------- */

export type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet"

const toneClass: Record<Tone, string> = {
  neutral: "bg-[var(--admin-fill)] text-[var(--admin-fg-soft)]",
  blue: "bg-[var(--admin-blue-soft)] text-[var(--admin-blue)]",
  green: "bg-[var(--admin-green-soft)] text-[var(--admin-green)]",
  amber: "bg-[var(--admin-amber-soft)] text-[var(--admin-amber)]",
  red: "bg-[var(--admin-red-soft)] text-[var(--admin-red)]",
  violet: "bg-[#f1efff] text-[var(--admin-violet)]",
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
        "rounded-md px-1.5 font-medium",
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
}: Readonly<{ tone?: Tone; pulse?: boolean }>) {
  const dot: Record<Tone, string> = {
    neutral: "bg-[var(--admin-border-strong)]",
    blue: "bg-[var(--admin-blue)]",
    green: "bg-[var(--admin-green)]",
    amber: "bg-[var(--admin-amber)]",
    red: "bg-[var(--admin-red)]",
    violet: "bg-[var(--admin-violet)]",
  }
  return (
    <span className="relative flex size-1.5 shrink-0">
      {pulse ? (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
            dot[tone]
          )}
        />
      ) : null}
      <span className={cn("inline-flex size-1.5 rounded-full", dot[tone])} />
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
        <h2 className="text-[15px] font-semibold text-[var(--admin-fg)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-[var(--admin-muted)]">
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
        // min-h matches a header holding a 36px control, so panel headers sitting
        // side by side line up whether they hold text or a segmented control
        "flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--admin-border)] px-5 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[var(--admin-fg)]">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
  return (
    <Card className={cn("gap-0 rounded-xl p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-[var(--admin-muted)]">
          {label}
        </p>
        {icon ? (
          <span className="shrink-0 text-[var(--admin-muted)]">{icon}</span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl leading-none font-semibold tracking-tight text-[var(--admin-fg)] tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {trend ? (
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              trendUp ? "text-[var(--admin-green)]" : "text-[var(--admin-red)]"
            )}
          >
            {trendUp ? "+" : "−"}
            {Math.abs(trend.value)}%
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-1.5 truncate text-xs text-[var(--admin-muted)]">
          {hint}
        </p>
      ) : null}
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-0 rounded-xl p-4">
      <Skeleton className="h-3.5 w-24 rounded-md" />
      <Skeleton className="mt-3 h-6 w-16 rounded-md" />
      <Skeleton className="mt-2.5 h-3 w-28 rounded-md" />
    </Card>
  )
}

/* --- Avatar --------------------------------------------------------------- */

const avatarPalette = [
  "bg-[#eaf3ff] text-[#0060c0]",
  "bg-[#e7f6ed] text-[#17864a]",
  "bg-[#fdf3e6] text-[#b54708]",
  "bg-[#f1efff] text-[#5f52d6]",
  "bg-[#fdecec] text-[#c0322b]",
  "bg-[#e6f6f7] text-[#0e7490]",
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
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
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

export function AdminFadeIn({
  children,
  className,
  delay = 0,
}: Readonly<{ children: ReactNode; className?: string; delay?: number }>) {
  return (
    <div
      className={cn("admin-fade-in", className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

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
          <dt className="text-xs text-[var(--admin-muted)]">{item.label}</dt>
          <dd className="mt-1 truncate text-[13px] font-medium text-[var(--admin-fg)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
