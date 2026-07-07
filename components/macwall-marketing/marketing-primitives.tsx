import Link from "next/link"
import { macwall, mailtoReelRefund } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"
import {
  Fragment,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"

const marketingLinkedTokens: Record<string, string> = {
  [macwall.reelRefundHashtag]: macwall.reelRefundHashtagURL,
  [macwall.reelRefundEmail]: mailtoReelRefund,
}

const marketingLinkedTextPattern = new RegExp(
  `(${Object.keys(marketingLinkedTokens)
    .sort((a, b) => b.length - a.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g"
)

export function MarketingRichText({
  children,
  className,
  as: Tag = "span",
}: Readonly<{
  children: string
  className?: string
  as?: "span" | "p"
}>) {
  const parts = children.split(marketingLinkedTextPattern)

  return (
    <Tag className={className}>
      {parts.map((part, index) => {
        const href = marketingLinkedTokens[part]
        if (!href) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>
        }

        const external = href.startsWith("http")

        return (
          <a
            key={`${part}-${index}`}
            href={href}
            className="MacWallMarketingInlineLink"
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {part}
          </a>
        )
      })}
    </Tag>
  )
}

function MarketingInlineExternalLink({
  href,
  children,
}: Readonly<{
  href: string
  children: ReactNode
}>) {
  return (
    <a
      href={href}
      className="MacWallMarketingInlineLink"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

function MarketingReelAtLink({
  platform,
}: Readonly<{ platform: "instagram" | "tiktok" }>) {
  const href =
    platform === "instagram"
      ? macwall.reelRefundInstagramURL
      : macwall.reelRefundTiktokURL
  const handle =
    platform === "instagram"
      ? macwall.reelRefundInstagram
      : macwall.reelRefundTiktok

  return (
    <MarketingInlineExternalLink href={href}>
      {handle}
    </MarketingInlineExternalLink>
  )
}

export function MarketingReelHashtagLink() {
  return (
    <MarketingInlineExternalLink href={macwall.reelRefundHashtagURL}>
      {macwall.reelRefundHashtag}
    </MarketingInlineExternalLink>
  )
}

export function MarketingReelPostTagsCopy({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <p className={className}>
      Share on Instagram <MarketingReelAtLink platform="instagram" /> or TikTok{" "}
      <MarketingReelAtLink platform="tiktok" />, with{" "}
      <MarketingReelHashtagLink />.
    </p>
  )
}

export function MarketingReelInfluencerCopy({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <span className={className}>
      DM <MarketingReelAtLink platform="instagram" /> on Instagram or{" "}
      <MarketingReelAtLink platform="tiktok" /> on TikTok for influencer
      partnerships.
    </span>
  )
}

export function MarketingReelFaqRefundCopy({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <p className={className}>
      Buy {macwall.name} Pro, post on Instagram{" "}
      <MarketingReelAtLink platform="instagram" /> or TikTok{" "}
      <MarketingReelAtLink platform="tiktok" /> with{" "}
      <MarketingReelHashtagLink />, then email{" "}
      <a href={mailtoReelRefund} className="MacWallMarketingInlineLink">
        {macwall.reelRefundEmail}
      </a>{" "}
      once you hit {macwall.reelRefundHalfViews.toLocaleString()} views for 50%
      back or {macwall.reelRefundFullViews.toLocaleString()} views for a full
      refund.
    </p>
  )
}

export const mw = {
  ink: "#1d1d1f",
  muted: "#86868b",
  subtle: "#6e6e73",
  surface: "#f5f5f7",
  white: "#ffffff",
  accent: "#0071e3",
  accentHover: "#0077ed",
} as const

export function ChevronRightIcon({
  className,
  size = 14,
}: Readonly<{ className?: string; size?: number }>) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      className={className}
      aria-hidden
    >
      <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
    </svg>
  )
}

export function MarketingContainer({
  className,
  children,
  wide,
}: Readonly<{
  className?: string
  children: ReactNode
  wide?: boolean
}>) {
  return (
    <div
      className={cn(
        "MacWallMarketingContainer mx-auto w-full min-w-0 px-6 md:px-8",
        wide ? "max-w-[1080px]" : "max-w-[980px]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionEyebrow({
  children,
  inverted,
  className,
}: Readonly<{
  children: ReactNode
  inverted?: boolean
  className?: string
}>) {
  return (
    <p
      className={cn(
        "text-[17px] leading-[1.235] font-semibold",
        inverted ? "text-[#86868b]" : "text-[#86868b]",
        className
      )}
    >
      {children}
    </p>
  )
}

export function SectionTitle({
  children,
  inverted,
  className,
  as: Tag = "h2",
  id,
}: Readonly<{
  children: ReactNode
  inverted?: boolean
  className?: string
  as?: "h1" | "h2" | "h3"
  id?: string
}>) {
  return (
    <Tag
      id={id}
      className={cn(
        "font-semibold tracking-[-0.025em]",
        Tag === "h1"
          ? "text-[40px] leading-[1.05] md:text-[56px] md:leading-[1.04]"
          : "text-[32px] leading-[1.08] md:text-[48px] md:leading-[1.05]",
        inverted ? "text-white" : "text-[#1d1d1f]",
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function SectionLead({
  children,
  inverted,
  className,
}: Readonly<{
  children: ReactNode
  inverted?: boolean
  className?: string
}>) {
  return (
    <p
      className={cn(
        "text-[19px] leading-[1.47] md:text-[21px] md:leading-[1.381]",
        inverted ? "text-[#86868b]" : "text-[#86868b]",
        className
      )}
    >
      {children}
    </p>
  )
}

export function TextLink({
  href,
  children,
  inverted,
  className,
  external,
}: Readonly<{
  href: string
  children: ReactNode
  inverted?: boolean
  className?: string
  external?: boolean
}>) {
  const classes = cn(
    "inline-flex items-center gap-0.5 text-[17px] leading-[1.235] hover:underline",
    inverted ? "text-[#2997ff]" : "text-[#0066cc]",
    className
  )

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
        <ChevronRightIcon />
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <ChevronRightIcon />
    </Link>
  )
}

type ButtonVariant = "primary" | "secondary"

/** Capsule CTA. Use TextLink for secondary actions. */
export function MarketingButton({
  href,
  children,
  variant = "primary",
  className,
  external,
  ariaLabel,
  size = "default",
}: Readonly<{
  href: string
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  external?: boolean
  ariaLabel?: string
  size?: "default" | "sm" | "lg"
}>) {
  const base = cn(
    "inline-flex items-center justify-center rounded-full font-normal transition-colors duration-150",
    size === "sm" && "min-h-[28px] px-4 text-[12px]",
    size === "default" &&
      "min-h-[44px] px-[22px] text-[17px] tracking-[-0.022em]",
    size === "lg" && "min-h-[48px] px-6 text-[17px] tracking-[-0.022em]",
    variant === "primary" && "bg-[#0071e3] text-white hover:bg-[#0077ed]",
    variant === "secondary" && "bg-[#1d1d1f] text-white hover:bg-[#333336]",
    className
  )

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={base}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={base} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}

export const MarketingSection = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"section"> & {
    inverted?: boolean
    muted?: boolean
  }
>(function MarketingSection(
  { children, className, inverted, muted, id, ...rest },
  ref
) {
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "py-20 md:py-28",
        inverted && "bg-black text-white",
        muted && !inverted && "bg-[#f5f5f7] text-[#1d1d1f]",
        !inverted && !muted && "bg-white text-[#1d1d1f]",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  )
})

export function MarketingCard({
  children,
  className,
  highlight,
  id,
}: Readonly<{
  children: ReactNode
  className?: string
  highlight?: boolean
  id?: string
}>) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-[28px] border bg-white p-7 md:p-8",
        highlight ? "border-[#1d1d1f]" : "border-black/[0.08]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CheckIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("mt-0.5 size-[14px] shrink-0 text-[#86868b]", className)}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
