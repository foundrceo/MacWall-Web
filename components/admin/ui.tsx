"use client"

/**
 * Admin console building blocks. Every admin screen is composed from these
 * plus the shared primitives in components/ui, so spacing, radii and status
 * colours stay the same everywhere. See components/admin/README.md.
 */

import NumberFlow, { type Format } from "@number-flow/react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  CircleCheck,
  Copy,
  Inbox,
  Info,
  Loader2,
  Search,
  TriangleAlert,
  X,
} from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Tones                                                                      */
/* -------------------------------------------------------------------------- */

/** The one status scale: badges, dots, meters, notices and deltas use it. */
export type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet"

export const toneText: Record<Tone, string> = {
  neutral: "text-soft",
  blue: "text-blue",
  green: "text-green",
  amber: "text-amber",
  red: "text-red",
  violet: "text-violet",
}

export const toneTint: Record<Tone, string> = {
  neutral: "bg-fill text-soft",
  blue: "bg-blue/12 text-blue",
  green: "bg-green/12 text-green",
  amber: "bg-amber/12 text-amber",
  red: "bg-red/12 text-red",
  violet: "bg-violet/14 text-violet",
}

export const toneSolid: Record<Tone, string> = {
  neutral: "bg-faint",
  blue: "bg-blue",
  green: "bg-green",
  amber: "bg-amber",
  red: "bg-red",
  violet: "bg-violet",
}

/* -------------------------------------------------------------------------- */
/* Panels                                                                     */
/* -------------------------------------------------------------------------- */

/** The surface every block of content sits on. */
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[14px] border border-border bg-card",
        className
      )}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: Readonly<{
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}>) {
  return (
    <header
      className={cn(
        "flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-2.5",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-medium text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </header>
  )
}

export function PanelBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />
}

/** Heading for a group of panels on a scrolling page. */
export function SectionHeading({
  title,
  description,
  actions,
  className,
}: Readonly<{
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
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
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 max-w-2xl text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

const statColumns = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-3 xl:grid-cols-5",
  6: "sm:grid-cols-3 xl:grid-cols-6",
} as const

/** A row of stats joined into one panel by hairlines. */
export function StatGroup({
  columns = 4,
  className,
  children,
}: Readonly<{
  columns?: keyof typeof statColumns
  className?: string
  children: ReactNode
}>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-border bg-card",
        className
      )}
    >
      {/* Cells draw their own right and bottom hairline; the negative margin
          tucks the outer ones under the panel edge. */}
      <dl
        className={cn("-mr-px -mb-px grid grid-cols-1", statColumns[columns])}
      >
        {children}
      </dl>
    </div>
  )
}

export function Stat({
  label,
  value,
  format,
  delta,
  lowerIsBetter = false,
  hint,
  icon,
  spark,
  className,
}: Readonly<{
  label: ReactNode
  /** Numbers animate; strings render as given. */
  value: number | string
  format?: Format
  /** Percentage change against the previous period. */
  delta?: number | null
  lowerIsBetter?: boolean
  hint?: ReactNode
  icon?: ReactNode
  spark?: readonly number[]
  className?: string
}>) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta)
  const up = hasDelta && delta >= 0
  const good = lowerIsBetter ? !up : up
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col border-r border-b border-border p-4",
        className
      )}
    >
      <dt className="flex items-center justify-between gap-2 text-[12.5px] text-muted-foreground">
        <span className="truncate">{label}</span>
        {icon ? (
          <span aria-hidden className="text-faint shrink-0 [&_svg]:size-3.5">
            {icon}
          </span>
        ) : null}
      </dt>
      <dd className="mt-2.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {/* Fixed-height, centred box: NumberFlow pads itself vertically, so
              without it numeric and string values sit on different lines. */}
          <p className="flex h-6 items-center text-[24px] leading-none font-semibold tracking-[-0.03em] text-foreground tabular-nums">
            {typeof value === "number" ? (
              <NumberFlow
                value={value}
                format={
                  format ?? {
                    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
                  }
                }
              />
            ) : (
              <span className="truncate">{value}</span>
            )}
          </p>
          {hasDelta || hint ? (
            <p className="mt-2.5 flex min-h-5 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {hasDelta ? (
                <span
                  className={cn(
                    "inline-flex h-5 items-center gap-0.5 rounded-md px-1 text-[11px] font-medium tabular-nums",
                    good ? "bg-green/12 text-green" : "bg-red/12 text-red"
                  )}
                >
                  <DeltaIcon
                    aria-hidden
                    className="size-3"
                    strokeWidth={2.25}
                  />
                  <span className="sr-only">{up ? "Up " : "Down "}</span>
                  {Math.abs(delta).toFixed(1)}%
                </span>
              ) : null}
              {hint ? <span className="truncate">{hint}</span> : null}
            </p>
          ) : null}
        </div>
        {spark && spark.length > 1 ? (
          <Sparkline
            values={spark}
            tone={hasDelta ? (good ? "green" : "red") : "neutral"}
            className="mb-0.5 hidden shrink-0 min-[420px]:block"
          />
        ) : null}
      </dd>
    </div>
  )
}

