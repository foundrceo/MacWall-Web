import type { ReactNode } from "react"

type CreatorSectionHeadingProps = Readonly<{
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: "left" | "center"
  className?: string
  subtitleClassName?: string
}>

/** Wysera-style section heading — eyebrow, serif title, lead. */
export function CreatorSectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  subtitleClassName,
}: CreatorSectionHeadingProps) {
  return (
    <div
      className={[
        align === "center" && "mx-auto max-w-[52rem] text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-marketing-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={[
          "font-heading text-balance font-normal tracking-[-0.02em] text-foreground",
          eyebrow ? "mt-3" : "",
          "text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1]",
        ].join(" ")}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={[
            "mx-auto mt-4 max-w-2xl text-balance text-[14px] leading-relaxed text-marketing-muted sm:text-base",
            align === "center" ? "text-center" : "text-left",
            subtitleClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
