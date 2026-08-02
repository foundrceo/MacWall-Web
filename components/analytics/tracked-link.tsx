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
import { markCheckoutStartedInSession } from "@/lib/analytics/retargeting"
import { trackTikTokInitiateCheckoutWithIdentify } from "@/lib/analytics/tiktok-client"

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
      void trackTikTokInitiateCheckoutWithIdentify()
    }
  }

  const prepareDownloadHref = (
    event: MouseEvent<HTMLAnchorElement> | TouchEvent<HTMLAnchorElement>
  ) => {
    if (!isDownloadClick) return
    event.currentTarget.href = withAnalyticsSessionHref(href)
  }

  const onNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    // Checkout: never block the browser — fire analytics and let the
    // native navigation hit /api/checkout → 303 Stripe as fast as possible.
    if (isCheckoutClick) {
      trackNavigation()
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
    onMouseDown: prepareDownloadHref,
    onTouchStart: prepareDownloadHref,
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
