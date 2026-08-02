"use client"

import type { CSSProperties, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { MarketingRichText } from "@/components/macwall-marketing/marketing-primitives"
import { macwallCreatorCopy as copy } from "@/lib/macwall-creator-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type ColorTheme = "accent" | "neutral"

type CreatorBoardStep = Readonly<{
  id: string
  title: string
  description: string
  colorTheme?: ColorTheme
}>

type StepPosition = Readonly<{
  className?: string
  rotate?: string
}>

const DESIGN_WIDTH = 1000

const CREATOR_STEP_POSITIONS: StepPosition[] = [
  { className: "absolute top-0 left-[12%]", rotate: "rotate-6" },
  { className: "absolute top-[100px] right-[12%]", rotate: "-rotate-6" },
  { className: "absolute top-[380px] left-[12%]", rotate: "rotate-6" },
  { className: "absolute top-[480px] right-[10%]", rotate: "-rotate-6" },
  { className: "absolute top-[760px] left-[12%]", rotate: "rotate-6" },
  { className: "absolute top-[980px] right-[10%]", rotate: "-rotate-6" },
]

function themeClasses(theme: ColorTheme) {
  switch (theme) {
    case "accent":
      return {
        panel: "border-border/60 bg-secondary",
        accent: "text-foreground",
      }
    case "neutral":
      return {
        panel: "border-border/40 bg-surface-elevated/90",
        accent: "text-marketing-muted",
      }
    default: {
      const unreachable: never = theme
      return unreachable
    }
  }
}

function Pin({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993-.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046-.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
    </svg>
  )
}

function CreatorStepLink({
  href,
  children,
}: Readonly<{
  href: string
  children: ReactNode
}>) {
  return (
    <a
      href={href}
      className="marketing-inline-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

const stepDescriptionClassName =
  "text-sm leading-snug tracking-tight text-foreground/65"

function CreatorStepDescription({
  stepId,
  body,
}: Readonly<{
  stepId: string
  body: string
}>) {
  if (stepId === "3") {
    return (
      <p className={stepDescriptionClassName}>
        Instagram, TikTok, YouTube Shorts, Threads, or X. Your pick. Add{" "}
        <CreatorStepLink href={macwall.reelRefundHashtagURL}>
          {macwall.reelRefundHashtag}
        </CreatorStepLink>
        {" wherever you post. Tag "}
        <CreatorStepLink href={macwall.reelRefundInstagramURL}>
          {macwall.reelRefundInstagram}
        </CreatorStepLink>
        {" or "}
        <CreatorStepLink href={macwall.reelRefundTiktokURL}>
          {macwall.reelRefundTiktok}
        </CreatorStepLink>
        {" so we can find you."}
      </p>
    )
  }

  return (
    <MarketingRichText as="p" className={stepDescriptionClassName}>
      {body}
    </MarketingRichText>
  )
}

function CreatorPinCard({
  number,
  title,
  stepId,
  description,
  colorTheme = "accent",
  className,
  rotate,
  id,
}: Readonly<{
  number: string
  title: string
  stepId: string
  description: string
  colorTheme?: ColorTheme
  className?: string
  rotate?: string
  id?: string
}>) {
  const { panel, accent } = themeClasses(colorTheme)

  return (
    <article
      id={id}
      className={cn(
        "relative w-[280px] scroll-mt-24 text-left transition-transform duration-300 [@media(hover:hover)]:hover:z-30 [@media(hover:hover)]:hover:scale-[1.03]",
        rotate,
        className,
      )}
    >
      <div className="rounded-[25px] border border-border/60 bg-card p-2 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.45)]">
        <Pin className={cn("mx-auto mb-5 size-7", accent)} />
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[15px] border p-4",
            panel,
          )}
        >
          <span
            className={cn(
              "font-heading mb-4 text-4xl font-normal leading-none tracking-[-0.03em]",
              accent,
            )}
          >
            {number}
          </span>
          <h3 className="mb-2.5 text-xl font-semibold leading-snug tracking-tight text-foreground">
            {title}
          </h3>
          <CreatorStepDescription stepId={stepId} body={description} />
        </div>
      </div>
    </article>
  )
}

function boardHeight(count: number) {
  if (count <= 1) return 400
  if (count === 2) return 450
  if (count === 3) return 720
  if (count === 4) return 820
  if (count === 5) return 1080
  return 1280
}

function connectorPath(count: number) {
  if (count < 2) return ""
  if (count === 4) {
    return [
      "M 290 140 C 520 140, 560 240, 720 240",
      "C 860 240, 520 320, 290 380",
      "C 120 440, 560 560, 740 560",
    ].join(" ")
  }
  if (count >= 6) {
    return [
      "M 290 150 C 500 150, 550 270, 710 270",
      "C 850 270, 500 350, 290 450",
      "C 290 600, 550 720, 750 720",
      "C 950 720, 500 800, 290 850",
      "C 120 850, 560 950, 740 950",
    ].join(" ")
  }
  return [
    "M 290 150 C 500 150, 550 270, 710 270",
    count > 2 ? "C 850 270, 500 350, 290 450" : "",
    count > 3 ? "C 290 600, 550 720, 750 720" : "",
    count > 4 ? "C 950 720, 500 800, 290 850" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

const CREATOR_BOARD_STEPS: CreatorBoardStep[] = copy.steps.map((step, index) => ({
  id: step.id,
  title: step.title,
  description: step.body,
  colorTheme: index % 2 === 0 ? "accent" : "neutral",
}))

export default function CreatorHowItWorksBoard() {
  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") return 1
    return Math.min(1, (Math.min(window.innerWidth, DESIGN_WIDTH) - 24) / DESIGN_WIDTH)
  })
  const stageRef = useRef<HTMLDivElement>(null)
  const height = boardHeight(CREATOR_BOARD_STEPS.length)
  const pathD = connectorPath(CREATOR_BOARD_STEPS.length)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      const width = stage.clientWidth
      if (width <= 0) return
      setScale(Math.min(1, width / DESIGN_WIDTH))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative overflow-x-clip px-3 sm:px-6 md:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div
          ref={stageRef}
          className="relative mx-auto w-full max-w-[1000px]"
          style={{ height: height * scale }}
        >
          <div
            className="absolute left-1/2 top-0"
            style={
              {
                width: DESIGN_WIDTH,
                height,
                transform: `translateX(-50%) scale(${scale})`,
                transformOrigin: "top center",
              } as CSSProperties
            }
          >
            <div className="relative h-full w-full">
              {CREATOR_BOARD_STEPS.length > 1 && pathD ? (
                <svg
                  className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full text-foreground/15"
                  viewBox={`0 0 1000 ${height}`}
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d={pathD}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -140 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </svg>
              ) : null}

              {CREATOR_BOARD_STEPS.map((step, index) => {
                const position =
                  CREATOR_STEP_POSITIONS[index] ?? CREATOR_STEP_POSITIONS[0]!

                return (
                  <CreatorPinCard
                    key={step.title}
                    number={`0${index + 1}`}
                    title={step.title}
                    stepId={step.id}
                    description={step.description}
                    colorTheme={step.colorTheme}
                    rotate={position.rotate}
                    className={position.className}
                    {...(step.id === "6" ? { id: "fine-print" } : {})}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
