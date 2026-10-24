import type { AmbientLight, Camera, DirectionalLight, Group, MeshBasicMaterial, MeshPhysicalMaterial } from 'three'

/** Mutable scene handles shared by the one AURA canvas and its scroll story. */
export type AuraRig = {
  turntable: Group | null
  fluidPose: Group | null
  root: Group | null
  body: Group | null
  shoulder: Group | null
  cap: Group | null
  capShell: Group | null
  capInsert: Group | null
  gasket: Group | null
  innerVessel: Group | null
  base: Group | null
  bodyMaterial: MeshPhysicalMaterial | null
  shoulderMaterial: MeshPhysicalMaterial | null
  neckMaterial: MeshPhysicalMaterial | null
  capMaterial: MeshPhysicalMaterial | null
  baseMaterial: MeshPhysicalMaterial | null
  innerMaterial: MeshPhysicalMaterial | null
  wordmarkMaterial: MeshBasicMaterial | null
  ambientLight: AmbientLight | null
  keyLight: DirectionalLight | null
  fillLight: DirectionalLight | null
  rimLight: DirectionalLight | null
  camera: Camera | null
  invalidate: (() => void) | null
  setFluidVisible: ((visible: boolean) => void) | null
  setWaterLevel: ((level: number) => void) | null
  disturbWater: (() => void) | null
}

export function createAuraRig(): AuraRig {
  return {
    turntable: null,
    fluidPose: null,
    root: null, body: null, shoulder: null, cap: null,
    capShell: null, capInsert: null, gasket: null, innerVessel: null,
    base: null, bodyMaterial: null, shoulderMaterial: null, neckMaterial: null,
    capMaterial: null, baseMaterial: null, innerMaterial: null, wordmarkMaterial: null,
    ambientLight: null, keyLight: null, fillLight: null, rimLight: null,
    camera: null, invalidate: null,
    setFluidVisible: null, setWaterLevel: null, disturbWater: null,
  }
}
