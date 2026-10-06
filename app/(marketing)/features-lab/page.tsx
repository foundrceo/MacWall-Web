import type { Metadata } from "next"

import { Features, type FeaturesVariant } from "../_components/features"

/** Temporary: compare designs for the features section. Delete after picking. */
export const metadata: Metadata = {
  title: "Features lab",
  robots: { index: false, follow: false },
}

const VARIANTS: readonly { variant: FeaturesVariant; name: string; note: string }[] = [
  {
    variant: "bento",
    name: "A · Bento (current)",
    note: "Zig-zag grid; the two exclusives take the wide tiles.",
  },
  {
    variant: "rows",
    name: "E · Alternating rows",
    note: "Apple-style rows: media one side, text the other, switching sides.",
  },
]

export default function FeaturesLabPage() {
  return (
    <>
      {VARIANTS.map((item) => (
        <div key={item.variant}>
          <div className="container mx-auto border-dashed border-border bg-white/[0.03] px-6 py-4 sm:border-x">
            <p className="text-foreground">{item.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.note}</p>
          </div>
          <Features variant={item.variant} anchors={false} />
        </div>
      ))}
    </>
  )
}
