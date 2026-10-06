import { Check, Minus, X } from "lucide-react"

import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

function Mark({ ok }: Readonly<{ ok: boolean }>) {
  return ok ? (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
      <Check className="size-3" strokeWidth={3} aria-hidden />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
      <X className="size-3" strokeWidth={2.5} aria-hidden />
      <span className="sr-only">No</span>
    </span>
  )
}

function MatrixValue({ value }: Readonly<{ value: boolean | string }>) {
  if (value === true) return <Mark ok />
  if (value === false) {
    return (
      <span className="flex size-5 items-center justify-center text-muted-foreground/60">
        <Minus className="size-4" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    )
  }
  return <span className="text-sm whitespace-nowrap text-muted-foreground">{value}</span>
}

/** The two playback modes as comparison cards, then what each macOS gets. */
export function Playback() {
  const { playback, compat } = macwallMarketingCopy.home

  return (
    <MarketingSection id="playback" aria-labelledby="playback-heading">
      <LandingSectionHeader
        id="playback-heading"
        title={playback.title}
        lead={playback.lead}
      />

      {/* Modes */}
      <div className="grid grid-cols-1 border-t border-dashed border-border md:grid-cols-2 md:divide-x md:divide-dashed md:divide-border">
        {playback.modes.map((mode, index) => (
          <div
            key={mode.name}
            className={cn(
              landingBlockPad,
              "flex min-w-0 flex-col gap-6 py-10",
              index > 0 && "border-t border-dashed border-border md:border-t-0",
              index === 0 && "bg-card/60"
            )}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-display text-2xl font-normal tracking-tighter md:text-3xl">
                  {mode.name}
                </h3>
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-full px-2.5 text-xs",
                    index === 0
                      ? "bg-primary font-medium text-primary-foreground"
                      : "border border-border text-muted-foreground"
                  )}
                >
                  {mode.tag}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {mode.body}
              </p>
            </div>
            <ul className="flex flex-col gap-3.5 border-t border-dashed border-border pt-6">
              {mode.points.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <Mark ok={point.ok} />
                  <span
                    className={cn(
                      "text-[15px] leading-5",
                      point.ok ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-1 border-t border-dashed border-border md:grid-cols-2 md:divide-x md:divide-dashed md:divide-border">
        <div className={cn(landingBlockPad, "flex flex-col gap-2 py-10")}>
          <h3 className="font-display text-2xl font-normal tracking-tighter md:text-3xl">
            {compat.title}
          </h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {compat.lead} {compat.note}
          </p>
        </div>
        <div className="min-w-0 border-t border-dashed border-border md:border-t-0">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col />
              <col className="w-24 lg:w-32" />
              <col className="w-24 lg:w-32" />
            </colgroup>
            <thead>
              <tr className="border-b border-dashed border-border">
                <th scope="col" className={cn(landingBlockPad, "py-4 font-normal")}>
                  <span className="sr-only">Feature</span>
                </th>
                {compat.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-3 py-4 text-sm font-normal whitespace-nowrap text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-border">
              {compat.rows.map((row) => (
                <tr key={row.feature}>
                  <th
                    scope="row"
                    className={cn(
                      landingBlockPad,
                      "py-4 text-[15px] font-normal text-foreground"
                    )}
                  >
                    {row.feature}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={`${row.feature}-${index}`} className="px-3 py-4">
                      <MatrixValue value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MarketingSection>
  )
}
