/** Display helpers for wallpaper metadata on the public site. */

export function formatLoopDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  if (total <= 0) return "—"
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatLoopDurationLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  if (total <= 0) return "live wallpaper"
  if (total < 60) return `${total}-second`
  const mins = Math.floor(total / 60)
  const secs = total % 60
  if (secs === 0) return `${mins}-minute`
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"] as const
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const digits = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

export function formatLikeCount(count: number): string {
  const n = Math.max(0, Math.floor(count))
  if (n < 1000) return `${n}`
  if (n < 1_000_000) {
    const k = n / 1000
    const label = k >= 100 ? k.toFixed(0) : k.toFixed(1)
    return `${label.replace(/\.0$/, "")}k`
  }
  const m = n / 1_000_000
  const label = m >= 100 ? m.toFixed(0) : m.toFixed(1)
  return `${label.replace(/\.0$/, "")}M`
}

export function parseResolution(
  resolution: string
): { width: number; height: number } | null {
  const match = resolution.trim().match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null
  }
  return { width, height }
}

export function aspectRatioLabel(resolution: string): string | null {
  const dims = parseResolution(resolution)
  if (!dims) return null
  const { width, height } = dims
  const ratio = width / height
  const candidates: Array<{ label: string; value: number }> = [
    { label: "16:9", value: 16 / 9 },
    { label: "21:9", value: 21 / 9 },
    { label: "32:9", value: 32 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "1:1", value: 1 },
  ]
  let best = candidates[0]!
  let bestDiff = Math.abs(ratio - best.value)
  for (const candidate of candidates.slice(1)) {
    const diff = Math.abs(ratio - candidate.value)
    if (diff < bestDiff) {
      best = candidate
      bestDiff = diff
    }
  }
  return bestDiff < 0.08 ? best.label : `${width}:${height}`
}
