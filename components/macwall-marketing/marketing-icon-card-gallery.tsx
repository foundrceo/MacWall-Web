"use client"

import { MarketingContainer } from "@/components/macwall-marketing/marketing-primitives"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type MarketingIconCardAccent = "violet" | "orange" | "teal" | "blue"

export type MarketingIconCard = {
  title: string
  body: string
  accent: MarketingIconCardAccent
  icon: LucideIcon
}

type IconCardGalleryLayout = "quad"

const accentClass: Record<MarketingIconCardAccent, string> = {
  violet: "MacWallValuesAccentViolet",
  orange: "MacWallValuesAccentOrange",
  teal: "MacWallValuesAccentTeal",
  blue: "MacWallValuesAccentBlue",
}

function IconCardGalleryIcon({ icon: Icon }: Readonly<{ icon: LucideIcon }>) {
  return (
    <Icon className="MacWallValuesCardIconSvg" strokeWidth={1.75} aria-hidden />
  )
}

export default function MacWallMarketingIconCardGallery({
  cards,
  layout = "quad",
  labelledBy,
  className,
}: Readonly<{
  cards: MarketingIconCard[]
  layout?: IconCardGalleryLayout
  labelledBy?: string
  className?: string
}>) {
  return (
    <MarketingContainer
      wide
      className={cn("MacWallIconCardGallery", className)}
    >
      <ul
        role="list"
        aria-labelledby={labelledBy}
        className={cn(
          "MacWallIconCardGalleryGrid grid gap-4",
          layout === "quad" &&
            "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5"
        )}
      >
        {cards.map((card) => (
          <li
            key={card.title}
            className="MacWallIconCardGalleryItem"
            role="listitem"
          >
            <div className="MacWallValuesCard h-full">
              <div className="MacWallValuesCardContent">
                <div
                  className={cn(
                    "MacWallValuesCardIcon",
                    accentClass[card.accent]
                  )}
                >
                  <IconCardGalleryIcon icon={card.icon} />
                </div>
                <div className="MacWallValuesCardCopy">
                  <h3 className="MacWallValuesCardHeadline">
                    <strong className={accentClass[card.accent]}>
                      {card.title}
                    </strong>
                  </h3>
                  <p className="MacWallValuesCardBody">{card.body}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </MarketingContainer>
  )
}
