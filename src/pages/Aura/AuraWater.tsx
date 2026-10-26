import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, DoubleSide, MathUtils, type Group, type Mesh } from 'three'
import type { AuraRig } from './AuraRig'

const bottom = -2.055
const top = 1.0
const sectors = 64
const sideRings = 28
const surfaceRings = 9
const profile: [number, number][] = [
  [bottom, .61], [-2.02, .65], [-1.94, .685], [-1.7, .7],
  [.82, .7], [.93, .67], [top, .62],
]

function radiusAt(height: number) {
  for (let index = 1; index < profile.length; index++) {
    const [endY, endRadius] = profile[index]
    if (height <= endY) {
      const [startY, startRadius] = profile[index - 1]
      return MathUtils.lerp(startRadius, endRadius, (height - startY) / (endY - startY))
    }
  }
  return profile[profile.length - 1][1]
}

// Invert integrated cross-sectional area, so the slider controls volume rather than raw height.
const volumeTable = Array.from({ length: 513 }, (_, index) => bottom + (top - bottom) * index / 512)
const cumulativeVolume = [0]
for (let index = 1; index < volumeTable.length; index++) {
  const start = volumeTable[index - 1]
  const end = volumeTable[index]
  cumulativeVolume.push(cumulativeVolume[index - 1] + (radiusAt(start) ** 2 + radiusAt(end) ** 2) * (end - start) / 2)
}

function heightForVolume(percent: number) {
  const target = MathUtils.clamp(percent, 0, 100) / 100 * cumulativeVolume[cumulativeVolume.length - 1]
  let low = 0
  let high = cumulativeVolume.length - 1
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (cumulativeVolume[middle] < target) low = middle
    else high = middle
  }
  const span = cumulativeVolume[high] - cumulativeVolume[low]
  return MathUtils.lerp(volumeTable[low], volumeTable[high], span ? (target - cumulativeVolume[low]) / span : 0)
}

function makeSideGeometry() {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array((sideRings + 1) * (sectors + 1) * 3), 3))
  const indices: number[] = []
  for (let ring = 0; ring < sideRings; ring++) {
    for (let segment = 0; segment < sectors; segment++) {
      const a = ring * (sectors + 1) + segment
      const b = a + sectors + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  geometry.setIndex(indices)
  return geometry
}

function makeSurfaceGeometry() {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array((1 + surfaceRings * (sectors + 1)) * 3), 3))
  const indices: number[] = []
  for (let segment = 0; segment < sectors; segment++) indices.push(0, segment + 2, segment + 1)
  for (let ring = 1; ring < surfaceRings; ring++) {
    const inner = 1 + (ring - 1) * (sectors + 1)
    const outer = inner + sectors + 1
    for (let segment = 0; segment < sectors; segment++) {
      indices.push(inner + segment, outer + segment + 1, outer + segment)
      indices.push(inner + segment, inner + segment + 1, outer + segment + 1)
    }
  }
  geometry.setIndex(indices)
  return geometry
}

export function AuraWater({ rig }: { rig: AuraRig }) {
  const group = useRef<Group>(null)
  const rim = useRef<Mesh>(null)
  const side = useMemo(makeSideGeometry, [])
  const surface = useMemo(makeSurfaceGeometry, [])
  const level = useRef(65)
  const visible = useRef(false)
  const rippleStart = useRef(0)
  const mounted = useRef(false)

  const updateSurface = useCallback((elapsed = 100) => {
    const height = heightForVolume(level.current)
    const radius = radiusAt(height)
    const positions = surface.getAttribute('position') as BufferAttribute
    const wave = elapsed < 3 ? .025 * Math.exp(-elapsed * 2.3) : 0
    positions.setXYZ(0, 0, height + wave * Math.sin(-elapsed * 13), 0)
    for (let ring = 1; ring <= surfaceRings; ring++) {
      const fraction = ring / surfaceRings
      const distance = fraction * radius
      const edgeFade = (1 - fraction * fraction) ** 2
      for (let segment = 0; segment <= sectors; segment++) {
        const angle = segment / sectors * Math.PI * 2
        const index = 1 + (ring - 1) * (sectors + 1) + segment
        positions.setXYZ(index, Math.cos(angle) * distance,
          height + wave * edgeFade * Math.sin(distance * 29 - elapsed * 13),
          Math.sin(angle) * distance)
      }
    }
    positions.needsUpdate = true
    surface.computeVertexNormals()
    if (rim.current) {
      rim.current.position.y = height
      rim.current.scale.set(radius, radius, 1)
    }
  }, [surface])

  const setLevel = useCallback((percent: number) => {
    level.current = MathUtils.clamp(percent, 0, 100)
    const height = heightForVolume(level.current)
    const positions = side.getAttribute('position') as BufferAttribute
    for (let ring = 0; ring <= sideRings; ring++) {
      const y = MathUtils.lerp(bottom, height, ring / sideRings)
      const radius = radiusAt(y)
      for (let segment = 0; segment <= sectors; segment++) {
        const angle = segment / sectors * Math.PI * 2
        positions.setXYZ(ring * (sectors + 1) + segment,
          Math.cos(angle) * radius, y, Math.sin(angle) * radius)
      }
    }
    positions.needsUpdate = true
    side.computeVertexNormals()
    updateSurface(rippleStart.current ? (performance.now() - rippleStart.current) / 1000 : 100)
    if (group.current) group.current.visible = visible.current && level.current > .05
    rig.invalidate?.()
  }, [rig, side, updateSurface])

  const setVisible = useCallback((value: boolean) => {
    visible.current = value
    if (group.current) group.current.visible = value && level.current > .05
    if (!value) { rippleStart.current = 0; updateSurface() }
    rig.invalidate?.()
  }, [rig, updateSurface])

  const disturb = useCallback(() => {
    if (!visible.current || level.current <= .05 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    rippleStart.current = performance.now()
    rig.invalidate?.()
  }, [rig])

  useEffect(() => {
    mounted.current = true
    rig.setFluidVisible = setVisible
    rig.setWaterLevel = setLevel
    rig.disturbWater = disturb
    setLevel(65)
    return () => {
      mounted.current = false
      rig.setFluidVisible = null
      rig.setWaterLevel = null
      rig.disturbWater = null
      // StrictMode replays effects; dispose only if the scene truly stays unmounted.
      queueMicrotask(() => { if (!mounted.current) { side.dispose(); surface.dispose() } })
    }
  }, [rig, setVisible, setLevel, disturb, side, surface])

  useFrame(() => {
    if (!visible.current || !rippleStart.current) return
    const elapsed = (performance.now() - rippleStart.current) / 1000
    if (elapsed >= 3) { rippleStart.current = 0; updateSurface(); return }
    updateSurface(elapsed)
    rig.invalidate?.()
  })

  return <group ref={group} name="aura-water-volume" visible={false}>
    <mesh geometry={side} name="contained-water">
      <meshPhysicalMaterial color="#6ca8b6" emissive="#1b4a57" emissiveIntensity={.18} metalness={0} roughness={.46} clearcoat={.15} clearcoatRoughness={.55} side={DoubleSide} />
    </mesh>
    <mesh geometry={surface} name="water-surface">
      <meshPhysicalMaterial color="#9dcdd4" metalness={.08} roughness={.19} clearcoat={.6} side={DoubleSide} />
    </mesh>
    <mesh ref={rim} rotation={[Math.PI / 2, 0, 0]} name="water-meniscus">
      <torusGeometry args={[1, .011, 6, sectors]} />
      <meshBasicMaterial color="#b2d9df" transparent opacity={.38} depthWrite={false} />
    </mesh>
  </group>
}
