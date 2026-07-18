"use client"

import { useEffect, useState } from "react"

import {
  formatPromoCountdown,
  getIndiaPromoDeadlineMs,
  INDIA_PROMO_DURATION_MS,
  INDIA_PROMO_START_KEY,
} from "@/lib/marketing-india-promo"

function readPromoStartMs(): number {
  if (typeof window === "undefined") return Date.now()

  try {
    const stored = window.localStorage.getItem(INDIA_PROMO_START_KEY)
    if (stored) {
      const parsed = Number.parseInt(stored, 10)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }

    const started = Date.now()
    window.localStorage.setItem(INDIA_PROMO_START_KEY, String(started))
    return started
  } catch {
    return Date.now()
  }
}

export function useIndiaPromoCountdown(enabled: boolean) {
  const [startMs, setStartMs] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const started = readPromoStartMs()
    setStartMs(started)
    setRemainingMs(Math.max(0, getIndiaPromoDeadlineMs(started) - Date.now()))
  }, [enabled])

  useEffect(() => {
    if (!enabled || startMs === null) return

    const tick = () => {
      setRemainingMs(Math.max(0, getIndiaPromoDeadlineMs(startMs) - Date.now()))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [enabled, startMs])

  const resolvedRemaining = remainingMs ?? INDIA_PROMO_DURATION_MS

  return {
    startMs,
    ready: startMs !== null && remainingMs !== null,
    remainingMs: resolvedRemaining,
    expired: startMs !== null && resolvedRemaining <= 0,
    countdownLabel: formatPromoCountdown(resolvedRemaining),
    durationMs: INDIA_PROMO_DURATION_MS,
  }
}
