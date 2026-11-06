"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { ColorCollectionLink } from "@/lib/tools/tools"

const ColorCollectionsContext = createContext<readonly ColorCollectionLink[]>(
  []
)

/**
 * Hands the colour collections (built on the server from
 * lib/seo/wallpaper-collections.ts) to the palette tool, so the browser
 * bundle never carries the collection definitions.
 */
export function ColorCollectionsProvider({
  collections,
  children,
}: Readonly<{
  collections: readonly ColorCollectionLink[]
  children: ReactNode
}>) {
  return (
    <ColorCollectionsContext.Provider value={collections}>
      {children}
    </ColorCollectionsContext.Provider>
  )
}

export function useColorCollections(): readonly ColorCollectionLink[] {
  return useContext(ColorCollectionsContext)
}
