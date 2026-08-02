"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const ROTATE_MS = 2800

export function PricingRotatingBadge({
  labels,
  className,
}: Readonly<{
  labels: readonly string[]
  className?: string
}>) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const safeLabels = labels.filter(Boolean)

  useEffect(() => {
    if (safeLabels.length < 2 || reduceMotion) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeLabels.length)
    }, ROTATE_MS)

    return () => window.clearInterval(id)
  }, [safeLabels.length, reduceMotion])

  if (safeLabels.length === 0) return null

  const label = safeLabels[reduceMotion ? 0 : index] ?? safeLabels[0]

  return (
    <span
      className={cn(
        "absolute top-0 right-4 z-10 inline-flex min-w-[6.75rem] items-center justify-center overflow-hidden rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium tracking-wide text-background",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          className="block whitespace-nowrap"
          initial={
            reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(3px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, y: -6, filter: "blur(3px)" }
          }
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
