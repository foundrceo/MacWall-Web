"use client"

import { useEffect } from "react"

import { fireCheckoutAbandonmentRetargeting } from "@/lib/analytics/retargeting"

const MIN_CHECKOUT_MS = 30_000

/** Retarget users who clicked checkout but never completed purchase in this session. */
export function CheckoutRetargetingTracker() {
  useEffect(() => {
    let idleTimer: number | undefined

    const scheduleAbandonmentCheck = () => {
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        fireCheckoutAbandonmentRetargeting()
      }, MIN_CHECKOUT_MS)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        fireCheckoutAbandonmentRetargeting()
      }
    }

    const onPageHide = () => {
      fireCheckoutAbandonmentRetargeting()
    }

    scheduleAbandonmentCheck()
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", onPageHide)

    return () => {
      window.clearTimeout(idleTimer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", onPageHide)
    }
  }, [])

  return null
}
