"use client"

import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"

import { EmptyState } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"

export default function AdminError({
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
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center"
    >
      <EmptyState
        icon={<TriangleAlert />}
        title="The admin console failed to load"
        description="Try again. If it keeps happening, check the server logs."
        action={
          <Button type="button" size="sm" onClick={() => retry()}>
            Try again
          </Button>
        }
      />
    </main>
  )
}
