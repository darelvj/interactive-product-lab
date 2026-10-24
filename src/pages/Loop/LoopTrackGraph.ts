import { CatmullRomCurve3, Curve, Vector3 } from 'three'

export type LoopTrackId = 'launch' | 'feedA' | 'helix' | 'exitA' | 'feedB' | 'orbit' | 'exitB' | 'collect' | 'portalTransfer' | 'portalDrop' | 'platformDescent' | 'platformRelease' | 'discCarry' | 'suspendedA' | 'suspendedB' | 'chamberReceive' | 'chamberRise' | 'chamberRelease' | 'elevatedReturn' | 'return'
export type LoopTrack = {
  id: LoopTrackId
  start: Vector3
  end: Vector3
  curve: Curve<Vector3>
  next: LoopTrackId[]
  family: 'common' | 'helix' | 'orbit' | 'return' | 'module'
  kind: 'rail' | 'portal' | 'freefall' | 'platform' | 'disc' | 'levitation'
}

const point = (x: number, y: number, z: number) => new Vector3(x, y, z)
const stage = point(0, 2.17, 0)
const junction = point(0, 1.44, .03)
const collector = point(0, -1.82, .18)
const liftTop = point(.32, 2.24, -.75)
const portalEntrance = point(2.86, -1.72, -.4)
const portalExit = point(3.72, 1.65, -.83)
const platformUpper = point(4.35, .78, -.72)
const platformLower = point(4.35, -.55, -.72)
const discEntry = point(4.9, -.95, -.38)
const discExit = point(5.6, -.95, -.38)
const suspendedJunction = point(3.78, -1.52, -1.42)
const chamberLower = point(6.46, -1.48, -1.67)
const chamberUpper = point(6.46, 1.35, -1.67)

export const loopModulePositions = {
  portalEntrance,
  portalExit,
  portalNormal: point(Math.sin(Math.PI / 3), 0, Math.cos(Math.PI / 3)),
  platformUpper,
  platformLower,
  platformTravel: platformUpper.y - platformLower.y,
  discCenter: point(5.25, -1.15, -.5),
  discEntry,
  discExit,
  discTravelAngle: Math.atan2(.2, .35) - Math.atan2(.2, -.35),
  chamberLower,
  chamberUpper,
  chamberRingHeights: [-.88, -.04, .8],
} as const

const helixPoints = Array.from({ length: 145 }, (_, index) => {
  const t = index / 144
  const angle = t * Math.PI * 6
  return point(-1.5 + .54 * Math.cos(angle), 1.04 - 2.25 * t, .12 + .54 * Math.sin(angle))
})

// One complete vertical revolution. A restrained depth advance gives the
// inbound and outbound rails separate, physically usable handoff positions.
class OrbitalCurve extends Curve<Vector3> {
  constructor() { super() }
  override getPoint(t: number, target = new Vector3()) {
    const angle = Math.PI + Math.PI * 2 * t
    return target.set(1.52 + 1.05 * Math.cos(angle), .02 + 1.05 * Math.sin(angle), .21 - .32 * t)
  }
}
const orbitalCurve = new OrbitalCurve()
const orbitStart = orbitalCurve.getPoint(0)
const orbitEnd = orbitalCurve.getPoint(1)

const discPoints = Array.from({ length: 25 }, (_, index) => {
  const angle = Math.atan2(.2, -.35) + loopModulePositions.discTravelAngle * index / 24
  const radius = Math.hypot(.35, .2)
  return point(loopModulePositions.discCenter.x + radius * Math.cos(angle), loopModulePositions.discCenter.y + radius * Math.sin(angle), discEntry.z)
})
discPoints[0] = discEntry
discPoints[discPoints.length - 1] = discExit

function track(id: LoopTrackId, points: Vector3[], next: LoopTrackId[], family: LoopTrack['family'], kind: LoopTrack['kind'] = 'rail', curve: Curve<Vector3> = new CatmullRomCurve3(points, false, 'centripetal')): LoopTrack {
  return { id, start: points[0], end: points[points.length - 1], curve, next, family, kind }
}

