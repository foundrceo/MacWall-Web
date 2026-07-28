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
      <div className="relative mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl pt-12 pb-8 md:max-w-none md:pt-16 md:pb-10">
          <p className="inline-flex items-center gap-2 text-[14px] text-marketing-muted">
            <span>{ix.kicker}</span>
            <span className="text-marketing-muted/60">·</span>
            <span>{macwall.pro.socialProofMembers} wallpapers</span>
          </p>

          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,4.5vw,3.75rem)] leading-[1.1] font-normal tracking-[-0.03em] text-foreground">
            {ix.title}
          </h1>

          <p className="mt-6 max-w-3xl text-[18px] leading-[1.5] text-marketing-muted sm:text-[19px]">
            <span className="text-foreground/75">{ix.heroLead}</span>
          </p>

          <HeroSectionActions />
        </div>

        <HeroWalkthroughVideo />

        <div className="w-full py-10 md:py-14">
          <p className="mb-6 text-center text-[15px] text-marketing-muted md:mb-10">
            Curated across every genre
          </p>
          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-8 lg:gap-3">
            {catalogGenres.map((label) => (
              <li
                key={label}
                className="flex h-[4rem] w-full items-center justify-center rounded-[24px] bg-secondary px-3 sm:h-[4.5rem] sm:px-4 md:h-[6.25rem] md:px-4"
              >
                <span
                  className={`${geistPixelSquare.className} whitespace-nowrap text-[clamp(10px,1.7vw,17px)] leading-none text-foreground`}
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
