import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations (server-only)."
    )
  }

  cached = createClient(getCatalogSupabaseOrigin(), serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return cached
}
