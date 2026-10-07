import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AIAvatar from './AIAvatar'
import AIOrb from './AIOrb'
import ParticleField from './ParticleField'

function Rig({ lite }: { lite?: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame(({ pointer, clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    const lerp = lite ? 0.012 : 0.045
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.x * (lite ? 0.1 : 0.22),
      lerp,
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * (lite ? 0.07 : 0.14),
      lerp,
    )
    group.current.position.y = Math.sin(t * 0.7) * 0.04
  })

  return (
    <group ref={group}>
      <AIAvatar />
      {!lite && <AIOrb position={[1.7, 2.1, -1.2]} />}
      {!lite && <ParticleField />}
      {lite && <ParticleField count={40} radius={4.6} size={0.028} />}
    </group>
  )
}

export default function AvatarScene({ lite = false }: { lite?: boolean }) {
  const dpr = useRef<[number, number]>([1, 1.5])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const small = window.matchMedia('(max-width: 768px)').matches
      dpr.current = lite ? [1, 1.25] : small ? [1, 1.4] : [1, 1.75]
    }
  }, [lite])

  return (
    <Canvas
      camera={{ position: [0, 0.55, 6.2], fov: 42 }}
      dpr={dpr.current}
      fallback={<WebGLFallback />}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
      className="!bg-transparent"
    >
      <ambientLight intensity={0.55} color="#aab8ff" />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#cfd8ff" />
      <pointLight position={[-4, 2, -2]} intensity={16} color="#6d5bff" decay={2} />
      <pointLight position={[2, -1, 3]} intensity={6} color="#3fd8ff" decay={2} />
      <Rig lite={lite} />
    </Canvas>
  )
}

function WebGLFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-pulse-orb h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.55),_rgba(99,102,241,0.15)_60%,_transparent)] blur-sm" />
    </div>
  )
}

export { WebGLFallback }