"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"

/**
 * The moving row of a `.mw-marquee`. The server sends one pass of the items
 * (so the HTML and the RSC payload carry each link once); after hydration
 * this clones that pass until the track can loop, marks the copies
 * aria-hidden and out of the tab order, then starts the animation.
 *
 * The animation reads `--marquee-duration`, which is set only once the
 * copies exist: before that the shorthand is invalid, so the single pass
 * stays still instead of jumping at the halfway point.
 */
export function MarqueeTrack({
  children,
  copies,
  duration,
}: Readonly<{
  children: ReactNode
  /** Extra passes to add; the track translates by -50%, so passes must be even in total. */
  copies: number
  /** CSS time for one loop, e.g. "48s". */
  duration: string
}>) {
  const ref = useRef<HTMLUListElement>(null)
  const router = useRouter()

  useEffect(() => {
    const track = ref.current
    if (!track) return
    const originals = Array.from(track.children)
    const clones: HTMLElement[] = []
    for (let pass = 0; pass < copies; pass += 1) {
      for (const node of originals) {
        const clone = node.cloneNode(true) as HTMLElement
        clone.setAttribute("aria-hidden", "true")
        clone.dataset.marqueeCopy = ""
        clone.querySelectorAll("a").forEach((link) => {
          link.tabIndex = -1
        })
        track.appendChild(clone)
        clones.push(clone)
      }
    }
    track.style.setProperty("--marquee-duration", duration)

    // Copies are plain anchors: keep client-side navigation for them too.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const target = event.target as Element | null
      const link = target?.closest("[data-marquee-copy] a")
      const href = link?.getAttribute("href")
      if (!href?.startsWith("/")) return
      event.preventDefault()
      router.push(href)
    }
    track.addEventListener("click", onClick)

    return () => {
      track.removeEventListener("click", onClick)
      track.style.removeProperty("--marquee-duration")
      for (const clone of clones) clone.remove()
    }
  }, [copies, duration, router])

  return (
    <ul ref={ref} className="mw-marquee-track">
      {children}
    </ul>
  )
}
