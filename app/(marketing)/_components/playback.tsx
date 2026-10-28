import { Check, Cpu, Minus } from "lucide-react"
import type { CSSProperties } from "react"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

type Mode = "system" | "app"

const MODES: readonly Mode[] = ["system", "app"]

/** A filled check for what a mode does well, a quiet dash for its trade-off. */
function Mark({ ok }: Readonly<{ ok: boolean }>) {
  return ok ? (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
      <Check className="size-3" strokeWidth={3} aria-hidden />
    </span>
  ) : (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-3">
      <Minus className="size-3" strokeWidth={2.5} aria-hidden />
    </span>
  )
}

/**
 * The two playback modes as two cards, PostMesh pricing style: same surface,
 * the recommended one marked by its white corner tab. Each card lists the same moments, one line
 * each, in the same order; on wide screens the lines share a subgrid so they
 * line up across both cards. Phones stack the cards, so there's nothing to
 * toggle.
 */
export function Playback() {
  const { playback } = macwallMarketingCopy.home
  const rowCount = playback.rows.length

  return (
    <MarketingSection
      id="playback"
      aria-labelledby="playback-heading"
      sectionClassName={LANDING_SECTION_END}
    >
      <LandingSectionHeader
        id="playback-heading"
        title={playback.title}
        lead={playback.lead}
      />

      {/* --rows: the header plus one per moment; each card spans them all. */}
      <div
        className="grid gap-4 lg:grid-cols-2 lg:grid-rows-[repeat(var(--rows),auto)] lg:gap-y-0"
        style={{ "--rows": rowCount + 1 } as CSSProperties}
      >
        {MODES.map((mode) => {
          const info = playback.modes[mode]
          const featured = mode === "system"
          return (
            <article
              key={mode}
              aria-labelledby={`playback-${mode}`}
              className={cn(
                "relative flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-surface-1 px-6 squircle sm:px-8",
                "lg:[grid-row:span_var(--rows)] lg:grid lg:grid-rows-subgrid"
              )}
            >
              {/* Corner tab, flush with the card's top and right edges. */}
              <span
                className={cn(
                  "absolute top-0 right-0 inline-flex h-8 items-center rounded-tr-[28px] rounded-bl-[16px] pr-5 pl-4 text-[12px] leading-4 font-medium whitespace-nowrap squircle",
                  featured ? "bg-white text-black" : "bg-surface-3 text-ink-2"
                )}
              >
                {info.tag}
              </span>

              <header className="pt-12 pb-8 sm:pt-14">
                <h3
                  id={`playback-${mode}`}
                  className="font-display text-[28px] leading-9 font-normal tracking-tight text-ink sm:text-[32px] sm:leading-10"
                >
                  {info.name}
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-[22px] text-pretty text-ink-2">
                  {info.body}
                </p>
                <p className="mt-5 inline-flex h-7 items-center gap-1.5 rounded-full bg-black/40 px-3 text-[13px] leading-5 text-ink-2">
                  <Cpu className="size-3.5 text-ink-3" aria-hidden />
                  Runs on {info.runsOn}
                </p>
              </header>

              <ul
                role="list"
                className="flex flex-col gap-5 border-t border-hairline pt-7 pb-9 lg:contents"
              >
                {playback.rows.map((row, i) => {
                  const cell = row[mode]
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-3",
                        // On wide screens each line is a subgrid row, so it
                        // lines up with the same moment in the other card.
                        "lg:py-3",
                        i === 0 && "lg:border-t lg:border-hairline lg:pt-7",
                        i === rowCount - 1 && "lg:pb-9"
                      )}
                    >
                      <span className="mt-px">
                        <Mark ok={cell.ok} />
                      </span>
                      <span
                        className={cn(
                          "min-w-0 text-[15px] leading-[22px] text-pretty",
                          cell.ok ? "text-ink" : "text-ink-2"
                        )}
                      >
                        <span className="sr-only">
                          {cell.ok ? "Yes: " : "Trade-off: "}
                        </span>
                        {cell.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>
    </MarketingSection>
  )
}
