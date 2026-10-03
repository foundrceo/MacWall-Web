"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  macwallInstallerLatestPath,
  macwallWallpaperDeepLink,
} from "@/lib/macwall-site"

const APP_OPEN_WAIT_MS = 2500

type OpenState = "opening" | "needs-install"

function OpenWallpaperRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<OpenState>("opening")
  const settledRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const wallpaperId = useMemo(() => {
    const raw = searchParams.get("id")?.trim()
    return raw && raw.length > 0 ? raw : null
  }, [searchParams])
  const wallpaperName = useMemo(
    () => searchParams.get("name")?.trim() || "this wallpaper",
    [searchParams]
  )

  const fireDeepLink = useCallback(() => {
    if (!wallpaperId) return
    settledRef.current = false

    const deepLink = macwallWallpaperDeepLink(wallpaperId)

    const settle = () => {
      if (settledRef.current) return
      settledRef.current = true
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onWindowBlur)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // MacWall took focus — leave the timer dead, stay on this page.
        settle()
      }
    }
    const onWindowBlur = () => settle()

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("blur", onWindowBlur)

    // Top-level navigation: browsers don't launch apps from a hidden iframe
    // (Safari ignores it, Chrome blocks it). A custom scheme never unloads
    // this page, so the install card still shows if no app handles it.
    window.location.href = deepLink

    timerRef.current = window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onWindowBlur)
      if (!settledRef.current && document.visibilityState === "visible") {
        settledRef.current = true
        setState("needs-install")
      }
    }, APP_OPEN_WAIT_MS)
  }, [wallpaperId])

  const handleRetry = useCallback(() => {
    setState("opening")
    // Let the state commit before firing so the spinner shows.
    window.setTimeout(() => fireDeepLink(), 0)
  }, [fireDeepLink])

  useEffect(() => {
    if (!wallpaperId) {
      router.replace("/wallpapers")
      return
    }
    fireDeepLink()
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
    }
  }, [router, wallpaperId, fireDeepLink])

  if (!wallpaperId) return null

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      {state === "opening" ? (
        <>
          <span
            role="status"
            aria-label="Opening MacWall"
            className="size-[18px] animate-spin rounded-full border-2 border-white/20 border-t-white/90"
          />
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-white">
            Opening {wallpaperName} in MacWall…
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            If the app doesn&rsquo;t open in a moment, install it below —
            nothing downloads on its own.
          </p>
          <a
            href={macwallInstallerLatestPath}
            className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Download MacWall
          </a>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Get MacWall to set {wallpaperName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            The app isn&rsquo;t installed on this Mac yet. Download it, then
            come back and open this wallpaper.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={macwallInstallerLatestPath}
              className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Download MacWall
            </a>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 transition hover:text-white"
            >
              Try again
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function MarketingOpenWallpaper() {
  return (
    <Suspense fallback={null}>
      <OpenWallpaperRedirect />
    </Suspense>
  )
}
