import HeroSectionActions from "@/components/macwall-marketing/HeroSectionActions"
import { HeroWalkthroughVideo } from "@/components/macwall-marketing/hero-walkthrough-video"
import { geistPixelSquare } from "@/lib/site-fonts"
import { macwall } from "@/lib/macwall-site"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

const catalogGenres = [
  "Nature",
  "Landscapes",
  "Space",
  "Cosmic",
  "Anime",
  "Studio quality",
  "Sci-fi",
  "Cinematic",
] as const

export default function HeroSection() {
  const ix = macwallMarketingCopy.interact

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="marketing-container relative">
        <div className="max-w-3xl pt-8 sm:pt-10 md:max-w-none md:pt-14 lg:pt-16">
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-marketing-muted sm:text-[14px]">
            <span>{ix.kicker}</span>
            <span className="text-marketing-muted/60" aria-hidden>
              ·
            </span>
            <span>{macwall.pro.socialProofMembers} wallpapers</span>
          </p>

          <h1 className="mt-5 max-w-4xl text-[clamp(2.125rem,6vw,3.75rem)] leading-[1.08] font-normal tracking-[-0.03em] text-foreground sm:mt-6">
            {ix.title}
          </h1>

          <p className="mt-5 max-w-2xl text-[16px] leading-[1.55] text-marketing-muted sm:mt-6 sm:text-[18px] md:text-[19px]">
            <span className="text-foreground/80">{ix.heroLead}</span>
          </p>

          <HeroSectionActions />
        </div>

        <div className="mt-8 md:mt-10">
          <HeroWalkthroughVideo />
        </div>

        <div className="border-t border-border/60 py-12 md:py-16 lg:py-20">
          <p className="mb-6 text-center text-[14px] text-marketing-muted sm:mb-8 sm:text-[15px]">
            Curated across every genre
          </p>
          <ul className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
            {catalogGenres.map((label) => (
              <li
                key={label}
                className="flex min-h-[3.75rem] w-full items-center justify-center rounded-[20px] bg-secondary px-2.5 py-3 sm:min-h-[4.5rem] sm:rounded-[24px] sm:px-3 md:min-h-[5.5rem] md:px-4"
              >
                <span
                  title={label}
                  className={`${geistPixelSquare.className} text-center text-[clamp(11px,2.8vw,16px)] leading-tight text-foreground`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
