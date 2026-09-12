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
        <p className="text-[13px] leading-5 font-normal text-landing-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={[
          "text-balance font-normal tracking-tight text-white",
          eyebrow ? "mt-2" : "",
          "text-[32px] leading-[1.15] md:text-[40px]",
        ].join(" ")}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={[
            "mx-auto mt-4 max-w-[34rem] text-balance text-[16px] leading-6 text-landing-muted",
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
