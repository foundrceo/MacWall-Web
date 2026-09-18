"use client"

import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"

export default function ProtectedAdminError({
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
    <AdminShell title="Something broke">
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <TriangleAlert className="size-7 text-[var(--admin-amber-fg)]" />
        <div className="space-y-1">
          <h2 className="text-[15px] font-semibold text-[var(--admin-fg)]">
            This page hit an error
          </h2>
          <p className="max-w-sm text-[13px] text-[var(--admin-muted)]">
            Your session is still signed in. Try again, or open another section
            from the sidebar.
          </p>
        </div>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </AdminShell>
  )
}
