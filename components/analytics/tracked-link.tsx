"use client"

import Link from "next/link"
import {
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react"

import {
  trackSiteEventClient,
  withAnalyticsSessionHref,
} from "@/lib/analytics/client"
import type {
  SiteAnalyticsEventName,
  SiteAnalyticsMetadata,
} from "@/lib/analytics/events"
import { withMarketingAttribution } from "@/lib/analytics/marketing-attribution"
import { trackMetaInitiateCheckout } from "@/lib/analytics/meta-client"
import { markCheckoutStartedInSession } from "@/lib/analytics/retargeting"
import { trackTikTokInitiateCheckoutWithIdentify } from "@/lib/analytics/tiktok-client"
import {
  parseCheckoutHrefParams,
  preconnectStripeCheckout,
  prefetchCheckoutSession,
  waitForPrefetchedCheckoutUrl,
} from "@/lib/checkout/prefetch-checkout"
import { pricingPathWithCheckoutError } from "@/lib/checkout/checkout-session-client"
import { isLikelyBotUserAgent } from "@/lib/http/bot-user-agent"

type TrackedLinkProps = {
  href: string
  children: ReactNode
  className?: string
  eventName: SiteAnalyticsEventName
  metadata?: SiteAnalyticsMetadata
  external?: boolean
  ariaLabel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  /**
   * Checkout CTAs in high-intent spots only (pricing cards, pricing sticky
   * bar, Pro modal): on touch devices, which have no hover, mint the Stripe
   * session once the button has been on screen for a moment so the tap
   * redirects without waiting.
   */
  warmOnView?: boolean
}

function isCheckoutApiHref(href: string): boolean {
  return href.includes("/api/checkout/")
}

/**
 * Mouse must rest on a checkout CTA this long before we mint a session, so
 * sweeping the cursor across the page does not create Stripe sessions.
 */
const CHECKOUT_HOVER_INTENT_MS = 120

/** On-screen time before a `warmOnView` CTA mints a session (scroll-by skips it). */
const CHECKOUT_VIEW_INTENT_MS = 1500

/**
 * Touch-only, real visitor, not Data Saver. Crawlers render JS
 * (and IntersectionObserver), so they must never mint Stripe sessions.
 */
function canWarmCheckoutOnView(): boolean {
  if (typeof window === "undefined") return false
  if (!window.matchMedia("(hover: none)").matches) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.webdriver || nav.connection?.saveData) return false
  return !isLikelyBotUserAgent(nav.userAgent)
}

