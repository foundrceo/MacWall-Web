import { createHash } from "node:crypto"

/**
 * Staged rollout for MacWall updates.
 *
 * The app sends `?did=` — the first 12 hex chars of SHA256 (hardware ID),
 * truncated client-side so it can bucket devices but never identify one.
 * The server hashes it again into a stable 0–99 bucket and compares it
 * against `releases/rollout.json` (`{"version":"4.0.5","percent":10}`).
 * Devices without a token (older apps) always get the latest release.
 */

export type RolloutState = {
  version: string
  percent: number
}

/** Accept only plausible hex tokens; anything else means "no bucketing". */
export function sanitizeDeviceToken(raw: string | null): string | null {
  if (!raw) return null
  const token = raw.trim().toLowerCase()
  return /^[0-9a-f]{6,64}$/.test(token) ? token : null
}

/** Stable 0–99 bucket for a device token. */
export function rolloutBucket(token: string): number {
  const head = createHash("sha256").update(token).digest("hex").slice(0, 8)
  return Number.parseInt(head, 16) % 100
}

export function parseRolloutState(raw: string): RolloutState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<RolloutState>
    if (typeof parsed.version !== "string" || !parsed.version.trim()) {
      return null
    }
    const percent = Number(parsed.percent)
    if (!Number.isFinite(percent)) return null
    return {
      version: parsed.version.trim(),
      percent: Math.min(100, Math.max(0, Math.floor(percent))),
    }
  } catch {
    return null
  }
}
