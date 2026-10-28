"use client"

import NumberFlow from "@number-flow/react"
import {
  BatteryCharging,
  BatteryLow,
  Cloud,
  Cpu,
  Maximize2,
  Moon,
} from "lucide-react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { Area, AreaChart, XAxis } from "recharts"
import { useEffect, useId, useRef, useState, type ReactNode } from "react"

import dynamic from "next/dynamic"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CloudOrbit, OrbitingImage } from "@/components/ui/cloud-orbit"
import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal"
import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallSocialProof } from "@/lib/macwall-site"
import type { PublicStats, ServedStats } from "@/lib/public-stats"
import { cn } from "@/lib/utils"

/*
 * Based on Tailark's "Features 8" and "Features 9" (21st.dev). Content is real:
 * verified users, Cloudflare's bytes served (lib/public-stats.ts), the pause
 * rules from /docs/performance-and-battery, and reviewers already on the site.
 */

const USERS = Number(macwallSocialProof.usersLabel.replace(/\D/g, ""))

const CARD =
  "relative min-w-0 overflow-hidden rounded-[24px] bg-surface-1 p-6 squircle"
const TOP = "col-span-full sm:col-span-3 lg:col-span-2"
const BOTTOM = "col-span-full lg:col-span-3"
const TITLE = "text-[19px] leading-7 font-medium tracking-tight text-ink"
const BODY = "text-[14px] leading-[22px] text-ink-2"
const LABEL = "text-[13px] leading-5 text-ink-3"

const RULES = [
  { icon: Maximize2, label: "Full-screen apps", on: true },
  { icon: Moon, label: "Sleep and lock", on: true },
  { icon: Cpu, label: "High CPU", on: false },
  { icon: BatteryLow, label: "Low Power Mode", on: false },
  { icon: BatteryCharging, label: "On battery", on: false },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "3.4 TB" / "812 GB". */
function formatBytes(bytes: number) {
  if (bytes >= 1e12) {
    const tb = bytes / 1e12
    return tb >= 100
      ? { value: Math.round(tb), unit: "TB", decimals: 0 }
      : { value: Math.round(tb * 10) / 10, unit: "TB", decimals: 1 }
  }
  return { value: Math.round(bytes / 1e9), unit: "GB", decimals: 0 }
}

/** "Oct 27, 2026", for the chart's tooltip. */
const fullDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

function CountUp({
  to,
  suffix = "",
  decimals = 0,
}: Readonly<{ to: number; suffix?: string; decimals?: number }>) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "-60px" })
  return (
    <span ref={ref}>
      <NumberFlow
        value={seen ? to : 0}
        suffix={suffix}
        format={{
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }}
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Tailark pieces                                                      */
/* ------------------------------------------------------------------ */

function Ring({
  children,
  size = "md",
}: Readonly<{ children: ReactNode; size?: "md" | "lg" }>) {
  return (
    <div
      className={cn(
        "relative flex aspect-square rounded-full border border-white/10 before:absolute before:-inset-2 before:rounded-full before:border before:border-white/5",
        size === "lg" ? "size-32" : "size-12"
      )}
    >
      <span className="m-auto text-ink">{children}</span>
    </div>
  )
}

/** Daily bytes as thin bars; today's in white. */
/** Bytes served by the end of each day: a series that only ever rises. */
const runningTotal = (served: ServedStats) =>
  served.daily.reduce<number[]>(
    (acc, d) => [...acc, (acc.at(-1) ?? 0) + d.bytes],
    []
  )

/** Tailark's little app window, peeking in from the card's corner. */
function PeekWindow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative -mr-6 -mb-6 rounded-tl-2xl border-t border-l border-white/10 bg-black/30 p-5 pt-8 sm:ml-6">
      <div className="absolute top-3 left-4 flex gap-1" aria-hidden>
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
      </div>
      {children}
    </div>
  )
}

