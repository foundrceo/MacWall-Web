"use client"

import NumberFlow from "@number-flow/react"
import {
  Battery,
  Cpu,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Monitor,
  Plug,
  type LucideIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { type ReactNode, type Ref, useEffect, useId, useRef, useState } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { DottedGrid } from "@/components/ui/dotted-grid"
import { cn } from "@/lib/utils"

export type PillarVisualId = "idle" | "pause" | "set" | "loop"

function Circle({
  className,
  children,
  ref,
}: {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

function IdleVisual() {
  const [cpu, setCpu] = useState(0.4)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCpu(Number((0.18 + Math.random() * 0.42).toFixed(1)))
    }, 1600)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative h-64 w-full overflow-hidden">
      <DottedGrid spacing={18} baseRadius={1.35} mouseRadius={130} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-start justify-end p-1">
        <p className="text-[4.5rem] leading-none font-light tracking-tighter tabular-nums text-foreground md:text-7xl">
          <NumberFlow
            value={cpu}
            suffix="%"
            format={{
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }}
          />
        </p>
        <p className="mt-1 text-sm tracking-tight text-muted-foreground">
          CPU while a loop is playing
        </p>
      </div>
    </div>
  )
}

const PAUSE_ICONS: { icon: LucideIcon; label: string; startAt: number }[] = [
  { icon: Battery, label: "Battery", startAt: 0 },
  { icon: Plug, label: "Unplug", startAt: 0.25 },
  { icon: Maximize2, label: "Fullscreen", startAt: 0.5 },
  { icon: Cpu, label: "High CPU", startAt: 0.75 },
]

function OrbitIcon({
  radius,
  duration,
  startAt,
  children,
}: {
  radius: number
  duration: number
  startAt: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
      }}
      animate={reduce ? { rotate: startAt * 360 } : { rotate: [startAt * 360, startAt * 360 + 360] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="absolute top-0 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
        animate={
          reduce
            ? { rotate: -startAt * 360 }
            : { rotate: [-startAt * 360, -startAt * 360 - 360] }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function PauseOrbitVisual() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden">
      <div className="absolute size-36 rounded-full border border-dashed border-border" />
      <div className="absolute size-52 rounded-full border border-dashed border-border/70" />
      <div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-border bg-background">
        <MacWallAppIcon size={28} className="rounded-full" />
      </div>
      {PAUSE_ICONS.map((item) => {
        const Icon = item.icon
        return (
          <OrbitIcon
            key={item.label}
            radius={104}
            duration={22}
            startAt={item.startAt}
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{item.label}</span>
          </OrbitIcon>
        )
      })}
    </div>
  )
}

function SetBeamVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const aRef = useRef<HTMLDivElement>(null)
  const bRef = useRef<HTMLDivElement>(null)
  const cRef = useRef<HTMLDivElement>(null)
  const dRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex h-64 w-full items-center justify-center overflow-hidden px-6 py-4"
    >
      <div className="flex h-full w-full max-w-[17rem] flex-col justify-between">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={aRef}>
            <Monitor className="size-4" aria-hidden />
            <span className="sr-only">Desktop</span>
          </Circle>
          <Circle ref={bRef}>
            <Lock className="size-4" aria-hidden />
            <span className="sr-only">Lock Screen</span>
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-center">
          <Circle ref={hubRef} className="size-14">
            <MacWallAppIcon size={28} className="rounded-full" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={cRef}>
            <ImageIcon className="size-4" aria-hidden />
            <span className="sr-only">Screen Saver</span>
          </Circle>
          <Circle ref={dRef}>
            <Maximize2 className="size-4" aria-hidden />
            <span className="sr-only">Displays</span>
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={aRef}
        toRef={hubRef}
        curvature={-28}
        pathColor="hsl(0 0% 28%)"
        gradientStartColor="#67edec"
        gradientStopColor="#67edec"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={bRef}
        toRef={hubRef}
        curvature={-28}
        reverse
        pathColor="hsl(0 0% 28%)"
        gradientStartColor="#67edec"
        gradientStopColor="#67edec"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={cRef}
        toRef={hubRef}
        curvature={28}
        pathColor="hsl(0 0% 28%)"
        gradientStartColor="#67edec"
        gradientStopColor="#67edec"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={dRef}
        toRef={hubRef}
        curvature={28}
        reverse
        pathColor="hsl(0 0% 28%)"
        gradientStartColor="#67edec"
        gradientStopColor="#67edec"
      />
    </div>
  )
}

function LoopTraceVisual() {
  const gradientId = useId().replace(/:/g, "")
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPaused((value) => !value)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative flex h-64 w-full flex-col justify-end overflow-hidden">
      <svg
        className="absolute inset-x-0 top-6 h-36 w-full"
        viewBox="0 0 720 160"
        fill="none"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          d="M0 96 C 70 28, 130 148, 200 80 S 340 8, 420 88 S 560 164, 720 56"
          stroke="hsl(0 0% 22%)"
          strokeWidth="2"
        />
        <path
          d="M0 96 C 70 28, 130 148, 200 80 S 340 8, 420 88 S 560 164, 720 56"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          className={paused ? "opacity-40" : "opacity-100"}
        />
        <defs>
          <motion.linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            animate={
              reduce || paused
                ? undefined
                : {
                    x1: [0, 1440],
                    x2: [0, 720],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <stop stopColor="#67edec" stopOpacity="0" />
            <stop stopColor="#67edec" />
            <stop offset="1" stopColor="#2979ff" stopOpacity="0" />
          </motion.linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 flex items-center gap-2">
        <span
          className={cn(
            "size-1.5 rounded-full",
            paused ? "bg-muted-foreground" : "bg-[#67edec]"
          )}
        />
        <span className="text-sm tracking-tight text-muted-foreground">
          {paused ? "Paused. Fullscreen took the GPU." : "Playing a 4K loop."}
        </span>
      </div>
    </div>
  )
}

export function PillarVisual({ id }: { id: PillarVisualId }) {
  switch (id) {
    case "idle":
      return <IdleVisual />
    case "pause":
      return <PauseOrbitVisual />
    case "set":
      return <SetBeamVisual />
    case "loop":
      return <LoopTraceVisual />
    default: {
      const _exhaustive: never = id
      return _exhaustive
    }
  }
}
