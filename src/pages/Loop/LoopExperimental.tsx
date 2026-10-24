import { useMemo } from 'react'
import { CatmullRomCurve3 } from 'three'
import { Strut } from './LoopMechanisms'
import type { LoopMaterials } from './LoopMaterials'
import type { LoopRig } from './LoopRig'
import { loopModulePositions, loopTracks } from './LoopTrackGraph'

function PortalRing({ position, accent, materials, name, rig, endpoint }: {
  position: [number, number, number]
  accent: LoopMaterials['cyan']
  materials: LoopMaterials
  name: string
  rig: LoopRig
  endpoint: 'portalEntrance' | 'portalExit'
}) {
  return <group ref={node => { rig[endpoint] = node }} name={name} position={position} rotation={[0, Math.PI / 3, 0]} userData={{ passageRadius: .235, normal: [Math.sin(Math.PI / 3), 0, Math.cos(Math.PI / 3)] }}>
    <mesh material={materials.frame}><torusGeometry args={[.29, .047, 10, 40]} /></mesh>
    <mesh position={[0, 0, .035]} material={materials.steel}><torusGeometry args={[.245, .014, 6, 40]} /></mesh>
    <mesh position={[0, 0, .056]} material={accent}><torusGeometry args={[.21, .012, 6, 40]} /></mesh>
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(angle => <mesh key={angle} position={[.29 * Math.cos(angle), .29 * Math.sin(angle), .052]} material={materials.darkSteel}>
      <sphereGeometry args={[.026, 8, 6]} />
    </mesh>)}
  </group>
}

