import Link from "next/link"
import type { ContentBlock } from "@/lib/content/types"
import {
  blogBody,
  blogH2,
  blogH2Spaced,
  blogH3,
  blogOl,
  blogOlItem,
  blogP,
  blogUl,
  blogUlBullet,
  blogUlItem,
} from "@/lib/blog-prose-classes"
import { proseLinkProse } from "@/lib/marketing-prose-classes"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const INLINE_LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/

function renderInlineText(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-medium text-foreground">
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

export function BlogContentBody({
  sections,
}: Readonly<{ sections: ContentBlock[] }>) {
  return (
    <div className={cn(blogBody, proseLinkProse)}>
      {sections.map((block, index) => {
        switch (block.type) {
          case "h2": {
            const h2Index =
              sections.slice(0, index).filter((b) => b.type === "h2").length + 1
            return (
              <h2
                key={`h2-${index}`}
                className={cn(blogH2, h2Index > 1 && blogH2Spaced)}
              >
                {block.text}
              </h2>
            )
          }
          case "h3":
            return (
              <h3 key={`h3-${index}`} className={blogH3}>
                {block.text}
              </h3>
            )
          case "p":
            return (
              <p key={`p-${index}`} className={blogP}>
                {renderInlineText(block.text)}
              </p>
            )
          case "ul":
            return (
              <ul key={`ul-${index}`} className={blogUl}>
                {block.items.map((item) => (
                  <li key={item} className={blogUlItem}>
                    <span aria-hidden className={blogUlBullet} />
                    <span className="min-w-0 flex-1">{renderInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={`ol-${index}`} className={blogOl}>
                {block.items.map((item) => (
                  <li key={item} className={blogOlItem}>
                    {renderInlineText(item)}
                  </li>
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
