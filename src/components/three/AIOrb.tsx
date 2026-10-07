import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from './glowTexture'

/** Glowing AI orb — pulsing core + orbit ring + soft light. */
export default function AIOrb({ position }: { position: [number, number, number] }) {
  const core = useRef<THREE.Mesh>(null)
  const outer = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 1 + Math.sin(t * 1.6) * 0.05
    if (core.current) core.current.scale.setScalar(pulse)
    if (outer.current) {
      outer.current.scale.setScalar(pulse * 1.06)
      ;(outer.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 1.6) * 0.18
    }
    if (ring.current) ring.current.rotation.z = t * 0.4
    if (glow.current) {
      glow.current.scale.setScalar(4.4 + Math.sin(t * 1.6) * 0.25)
      ;(glow.current.material as THREE.SpriteMaterial).opacity =
        0.5 + Math.sin(t * 1.4) * 0.15
    }
  })

  return (
    <group position={position}>
      <mesh ref={core}>
        <sphereGeometry args={[0.42, 40, 40]} />
        <meshBasicMaterial color="#8ab4ff" />
      </mesh>

      <mesh ref={outer}>
        <sphereGeometry args={[0.52, 40, 40]} />
        <meshBasicMaterial
          color="#6f8bff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ring} rotation={[Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[0.8, 0.85, 48, 1]} />
        <meshBasicMaterial
          color="#8ab4ff"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, 0.6, 0]}>
        <ringGeometry args={[1.0, 1.03, 48, 1]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <sprite ref={glow} scale={[4.4, 4.4, 1]}>
        <spriteMaterial
          map={createGlowTexture()}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <pointLight color="#8ab4ff" intensity={26} distance={7} decay={2} />
    </group>
  )
}