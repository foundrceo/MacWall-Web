import { PricingReviewAvatar } from "@/components/macwall-marketing/pricing-review-avatar"
import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  landingBelow,
  landingBody,
  landingEyebrow,
  landingH2,
  landingLead,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import {
  macwallPricingCopy as p,
  type PricingReview,
} from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

function ReviewCard({
  quote,
  name,
  context,
  avatarSrc,
}: Readonly<PricingReview>) {
  return (
    <LandingSurface
      className="flex h-full flex-col justify-between rounded-none p-5 sm:p-6 md:p-8"
      hover={false}
    >
      <figure className="flex h-full flex-col justify-between">
        <blockquote className={cn(landingBody, "text-white")}>
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-3">
          <PricingReviewAvatar name={name} src={avatarSrc} className="size-10" />
          <div className="min-w-0">
            <p className="text-[14px] leading-5 font-medium text-white">
              {name}
            </p>
            <p className="mt-0.5 text-[13px] leading-5 text-landing-muted">
              {context}
            </p>
          </div>
        </figcaption>
      </figure>
    </LandingSurface>
  )
}

export function PricingReviewsSection({
  className,
}: Readonly<{ className?: string }>) {
  const { eyebrow, title, subtitle, items } = p.reviews

  return (
    <section
      className={cn(landingSectionY, className)}
      aria-labelledby="pricing-reviews-heading"
    >
      <div className="marketing-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingEyebrow}>{eyebrow}</p>
          <h2 id="pricing-reviews-heading" className={cn(landingH2, "mt-2")}>
            {title}
          </h2>
          <p className={cn(landingLead, "mx-auto mt-5")}>{subtitle}</p>
        </div>

        <ul
          className={cn(
            landingBelow,
            "grid grid-cols-1 gap-2 sm:grid-cols-2"
          )}
        >
          {items.map((review) => (
            <li key={`${review.name}-${review.context}`} className="min-w-0">
              <ReviewCard {...review} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
