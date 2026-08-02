import HeroSectionActions from "@/components/macwall-marketing/HeroSectionActions"
import { HeroWalkthroughVideo } from "@/components/macwall-marketing/hero-walkthrough-video"
import { geistPixelSquare } from "@/lib/site-fonts"
import { macwall } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

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
  const ix = macwallExactCopy.interact

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="marketing-container relative">
        <div className="max-w-3xl pt-10 pb-8 sm:pt-12 md:max-w-none md:pt-16 md:pb-10">
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-marketing-muted sm:text-[14px]">
            <span>{ix.kicker}</span>
            <span className="text-marketing-muted/60" aria-hidden>
              ·
            </span>
            <span>{macwall.pro.socialProofMembers} wallpapers</span>
          </p>

          <h1 className="mt-5 max-w-4xl text-[clamp(2.15rem,6.5vw,3.75rem)] leading-[1.1] font-normal tracking-[-0.03em] text-foreground sm:mt-6">
            {ix.title}
          </h1>

          <p className="mt-5 max-w-3xl text-[16px] leading-[1.5] text-marketing-muted sm:mt-6 sm:text-[18px] md:text-[19px]">
            <span className="text-foreground/75">{ix.heroLead}</span>
          </p>

          <HeroSectionActions />
        </div>

        <HeroWalkthroughVideo />

        <div className="w-full py-10 md:py-14">
          <p className="mb-5 text-center text-[14px] text-marketing-muted sm:text-[15px] md:mb-10">
            Curated across every genre
          </p>
          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-8 lg:gap-3">
            {catalogGenres.map((label) => (
              <li
                key={label}
                className="flex min-h-[3.75rem] w-full items-center justify-center rounded-[20px] bg-secondary px-2.5 py-3 sm:min-h-[4.5rem] sm:rounded-[24px] sm:px-3 md:min-h-[6.25rem] md:px-4"
              >
                <span
                  title={label}
                  className={`${geistPixelSquare.className} text-center text-[clamp(11px,2.8vw,17px)] leading-tight text-foreground`}
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
