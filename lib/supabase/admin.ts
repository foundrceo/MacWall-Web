import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

let cached: SupabaseClient | null = null

function requireAdminCredentials(): { origin: string; serviceRoleKey: string } {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations (server-only)."
    )
  }

  const origin = getCatalogSupabaseOrigin()
  if (!origin) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required for admin operations (server-only)."
    )
  }

  return { origin, serviceRoleKey }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const { origin, serviceRoleKey } = requireAdminCredentials()

  cached = createClient(origin, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return cached
}

/**
 * Fresh client for long-lived SSE Realtime subscriptions.
 * Avoids sharing channel state on the cached singleton across concurrent streams.
 */
export function createSupabaseAdminRealtime(): SupabaseClient {
  const { origin, serviceRoleKey } = requireAdminCredentials()
  return createClient(origin, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
