/**
 * Public Supabase catalog env — URL is safe to expose (NEXT_PUBLIC_*).
 * No service keys; aligns with anon Storage reads on the macOS app / marketing clips.
 */

export const CATALOG_SUPABASE_DEFAULT_ORIGIN =
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co" as const

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

/**
 * Public anon key for PostgREST catalog reads. Required via env — no key is
 * baked into source. Callers (marketing catalog fetchers) wrap reads in
 * try/catch and fall back to static content when this throws.
 */
export function getCatalogSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is required for catalog reads."
    )
  }
  return raw
}
