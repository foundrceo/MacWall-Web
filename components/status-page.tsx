import type { ReactNode } from "react"

export const statusPrimaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** An empty band in the site column, as tall as the landing page's nav row. */
function Band() {
  return <div aria-hidden className="h-14" />
}

/**
 * Full-screen page for 404s and errors, in the site's open column,
 * frame lines one nav-row in from the top and bottom, the message centered.
 */
export function StatusPage({
  art,
  title,
  body,
  action,
}: Readonly<{
  art?: ReactNode
  title: string
  body: string
  action: ReactNode
}>) {
  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col">
        <Band />
        <div className="flex flex-1">
          <div className="container mx-auto flex">
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-20">
              {art ? (
                <div className="mb-10 w-full max-w-[18rem] sm:max-w-xs">
                  {art}
                </div>
              ) : null}
              <h1 className="font-display text-4xl font-normal tracking-tighter text-balance md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
                {body}
              </p>
              <div className="mt-8">{action}</div>
            </div>
          </div>
        </div>
        <Band />
      </div>
    </main>
  )
}
