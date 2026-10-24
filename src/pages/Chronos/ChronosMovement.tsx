import { useMemo } from 'react'
import { CatmullRomCurve3, Path, Shape, Vector3, type Group } from 'three'
import { AnnularPlate, ShapedPlate } from './ChronosGeometry'
import { bridgeMetal, champagne, edgeMetal, movementDark } from './ChronosMaterials'
import type { ChronosRig } from './ChronosRig'
import { GEAR_TEETH } from './ChronosTime'

function makeGearProfile(radius: number, teeth: number, openings: number) {
  const profile = new Shape()
  const root = radius - 0.035
  for (let tooth = 0; tooth < teeth; tooth++) {
    const center = tooth * Math.PI * 2 / teeth
    const pitch = Math.PI * 2 / teeth
    const points = [
      [center - pitch * 0.5, root],
      [center - pitch * 0.3, radius],
      [center + pitch * 0.3, radius],
      [center + pitch * 0.5, root],
    ]
    for (const [angle, extent] of points) {
      const x = Math.cos(angle) * extent
      const y = Math.sin(angle) * extent
      if (tooth === 0 && angle === points[0][0]) profile.moveTo(x, y)
      else profile.lineTo(x, y)
    }
  }
  profile.closePath()
  for (let opening = 0; opening < openings; opening++) {
    const angle = opening * Math.PI * 2 / openings
    const cutout = new Path()
    cutout.absarc(Math.sin(angle) * radius * 0.53, Math.cos(angle) * radius * 0.53, radius * 0.16, 0, Math.PI * 2, true)
    profile.holes.push(cutout)
  }
  return profile
}

export function ChronosGear({ name, x, y, radius, teeth, openings, color, onRef }: {
  name: string; x: number; y: number; radius: number; teeth: number; openings: number; color: string; onRef: (node: Group | null) => void
}) {
  const profile = useMemo(() => makeGearProfile(radius, teeth, openings), [radius, teeth, openings])
  return <group ref={onRef} name={name} position={[x, y, -0.01]}>
    <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]} name="wheel-jewel-setting">
      <cylinderGeometry args={[0.087, 0.087, 0.035, 16]} />
      <meshStandardMaterial {...movementDark} />
    </mesh>
    <mesh name={`${name}-wheel`}>
      <extrudeGeometry args={[profile, { depth: 0.075, steps: 1, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.006, bevelThickness: 0.006, curveSegments: 12 }]} />
      <meshStandardMaterial name={name} color={color} metalness={0.6} roughness={0.44} />
    </mesh>
    <mesh position={[0, 0, 0.082]} name="machined-wheel-ring">
      <torusGeometry args={[radius * 0.68, 0.009, 6, 48]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>
    <mesh position={[0, 0, 0.086]} name="arbor-bearing">
      <torusGeometry args={[0.066, 0.011, 6, 20]} />
      <meshStandardMaterial {...movementDark} />
    </mesh>
    <mesh position={[0, 0, 0.095]} name="arbor-cap">
      <sphereGeometry args={[0.043, 12, 8]} />
      <meshStandardMaterial {...champagne} />
    </mesh>
  </group>
}

function ChronosBalance({ rig }: { rig: ChronosRig }) {
  const hairspring = useMemo(() => {
    const points = Array.from({ length: 65 }, (_, index) => {
      const t = index / 64
      const angle = t * Math.PI * 5
      const radius = 0.025 + t * 0.17
      return new Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius, 0.052)
    })
    return new CatmullRomCurve3(points)
  }, [])
  return <group ref={node => { rig.balance = node }} name="balance-wheel" position={[0.48, -0.7, 0.04]}>
    <mesh name="balance-rim"><torusGeometry args={[0.255, 0.025, 8, 48]} /><meshStandardMaterial {...champagne} /></mesh>
    {[0, Math.PI / 2].map(angle => <mesh key={angle} rotation={[0, 0, angle]} name="balance-spoke">
      <boxGeometry args={[0.037, 0.46, 0.027]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>)}
    <mesh name="hairspring"><tubeGeometry args={[hairspring, 72, 0.004, 4, false]} /><meshStandardMaterial {...edgeMetal} /></mesh>
    <mesh position={[0, 0, 0.082]}><sphereGeometry args={[0.055, 12, 8]} /><meshStandardMaterial {...champagne} /></mesh>
    <mesh position={[0, 0, -0.045]} name="balance-bearing"><torusGeometry args={[0.072, 0.012, 6, 24]} /><meshStandardMaterial {...movementDark} /></mesh>
  </group>
}

