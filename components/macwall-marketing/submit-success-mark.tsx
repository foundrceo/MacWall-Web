"use client"

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const MARK_SIZE = 72

const BADGE_PATH =
  "M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"

const CHECK_PATH =
  "M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5"

const ENTER_MS = 180
const TICK_START_MS = ENTER_MS
const TICK_DRAW_MS = 400
const BADGE_FADE_MS = 220

type IntroStage = "enter" | "tick" | "badge"

const shellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.76 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 28,
      mass: 0.75,
    },
  },
}

const tickDrawTransition = {
  pathLength: {
    type: "spring" as const,
    visualDuration: 0.4,
    bounce: 0.12,
  },
  pathOffset: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as const,
  },
  opacity: { duration: 0.1 },
}

/** Animated success checkmark for community submit confirmation. */
export function SubmitSuccessMark({
  className,
}: Readonly<{
  className?: string
}>) {
  const reducedMotion = useReducedMotion()
  const skip = Boolean(reducedMotion)
  const [stage, setStage] = useState<IntroStage>(skip ? "badge" : "enter")

  useEffect(() => {
    if (skip) return

    const toTick = globalThis.setTimeout(() => setStage("tick"), TICK_START_MS)
    const toBadge = globalThis.setTimeout(
      () => setStage("badge"),
      TICK_START_MS + TICK_DRAW_MS
    )

    return () => {
      globalThis.clearTimeout(toTick)
      globalThis.clearTimeout(toBadge)
    }
  }, [skip])

  const tickVisible = stage === "tick" || stage === "badge"
  const badgeVisible = stage === "badge"

  return (
    <div
      className={cn("relative mx-auto", className)}
      style={{ width: MARK_SIZE, height: MARK_SIZE }}
      aria-hidden
    >
      <motion.div
        className="size-full"
        variants={shellVariants}
        initial={skip ? false : "hidden"}
        animate={stage === "enter" ? "hidden" : "show"}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={24}
          height={24}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-full text-[#34c759]"
        >
          <motion.path
            d={BADGE_PATH}
            initial={skip ? false : { opacity: 0 }}
            animate={{ opacity: badgeVisible ? 1 : 0 }}
            transition={
              skip
                ? { duration: 0 }
                : { duration: BADGE_FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }
            }
          />
          <motion.path
            d={CHECK_PATH}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={
              skip
                ? { pathLength: 1, pathOffset: 0, opacity: 1 }
                : { pathLength: 0, pathOffset: 0.08, opacity: 0 }
            }
            animate={
              tickVisible
                ? { pathLength: 1, pathOffset: 0, opacity: 1 }
                : { pathLength: 0, pathOffset: 0.08, opacity: 0 }
            }
            transition={skip ? { duration: 0 } : tickDrawTransition}
          />
        </motion.svg>
      </motion.div>
    </div>
  )
}
