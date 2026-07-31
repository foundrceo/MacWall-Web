"use client"

import { useState, type FormEvent } from "react"
import { Loader2, TriangleAlert } from "lucide-react"

import { AdminAppIcon } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      if (!res.ok) throw new Error(json.error ?? "Login failed")
      window.location.assign(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--admin-canvas)] px-4 py-12">
      <div className="admin-fade-in w-full max-w-sm">
        <Card className="gap-0 py-0">
          <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center">
            <AdminAppIcon size="lg" />
            <div>
              <h1 className="text-lg font-semibold text-[var(--admin-fg)]">
                {macwall.name} Admin
              </h1>
              <p className="mt-1 text-[13px] text-[var(--admin-muted)]">
                Sign in to manage analytics, catalog and support.
              </p>
            </div>
          </div>

          <form className="space-y-4 px-6 pt-6 pb-8" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Admin password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <p className="flex items-center gap-1.5 text-xs text-[var(--admin-red)]">
                <TriangleAlert className="size-3.5 shrink-0" />
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || password.length === 0}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-[var(--admin-muted)]">
          Authorised access only.
        </p>
      </div>
    </div>
  )
}
