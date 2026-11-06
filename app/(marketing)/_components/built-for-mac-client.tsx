"use client"

import NumberFlow from "@number-flow/react"
import {
  BatteryCharging,
  Cpu,
  Maximize2,
  Moon,
  type LucideIcon,
} from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import dynamic from "next/dynamic"
import { useEffect, useId, useRef, useState } from "react"

import { CloudOrbit, OrbitingImage } from "@/components/ui/cloud-orbit"
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal"
import { macwallBatteryPolicy } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/*
 * The interactive pieces of the home page's "Light on your Mac" bento. The
 * cards, their text and the served chart render on the server
 * (built-for-mac.tsx); only these hydrate.
 */

/**
 * A number that counts up when it scrolls into view. The server HTML (and
 * what crawlers, AI answer engines and screen readers read) is the final
 * value, `label`. After hydration, if the number is still off screen and
 * motion is allowed, it is swapped for an aria-hidden NumberFlow that starts
 * at 0 and counts up once seen; a number already on screen stays as it is.
 */
export function CountUp({
  to,
  label,
  suffix = "",
  decimals = 0,
}: Readonly<{
  to: number
  /** The final value as text, e.g. "25,000+". */
  label: string
  suffix?: string
  decimals?: number
}>) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "-60px" })
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = node.getBoundingClientRect()
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight
    // Only a number nobody is looking at yet may drop to 0 and count up.
    if (!onScreen) setAnimate(true)
  }, [])

  return (
    <span ref={ref}>
      {animate ? (
        <>
          <span className="sr-only">{label}</span>
          <span aria-hidden>
            <NumberFlow
              value={seen ? to : 0}
              suffix={suffix}
              format={{
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }}
            />
          </span>
        </>
      ) : (
        label
      )}
    </span>
  )
}

/**
 * What pauses the wallpaper, as in Settings → Battery & Performance (4.1.0).
 * Sleep and lock always pause it; only full-screen apps are on by default.
 * The switches here are a toy: they only flip on the page.
 */
const RULES: readonly {
  icon: LucideIcon
  label: string
  /** The switch's name: the app's own setting name where there is one. */
  setting: string
  on: boolean
}[] = [
  {
    icon: Maximize2,
    label: "Full-screen apps",
    setting: macwallBatteryPolicy.pauseBehindFullScreen.label,
    on: macwallBatteryPolicy.pauseBehindFullScreen.onByDefault,
  },
  {
    icon: Moon,
    label: "Sleep and lock",
    setting: "Sleep and lock (always pauses)",
    on: true,
  },
  {
    icon: Cpu,
    label: "High CPU",
    setting: macwallBatteryPolicy.pauseWhenBusy.label,
    on: macwallBatteryPolicy.pauseWhenBusy.onByDefault,
  },
  {
    icon: BatteryCharging,
    label: "On battery",
    setting: macwallBatteryPolicy.pauseOnBattery.label,
    on: macwallBatteryPolicy.pauseOnBattery.onByDefault,
  },
]

