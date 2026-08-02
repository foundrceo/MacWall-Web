"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

const MacWallChatWidget = dynamic(
  () =>
    import("@/components/macwall-chat/macwall-chat-widget").then(
      (m) => m.MacWallChatWidget
    ),
  { ssr: false }
)

/** Client boundary for marketing layout — loads chat after hydration. */
export function MacWallChatMount() {
  return (
    <Suspense fallback={null}>
      <MacWallChatWidget />
    </Suspense>
  )
}
