import {
  Car,
  Gamepad2,
  LayoutGrid,
  Leaf,
  Moon,
  Orbit,
  Shapes,
  Sparkles,
  Shield,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Anime: Sparkles,
  Nature: Leaf,
  Cars: Car,
  Gaming: Gamepad2,
  Space: Orbit,
  Heroes: Shield,
  Dark: Moon,
  Abstract: Shapes,
  Others: LayoutGrid,
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
