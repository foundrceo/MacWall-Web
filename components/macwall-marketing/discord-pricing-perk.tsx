"use client"

import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DISCORD_MEMBER_PERCENT_OFF } from "@/lib/discord/discount-public"
import { macwall } from "@/lib/macwall-site"

function DiscordMark({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 12.3 12.3 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.099.246.198.373.292a.077.077 0 01-.007.128 12.3 12.3 0 01-1.873.891.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

/** Pricing Discord perk — capsule with clipped, centered shine sweep. */
export function DiscordPricingPerk() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="mx-auto mt-6 flex w-fit max-w-[calc(100%-2rem)] justify-center"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative isolate flex items-center overflow-hidden rounded-full border border-white/10 bg-secondary p-1 pl-3.5 sm:pl-4">
        {/* Shine clipped to capsule; transform keeps it on the vertical center */}
        {!reduceMotion ? (
          <motion.span
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-0 w-[28%] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: "420%" }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 3,
            }}
          />
        ) : null}

        <div className="relative z-10 flex items-center gap-2 pr-3 sm:gap-2.5 sm:pr-3.5">
          <DiscordMark className="size-3.5 shrink-0 text-foreground/80 sm:size-4" />

          <span className="text-[13px] leading-none font-medium tracking-tight whitespace-nowrap text-foreground sm:text-[14px]">
            Extra {DISCORD_MEMBER_PERCENT_OFF}% off in Discord
          </span>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="How the Discord discount works"
                >
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={10}
                className="max-w-[220px] text-center leading-snug"
              >
                Join Discord, copy the code from the discount channel, then
                enter it at checkout for {DISCORD_MEMBER_PERCENT_OFF}% off.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <a
          href={macwall.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#23A559] px-3.5 text-[12px] font-medium whitespace-nowrap text-white no-underline transition-opacity hover:opacity-90 sm:h-9 sm:px-4 sm:text-[13px]"
        >
          Join for {DISCORD_MEMBER_PERCENT_OFF}% off
        </a>
      </div>
    </motion.div>
  )
}