export function TrackedLink({
  href,
  children,
  className,
  eventName,
  metadata,
  external,
  ariaLabel,
  onClick,
  warmOnView,
}: TrackedLinkProps) {
  const isDownloadClick = eventName === "download_click"
  const isCheckoutClick = isCheckoutApiHref(href)
  const checkoutParams = isCheckoutClick ? parseCheckoutHrefParams(href) : null
  const checkoutOffer = checkoutParams?.offer ?? null
  const isExternalHref =
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    isCheckoutClick

  const resolvedHref =
    eventName === "pricing_click" ? withMarketingAttribution(href) : href

  const trackNavigation = () => {
    trackSiteEventClient(eventName, metadata)

    if (
      eventName === "pricing_click" &&
      (isCheckoutClick || href.startsWith("http"))
    ) {
      markCheckoutStartedInSession()
      trackSiteEventClient("checkout_started", metadata)
      trackMetaInitiateCheckout()
      void trackTikTokInitiateCheckoutWithIdentify()
    }
  }

  const prepareDownloadHref = (
    event: MouseEvent<HTMLAnchorElement> | TouchEvent<HTMLAnchorElement>
  ) => {
    if (!isDownloadClick) return
    event.currentTarget.href = withAnalyticsSessionHref(href)
  }

  const hoverTimerRef = useRef<number | null>(null)
  const cancelHoverWarm = () => {
    if (hoverTimerRef.current === null) return
    window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
  }
  useEffect(() => cancelHoverWarm, [])

  // Back from Stripe restores this page from bfcache mid-"busy"; reset it.
  useEffect(() => {
    if (!isCheckoutClick) return
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      document
        .querySelectorAll('a[aria-busy="true"][href*="/api/checkout/"]')
        .forEach((anchor) => anchor.removeAttribute("aria-busy"))
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [isCheckoutClick])

  const warmCheckout = () => {
    if (!checkoutParams) return
    cancelHoverWarm()
    preconnectStripeCheckout()
    void prefetchCheckoutSession(checkoutParams.offer, {
      email: checkoutParams.email,
      visitorId: checkoutParams.visitorId,
      promo: checkoutParams.promo,
      until: checkoutParams.until,
    })
  }

  const anchorRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const anchor = anchorRef.current
    const params = warmOnView ? parseCheckoutHrefParams(href) : null
    if (!params || !anchor) return
    if (typeof IntersectionObserver === "undefined") return
    if (!canWarmCheckoutOnView()) return

    let timer: number | null = null
    let inView = false
    const clear = () => {
      if (timer === null) return
      window.clearTimeout(timer)
      timer = null
    }
    // Only count time the visitor can actually see the button.
    const arm = () => {
      if (!inView || timer !== null || document.visibilityState !== "visible")
        return
      timer = window.setTimeout(() => {
        timer = null
        if (document.visibilityState !== "visible") return
        observer.disconnect()
        document.removeEventListener("visibilitychange", onVisibility)
        preconnectStripeCheckout()
        void prefetchCheckoutSession(params.offer, {
          email: params.email,
          visitorId: params.visitorId,
          promo: params.promo,
          until: params.until,
        })
      }, CHECKOUT_VIEW_INTENT_MS)
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") arm()
      else clear()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting)
        if (inView) arm()
        else clear()
      },
      { threshold: 0.6 }
    )
    observer.observe(anchor)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      clear()
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [warmOnView, href])

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    if (isCheckoutClick && checkoutOffer && checkoutParams) {
      trackNavigation()
      // POST → Stripe Checkout URL. Never GET create-session (429 → /pricing?checkout_error).
      event.preventDefault()
      const anchor = event.currentTarget
      anchor.setAttribute("aria-busy", "true")
      void waitForPrefetchedCheckoutUrl(checkoutOffer, {
        email: checkoutParams.email,
        visitorId: checkoutParams.visitorId,
        promo: checkoutParams.promo,
        until: checkoutParams.until,
      })
        .then((result) => {
          if (result.ok && result.url.startsWith("https://")) {
            window.location.assign(result.url)
            return
          }
          anchor.removeAttribute("aria-busy")
          const error = result.ok
            ? "Checkout did not return a URL."
            : result.error
          window.location.assign(pricingPathWithCheckoutError(error))
        })
        .catch(() => {
          anchor.removeAttribute("aria-busy")
          window.location.assign(pricingPathWithCheckoutError(""))
        })
      return
    }

    trackNavigation()

    if (!isDownloadClick) return

    const nextHref = withAnalyticsSessionHref(href)
    event.currentTarget.href = nextHref

    if (
      isExternalHref ||
      nextHref === href ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    window.location.assign(nextHref)
  }

  const trackProps = {
    // Desktop hover gives the Stripe session a few hundred ms head start
    // over mousedown, so the click usually finds the URL ready.
    onPointerEnter: (event: PointerEvent<HTMLAnchorElement>) => {
      if (!checkoutParams || event.pointerType !== "mouse") return
      cancelHoverWarm()
      hoverTimerRef.current = window.setTimeout(
        warmCheckout,
        CHECKOUT_HOVER_INTENT_MS
      )
    },
    onPointerLeave: cancelHoverWarm,
    onMouseDown: (event: MouseEvent<HTMLAnchorElement>) => {
      prepareDownloadHref(event)
      warmCheckout()
    },
    onTouchStart: (event: TouchEvent<HTMLAnchorElement>) => {
      prepareDownloadHref(event)
      warmCheckout()
    },
    onFocus: warmCheckout,
    onClick: onNavigate,
    onAuxClick: onNavigate,
  }

  if (isExternalHref || isDownloadClick) {
    return (
      <a
        ref={anchorRef}
        href={resolvedHref}
        className={className}
        {...trackProps}
        target={resolvedHref.startsWith("http") ? "_blank" : undefined}
        rel={
          resolvedHref.startsWith("http")
            ? "noopener noreferrer"
            : isCheckoutClick
              ? "nofollow"
              : undefined
        }
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={resolvedHref}
      className={className}
      {...trackProps}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
