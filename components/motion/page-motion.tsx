"use client"

import { useEffect } from "react"

import "lenis/dist/lenis.css"

/**
 * Smooth scrolling and scroll reveals for reading pages (legal, tools), the
 * same feel as PostMesh's landing motion: Lenis for wheel and trackpad
 * scrolling, driven by GSAP's ticker, and GSAP reveals as blocks come in.
 *
 * Every block inside the elements matching `rootSelector` (a <section> counts
 * as its children, so headings and paragraphs stagger) fades up from 16px with
 * a 4px blur as it comes into view: ~600ms, smooth-out, no bounce.
 *
 * - GSAP and Lenis load after the page is up (dynamic import), so they never
 *   weigh on the first paint.
 * - Only blocks still below the screen are hidden, so nothing on screen blinks.
 * - Off for reduced motion. Everything is reverted on unmount.
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
    let revert: (() => void) | undefined
    let cancelled = false

    void (async () => {
      const [{ gsap }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("lenis"),
      ])
      if (cancelled) return

      const lenis = new Lenis({ anchors: true })
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const revealed = new WeakSet<Element>()
      let targets: HTMLElement[] = []
      const ctx = gsap.context(() => {
        targets = (
          layout === "landing"
            ? landingTargets(rootSelector)
            : revealTargets(rootSelector)
        ).filter(
          (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
        )
        if (targets.length > 0)
          gsap.set(targets, { autoAlpha: 0, y: 16, filter: "blur(4px)" })
      })

      // Reveal every hidden block whose top has reached 88% of the screen,
      // including blocks a jump (anchor link, reading-progress click) skipped.
      let frame = 0
      const sweep = () => {
        frame = 0
        const line = window.innerHeight * 0.88
        const due = targets.filter(
          (el) => !revealed.has(el) && el.getBoundingClientRect().top < line
        )
        if (due.length === 0) return
        due.forEach((el) => revealed.add(el))
        ctx.add(() =>
          gsap.to(due, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power3.out",
            // After a long jump many blocks are due; keep the whole cascade short.
            stagger: Math.min(0.08, 0.6 / due.length),
            overwrite: true,
            clearProps: "filter,transform",
          })
        )
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(sweep)
      }
      lenis.on("scroll", schedule)
      window.addEventListener("scroll", schedule, { passive: true })
      window.addEventListener("resize", schedule)
      // Late layout (a canvas sizing itself, fonts, images) moves blocks.
      const observer = new ResizeObserver(schedule)
      observer.observe(document.body)
      schedule()

      revert = () => {
        observer.disconnect()
        if (frame) cancelAnimationFrame(frame)
        window.removeEventListener("scroll", schedule)
        window.removeEventListener("resize", schedule)
        ctx.revert()
        gsap.ticker.remove(tick)
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
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
