/**
 * Public Supabase catalog env — URL is safe to expose (NEXT_PUBLIC_*).
 * No service keys; aligns with anon Storage reads on the macOS app / marketing clips.
 * Values come from env only (no baked-in project IDs for open-source safety).
 */

/** Validated HTTPS project origin for catalog + Storage URLs. */
export function getCatalogSupabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw?.startsWith("https://")) return null
  try {
    return new URL(raw).origin
  } catch {
    return null
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
