import type { ReactNode } from "react"

import { landingEyebrow } from "@/components/macwall-marketing/landing-type"
import { cn } from "@/lib/utils"

/** Inner padding every home section block uses, so edges line up down the page. */
export const landingBlockPad = "px-6 lg:px-8"

/**
 * The heading block at the top of a home section: same padding, same type
 * scale, same rhythm everywhere.
 */
export function LandingSectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  children,
}: Readonly<{
  id?: string
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: "left" | "center"
  className?: string
  children?: ReactNode
}>) {
  return (
    <div
      className={cn(
        landingBlockPad,
        "flex flex-col gap-3 pt-12 pb-10 md:pt-16 md:pb-12",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? <p className={landingEyebrow}>{eyebrow}</p> : null}
      <h2
        id={id}
        className="font-display max-w-2xl text-3xl font-normal tracking-tighter text-balance md:text-5xl"
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-xl text-lg leading-relaxed tracking-tight text-pretty text-muted-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  )
}
