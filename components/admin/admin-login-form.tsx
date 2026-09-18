"use client"

import { useState, type FormEvent } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Eye, EyeOff, Loader2, Lock, TriangleAlert } from "lucide-react"

import { AdminAppIcon } from "@/components/admin/admin-ui"
import { DottedGrid } from "@/components/ui/dotted-grid"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export function AdminLoginForm({
  nextPath = "/admin",
}: Readonly<{ nextPath?: string }>) {
  const reduceMotion = useReducedMotion()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[var(--admin-canvas)] px-4 py-12">
      <DottedGrid
        className="pointer-events-none absolute inset-0"
        backgroundColor="#09090b"
        spacing={28}
        baseRadius={1.2}
      />
      <div
        aria-hidden
        className="admin-orb admin-orb-blue pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="admin-orb admin-orb-violet pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[36rem] -translate-x-1/2"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#09090b_100%)]" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={
          error && !reduceMotion
            ? { opacity: 1, y: 0, scale: 1, x: [0, -7, 7, -4, 4, 0] }
            : { opacity: 1, y: 0, scale: 1, x: 0 }
        }
        transition={{ duration: error ? 0.35 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="gap-0 overflow-hidden border-[var(--admin-border-strong)] py-0 shadow-[var(--admin-shadow-pop)]">
          <div className="relative flex flex-col items-center gap-3 px-6 pt-8 pb-2 text-center">
            <div
              aria-hidden
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--admin-blue)]/60 to-transparent"
            />
            <span className="relative flex items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-3xl bg-[var(--admin-glow-blue)] blur-xl"
              />
              <AdminAppIcon size="lg" className="relative" />
            </span>
            <div>
              <h1 className="admin-gradient-text text-xl font-semibold tracking-tight">
                {macwall.name} Admin
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--admin-muted)]">
                Sign in to manage analytics, catalog and support.
              </p>
            </div>
          </div>

          <form className="space-y-4 px-6 pt-5 pb-7" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Admin password
              </Label>
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--admin-muted)]"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={12}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "admin-login-error" : undefined}
                  className="h-10 pr-11 pl-10"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--admin-muted)] outline-none hover:bg-[var(--admin-fill)] hover:text-[var(--admin-fg)]"
                  onClick={() => setShowPassword((open) => !open)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p
                id="admin-login-error"
                role="alert"
                className="flex items-center gap-1.5 rounded-xl border border-[var(--admin-red)]/25 bg-[var(--admin-red-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--admin-red-fg)]"
              >
                <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || password.length === 0}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              ) : null}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-[11px] text-[var(--admin-muted)]">
              Sessions last 7 days on this device.
            </p>
          </form>
        </Card>

        <p
          className={cn(
            "mt-4 text-center text-xs text-[var(--admin-muted)]"
          )}
        >
          Authorised access only. All sign-ins are logged.
        </p>
      </motion.div>
    </div>
  )
}
