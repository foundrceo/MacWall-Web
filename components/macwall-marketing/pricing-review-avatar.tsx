"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

export function PricingReviewAvatar({
  name,
  src,
  className,
}: Readonly<{
  name: string
  src?: string
  className?: string
}>) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[#111] text-[13px] font-medium text-landing-muted ring-1 ring-inset ring-white/10",
          className
        )}
        aria-hidden
      >
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("")}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt=""
      width={48}
      height={48}
      sizes="48px"
      onError={() => setFailed(true)}
      className={cn(
        "size-12 shrink-0 rounded-full object-cover ring-1 ring-inset ring-white/10",
        className
      )}
    />
  )
}
