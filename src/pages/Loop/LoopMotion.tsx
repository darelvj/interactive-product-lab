import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { SphereGeometry, type Mesh } from 'three'
import type { LoopMaterials } from './LoopMaterials'
import type { LoopRig } from './LoopRig'
import { MAX_LOOP_MARBLES, type LoopOperatingMode, type LoopRouteMode, type LoopTrafficSimulation } from './LoopTrafficSimulation'
import { loopModulePositions } from './LoopTrackGraph'
import type { LoopStoryProgress } from './LoopStoryCamera'

type LoopDebug = {
  snapshot: () => ReturnType<LoopTrafficSimulation['snapshot']>
  pause: () => void
  resume: () => void
  reset: () => void
  advance: (seconds: number) => void
  setCount: (count: number) => void
  setRouteMode: (mode: LoopRouteMode) => void
  setOperatingMode: (mode: LoopOperatingMode) => void
  requestMarble: () => ReturnType<LoopTrafficSimulation['requestMarble']>
  setTempo: (value: number) => void
}

declare global { interface Window { __loopDebug?: LoopDebug } }

export function LoopMotion({ materials, rig, reducedMotion, simulation: sim, progress }: { materials: LoopMaterials; rig: LoopRig; reducedMotion: boolean; simulation: LoopTrafficSimulation; progress: LoopStoryProgress }) {
  const marbleGeometry = useMemo(() => new SphereGeometry(.105, 24, 16), [])
  const marbles = useRef<(Mesh | null)[]>([])
  const { invalidate, setFrameloop } = useThree()

  const syncVisibility = useCallback(() => {
    sim.setEnvironmentPaused(document.hidden)
    setFrameloop(sim.paused ? 'demand' : 'always')
    invalidate()
  }, [sim, setFrameloop, invalidate])

  const applyPose = () => {
    for (let index = 0; index < marbles.current.length; index++) {
      const mesh = marbles.current[index]
      if (!mesh) continue
      const state = sim.marbles[index]
      if (!state) { mesh.visible = false; continue }
      mesh.position.copy(state.position)
      mesh.scale.setScalar(state.scale)
      mesh.visible = state.visible
    }
    if (rig.launcherGate) rig.launcherGate.position.x = .24 * sim.launcherGateOpen
    if (rig.diverterGate) rig.diverterGate.rotation.z = sim.diverterAngle
    if (rig.platform) rig.platform.position.y = loopModulePositions.platformUpper.y - .185 + sim.platformOffset
    if (rig.platformGate) rig.platformGate.rotation.z = -.55 * sim.platformGateOpen
    if (rig.disc) rig.disc.rotation.z = sim.discAngle
    if (rig.chamberLowerGate) rig.chamberLowerGate.position.y = .18 + .24 * sim.chamberLowerGateOpen
    if (rig.chamberUpperGate) rig.chamberUpperGate.position.y = -.13 + .22 * sim.chamberUpperGateOpen
    const chaos = sim.visualChaos
    if (rig.portalEntrance) rig.portalEntrance.scale.setScalar(1 + (.045 + .025 * chaos) * sim.entrancePulse)
    if (rig.portalExit) rig.portalExit.scale.setScalar(1 + (.045 + .025 * chaos) * sim.exitPulse)
    materials.portalCyan.emissiveIntensity = .28 + (.8 + .16 * chaos) * sim.entrancePulse
    materials.portalViolet.emissiveIntensity = .25 + (.78 + .2 * chaos) * sim.exitPulse
    materials.platformStatus.emissiveIntensity = .28 + (.55 + .16 * chaos) * sim.platformPulse
    materials.discStatus.emissiveIntensity = .18 + (.43 + .15 * chaos) * sim.discPulse
    materials.chamberRingLower.emissiveIntensity = .16 + (.72 + .18 * chaos) * sim.chamberRingPulse[0]
    materials.chamberRingMiddle.emissiveIntensity = .16 + (.72 + .18 * chaos) * sim.chamberRingPulse[1]
    materials.chamberRingUpper.emissiveIntensity = .16 + (.72 + .18 * chaos) * sim.chamberRingPulse[2]
    materials.chamberStatus.emissiveIntensity = .2 + (.55 + .14 * chaos) * sim.chamberStatusPulse
    if (rig.violetRimLight) rig.violetRimLight.intensity = .9 + .32 * chaos + .13 * progress.finale
    if (rig.coralAccentLight) rig.coralAccentLight.intensity = 7 + 1.15 * chaos + .25 * progress.finale
  }

  useFrame((_, delta) => {
    sim.step(Math.min(delta, .05))
    applyPose()
  })

  useEffect(() => {
    // Reduced motion starts still, but the visitor can explicitly resume.
    if (reducedMotion) sim.pause()
    syncVisibility()
    applyPose()
  }, [reducedMotion, sim, syncVisibility])

  useEffect(() => {
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [syncVisibility])

  useEffect(() => sim.subscribe(() => {
    setFrameloop(sim.paused ? 'demand' : 'always')
    applyPose()
    invalidate()
  }), [sim, setFrameloop, invalidate])

  useEffect(() => () => marbleGeometry.dispose(), [marbleGeometry])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const debug: LoopDebug = {
      snapshot: () => sim.snapshot(),
      pause: () => sim.pause(),
      resume: () => sim.resume(),
      reset: () => { sim.reset(); applyPose(); invalidate() },
      advance: seconds => { sim.advance(seconds); applyPose(); invalidate() },
      setCount: count => { sim.setCount(count); applyPose(); invalidate() },
      setRouteMode: mode => sim.setRouteMode(mode),
      setOperatingMode: mode => sim.setOperatingMode(mode),
      requestMarble: () => sim.requestMarble(),
      setTempo: value => sim.setTempo(value),
    }
    window.__loopDebug = debug
    return () => { if (window.__loopDebug === debug) delete window.__loopDebug }
  }, [sim, invalidate])

  const finishes = [materials.sphere, materials.sphereCoral, materials.sphereViolet]
  return <group name="circulating-marbles">{Array.from({ length: MAX_LOOP_MARBLES }, (_, index) => <mesh
    key={index}
    ref={node => { marbles.current[index] = node }}
    name={`LOOP-slot-${index + 1}`}
    visible={index < sim.marbles.length}
    position={sim.marbles[index]?.position.toArray() ?? [0, 0, 0]}
    geometry={marbleGeometry}
    material={finishes[index % finishes.length]}
  />)}</group>
}
