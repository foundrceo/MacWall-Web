import "server-only"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/**
 * Only accept HTTPS image URLs from our CDN / Supabase storage.
 * Blocks javascript:/data: and arbitrary third-party hosts in chat attachments.
 */
export function sanitizeSupportImageUrl(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== "https:") return null
  if (url.username || url.password) return null

  const host = url.hostname.toLowerCase()
  const allowedHosts = new Set<string>(["cdn.macwall.app"])

  try {
    allowedHosts.add(new URL(getR2PublicBaseUrl()).hostname.toLowerCase())
  } catch {
    // ignore bad env
  }

  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (supabase) {
    try {
      allowedHosts.add(new URL(supabase).hostname.toLowerCase())
    } catch {
      // ignore
    }
  }

  const isSupabaseStorage =
    host.endsWith(".supabase.co") && url.pathname.includes("/storage/")

  if (!allowedHosts.has(host) && !isSupabaseStorage) return null

  return url.toString()
}
