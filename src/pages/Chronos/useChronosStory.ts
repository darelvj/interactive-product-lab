import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mesh, MeshStandardMaterial, type Group } from 'three'
import type { ChronosRig, ChronosSystem } from './ChronosRig'
import { CHRONOS_LAYERS } from './ChronosAnatomyConfig'
import { anatomyFrame, anatomyLabelWeight, applyAnatomyOffsets, smooth } from './ChronosAnatomyMotion'
import { craftFrame, type ChronosCraftFrame, type ChronosCraftView } from './ChronosCraftMotion'

gsap.registerPlugin(ScrollTrigger)

type Refs = {
  story: RefObject<HTMLDivElement | null>
  movement: RefObject<HTMLElement | null>
  overlay: RefObject<HTMLDivElement | null>
  anatomy: RefObject<HTMLElement | null>
  anatomyOverlay: RefObject<HTMLDivElement | null>
  craft: RefObject<HTMLElement | null>
  ending: RefObject<HTMLElement | null>
}

const frames = [
  { at: 0, z: 9.8, x: 0, y: 0, yaw: 0, pitch: 0 },
  { at: 0.21, z: 7.7, x: 0, y: 0, yaw: 0.12, pitch: -0.06 },
  { at: 0.34, z: 7.15, x: -0.13, y: 0.06, yaw: 0.16, pitch: -0.04 },
  { at: 0.52, z: 7.0, x: 0.12, y: -0.05, yaw: 0.19, pitch: -0.07 },
  { at: 0.70, z: 7.05, x: 0.12, y: -0.10, yaw: 0.13, pitch: -0.04 },
  { at: 1, z: 8.1, x: 0, y: 0, yaw: 0.09, pitch: -0.03 },
] as const

function windowed(progress: number, enter: number, full: number, leave: number, gone: number) {
  return smooth(enter, full, progress) * (1 - smooth(leave, gone, progress))
}

function cameraFrame(progress: number) {
  const nextIndex = frames.findIndex(frame => frame.at >= progress)
  if (nextIndex <= 0) return frames[0]
  const before = frames[nextIndex - 1]
  const after = frames[nextIndex]
  const mix = smooth(before.at, after.at, progress)
  return {
    z: gsap.utils.interpolate(before.z, after.z, mix),
    x: gsap.utils.interpolate(before.x, after.x, mix),
    y: gsap.utils.interpolate(before.y, after.y, mix),
    yaw: gsap.utils.interpolate(before.yaw, after.yaw, mix),
    pitch: gsap.utils.interpolate(before.pitch, after.pitch, mix),
  }
}

function highlight(group: Group | null, amount: number) {
  group?.traverse(object => {
    if (!(object instanceof Mesh)) return
    const material = object.material
    if (!(material instanceof MeshStandardMaterial)) return
    material.emissive.set('#bfa779')
    material.emissiveIntensity = amount * 0.22
  })
}

function applyFocus(rig: ChronosRig, weights: Record<ChronosSystem, number>) {
  highlight(rig.mainWheel, weights.gear)
  highlight(rig.transferWheel, weights.gear)
  highlight(rig.escapeWheel, weights.escapement)
  highlight(rig.lever, weights.escapement)
  highlight(rig.balance, weights.balance)
}

