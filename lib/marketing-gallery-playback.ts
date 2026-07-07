import { MARKETING_GALLERY_MAX_DECODERS } from "@/lib/marketing-cache"

const activeDecoders = new Set<string>()

export function requestGalleryDecoder(id: string): boolean {
  if (activeDecoders.has(id)) return true
  if (activeDecoders.size >= MARKETING_GALLERY_MAX_DECODERS) return false
  activeDecoders.add(id)
  return true
}

export function releaseGalleryDecoder(id: string): void {
  activeDecoders.delete(id)
}
