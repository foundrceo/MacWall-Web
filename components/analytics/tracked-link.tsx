"use client"

import Link from "next/link"
import type { MouseEvent, ReactNode, TouchEvent } from "react"

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
  prefetchCheckoutSession,
  waitForPrefetchedCheckoutUrl,
} from "@/lib/checkout/prefetch-checkout"
import { pricingPathWithCheckoutError } from "@/lib/checkout/checkout-session-client"

type TrackedLinkProps = {
  href: string
  children: ReactNode
  className?: string
  eventName: SiteAnalyticsEventName
  metadata?: SiteAnalyticsMetadata
  external?: boolean
  ariaLabel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

function isCheckoutApiHref(href: string): boolean {
  return href.includes("/api/checkout/")
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

  const warmCheckout = () => {
    if (!checkoutParams) return
    void prefetchCheckoutSession(checkoutParams.offer, {
      email: checkoutParams.email,
      visitorId: checkoutParams.visitorId,
      promo: checkoutParams.promo,
      until: checkoutParams.until,
    })
  }

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
            ? "Stripe did not return a checkout URL."
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
        href={resolvedHref}
        className={className}
        {...trackProps}
        target={resolvedHref.startsWith("http") ? "_blank" : undefined}
        rel={
          resolvedHref.startsWith("http") ? "noopener noreferrer" : undefined
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
