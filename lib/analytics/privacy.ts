/** Sensitive surfaces never enter product analytics, including SPA navigation. */
export function isPrivateAnalyticsPath(pathname: string): boolean {
  return /^\/(admin|activate|support)(\/|$)/.test(pathname)
}

export function sanitizeAnalyticsUrl(raw: string): string | null {
  try {
    const url = new URL(raw, "https://macwall.app")
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    // URL parameters and fragments can contain license, session, email or device data.
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

export function redactAnalyticsProperties<T extends Record<string, unknown>>(properties: T): T {
  const result: Record<string, unknown> = { ...properties }
  for (const [key, value] of Object.entries(result)) {
    if (/license|email|session_token|device_token|visitor_id|checkout_session|^key$/i.test(key)) {
      delete result[key]
    } else if (typeof value === "string" && /url|href|referrer/i.test(key)) {
      result[key] = sanitizeAnalyticsUrl(value)
    }
  }
  return result as T
}