export function useChronosStory(refs: Refs, rig: ChronosRig, sceneReady: boolean, craftView: ChronosCraftView) {
  const craftPose = useRef<ChronosCraftFrame>(craftFrame('case', false))
  const currentView = useRef(craftView)
  currentView.current = craftView
  useLayoutEffect(() => {
    const { story, movement, overlay, anatomy, anatomyOverlay, craft, ending } = refs
    const storyNode = story.current
    const movementNode = movement.current
    const overlayNode = overlay.current
    const anatomyNode = anatomy.current
    const anatomyOverlayNode = anatomyOverlay.current
    const craftNode = craft.current
    const endingNode = ending.current
    const camera = rig.camera
    const presentation = rig.presentation
    if (!sceneReady || !storyNode || !movementNode || !overlayNode || !anatomyNode || !anatomyOverlayNode || !craftNode || !endingNode || !camera || !presentation) return

    const media = gsap.matchMedia()
    media.add({ mobile: '(max-width: 700px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      const mobile = Boolean(context.conditions?.mobile)
      const motion = Boolean(context.conditions?.motion)
      const intro = overlayNode.querySelector<HTMLElement>('.chronos-movement-overlay__intro')
      const overview = overlayNode.querySelector<HTMLElement>('.chronos-movement-overlay__overview')
      const playback = overlayNode.querySelector<HTMLElement>('.chronos-playback')
      const annotations = ['gear', 'escapement', 'balance'] as const
      const progress = { value: 0 }
      const anatomyProgress = { value: 0 }
      const anatomyComplete = anatomyOverlayNode.querySelector<HTMLElement>('.chronos-anatomy-overlay__complete')
      const anatomyEntry = anatomyNode.querySelector<HTMLElement>('.chronos-anatomy__entry')
      const anatomyActive = () => anatomyNode.getBoundingClientRect().top <= window.innerHeight
      const craftActive = () => craftNode.getBoundingClientRect().top <= window.innerHeight * .8
      const endingActive = () => endingNode.getBoundingClientRect().top <= window.innerHeight
      const craftProgress = { value: 0 }
      const endingProgress = { value: 0 }
      craftPose.current = craftFrame(currentView.current, mobile)

      const renderMovement = () => {
        const value = progress.value
        presentation.position.set(0, 0, 0)
        applyAnatomyOffsets(rig, 0, mobile)
        anatomyOverlayNode.style.opacity = '0'
        anatomyOverlayNode.style.visibility = 'hidden'
        if (anatomyEntry) anatomyEntry.style.opacity = '1'
        const frame = cameraFrame(value)
        // This parent is owned by scroll; the child watch remains owned by cursor motion.
        camera.position.set(frame.x * (mobile ? 0.35 : 1), frame.y * (mobile ? 0.35 : 1), mobile ? 9.8 - (9.8 - frame.z) * 0.55 : frame.z)
        presentation.rotation.set(frame.pitch, frame.yaw, 0)
        if (value > 0.02) { rig.tiltX = 0; rig.tiltY = 0 }
        storyNode.classList.toggle('is-exploring', value > 0.02)
        const visible = motion ? smooth(0.06, 0.12, value) : 0
        overlayNode.style.opacity = String(visible)
        overlayNode.style.visibility = visible > 0.01 ? 'visible' : 'hidden'
        if (intro) intro.style.opacity = String(windowed(value, 0.07, 0.13, 0.22, 0.29))
        if (overview) overview.style.opacity = String(smooth(0.83, 0.91, value) * (1 - smooth(0.94, 1, value)))
        if (playback) {
          const controlOpacity = smooth(0.15, 0.23, value) * (1 - smooth(0.93, 1, value))
          playback.style.opacity = String(controlOpacity)
          playback.style.visibility = controlOpacity > 0.1 ? 'visible' : 'hidden'
          playback.style.pointerEvents = controlOpacity > 0.6 ? 'auto' : 'none'
        }
        const weights: Record<ChronosSystem, number> = {
          gear: windowed(value, 0.22, 0.28, 0.37, 0.43),
          escapement: windowed(value, 0.40, 0.46, 0.55, 0.61),
          balance: windowed(value, 0.59, 0.65, 0.74, 0.81),
        }
        for (const system of annotations) {
          const annotation = overlayNode.querySelector<HTMLElement>(`[data-chronos-label="${system}"]`)
          const line = overlayNode.querySelector<SVGLineElement>(`[data-chronos-line="${system}"]`)
          const marker = overlayNode.querySelector<SVGCircleElement>(`[data-chronos-marker="${system}"]`)
          if (annotation) annotation.style.opacity = String(weights[system])
          if (line) line.style.opacity = String(weights[system] * (mobile ? 0.45 : 0.7))
          if (marker) marker.style.opacity = String(weights[system])
        }
        applyFocus(rig, weights)
        rig.invalidate?.()
      }

      const renderAnatomy = () => {
        const value = anatomyProgress.value
        presentation.position.set(0, 0, 0)
        if (anatomyEntry) anatomyEntry.style.opacity = String(1 - smooth(0.24, 0.36, value))
        overlayNode.style.opacity = '0'
        overlayNode.style.visibility = 'hidden'
        storyNode.classList.add('is-exploring')
        const frame = anatomyFrame(value, mobile)
        camera.position.set(frame.x, frame.y, frame.z)
        presentation.rotation.set(frame.pitch, frame.yaw, 0)
        rig.tiltX = 0
        rig.tiltY = 0
        applyFocus(rig, { gear: 0, escapement: 0, balance: 0 })
        applyAnatomyOffsets(rig, value, mobile)
        const visible = motion ? smooth(0.06, 0.14, value) * (1 - smooth(0.985, 1, value)) : 0
        anatomyOverlayNode.style.opacity = String(visible)
        anatomyOverlayNode.style.visibility = visible > 0.01 ? 'visible' : 'hidden'
        for (const part of CHRONOS_LAYERS) {
          const weight = anatomyLabelWeight(part.id, value, mobile)
          const label = anatomyOverlayNode.querySelector<HTMLElement>(`[data-chronos-anatomy-label="${part.id}"]`)
          const line = anatomyOverlayNode.querySelector<SVGLineElement>(`[data-chronos-anatomy-line="${part.id}"]`)
          const marker = anatomyOverlayNode.querySelector<SVGCircleElement>(`[data-chronos-anatomy-marker="${part.id}"]`)
          if (label) label.style.opacity = String(weight)
          if (line) line.style.opacity = String(weight * (mobile ? 0.48 : 0.72))
          if (marker) marker.style.opacity = String(weight)
        }
        if (anatomyComplete) anatomyComplete.style.opacity = String(smooth(0.91, 0.97, value))
        rig.invalidate?.()
      }

      const renderCraft = () => {
        if (!craftActive() || endingActive()) return
        presentation.position.set(0, 0, 0)
        overlayNode.style.visibility = 'hidden'
        anatomyOverlayNode.style.visibility = 'hidden'
        storyNode.classList.add('is-exploring')
        applyAnatomyOffsets(rig, 1, mobile)
        applyFocus(rig, { gear: 0, escapement: 0, balance: 0 })
        rig.tiltX = 0
        rig.tiltY = 0
        const start = anatomyFrame(1, mobile)
        const target = craftPose.current
        const blend = motion ? smooth(0, 1, craftProgress.value) : 1
        const mix = (a: number, b: number) => gsap.utils.interpolate(a, b, blend)
        camera.position.set(mix(start.x, target.x), mix(start.y, target.y), mix(start.z, target.z))
        presentation.rotation.set(mix(start.pitch, target.pitch), mix(start.yaw, target.yaw), 0)
        rig.invalidate?.()
      }

      const renderEnding = () => {
        const value = motion ? smooth(0, 1, endingProgress.value) : 1
        const start = craftFrame(currentView.current, mobile)
        const target = mobile
          ? { x: 0, y: 0, z: 11.1, yaw: 0.05, pitch: -0.025, offsetX: 0.12, offsetY: -0.82 }
          : { x: 0, y: 0, z: 8.55, yaw: 0.07, pitch: -0.025, offsetX: 0.92, offsetY: 0 }
        const mix = (a: number, b: number) => gsap.utils.interpolate(a, b, value)
        applyAnatomyOffsets(rig, 0, mobile)
        applyFocus(rig, { gear: 0, escapement: 0, balance: 0 })
        rig.tiltX = 0
        rig.tiltY = 0
        overlayNode.style.opacity = '0'
        overlayNode.style.visibility = 'hidden'
        anatomyOverlayNode.style.opacity = '0'
        anatomyOverlayNode.style.visibility = 'hidden'
        if (anatomyEntry) anatomyEntry.style.opacity = '0'
        storyNode.classList.add('is-exploring')
        camera.position.set(mix(start.x, target.x), mix(start.y, target.y), mix(start.z, target.z))
        presentation.rotation.set(mix(start.pitch, target.pitch), mix(start.yaw, target.yaw), 0)
        presentation.position.set(mix(0, target.offsetX), mix(0, target.offsetY), 0)
        rig.invalidate?.()
      }
      rig.renderCraft = renderCraft

      if (motion) {
        gsap.to(progress, {
          value: 1, duration: 1, ease: 'none', onUpdate: () => { if (!anatomyActive() && !craftActive()) renderMovement() },
          scrollTrigger: { trigger: movementNode, start: 'top bottom', end: 'bottom bottom', scrub: 0.45, invalidateOnRefresh: true },
        })
        gsap.to(anatomyProgress, {
          value: 1, duration: 1, ease: 'none', onUpdate: () => { if (anatomyActive() && !craftActive()) renderAnatomy() },
          scrollTrigger: { trigger: anatomyNode, start: 'top bottom', end: 'bottom bottom', scrub: 0.45, invalidateOnRefresh: true },
        })
        gsap.to(craftProgress, {
          value: 1, duration: 1, ease: 'none', onUpdate: renderCraft,
          scrollTrigger: { trigger: craftNode, start: 'top 80%', end: 'top 25%', scrub: .4, invalidateOnRefresh: true },
        })
        gsap.to(endingProgress, {
          value: 1, duration: 1, ease: 'none', onUpdate: renderEnding,
          scrollTrigger: { trigger: endingNode, start: 'top bottom', end: 'top 28%', scrub: .45, invalidateOnRefresh: true },
        })
      } else {
        // Static assembly information remains in the anatomy section.
        overlayNode.style.visibility = 'hidden'
        anatomyOverlayNode.style.visibility = 'hidden'
        if (anatomyEntry) anatomyEntry.style.opacity = ''
        const staticCraft = ScrollTrigger.create({
          trigger: craftNode, start: 'top 80%', end: 'bottom top',
          onEnter: renderCraft, onEnterBack: renderCraft,
          onLeaveBack: renderAnatomy,
        })
        if (staticCraft.isActive) renderCraft()
        ScrollTrigger.create({
          trigger: endingNode, start: 'top bottom', end: 'bottom top',
          onEnter: renderEnding, onEnterBack: renderEnding,
          onLeaveBack: renderCraft,
        })
      }
      if (endingActive()) renderEnding()
      else if (craftActive()) renderCraft()
      else if (motion && anatomyActive()) renderAnatomy()
      else renderMovement()
      return () => {
        rig.renderCraft = null
        storyNode.classList.remove('is-exploring')
        camera.position.set(0, 0, 9.8)
        presentation.rotation.set(0, 0, 0)
        presentation.position.set(0, 0, 0)
        applyAnatomyOffsets(rig, 0, mobile)
        applyFocus(rig, { gear: 0, escapement: 0, balance: 0 })
        overlayNode.style.visibility = 'hidden'
        anatomyOverlayNode.style.visibility = 'hidden'
        rig.invalidate?.()
      }
    })
    return () => media.revert()
  }, [refs, rig, sceneReady])

  useEffect(() => {
    if (!sceneReady) return
    const target = craftFrame(craftView, window.innerWidth <= 700)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { Object.assign(craftPose.current, target); rig.renderCraft?.(); return }
    const tween = gsap.to(craftPose.current, { ...target, duration: .72, ease: 'power2.inOut', onUpdate: () => rig.renderCraft?.() })
    return () => { tween.kill() }
  }, [rig, sceneReady, craftView])
}
