import type { Metadata } from "next"

import MacWallMarketingBottomCta from "@/components/macwall-marketing/marketing-bottom-cta"

import { CtaDesign, type CtaVariant } from "../_components/cta-designs"

/** Temporary: compare designs for the closing call to action. Delete after picking. */
export const metadata: Metadata = {
  title: "CTA lab",
  robots: { index: false, follow: false },
}

const VARIANTS: readonly { variant: CtaVariant; name: string; note: string }[] = [
  {
    variant: "wall",
    name: "1 · Wallpaper wall — after 21st.dev “Promo Section”",
    note: "Three tilted rows of real wallpapers drift behind the ask, dimmed at the centre.",
  },
  {
    variant: "split",
    name: "2 · Split with gallery — after 21st.dev “CTA with Floating Gallery”",
    note: "The ask on the left; a staggered wallpaper gallery on the right, one tile playing live.",
  },
  {
    variant: "card",
    name: "3 · Serif card — after 21st.dev “Dithered Shader CTA”",
    note: "One soft, grainy card: an eyebrow pill and a two-line serif headline, second line hushed.",
  },
  {
    variant: "beams",
    name: "4 · Light beams — after 21st.dev “Download Section with Column Lines”",
    note: "A fine column grid with lights falling down it; the hero’s Music Sync badge on top.",
  },
  {
    variant: "icon",
    name: "5 · App icon — Apple product-page close",
    note: "The glowing app icon, the name, one line, the actions, three plain facts.",
  },
  {
    variant: "marquee",
    name: "6 · Marquee type — after 21st.dev “Worth Keeping CTA”",
    note: "A giant serif line drifts behind; “One more thing” as the eyebrow.",
  },
]

function Label({ name, note }: Readonly<{ name: string; note: string }>) {
  return (
    <div className="container mx-auto border-dashed border-border bg-white/[0.03] px-6 py-4 sm:border-x">
      <p className="text-foreground">{name}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

export default function CtaLabPage() {
  return (
    <>
      <div>
        <Label name="Current (live on the site)" note="“Try MacWall Now”, two buttons, the macOS line." />
        <MacWallMarketingBottomCta />
      </div>
      {VARIANTS.map((item) => (
        <div key={item.variant}>
          <Label name={item.name} note={item.note} />
          <CtaDesign variant={item.variant} />
        </div>
      ))}
    </>
  )
}
