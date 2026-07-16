const STORAGE_KEY = "macwall_offer_countdown"
const STORAGE_TS_KEY = "macwall_offer_countdown_ts"

/** Shown until sessionStorage countdown is read on the client. */
export const OFFER_COUNTDOWN_PLACEHOLDER = {
  hours: "--",
  minutes: "--",
  seconds: "--",
} as const

/**
 * Remaining offer countdown seconds for this browser session.
 * Returns 0 once the session offer has expired (does not regenerate until a new session).
 */
export function getSessionCountdownSeconds(): number {
  if (typeof window === "undefined") return 0

  const now = Date.now()
  const savedTs = sessionStorage.getItem(STORAGE_TS_KEY)
  const savedDuration = sessionStorage.getItem(STORAGE_KEY)

  if (savedTs && savedDuration) {
    const elapsed = Math.floor((now - Number(savedTs)) / 1000)
    const remaining = Number(savedDuration) - elapsed
    return Math.max(0, remaining)
  }

  const fresh = Math.floor(Math.random() * (6 - 1) * 3600) + 1 * 3600
  sessionStorage.setItem(STORAGE_KEY, String(fresh))
  sessionStorage.setItem(STORAGE_TS_KEY, String(now))
  return fresh
}

/** Pads a number to two digits. */
export function padCountdownDigit(n: number): string {
  return n.toString().padStart(2, "0")
}

/** Formats seconds into HH : MM : SS. */
export function formatOfferCountdown(totalSeconds: number): {
  hours: string
  minutes: string
  seconds: string
} {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return {
    hours: padCountdownDigit(h),
    minutes: padCountdownDigit(m),
    seconds: padCountdownDigit(s),
  }
}
