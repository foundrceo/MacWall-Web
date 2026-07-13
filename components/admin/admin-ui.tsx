"use client"

import Image from "next/image"
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"

import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

const iconSizes = {
  sm: 20,
  md: 32,
  lg: 56,
} as const

export function AdminAppIcon({
  size = "sm",
  className,
}: Readonly<{ size?: keyof typeof iconSizes; className?: string }>) {
  const px = iconSizes[size]
  return (
    <Image
      alt={`${macwall.name} app icon`}
      src={macwallAppIconPath}
      width={px}
      height={px}
      className={cn(
        macwallAppIconRadiusClass,
        "shrink-0 object-cover",
        className
      )}
      priority={size === "lg"}
    />
  )
}

export function AdminAppMark({
  subtitle,
  iconSize = "sm",
}: Readonly<{ subtitle?: string; iconSize?: keyof typeof iconSizes }>) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AdminAppIcon size={iconSize} />
      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium tracking-[-0.01em] text-[#1d1d1f]">
          {macwall.name}
        </p>
        {subtitle ? (
          <p className="truncate text-[12px] text-[#86868b]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export function AdminSurface({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminSurfaceHeader({
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
        "flex flex-wrap items-start justify-between gap-3 px-6 pt-6",
        className
      )}
    >
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[14px] leading-snug text-[#86868b]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function AdminSurfaceBody({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return <div className={cn("px-6 pt-4 pb-6", className)}>{children}</div>
}

export function AdminPageIntro({
  title,
  description,
}: Readonly<{ title: string; description?: string }>) {
  return (
    <div className="mb-8">
      <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1d1d1f] md:text-[40px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-[17px] leading-snug text-[#86868b]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

const buttonBase =
  "inline-flex items-center justify-center rounded-full font-normal transition-colors duration-150 outline-none disabled:pointer-events-none disabled:opacity-45"

const buttonSizes = {
  sm: "min-h-[32px] px-4 text-[12px]",
  md: "min-h-[36px] px-5 text-[14px]",
  lg: "min-h-[44px] px-[22px] text-[17px] tracking-[-0.022em]",
} as const

export function AdminButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: keyof typeof buttonSizes
}) {
  return (
    <button
      type="button"
      className={cn(
        buttonBase,
        buttonSizes[size],
        variant === "primary" && "bg-[#0071e3] text-white hover:bg-[#0077ed]",
        variant === "secondary" &&
          "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]",
        variant === "ghost" &&
          "bg-transparent text-[#1d1d1f]/70 hover:bg-[#f5f5f7] hover:text-[#1d1d1f]",
        variant === "danger" &&
          "bg-[#ff3b30]/12 text-[#ff3b30] hover:bg-[#ff3b30]/18",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminPill({
  active,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        buttonBase,
        "min-h-[32px] px-4 text-[13px]",
        active
          ? "bg-[#1d1d1f] text-white"
          : "bg-[#f5f5f7] text-[#1d1d1f]/75 hover:bg-[#e8e8ed] hover:text-[#1d1d1f]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] transition-colors outline-none placeholder:text-[#86868b] focus:bg-[#ebebed]",
        className
      )}
      {...props}
    />
  )
}

export function AdminTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] transition-colors outline-none placeholder:text-[#86868b] focus:bg-[#ebebed]",
        className
      )}
      {...props}
    />
  )
}

export function AdminLabel({
  htmlFor,
  children,
}: Readonly<{ htmlFor?: string; children: ReactNode }>) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-medium text-[#1d1d1f]/80"
    >
      {children}
    </label>
  )
}

export function AdminBadge({
  tone = "neutral",
  children,
  className,
}: Readonly<{
  tone?: "neutral" | "blue" | "green" | "amber" | "red"
  children: ReactNode
  className?: string
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tone === "neutral" && "bg-[#f5f5f7] text-[#1d1d1f]/80",
        tone === "blue" && "bg-[#0071e3]/10 text-[#0071e3]",
        tone === "green" && "bg-[#34c759]/12 text-[#248a3d]",
        tone === "amber" && "bg-[#ff9500]/12 text-[#c93400]",
        tone === "red" && "bg-[#ff3b30]/12 text-[#d70015]",
        className
      )}
    >
      {children}
    </span>
  )
}

export function AdminMetricTile({
  label,
  value,
  hint,
  icon,
}: Readonly<{
  label: string
  value: number | string
  hint?: string
  icon?: ReactNode
}>) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-[#86868b]">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f] tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[12px] text-[#86868b]">{hint}</p>
      ) : null}
    </div>
  )
}

export function AdminSectionHeading({
  eyebrow,
  title,
}: Readonly<{ eyebrow: string; title: string }>) {
  return (
    <div>
      <p className="text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
        {title}
      </h2>
    </div>
  )
}

export function AdminNotice({
  tone = "info",
  children,
}: Readonly<{
  tone?: "info" | "success" | "warning"
  children: ReactNode
}>) {
  return (
    <p
      className={cn(
        "rounded-2xl px-4 py-3 text-[14px]",
        tone === "info" && "bg-[#f5f5f7] text-[#1d1d1f]/80",
        tone === "success" && "bg-[#34c759]/10 text-[#248a3d]",
        tone === "warning" && "bg-[#ff9500]/10 text-[#9a3412]"
      )}
    >
      {children}
    </p>
  )
}

export function AdminRowListItem({
  active,
  title,
  meta,
  badge,
  onClick,
}: Readonly<{
  active?: boolean
  title: string
  meta?: ReactNode
  badge?: ReactNode
  onClick?: () => void
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl px-3.5 py-3 text-left transition-colors",
        active ? "bg-[#0071e3]/10" : "bg-[#f5f5f7] hover:bg-[#ebebed]"
      )}
    >
      <p className="truncate text-[14px] font-medium text-[#1d1d1f]">{title}</p>
      {meta || badge ? (
        <div className="mt-1.5 flex items-center gap-2">
          {meta}
          {badge}
        </div>
      ) : null}
    </button>
  )
}

export function AdminInfoGrid({
  items,
}: Readonly<{ items: Array<{ label: string; value: string }> }>) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5"
        >
          <p className="text-[12px] text-[#86868b]">{item.label}</p>
          <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function AdminSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={cn("animate-pulse rounded-[20px] bg-[#ebebed]", className)}
    />
  )
}
