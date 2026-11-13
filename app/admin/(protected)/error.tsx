"use client"

import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"

import { EmptyState } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"

export default function ProtectedAdminError({
  error,
  retry,
}: Readonly<{
  error: Error & { digest?: string }
  retry: () => void
}>) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full min-h-[60svh] items-center justify-center">
      <EmptyState
        icon={<TriangleAlert />}
        title="This page failed to load"
        description="Try again. If it keeps happening, check the server logs."
        action={
          <Button type="button" size="sm" onClick={() => retry()}>
            Try again
          </Button>
        }
      />
    </div>
  )
}
