"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const SocialProofPopups = dynamic(
  () =>
    import("@/components/macwall-marketing/social-proof-popups").then(
      (m) => m.SocialProofPopups
    ),
  { ssr: false }
)

/** Client boundary for marketing layout — loads social proof after hydration. */
export function SocialProofMount() {
  return (
    <Suspense fallback={null}>
      <SocialProofPopups />
    </Suspense>
  )
}
