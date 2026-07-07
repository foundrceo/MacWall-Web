/** In-tab poster cache so gallery tiles do not flash empty on refresh. */
const memory = new Set<string>()
const STORAGE_KEY = "macwall-gallery-posters-v1"

function readSessionSet(): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function writeSessionSet(set: Set<string>) {
  if (typeof sessionStorage === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set].slice(-80)))
  } catch {
    /* quota or private mode */
  }
}

export function isGalleryPosterCached(url: string): boolean {
  return memory.has(url) || readSessionSet().has(url)
}

export function markGalleryPosterCached(url: string): void {
  memory.add(url)
  const set = readSessionSet()
  set.add(url)
  writeSessionSet(set)
}

const loadedVideos = new Set<string>()

export function isGalleryVideoCached(id: string): boolean {
  return loadedVideos.has(id)
}

export function markGalleryVideoCached(id: string): void {
  loadedVideos.add(id)
}