export const loopTracks: Record<LoopTrackId, LoopTrack> = {
  launch: track('launch', [stage, point(0, 1.86, .01), junction], ['feedA', 'feedB'], 'common'),
  feedA: track('feedA', [junction, point(-.34, 1.34, -.16), point(-.73, 1.19, -.36), point(-.97, 1.1, -.2), helixPoints[0]], ['helix'], 'helix'),
  helix: track('helix', helixPoints, ['exitA'], 'helix'),
  exitA: track('exitA', [helixPoints[helixPoints.length - 1], point(-.95, -1.31, .35), point(-.77, -1.47, .4), point(-.42, -1.7, .25), collector], ['collect'], 'helix'),
  feedB: track('feedB', [junction, point(-.15, 1.14, .27), point(.09, .78, .25), point(.38, .39, .22), orbitStart], ['orbit'], 'orbit'),
  orbit: track('orbit', [orbitStart, orbitEnd], ['exitB'], 'orbit', 'rail', orbitalCurve),
  exitB: track('exitB', [orbitEnd, point(.47, -.34, -.12), point(.3, -.95, -.05), point(.1, -1.5, .12), collector], ['collect'], 'orbit'),
  collect: track('collect', [collector, point(.9, -2.04, -.02), point(1.95, -1.94, -.22), portalEntrance], ['portalTransfer'], 'common'),
  // Deliberately nonphysical: the two rings form one state-based handoff.
  portalTransfer: track('portalTransfer', [portalEntrance, portalExit], ['portalDrop'], 'module', 'portal'),
  // Free fall and magnetic carriage are logical paths, not fixed rails.
  portalDrop: track('portalDrop', [portalExit, point(4.28, 1.28, -.75), platformUpper], ['platformDescent'], 'module', 'freefall'),
  platformDescent: track('platformDescent', [platformUpper, platformLower], ['platformRelease'], 'module', 'platform'),
  platformRelease: track('platformRelease', [platformLower, point(4.67, -.64, -.62), discEntry], ['discCarry'], 'module'),
  discCarry: track('discCarry', discPoints, ['suspendedA'], 'module', 'disc'),
  suspendedA: track('suspendedA', [discExit, point(5.86, -1.18, -.65), point(5.47, -1.38, -1.09), point(4.7, -1.39, -1.22), suspendedJunction], ['suspendedB'], 'module'),
  suspendedB: track('suspendedB', [suspendedJunction, point(4.44, -1.62, -1.7), point(5.2, -1.76, -1.98), point(5.75, -1.68, -1.93)], ['chamberReceive'], 'module'),
  chamberReceive: track('chamberReceive', [point(5.75, -1.68, -1.93), point(6.1, -1.55, -1.8), chamberLower], ['chamberRise'], 'module'),
  // State-driven levitation is intentional: there is no physical lifting rail.
  chamberRise: track('chamberRise', [chamberLower, chamberUpper], ['chamberRelease'], 'module', 'levitation'),
  chamberRelease: track('chamberRelease', [chamberUpper, point(6.33, 1.53, -1.77), point(6.03, 1.74, -1.99)], ['elevatedReturn'], 'module'),
  elevatedReturn: track('elevatedReturn', [point(6.03, 1.74, -1.99), point(5.58, 1.91, -2.08), point(3.65, 2.26, -2.12), point(1.35, 2.54, -1.64), liftTop], ['return'], 'return'),
  return: track('return', [liftTop, point(.28, 2.46, -.51), point(.08, 2.39, -.18), stage], ['launch'], 'return'),
}

export const loopTrackOrder: LoopTrackId[] = ['launch', 'feedA', 'helix', 'exitA', 'feedB', 'orbit', 'exitB', 'collect', 'portalTransfer', 'portalDrop', 'platformDescent', 'platformRelease', 'discCarry', 'suspendedA', 'suspendedB', 'chamberReceive', 'chamberRise', 'chamberRelease', 'elevatedReturn', 'return']

// Same endpoints drive both the visible rails and the later marble handoffs.
export function validateLoopTrackGraph(tolerance = .001): string[] {
  const problems: string[] = []
  for (const track of Object.values(loopTracks)) {
    if (track.curve.getPoint(0).distanceTo(track.start) > tolerance || track.curve.getPoint(1).distanceTo(track.end) > tolerance) problems.push(`${track.id}: curve endpoint mismatch`)
    for (const next of track.next) if (track.end.distanceTo(loopTracks[next].start) > tolerance) problems.push(`${track.id} → ${next}: disconnected`)
  }
  const reachable = new Set<LoopTrackId>()
  const visit = (id: LoopTrackId) => {
    if (reachable.has(id)) return
    reachable.add(id)
    loopTracks[id].next.forEach(visit)
  }
  visit('launch')
  for (const id of loopTrackOrder) if (!reachable.has(id)) problems.push(`${id}: unreachable from launcher`)
  for (const id of loopTrackOrder) {
    const seen = new Set<LoopTrackId>()
    const reachesLaunch = (current: LoopTrackId): boolean => {
      if (current === 'launch') return true
      if (seen.has(current)) return false
      seen.add(current)
      return loopTracks[current].next.some(reachesLaunch)
    }
    if (!loopTracks[id].next.some(reachesLaunch)) problems.push(`${id}: no return to launcher`)
  }
  if (!loopTracks.return.next.includes('launch')) problems.push('return does not close the cycle')
  return problems
}
