"use client"

import { useEffect } from "react"

import { getDataFast } from "@/lib/analytics/datafast"

/**
 * Initializes DataFast on every page via the root layout.
 * SDK auto-captures pageviews + SPA route changes.
 *
 * @see https://datafa.st/docs/npm
 */
export function DataFastInit() {
  useEffect(() => {
    void getDataFast().catch(() => {
      /* SDK no-ops on localhost/bots; never break the page */
    })
  }, [])

  return null
}
