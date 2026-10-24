import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Color, Mesh, MeshStandardMaterial } from 'three'
import { chronosFinishes, type ChronosFinishId, type ChronosMaterialRole } from './ChronosFinishes'
import type { ChronosRig } from './ChronosRig'

/** Materials, lighting, scroll, and clock motion never write the same property. */
export function useChronosFinish(rig: ChronosRig, ready: boolean, selected: ChronosFinishId) {
  const first = useRef(true)
  useEffect(() => {
    if (!ready || !rig.root || !rig.invalidate) return
    const preset = chronosFinishes[selected]
    const changes: { material: MeshStandardMaterial; color: Color; metalness: number; roughness: number; target: Color; targetMetalness: number; targetRoughness: number }[] = []
    rig.root.traverse(object => {
      if (!(object instanceof Mesh)) return
      const material = object.material
      if (!(material instanceof MeshStandardMaterial)) return
      const role = material.name as ChronosMaterialRole
      if (!(role in preset.surfaces)) return
      const finish = preset.surfaces[role]
      changes.push({ material, color: material.color.clone(), metalness: material.metalness, roughness: material.roughness,
        target: new Color(finish.color), targetMetalness: finish.metalness, targetRoughness: finish.roughness })
    })
    const lamps = [
      [rig.keyLight, preset.light.key, preset.light.keyPower],
      [rig.fillLight, preset.light.fill, preset.light.fillPower],
      [rig.rimLight, preset.light.rim, preset.light.rimPower],
    ] as const
    const lightChanges = lamps.filter(item => item[0] !== null).map(([light, color, power]) => ({
      light: light!, color: light!.color.clone(), intensity: light!.intensity, target: new Color(color), targetIntensity: power,
    }))
    const apply = (progress: number) => {
      for (const change of changes) {
        change.material.color.lerpColors(change.color, change.target, progress)
        change.material.metalness = gsap.utils.interpolate(change.metalness, change.targetMetalness, progress)
        change.material.roughness = gsap.utils.interpolate(change.roughness, change.targetRoughness, progress)
      }
      for (const change of lightChanges) {
        change.light.color.lerpColors(change.color, change.target, progress)
        change.light.intensity = gsap.utils.interpolate(change.intensity, change.targetIntensity, progress)
      }
      rig.invalidate?.()
    }
    const instant = first.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    first.current = false
    if (instant) { apply(1); return }
    const state = { progress: 0 }
    const tween = gsap.to(state, { progress: 1, duration: .72, ease: 'power2.inOut', onUpdate: () => apply(state.progress) })
    return () => { tween.kill() }
  }, [rig, ready, selected])
}
