import Link from "next/link"
import {
  legalLinkProse,
  legalTextPrimary,
  legalTextSecondary,
} from "@/components/legal/legal-classes"
import type { ContentBlock } from "@/lib/content/types"
import {
  proseBody,
  proseH2,
  proseH3,
  proseLinkProse,
  proseOl,
  proseP,
  proseUl,
  proseUlBullet,
  proseUlItem,
} from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const INLINE_LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/

/** Inline markdown: **bold** and [label](href). Internal hrefs (starting with "/") use next/link. */
function renderInlineText(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    const link = part.match(INLINE_LINK_PATTERN)
    if (link) {
      const [, label, href] = link
      if (href.startsWith("/")) {
        return (
          <Link key={index} href={href}>
            {label}
          </Link>
        )
      }
      return (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      )
    }

    return <span key={index}>{part}</span>
  })
}

export function ContentBody({
  sections,
}: Readonly<{ sections: ContentBlock[] }>) {
  return (
    <div className={cn(proseBody, proseLinkProse, legalLinkProse)}>
      {sections.map((block, index) => {
        switch (block.type) {
          case "h2": {
            const h2Index =
              sections.slice(0, index).filter((b) => b.type === "h2").length + 1
            return (
              <h2
                key={`h2-${index}`}
                className={cn(
                  proseH2,
                  h2Index === 1 && "mt-0",
                  legalTextPrimary
                )}
              >
                {block.text}
              </h2>
            )
          }
          case "h3":
            return (
              <h3
                key={`h3-${index}`}
                className={cn(proseH3, legalTextPrimary)}
              >
                {block.text}
              </h3>
            )
          case "p":
            return (
              <p
                key={`p-${index}`}
                className={cn(proseP, legalTextSecondary)}
              >
                {renderInlineText(block.text)}
              </p>
            )
          case "ul":
            return (
              <ul key={`ul-${index}`} className={proseUl}>
                {block.items.map((item) => (
                  <li key={item} className={proseUlItem}>
                    <span aria-hidden className={proseUlBullet}>
                      •
                    </span>
                    <span>{renderInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={`ol-${index}`} className={proseOl}>
                {block.items.map((item) => (
                  <li key={item}>{renderInlineText(item)}</li>
                ))}
              </ol>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
