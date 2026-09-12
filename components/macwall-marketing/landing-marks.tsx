import type { ReactNode } from "react"

function MarkFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="landing-pillar-mark flex aspect-square w-full items-center justify-center text-white">
      <svg
        viewBox="0 0 160 120"
        className="h-auto w-full max-w-[9rem]"
        fill="none"
        aria-hidden
      >
        {children}
      </svg>
    </div>
  )
}

/** Catalog tiles light up one by one. */
export function PickMark() {
  return (
    <MarkFrame>
      <rect x="28" y="22" width="48" height="32" rx="4" className="pillar-track" />
      <rect x="84" y="22" width="48" height="32" rx="4" className="pillar-track" />
      <rect x="28" y="66" width="48" height="32" rx="4" className="pillar-track" />
      <rect x="84" y="66" width="48" height="32" rx="4" className="pillar-track" />

      <rect
        x="28"
        y="22"
        width="48"
        height="32"
        rx="4"
        className="pillar-fill pillar-tile-1"
      />
      <rect
        x="84"
        y="22"
        width="48"
        height="32"
        rx="4"
        className="pillar-fill pillar-tile-2"
      />
      <rect
        x="28"
        y="66"
        width="48"
        height="32"
        rx="4"
        className="pillar-fill pillar-tile-3"
      />
      <rect
        x="84"
        y="66"
        width="48"
        height="32"
        rx="4"
        className="pillar-fill pillar-tile-4"
      />

      <circle cx="108" cy="38" r="3" className="pillar-fill pillar-dot" />
    </MarkFrame>
  )
}

/** File well with a looping drop arrow. */
export function ImportMark() {
  return (
    <MarkFrame>
      <rect x="48" y="34" width="64" height="56" rx="8" className="pillar-line" />
      <path
        d="M66 62h28M66 72h18"
        className="pillar-track"
        strokeLinecap="round"
      />
      <g className="pillar-drop">
        <path
          d="M80 24v28M68 40l12 12 12-12"
          className="pillar-line"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M68 78h24"
        pathLength="1"
        className="pillar-write-line pillar-write-1"
        strokeLinecap="round"
      />
    </MarkFrame>
  )
}

/** Two displays with a sync pulse between them. */
export function DisplaysMark() {
  return (
    <MarkFrame>
      <rect x="18" y="30" width="78" height="50" rx="6" className="pillar-line" />
      <rect x="34" y="84" width="46" height="4" rx="2" className="pillar-track" />
      <rect x="42" y="88" width="30" height="4" rx="2" className="pillar-track" />

      <rect
        x="72"
        y="42"
        width="66"
        height="42"
        rx="6"
        className="pillar-line pillar-soft"
      />
      <rect x="88" y="88" width="34" height="3" rx="1.5" className="pillar-track" />

      <path
        d="M64 55h18"
        pathLength="1"
        className="pillar-link-gleam"
        strokeLinecap="round"
      />
      <circle cx="64" cy="55" r="2.2" className="pillar-fill pillar-dot" />
      <circle cx="82" cy="55" r="2.2" className="pillar-fill pillar-dot" />
    </MarkFrame>
  )
}

/** Lock body with a soft unlock shimmer. */
export function LockMark() {
  return (
    <MarkFrame>
      <rect
        x="40"
        y="28"
        width="80"
        height="54"
        rx="8"
        className="pillar-track"
      />
      <rect
        x="48"
        y="36"
        width="64"
        height="38"
        rx="4"
        className="pillar-fill pillar-soft"
        opacity="0.12"
      />
      <path
        d="M48 52h64"
        pathLength="1"
        className="pillar-write-line pillar-write-2"
        strokeLinecap="round"
      />

      <g className="pillar-lock">
        <path
          d="M68 78v-8a12 12 0 0 1 24 0v8"
          className="pillar-line"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <rect
          x="60"
          y="78"
          width="40"
          height="28"
          rx="6"
          className="pillar-line"
        />
        <circle cx="80" cy="90" r="2.5" className="pillar-fill pillar-dot" />
        <path
          d="M80 93v5"
          className="pillar-line"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </MarkFrame>
  )
}
