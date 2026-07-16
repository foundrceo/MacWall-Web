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
import { trackTikTokInitiateCheckoutWithIdentify } from "@/lib/analytics/tiktok-client"

type TrackedLinkProps = {
  href: string
  children: ReactNode
  className?: string
  eventName: SiteAnalyticsEventName
  metadata?: SiteAnalyticsMetadata
  external?: boolean
  ariaLabel?: string
}

export function TrackedLink({
  href,
  children,
  className,
  eventName,
  metadata,
  external,
  ariaLabel,
}: TrackedLinkProps) {
  const isDownloadClick = eventName === "download_click"
  const isExternalHref =
    external || href.startsWith("http") || href.startsWith("mailto:")

  const trackNavigation = () => {
    trackSiteEventClient(eventName, metadata)

    if (eventName === "pricing_click") {
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
    trackNavigation()

    if (!isDownloadClick) return

    const resolvedHref = withAnalyticsSessionHref(href)
    event.currentTarget.href = resolvedHref

    if (
      isExternalHref ||
      resolvedHref === href ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    window.location.assign(resolvedHref)
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
        href={href}
        className={className}
        {...trackProps}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={className}
      {...trackProps}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
