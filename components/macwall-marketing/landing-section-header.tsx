import type { ReactNode } from "react"

import { landingEyebrow } from "@/components/macwall-marketing/landing-type"
import { cn } from "@/lib/utils"

/**
 * Inner padding for home section blocks. The section frame now carries the
 * gutters (PostMesh-style), so blocks sit flush with the stage edge.
 */
export const landingBlockPad = ""

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
        "flex flex-col pt-20 pb-10 lg:pt-[110px] lg:pb-14",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? <p className={cn(landingEyebrow, "mb-4")}>{eyebrow}</p> : null}
      <h2
        id={id}
        className="max-w-2xl font-display text-[36px] leading-[44px] font-normal tracking-tight text-balance text-ink sm:text-[48px] sm:leading-[58px]"
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-xl text-[15px] leading-[22px] text-pretty text-ink-2",
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
