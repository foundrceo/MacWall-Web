"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

const loadProModal = () =>
  import("@/components/macwall-marketing/pro-modal").then((m) => m.ProModal)

const ProModalImpl = dynamic(loadProModal, { ssr: false })

/** Warm the modal chunk on intent (hover/focus) so the first open is instant. */
export function preloadProModal() {
  void loadProModal()
}

/**
 * Same API as `ProModal`, but the dialog code (Radix Dialog + pricing UI)
 * downloads on first open instead of shipping with every page. Once opened it
 * stays mounted so the close animation still plays.
 */
export function ProModal({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const [hasOpened, setHasOpened] = useState(open)
  if (open && !hasOpened) setHasOpened(true)
  if (!hasOpened) return null
  return <ProModalImpl open={open} onOpenChange={onOpenChange} />
}