const sparkStroke: Record<Tone, string> = {
  neutral: "var(--ad-faint)",
  blue: "var(--ad-blue)",
  green: "var(--ad-green)",
  amber: "var(--ad-amber)",
  red: "var(--ad-red)",
  violet: "var(--ad-violet)",
}

/** Tiny trend line; decoration only, the number next to it carries the data. */
export function Sparkline({
  values,
  tone = "neutral",
  width = 72,
  height = 28,
  className,
}: Readonly<{
  values: readonly number[]
  tone?: Tone
  width?: number
  height?: number
  className?: string
}>) {
  const gradientId = useId()
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (width - 4) + 2,
    height - 3 - ((value - min) / (max - min || 1)) * (height - 6),
  ])
  const line = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    )
    .join(" ")
  const last = points[points.length - 1]

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sparkStroke[tone]} stopOpacity="0.18" />
          <stop offset="1" stopColor={sparkStroke[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L${last[0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={line}
        fill="none"
        stroke={sparkStroke[tone]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill={sparkStroke[tone]} />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: Readonly<{
  tone?: Tone
  /** Leading status dot, for states rather than categories. */
  dot?: boolean
  className?: string
  children: ReactNode
}>) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-[11px] leading-none font-medium whitespace-nowrap [&_svg]:size-3",
        toneTint[tone],
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", toneSolid[tone])}
        />
      ) : null}
      {children}
    </span>
  )
}

export function StatusDot({
  tone = "neutral",
  pulse = false,
  label,
  className,
}: Readonly<{
  tone?: Tone
  pulse?: boolean
  /** Read by screen readers; omit when the text next to it says the same. */
  label?: string
  className?: string
}>) {
  return (
    <span
      className={cn("relative inline-flex size-2 shrink-0", className)}
      aria-hidden={label ? undefined : true}
    >
      {pulse ? (
        <span
          aria-hidden
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-50 motion-reduce:animate-none",
            toneSolid[tone]
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative inline-flex size-2 rounded-full",
          toneSolid[tone]
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}

const avatarTones = [
  "bg-blue/15 text-blue",
  "bg-green/15 text-green",
  "bg-amber/15 text-amber",
  "bg-violet/15 text-violet",
  "bg-red/15 text-red",
  "bg-fill-hover text-soft",
] as const

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

export function initialsFromName(name?: string | null) {
  const trimmed = name?.trim()
  if (!trimmed) return "?"
  return (
    trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

const avatarSizes = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-[11px]",
  lg: "size-10 text-[13px]",
} as const

/** Initials on a tint picked from the name, so a person keeps their colour. */
export function Avatar({
  name,
  size = "md",
  className,
}: Readonly<{
  name?: string | null
  size?: keyof typeof avatarSizes
  className?: string
}>) {
  const tone =
    avatarTones[hashString(name?.trim() || "anonymous") % avatarTones.length]
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        avatarSizes[size],
        tone,
        className
      )}
    >
      {initialsFromName(name)}
    </span>
  )
}

export function Meter({
  value,
  max = 100,
  tone = "blue",
  label,
  className,
}: Readonly<{
  value: number
  max?: number
  tone?: Tone
  label: string
  className?: string
}>) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("bg-fill h-1.5 overflow-hidden rounded-full", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
          toneSolid[tone]
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

export type SegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  icon?: ReactNode
  /** Small trailing count, e.g. items in that filter. */
  count?: number
  /** Needed when `label` is not plain text. */
  ariaLabel?: string
}

/**
 * Single-choice switch for 2-5 short options (ranges, filters, view modes).
 * A radio group with roving focus and a thumb that slides to the choice.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: Readonly<{
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  /** Accessible name of the group. */
  label: string
  size?: "sm" | "md"
  className?: string
}>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = index
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % options.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + options.length) % options.length
    } else if (event.key === "Home") {
      next = 0
    } else if (event.key === "End") {
      next = options.length - 1
    } else {
      return
    }
    event.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-grid shrink-0 auto-cols-fr grid-flow-col rounded-[10px] border border-border bg-background p-[3px]",
        className
      )}
    >
      <span
        aria-hidden
        className="bg-fill-hover absolute inset-y-[3px] left-[3px] rounded-[7px] shadow-[0_0_0_1px_var(--ad-line)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option, optionIndex) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[optionIndex] = element
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-[7px] font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
              size === "sm" ? "h-6 px-2 text-xs" : "h-7 px-2.5 text-[12.5px]",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "tabular-nums",
                  selected ? "text-muted-foreground" : "text-faint"
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  label,
  className,
  autoFocus,
}: Readonly<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Accessible name; defaults to the placeholder. */
  label?: string
  className?: string
  autoFocus?: boolean
}>) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search
        aria-hidden
        className="text-faint pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.stopPropagation()
            onChange("")
          }
        }}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="h-8 w-full rounded-[9px] border border-border bg-input/50 pr-8 pl-8 text-[13px] text-foreground transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          className="hover:bg-fill-hover absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden className="size-3" />
        </button>
      ) : null}
    </div>
  )
}

