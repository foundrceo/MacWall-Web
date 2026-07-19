import { clientIpFromRequest } from "@/lib/http/rate-limit"

import {
  COUNTRY_COOKIE,
  isIndiaCountry,
  resolveCountryFromHeaders,
} from "./country"
import { resolveCountryFromVercelGeolocation } from "./vercel-geolocation"

export type ResolveVisitorCountryInput = {
  headers: Headers
  cookieCountry?: string | null
  /** Vercel middleware `request.geo.country` — most reliable on production. */
  geoCountry?: string | null
}

const IP_LOOKUP_TIMEOUT_MS = 2500
const IP_LOOKUP_CACHE_TTL_MS = 60 * 60 * 1000
const ipCountryCache = new Map<string, { country: string; expiresAt: number }>()

function normalizeCountry(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

function isNonPublicIp(ip: string): boolean {
  if (!ip || ip === "unknown") return true
  if (ip === "::1" || ip === "127.0.0.1" || ip === "0.0.0.0") return true
  if (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.")
  ) {
    return true
  }
  if (ip.startsWith("172.")) {
    const second = Number.parseInt(ip.split(".")[1] ?? "", 10)
    if (second >= 16 && second <= 31) return true
  }
  if (ip.includes(":")) {
    const lower = ip.toLowerCase()
    if (
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe80")
    ) {
      return true
    }
  }
  return false
}

/** Only treat explicit `-IN` locale tags as India (ignore en-US on Indian machines). */
export function resolveCountryFromAcceptLanguage(
  header: string | null | undefined
): string | null {
  if (!header) return null

  for (const part of header.split(",")) {
    const tag = part.trim().split(";")[0]?.trim()
    if (!tag) continue

    const match = tag.match(/^([a-z]{2,3})-in$/i)
    if (match) return "IN"
  }

  return null
}

async function resolveCountryFromIp(ip: string): Promise<string | null> {
  if (isNonPublicIp(ip)) return null

  const cached = ipCountryCache.get(ip)
  if (cached && cached.expiresAt > Date.now()) return cached.country

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IP_LOOKUP_TIMEOUT_MS)

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { Accept: "application/json", "User-Agent": "MacWallGeo/1.0" },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      success?: boolean
      country_code?: string
    }
    const country = normalizeCountry(data.country_code)
    if (!country) return null

    ipCountryCache.set(ip, {
      country,
      expiresAt: Date.now() + IP_LOOKUP_CACHE_TTL_MS,
    })

    return country
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** Localhost has no client IP — use the dev machine egress via Cloudflare trace. */
async function resolveCountryFromDevServerEgress(): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null

  const cacheKey = "__dev_egress__"
  const cached = ipCountryCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.country

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IP_LOOKUP_TIMEOUT_MS)

  try {
    const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) return null

    const text = await response.text()
    const match = text.match(/^loc=([A-Z]{2})$/m)
    const country = normalizeCountry(match?.[1])
    if (!country) return null

    ipCountryCache.set(cacheKey, {
      country,
      expiresAt: Date.now() + IP_LOOKUP_CACHE_TTL_MS,
    })

    return country
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Single source of truth for visitor country — used in middleware and server layout
 * so the first request already resolves India (not only after a cookie round-trip).
 */
export async function resolveVisitorCountry(
  input: ResolveVisitorCountryInput
): Promise<string | null> {
  const fromGeo = normalizeCountry(input.geoCountry)
  if (fromGeo) return fromGeo

  const fromVercel = resolveCountryFromVercelGeolocation(input.headers)
  if (fromVercel) return fromVercel

  const fromEdge = resolveCountryFromHeaders(input.headers)
  if (fromEdge) return fromEdge

  const ip = clientIpFromRequest({ headers: input.headers } as Request)
  const fromIp = await resolveCountryFromIp(ip)
  if (fromIp) return fromIp

  if (isNonPublicIp(ip)) {
    const fromDevEgress = await resolveCountryFromDevServerEgress()
    if (fromDevEgress) return fromDevEgress
  }

  // Cookie is a weak fallback — IP/geo above are preferred so travel/VPN changes apply.
  const fromCookie = normalizeCountry(input.cookieCountry)
  if (fromCookie) return fromCookie

  const fromLanguage = resolveCountryFromAcceptLanguage(
    input.headers.get("accept-language")
  )
  if (fromLanguage) return fromLanguage

  return null
}

export { isIndiaCountry, COUNTRY_COOKIE }
