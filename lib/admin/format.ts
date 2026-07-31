export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCount(value: number): string {
  return value.toLocaleString()
}

/** "Just now" · "12m ago" · "3h ago" · "Apr 8" */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const diffMin = Math.round((Date.now() - date.getTime()) / 60_000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function formatClockTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

/** "Today" · "Yesterday" · "April 8" */
export function formatDayLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  })
}