function EscapementLever({ rig }: { rig: ChronosRig }) {
  return <group ref={node => { rig.lever = node }} name="escapement-lever" position={[0.57, -0.3, 0.13]}>
    <mesh rotation={[0, 0, -0.13]} name="lever-arm">
      <boxGeometry args={[0.038, 0.265, 0.029]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>
    <mesh position={[0.012, 0.132, 0]} name="pallet-fork"><boxGeometry args={[0.16, 0.026, 0.029]} /><meshStandardMaterial {...champagne} /></mesh>
    <mesh position={[-0.06, 0.143, 0.015]} name="entry-pallet"><boxGeometry args={[0.023, 0.052, 0.03]} /><meshStandardMaterial {...movementDark} /></mesh>
    <mesh position={[0.08, 0.143, 0.015]} name="exit-pallet"><boxGeometry args={[0.023, 0.052, 0.03]} /><meshStandardMaterial {...movementDark} /></mesh>
    <mesh position={[0, -0.135, 0.012]} name="lever-pivot"><sphereGeometry args={[0.043, 10, 8]} /><meshStandardMaterial {...champagne} /></mesh>
  </group>
}

function BridgeScrew({ x, y }: { x: number; y: number }) {
  return <group position={[x, y, 0.175]} name="bridge-screw">
    <mesh position={[0, 0, -.004]}><torusGeometry args={[.038, .006, 5, 16]} /><meshStandardMaterial {...edgeMetal} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.032, 0.032, 0.012, 12]} /><meshStandardMaterial {...champagne} /></mesh>
    <mesh position={[0, 0, 0.008]} rotation={[0, 0, Math.PI / 5]}><boxGeometry args={[0.038, 0.005, 0.003]} /><meshStandardMaterial {...movementDark} /></mesh>
  </group>
}

const upperBridge = [
  [-0.99, 0.68], [-0.83, 0.82], [-0.49, 0.51], [0.05, 0.49],
  [0.33, 0.58], [0.46, 0.45], [0.09, 0.34], [-0.54, 0.37],
] as const
const lowerBridge = [
  [-0.95, -0.54], [-0.78, -0.74], [-0.31, -0.42], [0.18, -0.33],
  [0.43, -0.14], [0.55, -0.27], [0.24, -0.5], [-0.3, -0.59],
] as const

function Bridges() {
  return <group name="movement-bridges">
    <ShapedPlate points={upperBridge} depth={0.036} z={0.115} name="upper-machined-bridge"><meshStandardMaterial {...bridgeMetal} /></ShapedPlate>
    <ShapedPlate points={lowerBridge} depth={0.036} z={0.105} name="lower-machined-bridge"><meshStandardMaterial {...bridgeMetal} /></ShapedPlate>
    {[[-0.87, 0.67], [0.33, 0.49], [-0.84, -0.62], [0.39, -0.32]].map(([x, y], index) => <BridgeScrew key={index} x={x} y={y} />)}
  </group>
}

export function ChronosMovementPlate() {
  return <group name="movement-mainplate">
    <AnnularPlate name="recessed-mainplate" outer={1.13} inner={0.88} z={-0.245} depth={0.045}><meshStandardMaterial {...movementDark} /></AnnularPlate>
    <mesh position={[0, 0, -0.19]} name="mainplate-machined-edge">
      <torusGeometry args={[1.095, 0.012, 6, 64]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>
    <mesh position={[0, 0, -0.215]} name="central-arbor-support">
      <torusGeometry args={[0.13, 0.024, 6, 24]} />
      <meshStandardMaterial {...bridgeMetal} />
    </mesh>
  </group>
}

export function ChronosGearTrain({ rig }: { rig: ChronosRig }) {
  return <group name="open-worked-gear-train">
    <ChronosGear name="main-wheel" x={-0.43} y={0.33} radius={0.38} teeth={GEAR_TEETH.main} openings={5} color="#b9a27b" onRef={node => { rig.mainWheel = node }} />
    <ChronosGear name="transfer-wheel" x={0.18} y={0.18} radius={0.26} teeth={GEAR_TEETH.transfer} openings={4} color="#9aa7a2" onRef={node => { rig.transferWheel = node }} />
    <ChronosGear name="escape-wheel" x={0.565} y={-0.025} radius={0.18} teeth={GEAR_TEETH.escape} openings={3} color="#cfb88b" onRef={node => { rig.escapeWheel = node }} />
    <ChronosBalance rig={rig} />
    <EscapementLever rig={rig} />
    <Bridges />
  </group>
}
