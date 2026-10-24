import { useEffect } from 'react'
import gsap from 'gsap'
import type { Color, MeshPhysicalMaterial } from 'three'
import { auraFinishes, auraStudioFinish, type AuraFinish, type AuraFinishId } from './AuraFinishes'
import type { AuraRig } from './AuraRig'

/** The single owner of finish and inspection materials across all AURA sections. */
export function useAuraAppearance(rig: AuraRig, sceneReady: boolean, selected: AuraFinishId, hasCustomized: boolean, fluidActive: boolean) {
  useEffect(() => {
    if (!sceneReady) return
    const { bodyMaterial, shoulderMaterial, neckMaterial, capMaterial, baseMaterial, innerMaterial,
      wordmarkMaterial, ambientLight, keyLight, fillLight, rimLight, invalidate } = rig
    if (!bodyMaterial || !shoulderMaterial || !neckMaterial || !capMaterial || !baseMaterial ||
      !innerMaterial || !wordmarkMaterial || !ambientLight || !keyLight || !fillLight || !rimLight || !invalidate) return

    const finish: AuraFinish = hasCustomized ? auraFinishes[selected] : auraStudioFinish
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 0 : .78
    const shells = [bodyMaterial, shoulderMaterial, innerMaterial]
    const wasInspecting = shells.some(material => material.transparent)
    if (fluidActive) {
      for (const material of shells) {
        material.transparent = true
        material.depthWrite = false
        material.needsUpdate = true
      }
    }

    const timeline = gsap.timeline({
      onUpdate: invalidate,
      onComplete: () => {
        if (!fluidActive && wasInspecting) {
          for (const material of shells) {
            material.transparent = false
            material.depthWrite = true
            material.needsUpdate = true
          }
        }
        invalidate()
      },
    })
    const color = (target: Color, hex: string) => {
      const next = target.clone().set(hex)
      timeline.to(target, { r: next.r, g: next.g, b: next.b, duration, ease: 'power2.inOut' }, 0)
    }
    const surface = (material: MeshPhysicalMaterial, spec: AuraFinish['body'], inspectionOpacity?: number) => {
      color(material.color, fluidActive && inspectionOpacity !== undefined ? '#93b4bc' : spec.color)
      timeline.to(material, {
        metalness: spec.metalness, roughness: spec.roughness,
        clearcoat: spec.clearcoat, clearcoatRoughness: spec.clearcoatRoughness,
        transmission: fluidActive && inspectionOpacity !== undefined ? 0 : spec.transmission,
        duration, ease: 'power2.inOut',
      }, 0)
      if (inspectionOpacity !== undefined && (fluidActive || wasInspecting)) {
        timeline.to(material, { opacity: fluidActive ? inspectionOpacity : 1, duration, ease: 'power2.inOut' }, 0)
      }
    }
    surface(bodyMaterial, finish.body, .14)
    surface(shoulderMaterial, finish.body, .42)
    surface(capMaterial, finish.cap)
    surface(baseMaterial, finish.base)
    color(neckMaterial.color, finish.neck)
    color(innerMaterial.color, fluidActive ? '#a0bbc2' : finish.liner)
    if (fluidActive || wasInspecting) timeline.to(innerMaterial, { opacity: fluidActive ? .08 : 1, duration }, 0)
    color(wordmarkMaterial.color, finish.wordmark)
    color(keyLight.color, finish.light.keyColor)
    color(fillLight.color, finish.light.fillColor)
    color(rimLight.color, finish.light.rimColor)
    timeline.to(ambientLight, { intensity: finish.light.ambient, duration }, 0)
    timeline.to(keyLight, { intensity: finish.light.key, duration }, 0)
    timeline.to(fillLight, { intensity: finish.light.fill, duration }, 0)
    timeline.to(rimLight, { intensity: fluidActive ? finish.light.rim * 1.12 : finish.light.rim, duration }, 0)
    invalidate()
    return () => { timeline.kill() }
  }, [rig, sceneReady, selected, hasCustomized, fluidActive])
}
