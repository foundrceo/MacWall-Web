"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * AdminSkeleton — the only skeleton shape in the admin portal.
 * A cold, static bar. No shimmer, no pulse on its own; the pulse
 * comes from AdminSkeletonReveal wrapping it (once, then reveal).
 */
export function AdminSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      aria-hidden="true"
      data-slot="admin-skeleton"
      className={cn("bg-[var(--admin-fill)]", className)}
    />
  )
}

/**
 * AdminSkeletonReveal — one loading effect for the whole admin portal.
 *
 * Shows `skeleton` with a single cold pulse, then cross-fades (with a
 * whisper of blur) into `children` once `loading` flips to false.
 * Replays from scratch on every fresh loading cycle. Instantly swaps
 * under prefers-reduced-motion (see admin.css).
 */
export function AdminSkeletonReveal({
  loading,
  skeleton,
  children,
  className,
  /** Minimum ms the skeleton stays up so the pulse reads as one motion. */
  minDuration = 700,
}: Readonly<{
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
  className?: string
  minDuration?: number
}>) {
  const [revealed, setRevealed] = useState(() => !loading)
  const [cycle, setCycle] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (loading) {
      // Fresh cycle: snap back to skeleton and replay the pulse.
      // Deferred a task so no state updates run synchronously in the effect.
      timer.current = window.setTimeout(() => {
        setRevealed(false)
        setCycle((c) => c + 1)
        timer.current = null
      }, 0)
      return () => {
        if (timer.current) {
          window.clearTimeout(timer.current)
          timer.current = null
        }
      }
    }
    timer.current = window.setTimeout(() => {
      setRevealed(true)
      timer.current = null
    }, minDuration)
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [loading, minDuration])

  return (
    <div
      className={cn("admin-reveal", revealed && "is-revealed", className)}
      aria-busy={loading || undefined}
    >
      <div key={cycle} className="admin-reveal-skeleton" aria-hidden="true">
        {skeleton}
      </div>
      <div className="admin-reveal-content">{children}</div>
    </div>
  )
}
