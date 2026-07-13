import {
  legalLinkProse,
  legalTextPrimary,
  legalTextSecondary,
} from "@/components/legal/legal-classes"
import type { ContentBlock } from "@/lib/content/types"
import { cn } from "@/lib/utils"

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[#1d1d1f]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function ContentBody({
  sections,
}: Readonly<{ sections: ContentBlock[] }>) {
  return (
    <div className={cn("MacWallProseBody", legalLinkProse)}>
      {sections.map((block, index) => {
        switch (block.type) {
          case "h2": {
            const h2Index =
              sections.slice(0, index).filter((b) => b.type === "h2").length + 1
            return (
              <h2
                key={`h2-${index}`}
                className={cn(
                  "MacWallProseH2",
                  h2Index === 1 && "MacWallProseH2--first",
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
                className={cn("MacWallProseH3", legalTextPrimary)}
              >
                {block.text}
              </h3>
            )
          case "p":
            return (
              <p
                key={`p-${index}`}
                className={cn("MacWallProseP", legalTextSecondary)}
              >
                {renderInlineText(block.text)}
              </p>
            )
          case "ul":
            return (
              <ul key={`ul-${index}`} className="MacWallProseUl">
                {block.items.map((item) => (
                  <li key={item} className="MacWallProseUlItem">
                    <span aria-hidden className="MacWallProseUlBullet">
                      •
                    </span>
                    <span>{renderInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={`ol-${index}`} className="MacWallProseOl">
                {block.items.map((item) => (
                  <li key={item} className="MacWallProseOlItem">
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
