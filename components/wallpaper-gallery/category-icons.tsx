import {
  Building2,
  Car,
  Cat,
  Cpu,
  Gamepad2,
  LayoutGrid,
  Leaf,
  Orbit,
  Sparkles,
  Wand2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Nature: Leaf,
  Space: Orbit,
  Anime: Sparkles,
  Cars: Car,
  City: Building2,
  "Video Games": Gamepad2,
  "Sci-fi": Cpu,
  Fantasy: Wand2,
  Cats: Cat,
}

export function CategoryIcon({
  category,
  className,
}: Readonly<{
  category: string | null
  className?: string
}>) {
  const Icon = category ? (CATEGORY_ICONS[category] ?? LayoutGrid) : LayoutGrid
  return <Icon className={className} aria-hidden strokeWidth={1.75} />
}
