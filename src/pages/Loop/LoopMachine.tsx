import { useMemo } from 'react'
import { createLoopMaterials } from './LoopMaterials'
import { LoopTracks } from './LoopTracks'
import { LoopCollection, LoopDiverter, LoopFrame, LoopHelix, LoopLauncher, LoopOrbital } from './LoopMechanisms'
import { LoopExperimental } from './LoopExperimental'
import { createLoopRig } from './LoopRig'
import { LoopMotion } from './LoopMotion'
import { LoopGravityChamber } from './LoopGravityChamber'
import type { LoopTrafficSimulation } from './LoopTrafficSimulation'
import type { LoopStoryProgress } from './LoopStoryCamera'

export function LoopMachine({ reducedMotion, simulation, progress }: { reducedMotion: boolean; simulation: LoopTrafficSimulation; progress: LoopStoryProgress }) {
  const materials = useMemo(createLoopMaterials, [])
  const rig = useMemo(createLoopRig, [])

  return <group name="LOOP-apparatus">
    <ambientLight intensity={1.05} color="#ffffff" />
    <directionalLight position={[-4, 7, 7]} intensity={2.25} color="#fff7ee" />
    <directionalLight position={[5, 2, 3]} intensity={1.25} color="#b4e9ee" />
    <directionalLight ref={node => { rig.violetRimLight = node }} position={[-2, 3, -5]} intensity={.9} color="#c8b9ed" />
    <pointLight ref={node => { rig.coralAccentLight = node }} position={[2.4, -1.2, 2.5]} intensity={7} distance={6} decay={2} color="#efab96" />
    <LoopFrame materials={materials} />
    <LoopCollection materials={materials} />
    <LoopHelix materials={materials} />
    <LoopOrbital materials={materials} />
    <LoopExperimental materials={materials} rig={rig} />
    <LoopGravityChamber materials={materials} rig={rig} />
    <LoopTracks materials={materials} />
    <LoopLauncher materials={materials} rig={rig} />
    <LoopDiverter materials={materials} rig={rig} />
    <LoopMotion materials={materials} rig={rig} reducedMotion={reducedMotion} simulation={simulation} progress={progress} />
  </group>
}
