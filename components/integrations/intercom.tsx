"use client"

import { useEffect } from "react"
import Intercom from "@intercom/messenger-js-sdk"

const INTERCOM_APP_ID_FALLBACK = "fyja9v6x" as const

function resolveIntercomAppId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_INTERCOM_APP_ID
  if (raw === undefined) return INTERCOM_APP_ID_FALLBACK
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function IntercomMessenger() {
  useEffect(() => {
    const appId = resolveIntercomAppId()
    if (!appId) return

    Intercom({ app_id: appId })
  }, [])

  return null
}
