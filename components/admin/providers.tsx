"use client"

import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"

export function AdminProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <TooltipProvider delayDuration={250}>
      {children}
      {/* Styled in app/admin/admin.css ([data-sonner-toast]). */}
      <Toaster theme="dark" position="bottom-right" offset={16} />
    </TooltipProvider>
  )
}