/** Icon-only button. The label is both the tooltip and the accessible name. */
export function IconButton({
  label,
  side = "top",
  children,
  ...props
}: Readonly<
  Omit<ComponentProps<typeof Button>, "aria-label"> & {
    label: string
    side?: "top" | "right" | "bottom" | "left"
  }
>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}

export function CopyButton({
  value,
  label = "Copy",
  className,
}: Readonly<{ value: string; label?: string; className?: string }>) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <IconButton
      label={copied ? "Copied" : label}
      className={className}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => setCopied(true))
      }}
    >
      {copied ? (
        <Check aria-hidden className="text-green" />
      ) : (
        <Copy aria-hidden />
      )}
    </IconButton>
  )
}

export function Kbd({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <kbd
      className={cn(
        "bg-fill inline-grid h-5 min-w-5 place-items-center rounded-[5px] border border-border px-1 font-sans text-[10.5px] leading-none font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

/** Label, control and hint/error stacked the same way in every form. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional = false,
  className,
  children,
}: Readonly<{
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  className?: string
  children: ReactNode
}>) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-soft flex items-center justify-between gap-2 text-xs font-medium"
      >
        <span>{label}</span>
        {optional ? (
          <span className="text-faint font-normal">Optional</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-red text-xs">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

export type DataListItem = { label: string; value: ReactNode }

/**
 * Key/value facts. `rows` puts label and value on one line (side panels);
 * `grid` stacks the label over the value in columns (wide panels).
 */
export function DataList({
  items,
  layout = "rows",
  columns = 2,
  className,
}: Readonly<{
  items: readonly DataListItem[]
  layout?: "rows" | "grid"
  columns?: 2 | 3 | 4
  className?: string
}>) {
  if (layout === "grid") {
    return (
      <dl
        className={cn(
          "grid gap-x-6 gap-y-4",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 truncate text-[13px] font-medium text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
        >
          <dt className="shrink-0 text-[13px] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="min-w-0 truncate text-right text-[13px] font-medium text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div aria-hidden className={cn("admin-skeleton rounded-md", className)} />
  )
}

export function Spinner({ className }: Readonly<{ className?: string }>) {
  return (
    <Loader2
      aria-hidden
      className={cn(
        "size-4 animate-spin text-muted-foreground motion-reduce:animate-none",
        className
      )}
    />
  )
}

export function LoadingState({
  label = "Loading",
  className,
}: Readonly<{ label?: string; className?: string }>) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      <Spinner className="size-5" />
      <p className="text-[13px] text-muted-foreground">{label}…</p>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Readonly<{
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className
      )}
    >
      <div
        aria-hidden
        className="bg-fill mb-3 flex size-10 items-center justify-center rounded-[10px] border border-border text-muted-foreground [&_svg]:size-[18px]"
      >
        {icon ?? <Inbox />}
      </div>
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-[13px] text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

const noticeTone = {
  error: {
    icon: CircleAlert,
    className: "border-red/25 bg-red/8",
    iconClass: "text-red",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber/25 bg-amber/8",
    iconClass: "text-amber",
  },
  success: {
    icon: CircleCheck,
    className: "border-green/25 bg-green/8",
    iconClass: "text-green",
  },
  info: {
    icon: Info,
    className: "border-border bg-fill",
    iconClass: "text-blue",
  },
} as const

/** Inline message about the content it sits above. Errors are announced. */
export function Notice({
  tone = "error",
  title,
  action,
  className,
  children,
}: Readonly<{
  tone?: keyof typeof noticeTone
  title?: ReactNode
  action?: ReactNode
  className?: string
  children?: ReactNode
}>) {
  const { icon: Icon, className: toneClass, iconClass } = noticeTone[tone]
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13px]",
        toneClass,
        className
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        {children ? (
          <div className={cn("text-soft", title && "mt-0.5")}>{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
