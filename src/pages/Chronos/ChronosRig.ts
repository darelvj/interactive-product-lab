import type { DirectionalLight, Group, MeshPhysicalMaterial, PerspectiveCamera } from 'three'
import type { ChronosAssembly } from './ChronosAnatomyConfig'

export type ChronosSystem = 'gear' | 'escapement' | 'balance'
export type ChronosPlayback = 'paused' | 'normal' | 'slow'

export type ChronosRig = {
  root: Group | null
  presentation: Group | null
  camera: PerspectiveCamera | null
  invalidate: (() => void) | null
  assemblies: Record<ChronosAssembly, Group | null>
  crystalMaterial: MeshPhysicalMaterial | null
  keyLight: DirectionalLight | null
  fillLight: DirectionalLight | null
  rimLight: DirectionalLight | null
  renderCraft: (() => void) | null
  hour: Group | null
  minute: Group | null
  second: Group | null
  mainWheel: Group | null
  transferWheel: Group | null
  escapeWheel: Group | null
  balance: Group | null
  lever: Group | null
  tiltX: number
  tiltY: number
}

export function createChronosRig(): ChronosRig {
  return {
    root: null, presentation: null, camera: null, invalidate: null,
    assemblies: { crystal: null, bezel: null, hands: null, dial: null, movement: null, plate: null, case: null, back: null },
    crystalMaterial: null,
    keyLight: null, fillLight: null, rimLight: null,
    renderCraft: null,
    hour: null, minute: null, second: null, mainWheel: null, transferWheel: null, escapeWheel: null, balance: null, lever: null,
    tiltX: 0, tiltY: 0,
  }
}
