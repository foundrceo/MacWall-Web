"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { DoubleSide, ExtrudeGeometry, type Mesh, PMREMGenerator } from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import { cn } from "@/lib/utils"

/** The same Apple mark the navbar's Download button uses, on a 24×24 grid. */
const APPLE_PATH =
  "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"

/** Studio reflections, so the metal reads as metal without any lights. */
function Studio() {
  const gl = useThree((state) => state.gl)
  const env = useMemo(() => {
    const pmrem = new PMREMGenerator(gl)
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    return texture
  }, [gl])
  useEffect(() => () => env.dispose(), [env])
  return <primitive object={env} attach="environment" />
}

function Logo({ still }: Readonly<{ still: boolean }>) {
  const mesh = useRef<Mesh>(null)
  const geometry = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${APPLE_PATH}"/></svg>`
    const shapes = new SVGLoader()
      .parse(svg)
      .paths.flatMap((p) => SVGLoader.createShapes(p))
    const g = new ExtrudeGeometry(shapes, {
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.3,
      bevelSegments: 8,
      curveSegments: 48,
    })
    g.center()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  // A slow turn back and forth, so the light runs across the edges.
  useFrame(({ clock }) => {
    if (!mesh.current || still) return
    const t = clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t * 0.7) * 0.55
    mesh.current.rotation.x = Math.sin(t * 0.45) * 0.08
  })

  return (
    // SVG's y axis points down: flip it, and draw both sides to keep the faces.
    <mesh ref={mesh} geometry={geometry} scale={[0.1, -0.1, 0.1]}>
      <meshPhysicalMaterial
        color="#e4e4e8"
        metalness={1}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        side={DoubleSide}
      />
    </mesh>
  )
}

/** A 3D, brushed-silver Apple mark that turns slowly; still under reduced motion. */
export default function AppleLogo3D({
  className,
}: Readonly<{ className?: string }>) {
  const still =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <Canvas
        dpr={[1, 2]}
        frameloop={still ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6], fov: 35 }}
      >
        <Studio />
        <Logo still={still} />
      </Canvas>
    </div>
  )
}
