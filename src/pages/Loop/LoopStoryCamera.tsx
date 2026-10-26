import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { getLoopCameraPose, getLoopFinaleCameraPose, LOOP_ANNOTATIONS, type LoopAnnotationId } from './LoopCameraStory'

export type LoopStoryProgress = { value: number; entrance: number; finale: number; invalidate?: () => void }

export function LoopStoryCamera({ progress, overlayRef, activeBeat, reducedMotion }: {
  progress: LoopStoryProgress
  overlayRef: RefObject<HTMLDivElement | null>
  activeBeat: number
  reducedMotion: boolean
}) {
  const { camera, size, invalidate } = useThree()
  const position = useRef(new Vector3())
  const target = useRef(new Vector3())
  const projected = useRef(new Vector3())
  const last = useRef({ progress: -1, entrance: -1, finale: -1, width: -1, height: -1, beat: -2 })

  useEffect(() => {
    progress.invalidate = invalidate
    invalidate()
    return () => { if (progress.invalidate === invalidate) delete progress.invalidate }
  }, [progress, invalidate])

  useFrame(() => {
    const value = reducedMotion ? 0 : progress.value
    const entrance = reducedMotion ? 1 : progress.entrance
    const finale = reducedMotion ? 0 : progress.finale
    if (last.current.progress === value && last.current.entrance === entrance && last.current.finale === finale && last.current.width === size.width && last.current.height === size.height && last.current.beat === activeBeat) return
    last.current.progress = value
    last.current.entrance = entrance
    last.current.finale = finale
    last.current.width = size.width
    last.current.height = size.height
    last.current.beat = activeBeat

    const perspective = camera as PerspectiveCamera
    const aspect = size.width / Math.max(1, size.height)
    const fov = finale > 0
      ? getLoopFinaleCameraPose(finale, size.width, position.current, target.current, aspect)
      : getLoopCameraPose(value, size.width, position.current, target.current, aspect)
    const settle = (1 - entrance) * Math.max(0, 1 - value / .16)
    position.current.y += .16 * settle
    position.current.z += .55 * settle
    perspective.position.copy(position.current)
    perspective.lookAt(target.current)
    if (perspective.fov !== fov) { perspective.fov = fov; perspective.updateProjectionMatrix() }
    perspective.updateMatrixWorld()

    const overlay = overlayRef.current
    if (!overlay || reducedMotion || activeBeat < 0 || size.width < 700) return
    const svg = overlay.querySelector<SVGSVGElement>('.loop-story__leaders')
    if (!svg) return
    const viewBox = `0 0 ${size.width} ${size.height}`
    if (svg.getAttribute('viewBox') !== viewBox) svg.setAttribute('viewBox', viewBox)
    const bounds = overlay.getBoundingClientRect()
    for (const label of overlay.querySelectorAll<HTMLElement>('[data-loop-anchor]')) {
      const id = label.dataset.loopAnchor as LoopAnnotationId
      const annotation = LOOP_ANNOTATIONS[id]
      if (!annotation) continue
      projected.current.copy(annotation.anchor).project(perspective)
      const x = (projected.current.x + 1) * size.width / 2
      const y = (1 - projected.current.y) * size.height / 2
      const line = svg.querySelector<SVGLineElement>(`[data-loop-line="${id}"]`)
      const marker = svg.querySelector<SVGCircleElement>(`[data-loop-marker="${id}"]`)
      if (!line || !marker) continue
      const visible = projected.current.z > -1 && projected.current.z < 1 && x > 0 && x < size.width && y > 0 && y < size.height
      line.style.visibility = marker.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) continue
      const labelBounds = label.getBoundingClientRect()
      line.setAttribute('x1', String(annotation.side === 'left' ? labelBounds.right - bounds.left : labelBounds.left - bounds.left))
      line.setAttribute('y1', String(labelBounds.top - bounds.top + labelBounds.height / 2))
      line.setAttribute('x2', String(x))
      line.setAttribute('y2', String(y))
      marker.setAttribute('cx', String(x))
      marker.setAttribute('cy', String(y))
    }
  })
  return null
}
