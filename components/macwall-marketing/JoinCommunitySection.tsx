import Image from "next/image"
import { macwall } from "@/lib/macwall-site"

export default function JoinCommunitySection() {
  return (
    <section className="marketing-section-elevated bg-background">
      <div className="marketing-container">
        <div className="mx-auto max-w-none text-center">
          <h2 className="text-[clamp(1.6rem,4.5vw,2.5rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
            {macwall.name} is building the future of live desktops.
          </h2>
        </div>
        <div className="relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl md:mt-12">
          <Image
            alt={`${macwall.name} live wallpapers on a MacBook`}
            src="/Img.png"
            width={1024}
            height={683}
            className="h-auto w-full object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      </div>
    </section>
  )
}
