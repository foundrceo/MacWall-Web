"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

function AvatarFallback({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20",
        className
      )}
      aria-hidden
    >
      <User className="size-5 text-foreground/60" />
    </span>
  )
}

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
  const sizeClass = "size-11 shrink-0"

  if (!src || failed) {
    return <AvatarFallback className={className} />
  }

  return (
    <Image
      src={src}
      alt={`${name} profile photo`}
      width={48}
      height={48}
      sizes="48px"
      onError={() => setFailed(true)}
      className={cn(
        sizeClass,
        "rounded-full object-cover ring-1 ring-white/20",
        className
      )}
    />
  )
}
