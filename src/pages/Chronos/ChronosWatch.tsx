import { memo } from 'react'
import { ChronosBezel, ChronosCase, ChronosCaseBack, ChronosStrap } from './ChronosCase'
import { ChronosCrystal, ChronosDial } from './ChronosDial'
import { ChronosHands } from './ChronosHands'
import { ChronosGearTrain, ChronosMovementPlate } from './ChronosMovement'
import type { ChronosRig } from './ChronosRig'

export const ChronosWatch = memo(function ChronosWatch({ rig }: { rig: ChronosRig }) {
  return <group ref={node => { rig.root = node }} name="chronos-watch" rotation={[-0.13, -0.2, -0.13]}>
    <group ref={node => { rig.assemblies.case = node }} name="case-assembly"><ChronosStrap /><ChronosCase /></group>
    <group ref={node => { rig.assemblies.back = node }} name="case-back-assembly"><ChronosCaseBack /></group>
    <group ref={node => { rig.assemblies.plate = node }} name="movement-plate-assembly"><ChronosMovementPlate /></group>
    <group ref={node => { rig.assemblies.movement = node }} name="gear-train-assembly"><ChronosGearTrain rig={rig} /></group>
    <group ref={node => { rig.assemblies.dial = node }} name="dial-assembly"><ChronosDial /></group>
    <group ref={node => { rig.assemblies.hands = node }} name="hands-assembly"><ChronosHands rig={rig} /></group>
    <group ref={node => { rig.assemblies.bezel = node }} name="bezel-assembly"><ChronosBezel /></group>
    <group ref={node => { rig.assemblies.crystal = node }} name="crystal-assembly"><ChronosCrystal rig={rig} /></group>
  </group>
})
