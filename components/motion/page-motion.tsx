"use client"

import { useEffect } from "react"

/** Lenis is for wheel and trackpad; touch screens keep native scrolling. */
const SMOOTH_SCROLL_POINTER = "(pointer: fine)"

/**
 * Scroll reveals for the homepage and reading pages (legal, tools), plus
 * Lenis smooth scrolling for mouse and trackpad: the same feel as PostMesh's
 * landing motion.
 *
 * Every block inside the elements matching `rootSelector` (a <section> counts
 * as its children, so headings and paragraphs stagger) fades up from 16px as
 * it comes into view: ~600ms, smooth-out, no bounce. Opacity and transform
 * only, so reveals stay on the compositor instead of repainting a filter.
 *
 * - GSAP loads after the page is up (dynamic import), so it never weighs on
 *   the first paint.
 * - Lenis and its stylesheet load only for a fine pointer (smooth-scroll.ts),
 *   so phones and tablets never download them.
 * - Only blocks still below the screen are hidden, so nothing on screen blinks.
 * - The scroll and resize listeners detach once every block has revealed.
 * - Off entirely for reduced motion. Everything is reverted on unmount.
 */
export function PageMotion({
  rootSelector = "[data-reveal-root]",
  layout = "reading",
}: Readonly<{
  rootSelector?: string
  /** "reading": blocks of text pages. "landing": PostMesh's homepage rule. */
  layout?: "reading" | "landing"
}>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const smoothScroll = window.matchMedia(SMOOTH_SCROLL_POINTER).matches
    let revert: (() => void) | undefined
    let cancelled = false

    void (async () => {
      const [{ gsap }, smooth] = await Promise.all([
        import("gsap"),
        smoothScroll
          ? import("@/components/motion/smooth-scroll").catch(() => null)
          : null,
      ])
      if (cancelled) return

      const stopSmoothScroll = smooth?.startSmoothScroll()

      let hidden: HTMLElement[] = []
      const ctx = gsap.context(() => {
        hidden = (
          layout === "landing"
            ? landingTargets(rootSelector)
            : revealTargets(rootSelector)
        ).filter(
          (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
        )
        if (hidden.length > 0) gsap.set(hidden, { autoAlpha: 0, y: 16 })
      })

      // Reveal every hidden block whose top has reached 88% of the screen,
      // including blocks a jump (anchor link, reading-progress click) skipped.
      let frame = 0
      const sweep = () => {
        frame = 0
        const line = window.innerHeight * 0.88
        const due: HTMLElement[] = []
        hidden = hidden.filter((el) => {
          if (el.getBoundingClientRect().top >= line) return true
          due.push(el)
          return false
        })
        if (due.length > 0)
          ctx.add(() =>
            gsap.to(due, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              // After a long jump many blocks are due; keep the cascade short.
              stagger: Math.min(0.08, 0.6 / due.length),
              overwrite: true,
              clearProps: "transform",
            })
          )
        if (hidden.length === 0) unwatch()
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(sweep)
      }
      // Late layout (a canvas sizing itself, fonts, images) moves blocks.
      const observer = new ResizeObserver(schedule)
      const unwatch = () => {
        observer.disconnect()
        window.removeEventListener("scroll", schedule)
        window.removeEventListener("resize", schedule)
      }
      if (hidden.length > 0) {
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        observer.observe(document.body)
        schedule()
      }

      revert = () => {
        unwatch()
        if (frame) cancelAnimationFrame(frame)
        ctx.revert()
        stopSmoothScroll?.()
      }
    })()

    return () => {
      cancelled = true
      revert?.()
    }
  }, [rootSelector, layout])

  return null
}

/**
 * Direct blocks of each root. A text section (one with its own h2) or a
 * `display: contents` wrapper counts as its children, so heading and
 * paragraphs stagger; an interactive card stays one block.
 */
function revealTargets(rootSelector: string): HTMLElement[] {
  const out: HTMLElement[] = []
  const visit = (el: HTMLElement) => {
    const display = window.getComputedStyle(el).display
    const textSection =
      el.tagName === "SECTION" && el.querySelector(":scope > h2") !== null
    if (textSection || display === "contents") {
      for (const child of Array.from(el.children) as HTMLElement[]) visit(child)
      return
    }
    // Skip fixed UI (the reading-progress lines) and anything without a box.
    if (window.getComputedStyle(el).position === "fixed") return
    out.push(el)
  }
  for (const root of Array.from(
    document.querySelectorAll<HTMLElement>(rootSelector)
  )) {
    for (const child of Array.from(root.children) as HTMLElement[]) visit(child)
  }
  return out
}

/**
 * PostMesh's landing rule: in every section after the hero, each block of the
 * section's stage (its heading row, then every card or column) reveals; when
 * a block is a row or grid of 2 to 12 items, each item reveals so they stagger.
 */
function landingTargets(sectionSelector: string): HTMLElement[] {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(sectionSelector)
  ).slice(1)
  const out: HTMLElement[] = []
  for (const section of sections) {
    const stage =
      section.querySelector<HTMLElement>(":scope > div > div") ?? section
    for (const block of Array.from(stage.children) as HTMLElement[]) {
      const style = window.getComputedStyle(block)
      const isRow =
        (style.display === "flex" || style.display === "grid") &&
        block.children.length >= 2 &&
        block.children.length <= 12
      if (isRow && block.tagName !== "TABLE")
        out.push(...(Array.from(block.children) as HTMLElement[]))
      else out.push(block)
    }
  }
  return out
}
