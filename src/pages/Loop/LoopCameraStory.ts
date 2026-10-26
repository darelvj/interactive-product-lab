import { Vector3 } from 'three'
import { loopTracks, loopModulePositions } from './LoopTrackGraph'

export type LoopCameraPose = Readonly<{
  name: string
  at: number
  position: readonly [number, number, number]
  target: readonly [number, number, number]
  annotation: LoopAnnotationId | null
}>

// A single local coordinate system serves the track geometry, simulation, and
// presentation. The end shot leaves room for the existing playground console.
export const LOOP_CAMERA_POSES: readonly LoopCameraPose[] = [
  { name: 'overview', at: 0, position: [8.1, 3.8, 17.8], target: [1.5, -.05, -.55], annotation: null },
  { name: 'hero-hold', at: .16, position: [8.0, 3.65, 17.45], target: [1.55, -.03, -.55], annotation: null },
  { name: 'mechanical-routes', at: .30, position: [4.7, 2.9, 10.8], target: [-.05, .02, .04], annotation: 'dualPath' },
  { name: 'diverter-and-portals', at: .46, position: [6.7, 3.2, 11.5], target: [1.82, .14, -.25], annotation: 'portal' },
  { name: 'magnetic-transfer', at: .62, position: [8.0, 2.55, 9.4], target: [4.45, -.12, -.8], annotation: 'platform' },
  { name: 'reverse-gravity', at: .78, position: [9.8, 2.45, 9.1], target: [5.92, .12, -1.35], annotation: 'chamber' },
  { name: 'return-path', at: .90, position: [7.35, 5, 17], target: [2.1, .4, -.9], annotation: 'return' },
  { name: 'playground-overview', at: 1, position: [7.8, 3.8, 25.5], target: [2.1, -.3, -.55], annotation: null },
]

export const LOOP_ANNOTATIONS = {
  dualPath: { title: 'DUAL PATH SYSTEM', detail: 'Two routes. One continuous cycle.', side: 'left', anchor: loopTracks.launch.end },
  portal: { title: 'PORTAL TRANSFER', detail: 'A passage between systems.', side: 'right', anchor: loopModulePositions.portalExit },
  platform: { title: 'MAGNETIC SUSPENSION', detail: 'A platform that moves with its passenger.', side: 'left', anchor: loopModulePositions.platformUpper },
  chamber: { title: 'REVERSE GRAVITY', detail: 'An ascent against expectation.', side: 'right', anchor: new Vector3(6.46, -.08, -1.67) },
  return: { title: 'ENDLESS CIRCULATION', detail: 'The journey begins again.', side: 'left', anchor: loopTracks.elevatedReturn.curve.getPointAt(.55) },
} as const

export type LoopAnnotationId = keyof typeof LOOP_ANNOTATIONS

export const LOOP_BEATS: readonly { number: string; title: string; copy: string; annotations: readonly LoopAnnotationId[] }[] = [
  { number: '01 / THE JOURNEY BEGINS', title: 'The art of taking the long way.', copy: 'The launcher and diverter open two paths: a descending helix and a full orbital turn.', annotations: ['dualPath'] },
  { number: '02 / THROUGH THE PORTAL', title: 'A passage between systems.', copy: 'After the routes rejoin, the portals carry each sphere into the experimental assembly.', annotations: ['portal'] },
  { number: '03 / MAGNETIC SUSPENSION', title: 'Motion, held for a moment.', copy: 'A floating platform receives the sphere before a rotating disc sends it onward.', annotations: ['platform'] },
  { number: '04 / ASCENT', title: 'Against expectation.', copy: 'The reverse-gravity chamber lifts the sphere through a sequence of magnetic rings.', annotations: ['chamber'] },
  { number: '05 / THE ENDLESS RETURN', title: 'Back to the beginning.', copy: 'The overhead return rail completes the circuit. Every ending becomes another beginning.', annotations: ['return'] },
]

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
const finalePosition = new Vector3(7.8, 4, 22)
const finaleTarget = new Vector3(.45, .9, -.55)
const mobileOverview = new Vector3(6.8, 3.1, 30.7)
const tabletOverview = new Vector3(7.3, 3.5, 16.1)
const desktopOverview = new Vector3(8.1, 3.8, 17.8)
const desktopTarget = new Vector3(1.5, -.05, -.55)
const smallTarget = new Vector3(2.05, -.08, -.55)
const overviewPosition = new Vector3()
const tabletFinale = finalePosition.clone().sub(desktopOverview).multiplyScalar(.72).add(tabletOverview)
const mobileFinale = new Vector3(8.3, 4.1, 32)
const tabletFinaleTarget = finaleTarget.clone().sub(desktopTarget).multiplyScalar(.72).add(smallTarget)
const mobileFinaleTarget = new Vector3(2.1, -2.2, -.55)

