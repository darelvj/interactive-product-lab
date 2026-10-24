import { Strut } from './LoopMechanisms'
import type { LoopMaterials } from './LoopMaterials'
import type { LoopRig } from './LoopRig'
import { loopModulePositions } from './LoopTrackGraph'

export function LoopGravityChamber({ materials, rig }: { materials: LoopMaterials; rig: LoopRig }) {
  const { chamberLower, chamberUpper, chamberRingHeights } = loopModulePositions
  const x = chamberLower.x
  const z = chamberLower.z
  const ringMaterials = [materials.chamberRingLower, materials.chamberRingMiddle, materials.chamberRingUpper]

  return <group name="reverse-gravity-chamber" userData={{ receiver: chamberLower.toArray(), exit: chamberUpper.toArray() }}>
    <mesh position={[x, -2.49, z - .27]} material={materials.frame}><cylinderGeometry args={[.48, .53, .12, 32]} /></mesh>
    <mesh position={[x, -2.42, z - .27]} material={materials.steel}><cylinderGeometry args={[.4, .4, .025, 32]} /></mesh>
    <Strut from={[x, -2.37, z - .43]} to={[x, 1.57, z - .43]} material={materials.frame} radius={.045} />
    {[x - .43, x + .43].map(postX => <Strut key={postX} from={[postX, -1.85, z - .21]} to={[postX, 1.55, z - .21]} material={materials.darkSteel} radius={.026} />)}

    <group name="lower-receiver" position={[x, chamberLower.y - .18, z]}>
      <mesh material={materials.graphite}><cylinderGeometry args={[.31, .29, .15, 28]} /></mesh>
      <mesh position={[0, .085, 0]} material={materials.steel}><cylinderGeometry args={[.29, .29, .02, 28]} /></mesh>
      <mesh position={[0, .01, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.chamberStatus}><torusGeometry args={[.3, .012, 6, 32]} /></mesh>
      <mesh ref={node => { rig.chamberLowerGate = node }} name="receiver-gate" position={[.28, .18, 0]} material={materials.darkSteel}>
        <boxGeometry args={[.035, .22, .18]} />
      </mesh>
    </group>

    {chamberRingHeights.map((y, index) => <group key={y} name={`magnetic-ring-${index + 1}`} position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><torusGeometry args={[.36, .037, 8, 40]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .015, 0]} material={ringMaterials[index]}><torusGeometry args={[.32, .012, 6, 40]} /></mesh>
      <Strut from={[-.36, 0, -.16]} to={[-.43, 0, -.21]} material={materials.steel} radius={.018} />
      <Strut from={[.36, 0, -.16]} to={[.43, 0, -.21]} material={materials.steel} radius={.018} />
      <mesh position={[0, .025, -.36]} material={index === 2 ? materials.violet : materials.cyan}><boxGeometry args={[.1, .025, .025]} /></mesh>
    </group>)}

    <group name="upper-exit" position={[x, chamberUpper.y + .2, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.frame}><torusGeometry args={[.37, .045, 8, 40]} /></mesh>
      <mesh position={[0, -.075, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.violet}><torusGeometry args={[.31, .016, 6, 32]} /></mesh>
      <mesh ref={node => { rig.chamberUpperGate = node }} name="upper-release-gate" position={[-.29, -.13, 0]} material={materials.steel}>
        <boxGeometry args={[.04, .19, .2]} />
      </mesh>
    </group>
    <Strut from={[x, chamberUpper.y + .22, z - .31]} to={[x, chamberUpper.y + .22, z - .43]} material={materials.steel} radius={.026} />
  </group>
}
