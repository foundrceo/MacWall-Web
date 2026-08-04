"use client"

import { Analytics } from "@vercel/analytics/next"

/** Client wrapper — `beforeSend` cannot be passed from a Server Component. */
export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const path = new URL(event.url).pathname
          if (
            path.startsWith("/admin") ||
            path.startsWith("/legal") ||
            path.startsWith("/docs")
          ) {
            return null
          }
        } catch {
          // keep event
        }
        return event
      }}
    />
  )
}
