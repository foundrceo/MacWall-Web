"use client"

import { FormEvent, useState } from "react"

import {
  AdminAppIcon,
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminNotice,
  AdminSurface,
  AdminSurfaceBody,
} from "@/components/admin/admin-ui"
import { macwall } from "@/lib/macwall-site"

export function AdminLoginForm({
  nextPath = "/admin",
}: Readonly<{ nextPath?: string }>) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? "Login failed")
      }

      window.location.assign(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <AdminSurface className="w-full max-w-md">
        <AdminSurfaceBody className="space-y-6 pt-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <AdminAppIcon size="lg" />
            <div>
              <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                {macwall.name} Admin
              </h1>
              <p className="mt-1 text-[15px] text-[#86868b]">
                Sign in to manage analytics, wallpapers, and uploads.
              </p>
            </div>
          </div>

          <form className="space-y-4 text-left" onSubmit={onSubmit}>
            <div className="space-y-2">
              <AdminLabel htmlFor="password">Admin password</AdminLabel>
              <AdminInput
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}
            <AdminButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </AdminButton>
          </form>
        </AdminSurfaceBody>
      </AdminSurface>
    </div>
  )
}