function MagneticPlatform({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const { platformUpper, platformTravel } = loopModulePositions
  return <group name="magnetic-lift" userData={{ upperY: platformUpper.y, lowerY: platformUpper.y - platformTravel, travel: platformTravel }}>
    {[3.79, 4.91].map(x => <group key={x}>
      <Strut from={[x, -1.1, -1.23]} to={[x, .74, -1.23]} material={materials.frame} radius={.028} />
      <Strut from={[x, .29, -1.23]} to={[x, .29, -.96]} material={materials.darkSteel} radius={.019} />
      <Strut from={[x, -.7, -1.23]} to={[x, -.7, -.96]} material={materials.darkSteel} radius={.019} />
      <mesh position={[x, .29, -1.16]} material={materials.steel}><sphereGeometry args={[.047, 8, 6]} /></mesh>
      <mesh position={[x, -.7, -1.16]} material={materials.steel}><sphereGeometry args={[.047, 8, 6]} /></mesh>
    </group>)}
    {[.29, -.7].map((y, index) => <group key={y} position={[platformUpper.x, y, platformUpper.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><torusGeometry args={[.62, .039, 8, 48]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={index === 0 ? materials.cyan : materials.violet}><torusGeometry args={[.56, .012, 6, 48]} /></mesh>
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map(angle => <mesh key={angle} position={[.59 * Math.cos(angle), 0, .59 * Math.sin(angle)]} material={materials.steel}><sphereGeometry args={[.045, 8, 6]} /></mesh>)}
      <mesh position={[.63, 0, 0]} material={index === 0 ? materials.platformStatus : materials.violet}><boxGeometry args={[.085, .025, .035]} /></mesh>
    </group>)}
    <group ref={node => { rig.platform = node }} name="magnetic-platform-motion" position={[platformUpper.x, platformUpper.y - .185, platformUpper.z]} userData={{ lowerOffsetY: -platformTravel, impactDipY: -.055 }}>
      <mesh material={materials.frame}><cylinderGeometry args={[.41, .36, .13, 32]} /></mesh>
      <mesh position={[0, .073, 0]} material={materials.graphite}><cylinderGeometry args={[.36, .36, .023, 32]} /></mesh>
      <mesh position={[0, .016, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}><torusGeometry args={[.385, .018, 6, 32]} /></mesh>
      <mesh position={[0, -.045, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.platformStatus}><torusGeometry args={[.37, .011, 6, 32]} /></mesh>
      <mesh ref={node => { rig.platformGate = node }} name="platform-release-gate" position={[.38, .083, 0]} userData={{ openAngle: -.55 }} material={materials.steel}>
        <boxGeometry args={[.1, .035, .22]} />
      </mesh>
      <mesh position={[0, .085, 0]} material={materials.darkSteel}><cylinderGeometry args={[.08, .08, .01, 16]} /></mesh>
    </group>
    <Strut from={[3.72, .29, -1.28]} to={[3.79, .29, -.96]} material={materials.darkSteel} />
    <Strut from={[4.96, .29, -1.28]} to={[4.91, .29, -.96]} material={materials.darkSteel} />
    <Strut from={[3.72, -.7, -1.28]} to={[3.79, -.7, -.96]} material={materials.darkSteel} />
    <Strut from={[4.96, -.7, -1.28]} to={[4.91, -.7, -.96]} material={materials.darkSteel} />
  </group>
}

function TransferDisc({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const center = loopModulePositions.discCenter
  const cradle = useMemo(() => new CatmullRomCurve3(loopTracks.discCarry.curve.getPoints(24).slice(0, 5).map(p => p.sub(center))), [center])
  return <group name="transfer-disc-mount">
    <Strut from={[center.x, -2.36, center.z - .16]} to={[center.x, center.y, center.z - .16]} material={materials.darkSteel} radius={.035} />
    <group ref={node => { rig.disc = node }} name="transfer-disc-pivot" position={[center.x, center.y, center.z]} userData={{ inputAngle: 150, outputAngle: 30 }}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><cylinderGeometry args={[.43, .43, .105, 32]} /></mesh>
      <mesh position={[0, 0, .063]} material={materials.darkSteel}><torusGeometry args={[.37, .018, 6, 40]} /></mesh>
      <mesh material={materials.recess}><tubeGeometry args={[cradle, 12, .052, 8, false]} /></mesh>
      <mesh position={[0, 0, .085]} material={materials.steel}><cylinderGeometry args={[.092, .092, .06, 18]} /></mesh>
      <mesh position={[0, 0, .12]} material={materials.discStatus}><sphereGeometry args={[.028, 8, 6]} /></mesh>
    </group>
  </group>
}

export function LoopExperimental({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const { portalEntrance, portalExit } = loopModulePositions
  return <group name="experimental-module">
    <mesh position={[4.45, -2.51, -1.17]} material={materials.frame}><boxGeometry args={[2.75, .11, .5]} /></mesh>
    <mesh position={[4.45, -2.44, -1.17]} material={materials.steel}><boxGeometry args={[2.52, .02, .38]} /></mesh>
    <Strut from={[2.34, -2.43, -.94]} to={[3.22, -2.43, -1.17]} material={materials.frame} radius={.037} />
    <Strut from={[3.72, -2.4, -1.25]} to={[3.72, 1.65, -1.21]} material={materials.frame} radius={.045} />
    <Strut from={[3.72, 1.65, -1.21]} to={[portalExit.x, portalExit.y, portalExit.z]} material={materials.darkSteel} radius={.029} />
    <Strut from={[2.38, -2.26, -.82]} to={[portalEntrance.x, portalEntrance.y, portalEntrance.z]} material={materials.darkSteel} radius={.036} />
    <Strut from={[4.7, -2.42, -1.18]} to={[4.7, -1.38, -1.22]} material={materials.darkSteel} radius={.03} />
    <Strut from={[3.78, -2.38, -1.3]} to={[3.78, -1.52, -1.42]} material={materials.darkSteel} radius={.028} />
    <group name="elevated-return-suspension">
      <Strut from={[5.58, 1.91, -2.08]} to={[6.43, 1.57, -2.1]} material={materials.darkSteel} radius={.016} />
      <Strut from={[3.65, 2.26, -2.12]} to={[3.72, 1.65, -1.21]} material={materials.darkSteel} radius={.016} />
      <Strut from={[1.35, 2.54, -1.64]} to={[1.35, 2.34, -.92]} material={materials.darkSteel} radius={.016} />
      {[[5.58, 1.91, -2.08], [3.65, 2.26, -2.12], [1.35, 2.54, -1.64]].map(([x, y, z]) => <mesh key={x} position={[x, y, z]} material={materials.steel}><sphereGeometry args={[.036, 8, 6]} /></mesh>)}
    </group>
    <PortalRing name="portal-entrance" endpoint="portalEntrance" position={[portalEntrance.x, portalEntrance.y, portalEntrance.z]} accent={materials.portalCyan} materials={materials} rig={rig} />
    <PortalRing name="portal-exit" endpoint="portalExit" position={[portalExit.x, portalExit.y, portalExit.z]} accent={materials.portalViolet} materials={materials} rig={rig} />
    <MagneticPlatform materials={materials} rig={rig} />
    <TransferDisc materials={materials} rig={rig} />
  </group>
}
