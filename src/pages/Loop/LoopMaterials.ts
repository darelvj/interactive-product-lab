import { Color, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export function createLoopMaterials() {
  return {
    frame: new MeshStandardMaterial({ color: '#252c38', metalness: .55, roughness: .42 }),
    graphite: new MeshStandardMaterial({ color: '#343e4b', metalness: .6, roughness: .34 }),
    recess: new MeshStandardMaterial({ color: '#17212a', metalness: .35, roughness: .55 }),
    steel: new MeshStandardMaterial({ color: '#9eacb3', metalness: .78, roughness: .33 }),
    darkSteel: new MeshStandardMaterial({ color: '#68747f', metalness: .75, roughness: .36 }),
    acrylic: new MeshPhysicalMaterial({ color: '#97b5be', metalness: 0, roughness: .3, transparent: true, opacity: .43, depthWrite: false, side: DoubleSide }),
    cyan: new MeshStandardMaterial({ color: '#74bfc5', emissive: new Color('#58c9d1'), emissiveIntensity: .25, metalness: .15, roughness: .38 }),
    violet: new MeshStandardMaterial({ color: '#b5a4e8', emissive: new Color('#8d73ca'), emissiveIntensity: .22, metalness: .25, roughness: .42 }),
    coral: new MeshStandardMaterial({ color: '#f39a79', emissive: new Color('#df765f'), emissiveIntensity: .18, metalness: .25, roughness: .42 }),
    portalCyan: new MeshStandardMaterial({ color: '#88dfe2', emissive: new Color('#58c9d1'), emissiveIntensity: .28, metalness: .12, roughness: .4 }),
    portalViolet: new MeshStandardMaterial({ color: '#b5a4e8', emissive: new Color('#8d73ca'), emissiveIntensity: .25, metalness: .12, roughness: .4 }),
    platformStatus: new MeshStandardMaterial({ color: '#83cbd0', emissive: new Color('#58c9d1'), emissiveIntensity: .28, metalness: .1, roughness: .38 }),
    discStatus: new MeshStandardMaterial({ color: '#f39a79', emissive: new Color('#df765f'), emissiveIntensity: .18, metalness: .2, roughness: .4 }),
    chamberRingLower: new MeshStandardMaterial({ color: '#88dfe2', emissive: new Color('#58c9d1'), emissiveIntensity: .16, metalness: .18, roughness: .38 }),
    chamberRingMiddle: new MeshStandardMaterial({ color: '#a3cedf', emissive: new Color('#7ab8d5'), emissiveIntensity: .16, metalness: .18, roughness: .38 }),
    chamberRingUpper: new MeshStandardMaterial({ color: '#b5a4e8', emissive: new Color('#8d73ca'), emissiveIntensity: .16, metalness: .18, roughness: .38 }),
    chamberStatus: new MeshStandardMaterial({ color: '#88dfe2', emissive: new Color('#58c9d1'), emissiveIntensity: .2, metalness: .12, roughness: .38 }),
    sphere: new MeshPhysicalMaterial({ color: '#e0e9eb', metalness: .72, roughness: .19, clearcoat: .5, clearcoatRoughness: .22 }),
    sphereCoral: new MeshPhysicalMaterial({ color: '#df9b88', metalness: .66, roughness: .23, clearcoat: .4, clearcoatRoughness: .25 }),
    sphereViolet: new MeshPhysicalMaterial({ color: '#b9aad2', metalness: .68, roughness: .22, clearcoat: .42, clearcoatRoughness: .24 }),
  }
}

export type LoopMaterials = ReturnType<typeof createLoopMaterials>
