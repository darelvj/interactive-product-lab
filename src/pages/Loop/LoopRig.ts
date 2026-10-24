import type { DirectionalLight, Group, Mesh, PointLight } from 'three'

export type LoopRig = {
  launcherGate: Mesh | null
  diverterGate: Mesh | null
  portalEntrance: Group | null
  portalExit: Group | null
  platform: Group | null
  platformGate: Mesh | null
  disc: Group | null
  chamberLowerGate: Mesh | null
  chamberUpperGate: Mesh | null
  violetRimLight: DirectionalLight | null
  coralAccentLight: PointLight | null
}

export function createLoopRig(): LoopRig {
  return { launcherGate: null, diverterGate: null, portalEntrance: null, portalExit: null, platform: null, platformGate: null, disc: null, chamberLowerGate: null, chamberUpperGate: null, violetRimLight: null, coralAccentLight: null }
}
