import type { ReactNode } from "react"

import type { ContentTableBlock } from "@/lib/content/types"

/**
 * Comparison table for prose pages. The wrapper scrolls sideways on phones so
 * the page itself never does; the first column stays readable as a row header.
 */
export function ContentTable({
  block,
  renderInline,
}: Readonly<{
  block: ContentTableBlock
  renderInline: (text: string) => ReactNode[]
}>) {
  return (
    <figure className="not-prose -mx-4 md:mx-0">
      <div className="overflow-x-auto px-4 md:px-0">
        <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-5">
          <thead>
            <tr className="border-b border-border">
              {block.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="py-3 pr-4 align-bottom font-medium text-white"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr
                key={row[0]}
                className="border-b border-dashed border-border align-top"
              >
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th
                      key={cellIndex}
                      scope="row"
                      className="py-3 pr-4 font-medium text-white"
                    >
                      {renderInline(cell)}
                    </th>
                  ) : (
                    <td
                      key={cellIndex}
                      className="py-3 pr-4 text-landing-muted"
                    >
                      {renderInline(cell)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption ? (
        <figcaption className="mt-3 px-4 text-[13px] leading-5 text-marketing-muted md:px-0">
          {renderInline(block.caption)}
        </figcaption>
      ) : null}
    </figure>
  )
}
