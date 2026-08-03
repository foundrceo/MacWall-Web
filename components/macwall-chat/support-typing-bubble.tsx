"use client"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/** Fin-style three-dot typing bubble for the support transcript. */
export function SupportTypingBubble({
  label = "MacWall Team is typing…",
  className,
}: {
  label?: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col items-start gap-1.5", className)}
      aria-live="polite"
      aria-label={label}
    >
      <span className="px-1 text-[11px] font-medium text-emerald-300/90">
        MacWall Support
      </span>
      <div className="rounded-[20px] rounded-bl-md border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full bg-white/70",
                !reduceMotion && "animate-bounce"
              )}
              style={
                reduceMotion
                  ? undefined
                  : { animationDelay: `${i * 0.14}s`, animationDuration: "0.7s" }
              }
            />
          ))}
        </div>
      </div>
      <span className="px-1 text-[10px] text-white/35">{label}</span>
    </motion.div>
  )
}
