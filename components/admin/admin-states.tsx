"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { CircleCheck, Inbox, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

export function AdminNotice({
  tone = "error",
  children,
  className,
}: Readonly<{
  tone?: "error" | "success" | "info"
  children: ReactNode
  className?: string
}>) {
  const reduceMotion = useReducedMotion()
  const error = tone === "error"
  const success = tone === "success"
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed",
        error &&
          "border-[var(--admin-red)]/25 bg-[var(--admin-red-soft)] text-[var(--admin-red-fg)]",
        success &&
          "border-[var(--admin-green)]/25 bg-[var(--admin-green-soft)] text-[var(--admin-green-fg)]",
        tone === "info" &&
          "border-[var(--admin-blue)]/25 bg-[var(--admin-blue-soft)] text-[var(--admin-blue-fg)]",
        className
      )}
    >
      {error ? (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </motion.div>
  )
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Readonly<{
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}>) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col items-center gap-2 overflow-hidden px-6 py-16 text-center",
        className
      )}
    >
      <div aria-hidden className="admin-dotted-bg pointer-events-none absolute inset-0" />
      <div className="relative mb-1 flex size-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-gradient-to-b from-[var(--admin-fill-hover)] to-[var(--admin-fill)] text-[var(--admin-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className="relative text-sm font-semibold tracking-tight text-[var(--admin-fg)]">
        {title}
      </p>
      {description ? (
        <p className="relative max-w-xs text-[13px] leading-relaxed text-[var(--admin-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="relative mt-3">{action}</div> : null}
    </motion.div>
  )
}

/** Full-page loading state with announced status for screen readers. */
export function AdminLoadingState({
  label = "Loading…",
  className,
}: Readonly<{ label?: string; className?: string }>) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      <span
        aria-hidden
        className="size-6 animate-spin rounded-full border-2 border-[var(--admin-border-strong)] border-t-[var(--admin-blue)] motion-reduce:animate-none"
      />
      <p className="text-[13px] text-[var(--admin-muted)]">{label}</p>
    </div>
  )
}
