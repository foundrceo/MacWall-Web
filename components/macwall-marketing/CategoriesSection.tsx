import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  landingEyebrow,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export default function CategoriesSection() {
  const landing = macwallMarketingCopy.landing

  return (
    <section className={landingSectionY} aria-labelledby="categories-heading">
      <div className="marketing-container">
        <p id="categories-heading" className={`${landingEyebrow} text-center`}>
          {landing.catalogEyebrow}
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {landing.genres.map((label) => (
            <li key={label}>
              <LandingSurface className="flex min-h-[4.5rem] items-center justify-center px-3 py-4 md:min-h-[5.5rem]">
                <span className="text-center text-[16px] leading-6 font-normal text-white">
                  {label}
                </span>
              </LandingSurface>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
