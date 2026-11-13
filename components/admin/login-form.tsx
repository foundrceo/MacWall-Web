"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Spinner } from "@/components/admin/ui"
import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminLoginForm({
  nextPath = "/admin",
}: Readonly<{ nextPath?: string }>) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
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
      if (!res.ok) throw new Error(json.error ?? "Sign-in failed")
      window.location.assign(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed")
      setLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-[340px] animate-in duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none">
        <div className="flex flex-col items-center text-center">
          <MacWallAppIcon size={44} priority />
          <h1 className="mt-5 text-[20px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            MacWall Admin
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Enter the admin password to continue.
          </p>
        </div>

        <form className="mt-8 space-y-3" onSubmit={onSubmit}>
          <div className="relative">
            <label htmlFor="admin-password" className="sr-only">
              Admin password
            </label>
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              required
              minLength={12}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError(null)
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "admin-login-error" : undefined}
              placeholder="Password"
              className="h-10 pr-10 pl-3"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="hover:bg-fill-hover absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff aria-hidden className="size-4" />
              ) : (
                <Eye aria-hidden className="size-4" />
              )}
            </button>
          </div>

          {error ? (
            <p id="admin-login-error" role="alert" className="text-red text-xs">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || password.length === 0}
          >
            {loading ? <Spinner className="text-current" /> : null}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You stay signed in on this device for 7 days.
        </p>
      </div>
    </main>
  )
}
