"use client"

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <TriangleAlert className="size-7 text-[var(--admin-amber-fg)]" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-[var(--admin-fg)]">
          Admin failed to load
        </h1>
        <p className="max-w-sm text-[13px] text-[var(--admin-muted)]">
          Reload this page. If it keeps happening, check the server logs.
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
