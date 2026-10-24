import { useMemo, type ReactNode } from 'react'
import { Path, Shape } from 'three'

export function AnnularPlate({ outer, inner, depth, z, children, name }: {
  outer: number; inner: number; depth: number; z: number; children: ReactNode; name: string
}) {
  const profile = useMemo(() => {
    const shape = new Shape()
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
    const aperture = new Path()
    aperture.absarc(0, 0, inner, 0, Math.PI * 2, true)
    shape.holes.push(aperture)
    return shape
  }, [outer, inner])
  return <mesh name={name} position={[0, 0, z]}>
    <extrudeGeometry args={[profile, { depth, steps: 1, curveSegments: 64, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 }]} />
    {children}
  </mesh>
}

export function ShapedPlate({ points, depth, z, name, children }: {
  points: readonly (readonly [number, number])[]; depth: number; z: number; name: string; children: ReactNode
}) {
  const profile = useMemo(() => {
    const shape = new Shape()
    points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y))
    shape.closePath()
    return shape
  }, [points])
  return <mesh name={name} position={[0, 0, z]}>
    <extrudeGeometry args={[profile, { depth, steps: 1, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 }]} />
    {children}
  </mesh>
}
