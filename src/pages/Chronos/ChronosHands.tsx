import { useMemo } from 'react'
import { Shape } from 'three'
import { champagne, edgeMetal, paleMarker } from './ChronosMaterials'
import type { ChronosRig } from './ChronosRig'

function HandBlade({ length, width, z, name }: { length: number; width: number; z: number; name: string }) {
  const profile = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-width * 0.7, -0.16)
    shape.lineTo(width * 0.7, -0.16)
    shape.lineTo(width, 0.07)
    shape.lineTo(width * 0.68, length * 0.78)
    shape.lineTo(0, length)
    shape.lineTo(-width * 0.68, length * 0.78)
    shape.lineTo(-width, 0.07)
    shape.closePath()
    return shape
  }, [length, width])
  return <mesh name={name} position={[0, 0, z]}>
    <extrudeGeometry args={[profile, { depth: 0.024, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.005, bevelSegments: 1 }]} />
    <meshStandardMaterial {...paleMarker} />
  </mesh>
}

export function ChronosHands({ rig }: { rig: ChronosRig }) {
  return <group name="central-hand-assembly">
    <group ref={node => { rig.hour = node }} name="hour-hand" rotation={[0, 0, -Math.PI * (10 / 6 + 8 / 360)]}>
      <HandBlade name="angular-hour-blade" length={0.55} width={0.055} z={0.37} />
      <mesh position={[0, 0.32, 0.402]}><boxGeometry args={[0.012, 0.24, 0.009]} /><meshStandardMaterial {...movementDarkAccent} /></mesh>
    </group>
    <group ref={node => { rig.minute = node }} name="minute-hand" rotation={[0, 0, -Math.PI * (8 / 30)]}>
      <HandBlade name="angular-minute-blade" length={0.86} width={0.038} z={0.414} />
      <mesh position={[0, 0.49, 0.447]}><boxGeometry args={[0.009, 0.4, 0.009]} /><meshStandardMaterial {...movementDarkAccent} /></mesh>
    </group>
    <group ref={node => { rig.second = node }} name="seconds-hand" rotation={[0, 0, Math.PI * 0.27]}>
      <mesh position={[0, 0.39, 0.47]}><boxGeometry args={[0.012, 1.04, 0.014]} /><meshStandardMaterial {...champagne} /></mesh>
      <mesh position={[0, -0.21, 0.47]}><boxGeometry args={[0.039, 0.23, 0.014]} /><meshStandardMaterial {...champagne} /></mesh>
    </group>
    <mesh position={[0, 0, 0.49]}><sphereGeometry args={[0.052, 12, 8]} /><meshStandardMaterial {...edgeMetal} /></mesh>
  </group>
}

const movementDarkAccent = { name: 'hand-inlay', color: '#737d77', metalness: 0.38, roughness: 0.45 }
