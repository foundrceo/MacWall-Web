"use client"

import { useEffect } from "react"

const BODY_CLASS = "__className_f367f3"

/**
 * Vendored layout CSS targets this body helper class alongside Geist overrides in globals.
 */
export default function MarketingShellBodyClass() {
  useEffect(() => {
    document.body.classList.add(BODY_CLASS)
    return () => {
      document.body.classList.remove(BODY_CLASS)
    }
  }, [])
  return null
}
