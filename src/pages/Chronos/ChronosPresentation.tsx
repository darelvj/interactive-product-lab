import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type PerspectiveCamera } from 'three'
import type { ChronosRig, ChronosSystem } from './ChronosRig'
import { CHRONOS_LAYERS } from './ChronosAnatomyConfig'

// Coordinates sit on real movement parts in watch-local space, behind the hands.
const anchors: Record<ChronosSystem, [number, number, number]> = {
  gear: [-0.43, 0.33, 0.13],
  escapement: [0.57, -0.27, 0.19],
  balance: [0.48, -0.70, 0.14],
}
const systems: ChronosSystem[] = ['gear', 'escapement', 'balance']

export function ChronosPresentation({ rig, onReady, children }: {
  rig: ChronosRig; onReady: () => void; children: ReactNode
}) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
    rig.camera = camera as PerspectiveCamera
    rig.invalidate = invalidate
    onReady()
    return () => {
      rig.camera = null
      rig.invalidate = null
      rig.presentation = null
    }
  }, [rig, camera, invalidate, onReady])

  return <group ref={node => { rig.presentation = node }} name="chronos-scroll-presentation">
    {children}
  </group>
}

export function ChronosProjection({ rig, overlayRef, anatomyOverlayRef }: {
  rig: ChronosRig; overlayRef: RefObject<HTMLDivElement | null>; anatomyOverlayRef: RefObject<HTMLDivElement | null>
}) {
  const { camera, gl } = useThree()
  const point = useRef(new Vector3())

  useFrame(() => {
    const root = rig.root
    const movementOverlay = overlayRef.current
    const anatomyOverlay = anatomyOverlayRef.current
    const movementVisible = Boolean(movementOverlay && movementOverlay.style.visibility !== 'hidden')
    const anatomyVisible = Boolean(anatomyOverlay && anatomyOverlay.style.visibility !== 'hidden')
    if (!root || (!movementVisible && !anatomyVisible)) return

    root.updateWorldMatrix(true, true)
    camera.updateMatrixWorld()
    const canvasBox = gl.domElement.getBoundingClientRect()

    const draw = (overlay: HTMLDivElement, overlayBox: DOMRect, key: string, selector: string, world: Vector3) => {
      const projected = world.project(camera)
      const screenX = canvasBox.left - overlayBox.left + (projected.x * 0.5 + 0.5) * canvasBox.width
      const screenY = canvasBox.top - overlayBox.top + (-projected.y * 0.5 + 0.5) * canvasBox.height
      const label = overlay.querySelector<HTMLElement>(`[data-${selector}-label="${key}"]`)
      const line = overlay.querySelector<SVGLineElement>(`[data-${selector}-line="${key}"]`)
      const marker = overlay.querySelector<SVGCircleElement>(`[data-${selector}-marker="${key}"]`)
      if (!label || !line || !marker) return
      const labelBox = label.getBoundingClientRect()
      const compact = overlayBox.width <= 700
      const labelOnLeft = labelBox.left + labelBox.width / 2 < screenX + overlayBox.left
      const labelX = compact
        ? Math.max(labelBox.left + 12, Math.min(screenX + overlayBox.left, labelBox.right - 12)) - overlayBox.left
        : (labelOnLeft ? labelBox.right : labelBox.left) - overlayBox.left
      const labelY = (compact ? labelBox.top - 6 : labelBox.top + labelBox.height / 2) - overlayBox.top
      line.setAttribute('x1', String(screenX))
      line.setAttribute('y1', String(screenY))
      line.setAttribute('x2', String(labelX))
      line.setAttribute('y2', String(labelY))
      marker.setAttribute('cx', String(screenX))
      marker.setAttribute('cy', String(screenY))
    }

    if (movementOverlay && movementVisible) {
      const overlayBox = movementOverlay.getBoundingClientRect()
      for (const system of systems) {
        const [x, y, z] = anchors[system]
        draw(movementOverlay, overlayBox, system, 'chronos', point.current.set(x, y, z).applyMatrix4(root.matrixWorld))
      }
    }
    if (anatomyOverlay && anatomyVisible) {
      const overlayBox = anatomyOverlay.getBoundingClientRect()
      for (const part of CHRONOS_LAYERS) {
        const group = rig.assemblies[part.id]
        if (!group) continue
        const [x, y, z] = part.anchor
        draw(anatomyOverlay, overlayBox, part.id, 'chronos-anatomy', point.current.set(x, y, z).applyMatrix4(group.matrixWorld))
      }
    }
  })

  return null
}
