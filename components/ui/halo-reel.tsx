"use client"

import * as React from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"

export type HaloReelItem = {
  src?: string
  alt?: string
  bgColor?: string
  textColor?: string
  title?: string
  subtitle?: string
}

export type HaloReelProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  items: HaloReelItem[]
  cardWidth?: number
  cardHeight?: number
  minScale?: number
  radiusXRatio?: number
  centerXRatio?: number
  radiusYRatio?: number
  autoPlay?: boolean
  holdDuration?: number
  stepDuration?: number
  pauseOnHover?: boolean
  draggable?: boolean
  spread?: number
  maxCards?: number
  dragSensitivity?: number
  centerLabel?: React.ReactNode
  showCenterLabel?: boolean
}

const TAU = Math.PI * 2

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

export function HaloReel({
  items,
  cardWidth = 130,
  cardHeight = 180,
  minScale = 0.4,
  radiusXRatio = 0.45,
  centerXRatio = 0.5,
  radiusYRatio = 0.36,
  autoPlay = true,
  holdDuration = 1000,
  stepDuration = 700,
  pauseOnHover = true,
  draggable = true,
  spread = 1.2,
  maxCards = 64,
  dragSensitivity = 1,
  centerLabel,
  showCenterLabel = true,
  className,
  style,
  ...props
}: HaloReelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const count = items.length
  const rotation = useMotionValue(0)
  const draggingRef = React.useRef(false)
  const hoverRef = React.useRef(false)
  const [size, setSize] = React.useState({ w: 0, h: 0 })

  React.useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const measure = () =>
      setSize({ w: node.offsetWidth, h: node.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const radiusX = size.w * radiusXRatio
  const radiusY = size.h * radiusYRatio
  const slots = clamp(
    Math.ceil(
      TAU *
        Math.max(
          radiusX / (cardWidth * spread),
          radiusY / (cardHeight * spread)
        )
    ),
    count,
    Math.max(count, maxCards)
  )
  const step = slots ? TAU / slots : 0
  const fit = size.w
    ? clamp(
        Math.min(
          size.w / (radiusX + cardWidth),
          size.h / (2 * radiusY + cardHeight)
        ),
        0.45,
        1
      )
    : 1
  const cardW = cardWidth * fit
  const cardH = cardHeight * fit

  React.useEffect(() => {
    if (!autoPlay || reduceMotion || !count) return
    let timer = 0
    let controls: ReturnType<typeof animate> | undefined
    const tick = () => {
      timer = window.setTimeout(() => {
        if (draggingRef.current || (pauseOnHover && hoverRef.current)) {
          tick()
          return
        }
        controls = animate(rotation, rotation.get() - step, {
          duration: stepDuration / 1000,
          ease: [0.4, 0, 0.2, 1],
          onComplete: tick,
        })
      }, holdDuration)
    }
    tick()
    return () => {
      window.clearTimeout(timer)
      controls?.stop()
    }
  }, [
    autoPlay,
    count,
    holdDuration,
    pauseOnHover,
    reduceMotion,
    rotation,
    step,
    stepDuration,
  ])

  const dragRef = React.useRef({ left: 0, top: 0, angle: 0 })

  const pointerAngle = (e: React.PointerEvent) => {
    const { left, top } = dragRef.current
    return Math.atan2(
      (e.clientY - top - size.h / 2) / (radiusY || 1),
      (e.clientX - left - size.w * centerXRatio) / (radiusX || 1)
    )
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || (e.pointerType === "mouse" && e.button !== 0)) return
    const rect = e.currentTarget.getBoundingClientRect()
    dragRef.current = { left: rect.left, top: rect.top, angle: 0 }
    dragRef.current.angle = pointerAngle(e)
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const angle = pointerAngle(e)
    const delta =
      ((angle - dragRef.current.angle + Math.PI * 3) % TAU) - Math.PI
    dragRef.current.angle = angle
    rotation.set(rotation.get() + delta * dragSensitivity)
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const snapped = Math.round(rotation.get() / step) * step
    if (reduceMotion) {
      rotation.set(snapped)
      return
    }
    animate(rotation, snapped, { duration: 0.5, ease: [0.16, 1, 0.3, 1] })
  }

  const spinBy = (direction: number) => {
    const target = Math.round(rotation.get() / step) * step - direction * step
    if (reduceMotion) {
      rotation.set(target)
      return
    }
    animate(rotation, target, {
      duration: stepDuration / 1000,
      ease: [0.4, 0, 0.2, 1],
    })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!direction) return
    e.preventDefault()
    spinBy(direction)
  }

  if (!count) return null

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props["aria-label"] ?? "Image carousel"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative h-full w-full touch-pan-y overflow-hidden outline-none select-none",
        draggable && "cursor-grab active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className
      )}
      style={style}
      {...props}
    >
      {showCenterLabel && centerLabel ? (
        <div
          className="pointer-events-none absolute inset-y-0 z-0 flex items-center justify-center px-4 text-center"
          style={{
            left: size.w * centerXRatio + radiusX + cardW / 2,
            right: 0,
          }}
        >
          {centerLabel}
        </div>
      ) : null}

      {Array.from({ length: slots }, (_, i) => (
        <WheelCard
          key={i}
          item={items[i % count]}
          decorative={i >= count}
          index={i}
          step={step}
          rotation={rotation}
          radiusX={radiusX}
          radiusY={radiusY}
          centerXRatio={centerXRatio}
          minScale={minScale}
          width={cardW}
          height={cardH}
          onHoverChange={(hovered) => {
            hoverRef.current = hovered
          }}
        />
      ))}
    </div>
  )
}

function WheelCard({
  item,
  index,
  step,
  rotation,
  radiusX,
  radiusY,
  centerXRatio,
  minScale,
  width,
  height,
  decorative,
  onHoverChange,
}: {
  item: HaloReelItem
  index: number
  step: number
  rotation: MotionValue<number>
  radiusX: number
  radiusY: number
  centerXRatio: number
  minScale: number
  width: number
  height: number
  decorative: boolean
  onHoverChange: (hovered: boolean) => void
}) {
  const cos = useTransform(rotation, (r) => Math.cos(index * step + r))
  const sin = useTransform(rotation, (r) => Math.sin(index * step + r))
  const x = useTransform(cos, (c) => c * radiusX)
  const y = useTransform(sin, (s) => s * radiusY)
  const scale = useTransform(
    cos,
    (c) => minScale + (1 - minScale) * ((c + 1) / 2)
  )
  const zIndex = useTransform(scale, (s) => Math.round(s * 1000))

  return (
    <motion.div
      role={decorative ? undefined : "group"}
      aria-roledescription={decorative ? undefined : "slide"}
      aria-hidden={decorative || undefined}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      style={{
        x,
        y,
        scale,
        zIndex,
        width,
        height,
        left: `${centerXRatio * 100}%`,
        top: "50%",
        marginLeft: -width / 2,
        marginTop: -height / 2,
      }}
      className="absolute overflow-hidden shadow-xl"
    >
      {item.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={decorative ? "" : (item.alt ?? "")}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-1 bg-card p-3 text-center text-card-foreground"
          style={{ backgroundColor: item.bgColor, color: item.textColor }}
        >
          {item.title ? (
            <span className="text-2xl leading-none font-black">{item.title}</span>
          ) : null}
          {item.subtitle ? (
            <span className="text-[0.6rem] tracking-[0.2em] uppercase opacity-70">
              {item.subtitle}
            </span>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}

export default HaloReel