function RuleRows() {
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
              aria-label={r.label}
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

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

/**
 * The top row's shared layout, after Tailark's Features 9: the same height of
 * moving visual in every card, then a centred title and line at the same place.
 */
function TopCard({
  visual,
  title,
  children,
}: Readonly<{ visual: ReactNode; title: ReactNode; children: ReactNode }>) {
  return (
    <div className={cn(CARD, TOP, "flex flex-col")}>
      <div className="relative flex h-[232px] items-center justify-center">
        {visual}
      </div>
      <div className="mt-4 text-center">
        <h3 className={TITLE}>{title}</h3>
        <p className={cn(BODY, "mx-auto mt-2 max-w-[19rem]")}>{children}</p>
      </div>
    </div>
  )
}

/** A padlock with a keyhole, drawn for the glass reveal (only its shape is used). */
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path fill="#fff" fill-rule="evenodd" d="M7 10h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm5 3.6a1.6 1.6 0 0 0-.8 3v1.6a.8.8 0 0 0 1.6 0v-1.6a1.6 1.6 0 0 0-.8-3Z"/></svg>`

/** The lock held in a glass tile, with a band of light crossing it every few seconds. */
function LockGlass() {
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

/** MacWall's CPU while it's open, then the drop to zero once you quit it. */
const CPU_LINE =
  "M0 52 C10 48 14 30 22 34 S34 50 42 44 S54 24 62 30 S74 48 82 40 S94 22 102 28 S114 46 122 38 S132 30 138 36 L146 70 L240 70"

function CpuDrop() {
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

function CpuCard() {
  return (
    <TopCard visual={<CpuDrop />} title="Zero CPU after you quit">
      With System Wallpaper on macOS 26, your desktop keeps playing after
      MacWall quits.
    </TopCard>
  )
}

function QuietCard() {
  return (
    <div className={cn(CARD, BOTTOM, "grid sm:grid-cols-2")}>
      <div className="flex flex-col justify-between gap-10">
        <Ring>
          <Maximize2 className="size-5" strokeWidth={1.25} aria-hidden />
        </Ring>
        <div className="space-y-2">
          <h3 className={TITLE}>Gets out of the way</h3>
          <p className={BODY}>
            It pauses for full-screen apps, sleep and heavy work, on its own.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col justify-end sm:mt-0">
        <PeekWindow>
          <RuleRows />
        </PeekWindow>
      </div>
    </div>
  )
}

const AppleLogo3D = dynamic(() => import("@/components/ui/apple-logo-3d"), {
  ssr: false,
})

/** Loads the 3D Apple (three.js) only once the card is close to the screen. */
function Lazy3DApple() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden rounded-full">
      {near ? (
        <AppleLogo3D className="size-full animate-in duration-700 fade-in-0" />
      ) : null}
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

/** The 3D Apple in the middle, with real reviewers circling it. */
function MacOrbit() {
  return (
    <div className="relative h-full w-full max-w-[260px]">
      <CloudOrbit>
        <div className="relative z-10 size-24 rounded-full border border-white/10 bg-gradient-to-t from-surface-1 to-surface-3 inset-shadow-sm inset-shadow-white/7">
          <Lazy3DApple />
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

function UsersNarrowCard() {
  return (
    <TopCard
      visual={<MacOrbit />}
      title={
        <>
          <CountUp to={USERS} suffix="+" /> Mac users
        </>
      }
    >
      Downloads from macwall.app. A few of them, from our reviews.
    </TopCard>
  )
}

const servedChartConfig = {
  total: { label: "Total served", color: "white" },
} satisfies ChartConfig

/** "1,693 TB" / "4.2 TB" / "812 GB", for the chart's tooltip. */
function bytesLabel(bytes: number) {
  const { value, unit, decimals } = formatBytes(bytes)
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${unit}`
}

/** The running total as a shadcn area chart: hover any day to read it. */
function ServedChart({ served }: Readonly<{ served: ServedStats }>) {
  const id = useId().replace(/:/g, "")
  const totals = runningTotal(served)
  // Start the day before traffic first reached a gigabyte, so the line rises
  // from zero instead of sitting flat through the quiet early weeks.
  const first = served.daily.findIndex((d) => d.bytes >= 1e9)
  const start = Math.max(first - 1, 0)
  const data = served.daily.slice(start).map((d, i) => ({
    date: fullDay(d.date),
    total: totals[start + i],
  }))
  return (
    <ChartContainer
      config={servedChartConfig}
      className="aspect-auto min-h-32 w-full self-stretch"
    >
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity={0.22} />
            <stop offset="1" stopColor="white" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <ChartTooltip
          cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              className="min-w-40 rounded-lg border-white/10 bg-surface-2 text-[12px] text-ink shadow-xl"
              labelClassName="text-ink-3 font-normal"
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-ink-2">
                    <span className="size-2 rounded-[2px] bg-white" />
                    Total served
                  </span>
                  <span className="font-medium text-ink tabular-nums">
                    {bytesLabel(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="total"
          type="monotone"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={1.5}
          fill={`url(#${id})`}
          activeDot={{ r: 3.5, fill: "white", stroke: "black", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ChartContainer>
  )
}

/** Design A's wide bottom card: total data served, as a running total that only rises. */
function ServedTotalCard({ served }: Readonly<{ served: ServedStats | null }>) {
  const total = served ? formatBytes(served.bytes) : null
  return (
    <div className={cn(CARD, BOTTOM, "grid gap-8 sm:grid-cols-2")}>
      <div className="flex flex-col justify-between gap-10">
        <Ring>
          <Cloud className="size-5" strokeWidth={1.25} aria-hidden />
        </Ring>
        <div className="space-y-2">
          <p className={LABEL}>Data served</p>
          <h3 className="text-[28px] leading-none font-semibold tracking-tight text-ink tabular-nums">
            {total ? (
              <>
                <CountUp to={total.value} decimals={total.decimals} />{" "}
                {total.unit}
              </>
            ) : (
              "Served worldwide"
            )}
          </h3>
          <p className={BODY}>
            Wallpapers and pages from Cloudflare&rsquo;s network. Counted live,
            updated hourly.
          </p>
        </div>
      </div>
      {served ? <ServedChart served={served} /> : null}
    </div>
  )
}

function LockRingCard() {
  return (
    <TopCard visual={<LockGlass />} title="Lock Screen ready">
      Desktop, Lock Screen and screen saver, set in one click.
    </TopCard>
  )
}

/**
 * The homepage's "Light on your Mac" bento: three cards above (CPU, Lock Screen,
 * users), two wide ones below (pause rules, data served), all one height.
 */
export function BuiltForMac({
  stats,
}: Readonly<{ stats: PublicStats | null }>) {
  return (
    <MarketingSection
      sectionClassName={LANDING_SECTION_END}
      aria-label="Light on your Mac"
    >
      <LandingSectionHeader
        title="Light on your Mac"
        lead="Keeps playing after you quit and pauses while you work."
      />
      <div className="grid grid-cols-6 gap-3 lg:auto-rows-fr">
        <CpuCard />
        <LockRingCard />
        <UsersNarrowCard />
        <QuietCard />
        <ServedTotalCard served={stats?.served ?? null} />
      </div>
    </MarketingSection>
  )
}
