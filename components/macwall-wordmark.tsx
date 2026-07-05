"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
} from "@/lib/macwall-site"

type MacWallWordmarkProps = Readonly<{
  /** Pass `null` to render a non-clickable wordmark. */
  href?: string | null
  className?: string
  iconClassName?: string
  labelClassName?: string
}>

/** App icon + MacWall — same artwork as the macOS app. */
export function MacWallWordmark({
  href = "/",
  className,
  iconClassName,
  labelClassName,
}: MacWallWordmarkProps) {
  const body = (
    <>
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden",
          macwallAppIconRadiusClass,
          iconClassName ?? "h-7 w-7"
        )}
        aria-hidden
      >
        <Image
          src={macwallAppIconPath}
          alt=""
          fill
          className="object-cover"
          sizes="128px"
        />
      </span>
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          labelClassName
        )}
      >
        {macwall.name}
      </span>
    </>
  )

  if (href === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>{body}</div>
    )
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      {body}
    </Link>
  )
}
