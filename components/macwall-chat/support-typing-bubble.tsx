"use client"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/** Fin-style three-dot typing bubble for the support transcript. */
export function SupportTypingBubble({
  label = "MacWall Support is typing…",
  tone = "support",
  className,
}: {
  label?: string
  /** `support` = local scripted bubbles; `team` = live admin SSE typing. */
  tone?: "support" | "team"
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const isTeam = tone === "team"

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, y: 4, transition: { duration: 0.12 } }
      }
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col items-start gap-1", className)}
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={cn(
          "px-1 text-[11px] font-medium",
          isTeam ? "text-emerald-300/90" : "text-white/45"
        )}
      >
        {isTeam ? "MacWall Team" : "MacWall Support"}
      </span>
      <div
        className={cn(
          "flex min-h-[40px] min-w-[56px] items-center rounded-[20px] rounded-bl-md px-3.5 py-2.5",
          isTeam
            ? "border border-emerald-400/20 bg-emerald-400/10"
            : "bg-white/[0.07]"
        )}
      >
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full bg-white/65",
                !reduceMotion && "animate-bounce"
              )}
              style={
                reduceMotion
                  ? undefined
                  : {
                      animationDelay: `${i * 0.14}s`,
                      animationDuration: "0.7s",
                    }
              }
            />
          ))}
        </div>
      </div>
      <span className="px-1 text-[10px] text-white/30">{label}</span>
    </motion.div>
  )
}
