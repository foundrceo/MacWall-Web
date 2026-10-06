import type { Metadata } from "next"

import MacWallMarketingFooter, {
  type FooterVariant,
} from "@/components/macwall-marketing/marketing-footer"

/** Temporary: compare footer designs. Delete after picking. */
export const metadata: Metadata = {
  title: "Footer lab",
  robots: { index: false, follow: false },
}

const VARIANTS: readonly { variant: FooterVariant; name: string; note: string }[] = [
  {
    variant: "wordmark",
    name: "Previous footer",
    note: "Brand on the left, three columns on the right, the bottom bar, then the giant wordmark.",
  },
  {
    variant: "desktop",
    name: "1 · Mac desktop",
    note: "The footer is a Mac screen: click Product / Resources / Legal in the menu bar for the links; a live wallpaper plays behind; the Dock holds the app, socials and AI assistants.",
  },
  {
    variant: "wall",
    name: "2 · Wallpaper wall",
    note: "Two rows of real wallpapers drift across the top (hover one to play it, click to open it); calm links below.",
  },
  {
    variant: "directory",
    name: "3 · Apple-style directory (live on the site)",
    note: "Like apple.com: footnotes, a dense directory of every page in small type, one fine-print row, and the faint wordmark.",
  },
  {
    variant: "card",
    name: "4 · Big final card",
    note: "One large card with a live wallpaper behind the headline, links on glass, fine print below.",
  },
]

export default function FooterLabPage() {
  return (
    <>
      {VARIANTS.map((item) => (
        <div key={item.variant}>
          <div className="container mx-auto border-dashed border-border bg-white/[0.03] px-6 py-4 sm:border-x">
            <p className="text-foreground">{item.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.note}</p>
          </div>
          <MacWallMarketingFooter variant={item.variant} />
        </div>
      ))}
    </>
  )
}
