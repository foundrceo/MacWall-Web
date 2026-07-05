"use client"

import { useEffect } from "react"
import { macwall } from "@/lib/macwall-site"
import { Button } from "@/components/ui/button"

export default function RouteError({
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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {macwall.name} hit an unexpected error. You can try again or return
        home.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
