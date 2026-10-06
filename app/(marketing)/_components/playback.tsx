"use client"

import {
  Check,
  Cpu,
  Lock,
  Power,
  Volume2,
  Wallpaper,
  X,
  type LucideIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

type Mode = "system" | "app"

const MODES: readonly Mode[] = ["system", "app"]

const ROW_ICONS: Record<string, LucideIcon> = {
  power: Power,
  lock: Lock,
  sound: Volume2,
  wallpaper: Wallpaper,
  macos: Cpu,
}

function Mark({ ok }: Readonly<{ ok: boolean }>) {
  return ok ? (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
      <Check className="size-3" strokeWidth={3} aria-hidden />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
      <X className="size-3" strokeWidth={2.5} aria-hidden />
      <span className="sr-only">No</span>
    </span>
  )
}

function Tag({ mode, children }: Readonly<{ mode: Mode; children: string }>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center rounded-full px-2.5 text-xs",
        mode === "system"
          ? "bg-primary font-medium text-primary-foreground"
          : "border border-border text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

/** Phone-only switch between the two columns, with a gliding thumb. */
function ModeSwitch({
  value,
  onChange,
}: Readonly<{ value: Mode; onChange: (mode: Mode) => void }>) {
  const { playback } = macwallMarketingCopy.home

  return (
    <div
      role="radiogroup"
      aria-label={playback.switchLabel}
      className="mt-4 flex max-w-sm rounded-full border border-border bg-muted/60 p-1 md:hidden"
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return
        event.preventDefault()
        const next = value === "system" ? "app" : "system"
        onChange(next)
        event.currentTarget
          .querySelectorAll<HTMLButtonElement>("button")
          [MODES.indexOf(next)]?.focus()
      }}
    >
      {MODES.map((mode) => {
        const selected = mode === value
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(mode)}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center rounded-full px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {selected ? (
              <motion.span
                layoutId="playback-mode-thumb"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">{playback.modes[mode].name}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * The two playback modes as a ledger: rows are things you do, columns are what
 * each mode does. Phones show one column at a time.
 */
export function Playback() {
  const { playback } = macwallMarketingCopy.home
  const [phoneMode, setPhoneMode] = useState<Mode>("system")

  const columnVisibility = (mode: Mode) =>
    mode === phoneMode ? "max-md:block" : "max-md:hidden"

  return (
    <MarketingSection id="playback" aria-labelledby="playback-heading">
      <LandingSectionHeader id="playback-heading" title={playback.title} lead={playback.lead}>
        <ModeSwitch value={phoneMode} onChange={setPhoneMode} />
      </LandingSectionHeader>

      <div className="border-t border-dashed border-border">
        <table className="w-full text-left max-md:block md:table-fixed">
          <caption className="sr-only">{playback.caption}</caption>
          <colgroup className="max-md:hidden">
            <col className="w-[34%]" />
            <col />
            <col />
          </colgroup>
          <thead className="max-md:block">
            <tr className="border-b border-dashed border-border max-md:block">
              <th scope="col" className="max-md:hidden">
                <span className="sr-only">{playback.momentLabel}</span>
              </th>
              {MODES.map((mode) => (
                <th
                  key={mode}
                  scope="col"
                  className={cn(
                    landingBlockPad,
                    "py-8 align-top font-normal md:border-l md:border-dashed md:border-border",
                    mode === "system" && "bg-card/70",
                    columnVisibility(mode)
                  )}
                >
                  <span className="flex flex-col gap-2">
                    <Tag mode={mode}>{playback.modes[mode].tag}</Tag>
                    <span className="font-display text-2xl tracking-tighter text-foreground md:text-4xl">
                      {playback.modes[mode].name}
                    </span>
                    <span className="max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                      {playback.modes[mode].body}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-border max-md:block">
            {playback.rows.map((row) => {
              const Icon = ROW_ICONS[row.icon] ?? Cpu
              return (
                <tr key={row.moment} className="group max-md:block">
                  <th
                    scope="row"
                    className={cn(landingBlockPad, "py-5 align-top font-normal max-md:block max-md:pb-0")}
                  >
                    <span className="flex items-center gap-3 text-[15px] text-muted-foreground transition-colors group-hover:text-foreground">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      {row.moment}
                    </span>
                  </th>
                  {MODES.map((mode) => {
                    const cell = row[mode]
                    return (
                      <td
                        key={mode}
                        className={cn(
                          landingBlockPad,
                          "py-5 align-middle max-md:pt-3 md:border-l md:border-dashed md:border-border",
                          mode === "system" && "md:bg-card/70",
                          columnVisibility(mode)
                        )}
                      >
                        <span className="flex items-start gap-3">
                          {cell.ok === null ? null : <Mark ok={cell.ok} />}
                          <span
                            className={cn(
                              "text-[15px] leading-5",
                              cell.ok === false ? "text-muted-foreground" : "text-foreground"
                            )}
                          >
                            {cell.text}
                          </span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </MarketingSection>
  )
}
