import { macwall } from "@/lib/macwall-site"

const PRODUCTION_ORIGIN = macwall.website.replace(/\/$/, "")

/** Strip trailing slashes; add https:// when the value is host-only or missing scheme. */
function normalizeOrigin(originish: string): string {
  const trimmed = originish.trim().replace(/\/$/, "")
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/\//, "")}`
}

/**
 * Resolved host URL for HTML metadata (especially `metadataBase` and absolute Open Graph image URLs).
 * - Prefer `NEXT_PUBLIC_SITE_URL` when set (e.g. prod or custom preview domain).
 * - Else on Vercel use `VERCEL_URL` (`https://${VERCEL_URL}`) so OG/Twitter previews work on previews.
 * - Fallback: production (`macwall.website`).
 */
export function deploymentSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return normalizeOrigin(configured)

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")
    return `https://${host}`
  }

  return PRODUCTION_ORIGIN
}

/**
 * Canonical site origin used in `<link rel="canonical">`, sitemap URLs, robots `host`, and JSON-LD `@id`s.
 * When `NEXT_PUBLIC_SITE_URL` is unset, defaults to production so previews do not nominate `*.vercel.app` duplicates.
 */
export function canonicalSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return normalizeOrigin(configured).replace(/\/$/, "")
  return PRODUCTION_ORIGIN
}

export function metadataBaseUrl(): URL {
  return new URL(`${deploymentSiteOrigin()}/`)
}

/** Default social preview — `public/OG.png`. Absolute URL fixes crawlers without relative-path probing. */
export const openGraphImagePath = "/OG.png" as const

export const openGraphImageSize = {
  width: 2998,
  height: 1544,
} as const

export function openGraphImageAbsoluteUrl(): string {
  return new URL(openGraphImagePath, metadataBaseUrl()).toString()
}

/** Absolute canonical URL path (starts with `/`, no trailing slash except root → trailing slash omitted per Next defaults). */
export function canonicalSitePath(pathname: string): string {
  const origin = canonicalSiteOrigin()
  if (!pathname || pathname === "/") return origin
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${origin}${p}`
}
