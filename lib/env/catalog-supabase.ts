/**
 * Public Supabase catalog env — URL is safe to expose (NEXT_PUBLIC_*).
 * No service keys; aligns with anon Storage reads on the macOS app / marketing clips.
 */

export const CATALOG_SUPABASE_DEFAULT_ORIGIN =
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co" as const

/** Public anon key — same as the macOS app; safe for read-only catalog REST. */
export const CATALOG_SUPABASE_DEFAULT_ANON_KEY =
  "REDACTED_SUPABASE_ANON_KEY" as const

/** Validated HTTPS project origin for catalog + Storage URLs. */
export function getCatalogSupabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw?.startsWith("https://")) return CATALOG_SUPABASE_DEFAULT_ORIGIN
  try {
    return new URL(raw).origin
  } catch {
    return CATALOG_SUPABASE_DEFAULT_ORIGIN
  }
}

/** Public anon key for PostgREST catalog reads (override via NEXT_PUBLIC_SUPABASE_ANON_KEY). */
export function getCatalogSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return raw || CATALOG_SUPABASE_DEFAULT_ANON_KEY
}
