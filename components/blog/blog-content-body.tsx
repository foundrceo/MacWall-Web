import Link from "next/link"
import {
  ContentImageFigure,
  ContentVideoFigure,
} from "@/components/content/content-media"
import { ContentTable } from "@/components/content/content-table"
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
import { Fragment, type ReactNode } from "react"

const INLINE_LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/

/** Inline Markdown: `code`, **bold** and [label](href); internal links use next/link. */
function renderInlineText(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((part, index) => {
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.86em] break-words text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

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

/**
 * Where `afterFirstSection` goes: before the second H2, so it follows the
 * first section's content; after everything when there is no second H2.
 */
function secondH2Index(sections: readonly ContentBlock[]): number {
  let seen = 0
  for (const [index, block] of sections.entries()) {
    if (block.type !== "h2") continue
    seen += 1
    if (seen === 2) return index
  }
  return -1
}

export function BlogContentBody({
  sections,
  afterFirstSection,
}: Readonly<{
  sections: ContentBlock[]
  /** Rendered after the first H2 section, e.g. the in-content CTA. */
  afterFirstSection?: ReactNode
}>) {
  const insertAt = afterFirstSection ? secondH2Index(sections) : -1

  return (
    <div className={cn(blogBody, proseLinkProse)}>
      {sections.map((block, index) => (
        <Fragment key={`${block.type}-${index}`}>
          {index === insertAt ? afterFirstSection : null}
          {renderBlock(block, index, sections)}
        </Fragment>
      ))}
      {afterFirstSection && insertAt === -1 ? afterFirstSection : null}
    </div>
  )
}

function renderBlock(
  block: ContentBlock,
  index: number,
  sections: readonly ContentBlock[]
): ReactNode {
  switch (block.type) {
    case "h2": {
      const h2Index =
        sections.slice(0, index).filter((b) => b.type === "h2").length + 1
      return (
        <h2 className={cn(blogH2, h2Index > 1 && blogH2Spaced)}>
          {block.text}
        </h2>
      )
    }
    case "h3":
      return <h3 className={blogH3}>{block.text}</h3>
    case "p":
      return <p className={blogP}>{renderInlineText(block.text)}</p>
    case "ul":
      return (
        <ul className={blogUl}>
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
        <ol className={blogOl}>
          {block.items.map((item) => (
            <li key={item} className={blogOlItem}>
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      )
    case "table":
      return <ContentTable block={block} renderInline={renderInlineText} />
    case "image":
      return <ContentImageFigure block={block} />
    case "video":
      return <ContentVideoFigure block={block} />
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}
