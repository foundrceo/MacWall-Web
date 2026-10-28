"use client"

import { useEffect, useState } from "react"

type Mark = { id: string; label: string }

/** Where reading counts as "at" a heading: just under the sticky nav. */
const READ_LINE = 120

/** Line widths fall off around the reader's position: 36px at it, 11px far away. */
const width = (distance: number) =>
  11 + 25 * Math.exp(-(distance * distance) / 5.78)

/**
 * The right-edge reading progress on long legal pages (lg and up), as on
 * PostMesh: one thin line per section heading inside `containerId`. Lines
 * you have reached are lighter, the nearest is longest, each links to its
 * section.
 */
export function ReadingProgress({
  containerId,
}: Readonly<{ containerId: string }>) {
  const [marks, setMarks] = useState<Mark[]>([])
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const headings = [
      ...(document.getElementById(containerId)?.querySelectorAll("h2[id]") ??
        []),
    ]
    const found = headings.map((h) => ({
      id: h.id,
      label: h.textContent?.trim() ?? h.id,
    }))
    let frame = 0
    const measure = () => {
      frame = 0
      const root = document.documentElement
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
        setPosition(found.length - 1)
        return
      }
      const tops = found.map(
        (mark) =>
          document.getElementById(mark.id)?.getBoundingClientRect().top ??
          Infinity
      )
      let index = -1
      for (let i = 0; i < tops.length; i++) if (tops[i] <= READ_LINE) index = i
      if (index < 0) {
        setPosition(0)
        return
      }
      const next = tops[index + 1]
      const span =
        next === undefined || !Number.isFinite(next) ? 0 : next - tops[index]
      const through =
        span > 0
          ? Math.min(1, Math.max(0, (READ_LINE - tops[index]) / span))
          : 0
      setPosition(index + through)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    // Headings live in server-rendered HTML; read them once after mount.
    frame = requestAnimationFrame(() => {
      setMarks(found)
      measure()
    })
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [containerId])

  if (marks.length < 2) return null
  const reached = Math.floor(position)

  return (
    <nav
      aria-label="Reading progress"
      className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col lg:flex"
    >
      {marks.map((mark, index) => (
        <a
          key={mark.id}
          href={`#${mark.id}`}
          aria-label={`Go to ${mark.label}`}
          aria-current={index === reached ? "location" : undefined}
          className="group flex h-2.5 w-11 items-center justify-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span
            className={
              index <= reached
                ? "block h-[1.5px] rounded-full bg-white/55 transition-colors duration-500 group-hover:bg-white/80"
                : "block h-[1.5px] rounded-full bg-white/25 transition-colors duration-500 group-hover:bg-white/80"
            }
            style={{ width: width(index - position) }}
          />
        </a>
      ))}
    </nav>
  )
}