export function loopBeatAt(progress: number) {
  if (progress < .17 || progress >= .94) return -1
  return Math.min(4, Math.floor((progress - .17) / .155))
}

// The pose is always derived from absolute scroll progress; there is no
// accumulated camera delta to drift after fast or reverse scrolling.
export function getLoopCameraPose(progress: number, width: number, position: Vector3, target: Vector3, aspect = 1) {
  const value = clamp(progress)
  let index = 0
  while (index < LOOP_CAMERA_POSES.length - 2 && value > LOOP_CAMERA_POSES[index + 1].at) index++
  const from = LOOP_CAMERA_POSES[index]
  const to = LOOP_CAMERA_POSES[index + 1]
  const t = smooth((value - from.at) / (to.at - from.at))
  position.set(
    from.position[0] + (to.position[0] - from.position[0]) * t,
    from.position[1] + (to.position[1] - from.position[1]) * t,
    from.position[2] + (to.position[2] - from.position[2]) * t,
  )
  target.set(
    from.target[0] + (to.target[0] - from.target[0]) * t,
    from.target[1] + (to.target[1] - from.target[1]) * t,
    from.target[2] + (to.target[2] - from.target[2]) * t,
  )

  // Smaller screens retain more of the established wide shot rather than
  // pushing an isolated mechanism outside the narrow viewport.
  const portrait = clamp((.95 - aspect) / (.95 - .6))
  const compact = width < 650 ? 1 : portrait
  const baseFocus = width < 980 ? .72 : 1
  const focus = baseFocus + (.42 - baseFocus) * compact
  if (focus < 1) {
    overviewPosition.copy(width < 980 ? tabletOverview : desktopOverview).lerp(mobileOverview, compact)
    position.sub(desktopOverview).multiplyScalar(focus).add(overviewPosition)
    target.sub(desktopTarget).multiplyScalar(focus).add(smallTarget)
  }
  const baseFov = width < 650 ? 34 : width < 980 ? 28 : 27
  const portraitFov = width < 650 ? 34 + clamp((.82 - aspect) / (.82 - .45)) * 12 : baseFov + portrait * (46 - baseFov)
  return portraitFov
}

// The finale begins at the exact playground pose. Its own absolute scroll
// progress restores that pose when the visitor scrolls back to the controls.
export function getLoopFinaleCameraPose(progress: number, width: number, position: Vector3, target: Vector3, aspect = 1) {
  const fov = getLoopCameraPose(1, width, position, target, aspect)
  const amount = smooth(progress)
  const portrait = width < 650 ? 1 : clamp((.95 - aspect) / (.95 - .6))
  const widePosition = width < 980 ? tabletFinale : finalePosition
  const wideTarget = width < 980 ? tabletFinaleTarget : finaleTarget
  const startX = position.x
  const startY = position.y
  const startZ = position.z
  const startTargetX = target.x
  const startTargetY = target.y
  const startTargetZ = target.z
  const endX = widePosition.x + (mobileFinale.x - widePosition.x) * portrait
  const endY = widePosition.y + (mobileFinale.y - widePosition.y) * portrait
  const endZ = widePosition.z + (mobileFinale.z - widePosition.z) * portrait
  const endTargetX = wideTarget.x + (mobileFinaleTarget.x - wideTarget.x) * portrait
  const endTargetY = wideTarget.y + (mobileFinaleTarget.y - wideTarget.y) * portrait
  const endTargetZ = wideTarget.z + (mobileFinaleTarget.z - wideTarget.z) * portrait
  if (amount > 0) {
    position.set(
      startX + (endX - startX) * amount,
      startY + (endY - startY) * amount,
      startZ + (endZ - startZ) * amount,
    )
    target.set(
      startTargetX + (endTargetX - startTargetX) * amount,
      startTargetY + (endTargetY - startTargetY) * amount,
      startTargetZ + (endTargetZ - startTargetZ) * amount,
    )
  }
  return fov
}
