"use client"

/**
 * Catches errors in the root layout. Must define its own `<html>` / `<body>`.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 24 }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>
        <p style={{ color: "#555", maxWidth: 480 }}>
          An unexpected error occurred. Please try again.
          {error.digest ? (
            <>
              {" "}
              <span style={{ fontSize: 12, color: "#888" }}>
                (Ref: {error.digest})
              </span>
            </>
          ) : null}
        </p>
        <button
          type="button"
          style={{
            marginTop: 16,
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#f5f5f5",
          }}
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
