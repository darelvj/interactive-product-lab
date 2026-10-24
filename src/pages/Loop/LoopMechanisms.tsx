import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { loopTracks } from './LoopTrackGraph'
import type { LoopMaterials } from './LoopMaterials'
import type { LoopRig } from './LoopRig'

export function Strut({ from, to, radius = .026, material }: { from: [number, number, number]; to: [number, number, number]; radius?: number; material: LoopMaterials[keyof LoopMaterials] }) {
  const a = useMemo(() => new Vector3(...from), [from[0], from[1], from[2]])
  const b = useMemo(() => new Vector3(...to), [to[0], to[1], to[2]])
  const direction = useMemo(() => b.clone().sub(a), [a, b])
  const orientation = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()), [direction])
  return <mesh position={a.clone().add(b).multiplyScalar(.5)} quaternion={orientation} material={material}>
    <cylinderGeometry args={[radius, radius, direction.length(), 8]} />
  </mesh>
}

export function LoopFrame({ materials }: { materials: LoopMaterials }) {
  return <group name="structural-frame">
    <mesh position={[0, -2.53, -.57]} material={materials.frame}><boxGeometry args={[5.32, .19, 1.24]} /></mesh>
    <mesh position={[0, -2.39, -.6]} material={materials.steel}><boxGeometry args={[4.94, .025, 1.02]} /></mesh>
    {[-2.38, 2.38].map(x => <group key={x}>
      <mesh position={[x, -.06, -.92]} material={materials.frame}><boxGeometry args={[.12, 4.82, .17]} /></mesh>
      <mesh position={[x, -.06, -.815]} material={materials.darkSteel}><boxGeometry args={[.028, 4.7, .025]} /></mesh>
      <mesh position={[x, -2.37, -.67]} material={materials.steel}><cylinderGeometry args={[.11, .11, .055, 12]} /></mesh>
    </group>)}
    <mesh position={[0, 2.34, -.92]} material={materials.frame}><boxGeometry args={[4.86, .11, .16]} /></mesh>
    <mesh position={[0, -.08, -1.07]} material={materials.recess}><boxGeometry args={[.37, 4.45, .12]} /></mesh>
    <Strut from={[-2.33, -2.34, -.88]} to={[-1.47, 1.98, -.97]} material={materials.darkSteel} radius={.021} />
    <Strut from={[2.33, -2.34, -.88]} to={[1.53, 1.93, -.97]} material={materials.darkSteel} radius={.021} />
    {[-1.65, 1.63].map(x => <mesh key={x} position={[x, -2.39, -.02]} rotation={[Math.PI / 2, 0, 0]} material={materials.recess}><torusGeometry args={[.075, .014, 6, 16]} /></mesh>)}
  </group>
}

