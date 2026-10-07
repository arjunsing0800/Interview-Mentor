import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import type { Group } from 'three'

/**
 * Fixed full-viewport starfield background.
 * Sits at z-[1] — above the gradient background (z-0), below the
 * SplashCursor overlay (z-[5]) and the page content (z-10).
 */
function DriftingStars() {
  const group = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.012
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.05
  })

  return (
    <group ref={group}>
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.6}
      />
    </group>
  )
}

export default function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        className="!bg-transparent"
      >
        <DriftingStars />
      </Canvas>
    </div>
  )
}