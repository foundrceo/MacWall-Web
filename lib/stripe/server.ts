import "server-only"

import Stripe from "stripe"

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations.")
  }

  cached = new Stripe(secretKey, {
    // Match installed `stripe` SDK LatestApiVersion.
    apiVersion: "2026-07-29.dahlia",
  })

  return cached
}

export function getStripePriceIdUsd(): string {
  const fromEnv = process.env.STRIPE_PRICE_ID_USD?.trim()
  if (fromEnv) return fromEnv
  return "price_1TlWD3IZgqo0QIlX5ZpOgLSn"
}

export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, "")
  return "https://macwall.app"
}
