import { Star } from "lucide-react"

import { PricingReviewAvatar } from "@/components/macwall-marketing/pricing-review-avatar"
import {
  macwallPricingCopy as p,
  type PricingReview,
} from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

function StarRating({
  count,
  className,
}: Readonly<{ count: number; className?: string }>) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }, (_, index) => (
        <Star
          key={index}
          className="size-3 fill-yellow-400 text-yellow-400"
          aria-hidden
        />
      ))}
    </div>
  )
}

function ReviewCard({
  quote,
  name,
  context,
  rating,
  avatarSrc,
}: Readonly<PricingReview>) {
  return (
    <figure className="flex h-full flex-col rounded-[20px] bg-secondary px-5 py-5 ring-1 ring-white/8">
      <figcaption className="flex items-center gap-3">
        <PricingReviewAvatar name={name} src={avatarSrc} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[13px] font-medium text-foreground">{name}</p>
            <StarRating count={rating} />
          </div>
          <p className="mt-0.5 text-[11px] text-marketing-muted">{context}</p>
        </div>
      </figcaption>
      <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-foreground/90">
        &ldquo;{quote}&rdquo;
      </blockquote>
    </figure>
  )
}

export function PricingReviewsSection({
  className,
}: Readonly<{ className?: string }>) {
  const { title, subtitle, items } = p.reviews

  return (
    <section
      className={cn("marketing-section border-t border-border/40", className)}
      aria-labelledby="pricing-reviews-heading"
    >
      <div className="marketing-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium text-marketing-muted sm:text-[14px]">
            Reviews
          </p>
          <h2
            id="pricing-reviews-heading"
            className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground"
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-marketing-muted">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
          {items.map((review) => (
            <ReviewCard
              key={`${review.name}-${review.context}`}
              {...review}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
