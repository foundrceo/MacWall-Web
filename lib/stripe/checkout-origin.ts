import "server-only"

import { canonicalSiteOrigin, deploymentSiteOrigin } from "@/lib/site-url"

/**
 * Allowlist Stripe success/cancel redirect origins so Host-header spoofing
 * cannot send buyers (and license keys) to an attacker-controlled domain.
 */
export function resolveCheckoutSiteOrigin(requestUrl: string): string {
  let requestOrigin: string
  try {
    requestOrigin = new URL(requestUrl).origin
  } catch {
    return canonicalSiteOrigin()
  }

  const allowed = new Set<string>([
    canonicalSiteOrigin().replace(/\/+$/, ""),
    deploymentSiteOrigin().replace(/\/+$/, ""),
  ])

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")
    allowed.add(`https://${host}`)
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000")
    allowed.add("http://127.0.0.1:3000")
  }

  if (allowed.has(requestOrigin)) return requestOrigin
  return canonicalSiteOrigin()
}
