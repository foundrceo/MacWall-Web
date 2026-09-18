import type { Transition, Variants } from "motion/react"

/** Sidebar pill / active-bar spring — snappy, Apple-like. */
export const adminSpring: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 36,
  mass: 0.7,
}

/** Page fade — keep under 200ms so dense admin nav feels instant. */
export const adminPageTransition: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
}

/** Card entrance — subtle rise, staggered by siblings via `custom`. */
export const adminCardTransition: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
}

/** Stagger container for metric grids (21st.dev-style cascade). */
export const adminStaggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
}

export const adminStaggerChild: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: adminCardTransition,
  },
}
