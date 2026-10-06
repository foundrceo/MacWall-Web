"use client"

import { useEffect } from "react"
import { RotateCw } from "lucide-react"

import { StatusPage, statusPrimaryButton } from "@/components/status-page"

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
    <StatusPage
      title="Something went wrong"
      body="An unexpected error stopped this page. Try again."
      action={
        <button type="button" onClick={() => reset()} className={statusPrimaryButton}>
          <RotateCw className="size-4" aria-hidden />
          Try again
        </button>
      }
    />
  )
}
