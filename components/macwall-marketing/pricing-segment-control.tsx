"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type SegmentOption<T extends string> = {
  value: T
  label: string
}

function measureIndicator(
  container: HTMLDivElement,
  label: HTMLLabelElement
): { left: number; width: number } {
  const containerRect = container.getBoundingClientRect()
  const labelRect = label.getBoundingClientRect()

  return {
    left: labelRect.left - containerRect.left,
    width: labelRect.width,
  }
}

export function PricingSegmentControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  compact = false,
}: Readonly<{
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  compact?: boolean
}>) {
  const name = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef(new Map<string, HTMLLabelElement>())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const syncIndicator = () => {
    const container = containerRef.current
    const label = labelRefs.current.get(value)
    if (!container || !label) return
    setIndicator(measureIndicator(container, label))
  }

  useLayoutEffect(() => {
    syncIndicator()
  }, [value, options])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      syncIndicator()
    })

    observer.observe(container)
    window.addEventListener("resize", syncIndicator)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", syncIndicator)
    }
  }, [value])

  return (
    <fieldset aria-label={ariaLabel} className={cn("border-0 p-0", className)}>
      <div
        ref={containerRef}
        className={cn(
          "group relative flex w-fit rounded-full",
          compact ? "bg-background p-0.5" : "bg-card p-1"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute rounded-full transition-all duration-300 ease-out",
            compact ? "inset-y-0.5 bg-foreground/10" : "inset-y-1 bg-secondary"
          )}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
          aria-hidden
        />

        {options.map((option) => {
          const selected = value === option.value

          return (
            <label
              key={option.value}
              ref={(element) => {
                if (element) {
                  labelRefs.current.set(option.value, element)
                } else {
                  labelRefs.current.delete(option.value)
                }
              }}
              className={cn(
                "relative rounded-full leading-none transition-colors",
                compact ? "px-2.5 py-0.5 text-[13px]" : "px-4 py-2 text-base",
                selected
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="absolute inset-0 appearance-none rounded-full opacity-0 outline-none focus-visible:outline-none"
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
