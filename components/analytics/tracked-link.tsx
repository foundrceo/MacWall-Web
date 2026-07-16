"use client"

import Link from "next/link"
import type { ReactNode } from "react"

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
  const onNavigate = () => {
    trackSiteEventClient(eventName, metadata)

    if (eventName === "pricing_click") {
      void trackTikTokInitiateCheckoutWithIdentify()
    }
  }

  const resolvedHref =
    eventName === "download_click" ? withAnalyticsSessionHref(href) : href

  const trackProps = {
    onClick: onNavigate,
    onAuxClick: onNavigate,
  }

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={resolvedHref}
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
      href={resolvedHref}
      className={className}
      {...trackProps}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
