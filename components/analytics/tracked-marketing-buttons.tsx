"use client"

import type { MouseEvent, ReactNode } from "react"

import { TrackedLink } from "@/components/analytics/tracked-link"
import { prosePrimaryBtn } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"

type ButtonSize = "default" | "sm" | "lg" | "pill"

function buttonClasses(size: ButtonSize, className?: string) {
  if (size === "pill") {
    return cn(className)
  }

  return cn(
    prosePrimaryBtn,
    "prose-primary-btn",
    size === "sm" && "min-h-[28px] px-4 text-[12px]",
    size === "default" &&
      "min-h-[44px] px-[22px] text-[17px] tracking-[-0.022em]",
    size === "lg" && "min-h-[48px] px-6 text-[17px] tracking-[-0.022em]",
    className
  )
}

export function TrackedDownloadButton({
  href,
  children,
  className,
  size = "default",
  location,
  onClick,
}: Readonly<{
  href: string
  children: ReactNode
  className?: string
  size?: ButtonSize
  location: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}>) {
  return (
    <TrackedLink
      href={href}
      className={buttonClasses(size, className)}
      eventName="download_click"
      metadata={{ location }}
      onClick={onClick}
    >
      {children}
    </TrackedLink>
  )
}

export function TrackedPricingButton({
  href,
  children,
  className,
  size = "default",
  location,
  ariaLabel,
  external,
  onClick,
}: Readonly<{
  href: string
  children: ReactNode
  className?: string
  size?: ButtonSize
  location: string
  external?: boolean
  ariaLabel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}>) {
  const isExternal =
    external ??
    (href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("/api/"))

  return (
    <TrackedLink
      href={href}
      className={buttonClasses(size, className)}
      eventName="pricing_click"
      metadata={{ location }}
      external={isExternal}
      ariaLabel={ariaLabel}
      onClick={onClick}
    >
      {children}
    </TrackedLink>
  )
}

export function TrackedFooterLink({
  href,
  children,
  className,
  eventName,
  location,
  external,
}: Readonly<{
  href: string
  children: ReactNode
  className?: string
  eventName: "download_click" | "pricing_click" | "cta_click"
  location: string
  external?: boolean
}>) {
  return (
    <TrackedLink
      href={href}
      className={className}
      eventName={eventName}
      metadata={{ location }}
      external={external}
    >
      {children}
    </TrackedLink>
  )
}