export function RuleRows() {
  const [on, setOn] = useState(() => RULES.map((r) => r.on))
  return (
    <>
      <p className="mb-1 text-[12px] text-ink-3">Pauses on</p>
      <ul className="flex flex-col">
        {RULES.map((r, i) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-3 py-2.5",
              i > 0 && "border-t border-white/[0.06]"
            )}
          >
            <r.icon
              className="size-4 text-ink-3"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">
              {r.label}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on[i]}
              aria-label={r.setting}
              onClick={() => setOn((s) => s.map((x, j) => (j === i ? !x : x)))}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                on[i] ? "bg-white" : "bg-white/10"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full transition-[left,background-color] duration-200",
                  on[i] ? "left-[18px] bg-black" : "left-0.5 bg-white/40"
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

/** MacWall's CPU while it's open, then the drop to zero once you quit it. */
const CPU_LINE =
  "M0 52 C10 48 14 30 22 34 S34 50 42 44 S54 24 62 30 S74 48 82 40 S94 22 102 28 S114 46 122 38 S132 30 138 36 L146 70 L240 70"

export function CpuDrop() {
  const ref = useRef<SVGSVGElement>(null)
  const seen = useInView(ref, { once: true, margin: "-60px" })
  const still = useReducedMotion() ?? false
  const id = useId()
  const draw = still || seen ? { pathLength: 1 } : { pathLength: 0 }
  return (
    <div className="w-full max-w-[272px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12px] text-ink-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-white/[0.06] text-ink">
            <Cpu className="size-3.5" strokeWidth={1.5} aria-hidden />
          </span>
          MacWall CPU
        </span>
        <span className="text-[13px] text-ink-2 tabular-nums">0%</span>
      </div>
      <svg
        ref={ref}
        viewBox="0 0 240 80"
        className="mt-5 h-20 w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.16" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`${CPU_LINE} L240 80 L0 80 Z`}
          fill={`url(#${id})`}
          initial={false}
          animate={{ opacity: still || seen ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />
        <line x1="146" x2="146" y1="8" y2="74" className="stroke-white/15" />
        <text x="152" y="16" className="fill-ink-3 text-[9px]">
          Quit
        </text>
        <motion.path
          d={CPU_LINE}
          fill="none"
          className="stroke-white/70"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={false}
          animate={draw}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}

/** A padlock with a keyhole, drawn for the glass reveal (only its shape is used). */
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path fill="#fff" fill-rule="evenodd" d="M7 10h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm5 3.6a1.6 1.6 0 0 0-.8 3v1.6a.8.8 0 0 0 1.6 0v-1.6a1.6 1.6 0 0 0-.8-3Z"/></svg>`

/** The lock held in a glass tile, with a band of light crossing it every few seconds. */
export function LockGlass() {
  return (
    <GlassIconReveal
      logo={LOCK_SVG}
      look="dark"
      background="#111111"
      plateColor="#181818"
      logoColor="#ffffff"
      logoScale={0.62}
      finalScale={0.85}
      label="Lock"
      shine
      tuning={{ sheen: 2.6 }}
      className="size-full cursor-default rounded-2xl"
    />
  )
}

const AppleLogo3D = dynamic(() => import("@/components/ui/apple-logo-3d"), {
  ssr: false,
})

/**
 * three.js and a WebGL context are worth it only on a desktop-class screen
 * with a precise pointer; phones and tablets keep the still render.
 */
const WEBGL_QUERY = "(pointer: fine) and (min-width: 1024px)"

/** The same silver mark, pre-rendered (2 KB). */
const APPLE_STILL_SRC = "/hero/apple-logo-silver.avif"

/**
 * The silver Apple mark: a still image everywhere, upgraded to the turning
 * 3D one (three.js, loaded on demand) on desktops once the card nears the
 * screen.
 */
function AppleMark() {
  const ref = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || !window.matchMedia(WEBGL_QUERY).matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setLive(true)
        observer.disconnect()
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden rounded-full">
      {live ? (
        <AppleLogo3D className="size-full animate-in duration-700 fade-in-0" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 2 KB still, sized by the ring
        <img
          src={APPLE_STILL_SRC}
          alt=""
          aria-hidden
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      )}
    </div>
  )
}

/** A people emoji on the orbit's glass tile. */
const emoji = (char: string) => ({
  url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" dy=".35em" text-anchor="middle" font-size="82" font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif">${char}</text></svg>`
  )}`,
  name: "",
})

/**
 * Seven people emoji that each look different (hair, beard, turban, skin
 * tone), one per spot and spaced evenly round the orbit.
 */
const ORBITERS = [
  { size: 52, radius: 84, images: [emoji("🧑🏽‍🎤")] },
  { size: 46, radius: 80, images: [emoji("👩🏾‍🦱")] },
  { size: 50, radius: 84, images: [emoji("👨🏻‍🦰")] },
  { size: 46, radius: 80, images: [emoji("🧔🏿")] },
  { size: 52, radius: 84, images: [emoji("👩🏼‍🦳")] },
  { size: 46, radius: 80, images: [emoji("👳🏽‍♂️")] },
  { size: 50, radius: 84, images: [emoji("🧑🏻‍🦲")] },
].map((o, k, all) => ({ ...o, startAt: k / all.length }))

/** The Apple mark in the middle, with people circling it. */
export function MacOrbit() {
  return (
    <div className="relative h-full w-full max-w-[260px]">
      <CloudOrbit>
        <div className="relative z-10 size-24 rounded-full border border-white/10 bg-gradient-to-t from-surface-1 to-surface-3 inset-shadow-sm inset-shadow-white/7">
          <AppleMark />
        </div>
        {ORBITERS.map((o) => (
          <OrbitingImage
            key={o.startAt}
            speed={28}
            radius={o.radius}
            size={o.size}
            startAt={o.startAt}
            images={o.images}
          />
        ))}
      </CloudOrbit>
    </div>
  )
}
