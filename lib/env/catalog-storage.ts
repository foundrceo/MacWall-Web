/**
 * Cloudflare R2 public read base for the `wallpaper-catalog` bucket.
 *
 * Object keys (`videos/...`, `thumbs/...`, `community-pending/...`, `assets/...`)
 * are appended directly — no Supabase Storage prefix.
 */

const DEFAULT_R2_PUBLIC_BASE_URL = "https://cdn.macwall.app"

/** R2 public read base (no trailing slash). */
export function getR2PublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
    DEFAULT_R2_PUBLIC_BASE_URL
  return raw.replace(/\/+$/, "")
}

/** @deprecated All media reads use R2 — kept for call-site clarity during cutover. */
export function isR2ReadEnabled(): boolean {
  return true
}
