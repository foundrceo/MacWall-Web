"use client"

import Link from "next/link"
import { useSyncExternalStore, type ReactNode } from "react"

import {
  adPixelState,
  globalPrivacyControl,
  subscribeConsent,
  writeConsent,
  type AdPixelState,
} from "@/lib/consent/consent-client"

/** Server render and first paint: no pixels and no banner until decided. */
const SERVER_STATE = "pending" as const

function useAdPixelState(): AdPixelState | typeof SERVER_STATE {
  return useSyncExternalStore(subscribeConsent, adPixelState, () => SERVER_STATE)
}

/** Renders ad / analytics pixels only when consent rules allow them. */
export function AdPixelsGate({ children }: Readonly<{ children: ReactNode }>) {
  return useAdPixelState() === "allowed" ? <>{children}</> : null
}

/** Bottom banner for EEA / UK / Swiss visitors who have not chosen yet. */
export function CookieConsentBanner() {
  if (useAdPixelState() !== "ask") return null
  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl bg-[#111318]/95 p-4 text-[13px] leading-5 text-white/85 ring-1 ring-white/10 backdrop-blur-md ring-inset sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <p>
        We use essential cookies to run the site. With your OK we also use
        analytics and ad-measurement cookies to see which ads bring people to
        MacWall. See our{" "}
        <Link href="/legal/cookies" className="underline underline-offset-2">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="h-9 flex-1 rounded-full bg-white/[0.08] font-medium text-white ring-1 ring-white/10 ring-inset hover:bg-white/[0.13]"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className="h-9 flex-1 rounded-full bg-white font-medium text-black hover:opacity-90"
        >
          Accept all
        </button>
      </div>
    </div>
  )
}

/** On the Cookie Policy page: shows the current state and flips it. */
export function CookieChoiceReset() {
  const state = useAdPixelState()
  const link = "underline underline-offset-2"
  if (state === SERVER_STATE) return null
  if (state === "blocked" && globalPrivacyControl()) {
    return <>ad cookies are off because your browser sends Global Privacy Control</>
  }
  if (state === "allowed") {
    return (
      <>
        ad and analytics cookies are on ·{" "}
        <button type="button" onClick={() => writeConsent("denied")} className={link}>
          turn them off
        </button>
      </>
    )
  }
  return (
    <>
      ad and analytics cookies are off ·{" "}
      <button type="button" onClick={() => writeConsent("granted")} className={link}>
        turn them on
      </button>
    </>
  )
}
