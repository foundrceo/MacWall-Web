"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminCommandProvider } from "@/components/admin/admin-command"
import { Toaster } from "sonner"

export function AdminProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider delayDuration={200}>
      <AdminCommandProvider>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          offset={16}
          toastOptions={{
            className:
              "!border-[var(--admin-border)] !bg-[var(--admin-surface)] !text-[var(--admin-fg)] !shadow-[var(--admin-shadow-pop)]",
          }}
        />
      </AdminCommandProvider>
    </TooltipProvider>
  )
}
