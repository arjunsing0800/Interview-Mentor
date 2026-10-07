import { useMemo } from 'react'
import * as THREE from 'three'
import { Float } from '@react-three/drei'
import { createDiscTexture, createGlowTexture } from './glowTexture'

/**
 * Stylized professional "AI interviewer" bust built from primitives.
 * Reads as a sleek holographic figure — no cartoon features.
 */
export default function AIAvatar() {
  const torsoPoints = useMemo(() => {
    const pts: THREE.Vector2[] = []
    const profile: Array<[number, number]> = [
      [0.02, 0.0],
      [0.42, 0.02],
      [0.52, 0.2],
      [0.56, 0.55],
      [0.62, 0.78],
      [0.6, 0.92],
      [0.3, 1.02],
      [0.27, 1.1],
    ]
    profile.forEach(([r, y]) => pts.push(new THREE.Vector2(r, y)))
    return pts
  }, [])

  const torsoGeo = useMemo(() => new THREE.LatheGeometry(torsoPoints, 48), [torsoPoints])
  const discTexture = useMemo(() => createDiscTexture(), [])

  return (
    <group position={[0, -0.5, 0]} scale={[1.02, 1.02, 1.02]}>
      {/* ===== Ground platform (feathered edges so it blends into the scene) ===== */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.85, 64]} />
        <meshStandardMaterial
          color="#0a0e20"
          map={discTexture}
          transparent
          opacity={0.92}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
      {/* ===== Feathered ground ring (softens the platform boundary) ===== */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.44, 64]} />
        <meshBasicMaterial
          color="#5a7dff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.35}>
        <group>
          {/* ===== Torso / suit ===== */}
          <mesh geometry={torsoGeo} position={[0, 0.1, 0]}>
            <meshPhysicalMaterial
              color="#151a33"
              metalness={0.5}
              roughness={0.42}
              clearcoat={0.35}
            />
          </mesh>

          {/* chest accent seam */}
          <mesh position={[0, 0.7, 0.41]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshBasicMaterial color="#3f6dff" />
          </mesh>
          <mesh position={[0, 0.58, 0.44]} rotation={[0.16, 0.3, 0]}>
            <boxGeometry args={[0.24, 0.015, 0.015]} />
            <meshBasicMaterial color="#5a7dff" transparent opacity={0.65} />
          </mesh>

          {/* chest AI core */}
          <mesh position={[0, 0.5, 0.46]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshBasicMaterial color="#9dbcff" />
          </mesh>
          <sprite position={[0, 0.5, 0.6]} scale={[0.5, 0.5, 1]}>
            <spriteMaterial
              map={createGlowTexture()}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>

          {/* ===== Shoulders ===== */}
          <mesh position={[-0.64, 0.9, 0]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshPhysicalMaterial
              color="#10152c"
              metalness={0.6}
              roughness={0.3}
              clearcoat={0.4}
            />
          </mesh>
          <mesh position={[0.64, 0.9, 0]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshPhysicalMaterial
              color="#10152c"
              metalness={0.6}
              roughness={0.3}
              clearcoat={0.4}
            />
          </mesh>

          {/* upper arms */}
          <mesh position={[-0.7, 0.68, 0.02]} rotation={[0.12, 0, -0.5]}>
            <cylinderGeometry args={[0.075, 0.09, 0.5, 20]} />
            <meshPhysicalMaterial color="#11152e" metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[0.7, 0.68, 0.02]} rotation={[0.12, 0, 0.5]}>
            <cylinderGeometry args={[0.075, 0.09, 0.5, 20]} />
            <meshPhysicalMaterial color="#11152e" metalness={0.55} roughness={0.4} />
          </mesh>

          {/* ===== Collar ===== */}
          <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.024, 12, 40]} />
            <meshStandardMaterial
              color="#2b3a6e"
              metalness={0.8}
              roughness={0.25}
              emissive="#1d2c5e"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* ===== Neck ===== */}
          <mesh position={[0, 1.16, 0]}>
            <cylinderGeometry args={[0.115, 0.13, 0.16, 28]} />
            <meshPhysicalMaterial
              color="#12172f"
              metalness={0.6}
              roughness={0.3}
              clearcoat={0.5}
            />
          </mesh>

          {/* ===== Head ===== */}
          <group position={[0, 1.46, 0]}>
            <mesh scale={[1.04, 1.18, 0.96]}>
              <sphereGeometry args={[0.31, 48, 48]} />
              <meshPhysicalMaterial
                color="#1a2140"
                metalness={0.72}
                roughness={0.18}
                clearcoat={0.9}
                clearcoatRoughness={0.12}
              />
            </mesh>

            {/* visor */}
            <mesh position={[0, 0.02, 0.2]} rotation={[0.18, 0, 0]}>
              <torusGeometry args={[0.26, 0.012, 10, 40, Math.PI]} />
              <meshBasicMaterial
                color="#3fd8ff"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* cheek light accents */}
            <mesh position={[-0.18, -0.09, 0.16]} rotation={[0.3, 0.1, 0]}>
              <boxGeometry args={[0.06, 0.015, 0.012]} />
              <meshBasicMaterial color="#4f7cff" transparent opacity={0.55} />
            </mesh>
            <mesh position={[0.18, -0.09, 0.16]} rotation={[0.3, -0.1, 0]}>
              <boxGeometry args={[0.06, 0.015, 0.012]} />
              <meshBasicMaterial color="#4f7cff" transparent opacity={0.55} />
            </mesh>
            {/* mic dot */}
            <mesh position={[0, -0.12, 0.19]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshBasicMaterial color="#8ab4ff" />
            </mesh>
          </group>

          {/* thin scan line across body */}
          <mesh position={[0, 0.55, 0.357]} rotation={[0.05, 0, 0]}>
            <boxGeometry args={[0.46, 0.006, 0.006]} />
            <meshBasicMaterial color="#8ab4ff" transparent opacity={0.35} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}