export function LoopLauncher({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const stage = loopTracks.launch.start
  return <group name="launcher-chamber" position={[stage.x, stage.y, stage.z]}>
    <mesh position={[0, .34, -.13]} material={materials.frame}><cylinderGeometry args={[.36, .31, .12, 24]} /></mesh>
    <mesh position={[0, .25, -.13]} material={materials.steel}><cylinderGeometry args={[.23, .23, .025, 24]} /></mesh>
    <mesh position={[0, -.28, -.13]} material={materials.graphite}><cylinderGeometry args={[.32, .28, .12, 24]} /></mesh>
    {[.24, -.23].map(y => <mesh key={y} position={[0, y, -.13]} rotation={[Math.PI / 2, 0, 0]} material={materials.darkSteel}><torusGeometry args={[.28, .025, 8, 32]} /></mesh>)}
    {[-.25, .25].map(x => <mesh key={x} position={[x, 0, -.29]} material={materials.steel}><cylinderGeometry args={[.018, .018, .5, 8]} /></mesh>)}
    <mesh position={[.27, .15, .02]} material={materials.cyan}><sphereGeometry args={[.027, 8, 6]} /></mesh>
    <mesh position={[-.27, .15, .02]} material={materials.cyan}><sphereGeometry args={[.027, 8, 6]} /></mesh>
    <mesh ref={node => { rig.launcherGate = node }} position={[0, -.39, .05]} material={materials.graphite}><boxGeometry args={[.29, .065, .22]} /></mesh>
  </group>
}

export function LoopDiverter({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const junction = loopTracks.launch.end
  return <group name="diverter-junction" position={[junction.x, junction.y, junction.z]}>
    <mesh position={[0, -.025, -.21]} rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><cylinderGeometry args={[.26, .26, .085, 24]} /></mesh>
    <mesh position={[0, -.025, -.15]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}><torusGeometry args={[.21, .02, 8, 24]} /></mesh>
    <mesh ref={node => { rig.diverterGate = node }} name="route-diverter-gate" position={[0, -.03, .14]} rotation={[0, 0, -.23]} material={materials.graphite}><boxGeometry args={[.43, .056, .08]} /></mesh>
    <mesh position={[0, -.03, .2]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}><cylinderGeometry args={[.056, .056, .045, 16]} /></mesh>
    <mesh position={[-.29, -.14, .02]} material={materials.cyan}><sphereGeometry args={[.022, 8, 6]} /></mesh>
    <mesh position={[.29, -.14, .02]} material={materials.violet}><sphereGeometry args={[.022, 8, 6]} /></mesh>
  </group>
}

export function LoopHelix({ materials }: { materials: LoopMaterials }) {
  return <group name="route-a-helix">
    <mesh position={[-1.5, -.11, .12]} material={materials.frame}><cylinderGeometry args={[.095, .11, 2.48, 16]} /></mesh>
    <mesh position={[-1.5, 1.16, .12]} material={materials.steel}><cylinderGeometry args={[.19, .19, .055, 16]} /></mesh>
    <mesh position={[-1.5, -1.35, .12]} material={materials.steel}><cylinderGeometry args={[.18, .18, .055, 16]} /></mesh>
    {[.75, .2, -.35, -.9].map((y, index) => <group key={y}>
      <Strut from={[-1.5, y, .12]} to={[-.96, y, .12]} material={materials.darkSteel} radius={.018} />
      <mesh position={[-1.5, y, .12]} material={index === 0 ? materials.cyan : materials.steel}><sphereGeometry args={[.045, 8, 6]} /></mesh>
    </group>)}
  </group>
}

export function LoopOrbital({ materials }: { materials: LoopMaterials }) {
  return <group name="route-b-orbital-loop">
    <mesh position={[1.52, .02, -.31]} material={materials.frame}><torusGeometry args={[1.05, .037, 8, 80]} /></mesh>
    <mesh position={[1.52, .02, -.37]} rotation={[Math.PI / 2, 0, 0]} material={materials.graphite}><cylinderGeometry args={[.2, .2, .09, 24]} /></mesh>
    <mesh position={[1.52, .02, -.3]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}><torusGeometry args={[.115, .016, 6, 24]} /></mesh>
    {[45, 135, 225, 315].map(degrees => {
      const angle = degrees * Math.PI / 180
      return <Strut key={degrees} from={[1.52, .02, -.37]} to={[1.52 + .96 * Math.cos(angle), .02 + .96 * Math.sin(angle), -.37]} material={materials.darkSteel} radius={.021} />
    })}
    <mesh position={[2.57, .02, -.31]} material={materials.coral}><sphereGeometry args={[.037, 8, 6]} /></mesh>
  </group>
}

export function LoopCollection({ materials }: { materials: LoopMaterials }) {
  return <group name="collection-and-return-elevator">
    <mesh position={[0, -1.88, -.12]} material={materials.frame}><boxGeometry args={[.85, .17, .68]} /></mesh>
    <mesh position={[0, -1.76, -.1]} material={materials.steel}><boxGeometry args={[.7, .025, .5]} /></mesh>
    <mesh position={[.32, .08, -.96]} material={materials.recess}><boxGeometry args={[.49, 4.5, .13]} /></mesh>
    {[-.01, .65].map(x => <mesh key={x} position={[x, .08, -.71]} material={materials.darkSteel}><boxGeometry args={[.038, 4.44, .09]} /></mesh>)}
    {Array.from({ length: 9 }, (_, index) => -1.74 + index * .49).map(y => <group key={y}>
      <mesh position={[.32, y, -.61]} material={materials.steel}><boxGeometry args={[.34, .045, .13]} /></mesh>
      <mesh position={[.32, y + .055, -.54]} material={materials.graphite}><boxGeometry args={[.29, .085, .035]} /></mesh>
    </group>)}
    {[-1.99, 2.23].map(y => <group key={y} position={[.32, y, -.59]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><cylinderGeometry args={[.22, .22, .11, 24]} /></mesh>
      <mesh position={[0, 0, .07]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}><torusGeometry args={[.15, .023, 8, 24]} /></mesh>
    </group>)}
    <mesh position={[.32, 1.54, -.48]} material={materials.cyan}><boxGeometry args={[.22, .018, .022]} /></mesh>
  </group>
}
