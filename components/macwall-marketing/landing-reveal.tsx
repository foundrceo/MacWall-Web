"use client"

import { Children, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

export function LandingReveal({
  children,
  className,
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.14,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: { type: "spring", bounce: 0.3, duration: 1.5 },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
