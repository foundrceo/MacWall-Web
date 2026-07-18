import { COUNTRY_COOKIE, isIndiaCountry } from "@/lib/geo/country"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

export function getVisitorCountry(): string | null {
  const value = readCookie(COUNTRY_COOKIE)?.trim().toUpperCase()
  if (value && /^[A-Z]{2}$/.test(value)) return value
  return null
}

export function isVisitorFromIndia(): boolean {
  return isIndiaCountry(getVisitorCountry())
}
