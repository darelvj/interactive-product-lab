import { Vector3 } from 'three'
import { loopModulePositions as module, loopTracks, type LoopTrackId } from './LoopTrackGraph'

export type LoopPhase = 'waiting' | 'rail' | 'portalIn' | 'portalTransit' | 'portalOut' | 'landing' | 'impact' | 'descending' | 'docked' | 'releasing' | 'discReceiving' | 'discRotating' | 'chamberReceiving' | 'chamberActivation' | 'chamberRising' | 'chamberDocked' | 'chamberReleasing'

export type LoopRoute = 'A' | 'B'
export type LoopRouteMode = 'AUTO' | 'HELIX' | 'ORBIT'
export type LoopOperatingMode = 'FLOW' | 'CHAOS'
export type ChaosMotionProfile = 'SURGE' | 'DRIFT' | 'PULSE'
export type MarbleRequestResult = 'released' | 'queued' | 'capacity'
export type LoopControlState = Readonly<{
  operatingMode: LoopOperatingMode
  routeMode: LoopRouteMode
  nextRoute: LoopRoute
  routeChangePending: boolean
  marbleCount: number
  pendingReleaseRequests: number
  maxMarbles: number
  tempo: number
  paused: boolean
}>
export type Mechanism = 'launcher' | 'portal' | 'platform' | 'disc' | 'chamber'
export type Marble = {
  readonly id: string
  readonly index: number
  readonly position: Vector3
  phase: LoopPhase
  segment: LoopTrackId
  route: LoopRoute | null
  distance: number
  elapsed: number
  phaseDuration: number | null
  progress: number
  cycles: number
  visible: boolean
  scale: number
  waitReason: string | null
  waitSeconds: number
  motionProfile: ChaosMotionProfile | null
  motionSpeed: number
  profileElapsed: number
  phaseChaos: boolean
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
const impactOffset = (marble: Marble) => -(marble.phaseChaos ? .092 : .055) * Math.sin(Math.PI * 2.3 * marble.progress) * Math.exp(-4 * marble.progress)
const liftProgress = (marble: Marble) => marble.phaseChaos ? ease((marble.progress - .13) / .87) : ease(marble.progress)
const radius = .105
const spacing = radius * 2 + .09
const clearance = spacing + .04
export const MAX_LOOP_MARBLES = 6
export const DEFAULT_LOOP_SEED = 0x4c4f4f50
const speed: Partial<Record<LoopTrackId, number>> = {
  launch: 1.12, feedA: 1.3, helix: 1.44, exitA: 1.3, feedB: 1.45, orbit: 1.8,
  exitB: 1.5, collect: 1.52, suspendedA: 1.42, suspendedB: 1.48,
  chamberReceive: 1.02, elevatedReturn: 1.7, return: 1.23,
}

// The existing single-marble choreography is retained below as per-marble phases.
// This controller alone advances all marbles and owns every shared handoff.
export class LoopTrafficSimulation {
  readonly marbles: Marble[]
  readonly owners: Record<Mechanism, number | null> = { launcher: null, portal: null, platform: null, disc: null, chamber: null }
  readonly transitions: string[] = []
  private userPaused = false
  private environmentPaused = false
  private listeners = new Set<() => void>()
  private controlState: LoopControlState = { operatingMode: 'FLOW', routeMode: 'AUTO', nextRoute: 'A', routeChangePending: false, marbleCount: 0, pendingReleaseRequests: 0, maxMarbles: MAX_LOOP_MARBLES, tempo: 1, paused: false }
  private initialCount: number
  private readonly initialSeed: number
  private randomState: number
  private chaosLastRoute: LoopRoute | null = null
  private chaosRouteStreak = 0
  private chaosProfileCursor = 0
  private chaosProfileOffset = 0
  private burstCountdown = -1
  pendingReleaseRequests = 0
  operatingMode: LoopOperatingMode = 'FLOW'
  visualChaos = 0
  routeMode: LoopRouteMode = 'AUTO'
  tempo = 1
  cycles = 0
  nextRoute: LoopRoute = 'A'
  private flowNextRoute: LoopRoute = 'A'
  diverterAngle = -.23
  launcherGateOpen = 0
  platformOffset = 0
  platformGateOpen = 0
  discAngle = 0
  entrancePulse = 0
  exitPulse = 0
  platformPulse = 0
  discPulse = 0
  chamberLowerGateOpen = 0
  chamberUpperGateOpen = 0
  chamberStatusPulse = 0
  readonly chamberRingPulse: [number, number, number] = [0, 0, 0]
  private platformReturn = -1
  private discReturn = -1
  private chamberReset = -1

  get paused() { return this.userPaused || this.environmentPaused }
  get routeChangePending() {
    const route = this.upcomingRoute()
    return Math.abs(this.diverterAngle - (route === 'A' ? -.23 : .23)) > .001
  }

  // Stable external-store snapshot: React updates only when a displayed value
  // changes, never for every marble position or mechanism animation frame.
  getControlState = () => this.controlState
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publishControlState() {
    const previous = this.controlState
    const operatingMode = this.operatingMode
    const routeMode = this.routeMode
    const nextRoute = this.upcomingRoute()
    const routeChangePending = this.routeChangePending
    const marbleCount = this.marbles.length
    const pendingReleaseRequests = this.pendingReleaseRequests
    const tempo = this.tempo
    const paused = this.paused
    if (previous.operatingMode === operatingMode && previous.routeMode === routeMode && previous.nextRoute === nextRoute && previous.routeChangePending === routeChangePending && previous.marbleCount === marbleCount && previous.pendingReleaseRequests === pendingReleaseRequests && previous.tempo === tempo && previous.paused === paused) return
    this.controlState = { operatingMode, routeMode, nextRoute, routeChangePending, marbleCount, pendingReleaseRequests, maxMarbles: MAX_LOOP_MARBLES, tempo, paused }
    for (const listener of this.listeners) listener()
  }

  constructor(count = 3, seed = DEFAULT_LOOP_SEED) {
    const total = Math.max(1, Math.min(3, Math.floor(count)))
    this.initialCount = total
    this.initialSeed = Number.isFinite(seed) ? (seed >>> 0) || DEFAULT_LOOP_SEED : DEFAULT_LOOP_SEED
    this.randomState = this.initialSeed
    this.marbles = Array.from({ length: total }, (_, index) => this.createMarble(index))
    this.reset()
  }

  setRouteMode(mode: LoopRouteMode) {
    if (mode !== 'AUTO' && mode !== 'HELIX' && mode !== 'ORBIT') return
    if (this.routeMode === mode) return
    this.routeMode = mode
    if (mode === 'AUTO') this.nextRoute = this.operatingMode === 'CHAOS' ? this.chooseChaosRoute() : this.flowNextRoute
    const launcher = this.owner('launcher')
    if (launcher?.phase === 'waiting') { launcher.elapsed = 0; this.poseMarble(launcher) }
    this.poseMechanisms()
    this.publishControlState()
  }

  setOperatingMode(mode: LoopOperatingMode) {
    if (mode !== 'FLOW' && mode !== 'CHAOS') return
    if (this.operatingMode === mode) return
    this.operatingMode = mode
    this.burstCountdown = mode === 'CHAOS' ? 1.5 + this.random() * 1.5 : -1
    if (mode === 'CHAOS') this.chaosProfileOffset = Math.floor(this.random() * 3)
    // Only ordinary track travel changes immediately. A marble already inside
    // a mechanism keeps that mechanism's locked phase profile until handoff.
    for (const marble of this.marbles) {
      if (marble.phase === 'rail') this.assignMotionProfile(marble)
    }
    if (this.routeMode === 'AUTO') this.nextRoute = mode === 'CHAOS' ? this.chooseChaosRoute() : this.flowNextRoute
    // A staged marble may wait for a new diverter position; committed marbles
    // and in-progress mechanism durations are deliberately left untouched.
    this.poseMechanisms()
    this.publishControlState()
  }

  private random() {
    let value = this.randomState
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.randomState = value >>> 0
    return this.randomState / 0x100000000
  }

  private chooseChaosRoute(): LoopRoute {
    if (this.chaosRouteStreak >= 2 && this.chaosLastRoute) return this.chaosLastRoute === 'A' ? 'B' : 'A'
    return this.random() < .5 ? 'A' : 'B'
  }

  private assignMotionProfile(marble: Marble) {
    if (this.operatingMode === 'FLOW') marble.motionProfile = null
    else {
      const profiles: ChaosMotionProfile[] = ['SURGE', 'DRIFT', 'PULSE']
      // A seeded offset mixes the order, while cycling the three profiles
      // guarantees that a small marble population shows contrasting motion.
      marble.motionProfile = profiles[(this.chaosProfileCursor++ + this.chaosProfileOffset) % profiles.length]
    }
    marble.profileElapsed = 0
  }

  private motionTarget(marble: Marble) {
    if (marble.motionProfile === 'SURGE') return 1.82
    if (marble.motionProfile === 'DRIFT') return .58
    if (marble.motionProfile === 'PULSE') return 1.1 + .55 * Math.sin(marble.profileElapsed * 2.7)
    return 1
  }

  private phaseTiming(phase: LoopPhase): number | null {
    const base = phase === 'waiting' ? .52 : phase === 'portalIn' ? .3 : phase === 'portalTransit' ? .27 : phase === 'impact' ? .68 : phase === 'discReceiving' ? .34 : phase === 'chamberActivation' ? .85 : null
    if (this.operatingMode === 'CHAOS' && phase === 'chamberRising') return 1.7 + this.random() * .35
    if (this.operatingMode === 'CHAOS' && phase === 'discRotating') return 1.35 + this.random() * .3
    if (base === null) return null
    if (this.operatingMode === 'FLOW') return base
    const spread = phase === 'waiting' ? .24 : phase === 'chamberActivation' ? .27 : phase === 'impact' ? .19 : phase === 'portalIn' ? .2 : phase === 'portalTransit' ? .12 : phase === 'discReceiving' ? .1 : .07
    return base + (this.random() * 2 - 1) * spread
  }

  setTempo(value: number) {
    if (!Number.isFinite(value)) return
    const tempo = Math.max(.5, Math.min(1.5, value))
    if (tempo === this.tempo) return
    this.tempo = tempo
    this.publishControlState()
  }

  pause() { if (!this.userPaused) { this.userPaused = true; this.publishControlState() } }
  resume() { if (this.userPaused) { this.userPaused = false; this.publishControlState() } }
  setEnvironmentPaused(value: boolean) {
    if (this.environmentPaused === value) return
    this.environmentPaused = value
    this.publishControlState()
  }

  requestMarble(): MarbleRequestResult {
    if (this.marbles.length + this.pendingReleaseRequests >= MAX_LOOP_MARBLES) return 'capacity'
    this.pendingReleaseRequests++
    const released = this.activatePendingMarble()
    this.publishControlState()
    return released ? 'released' : 'queued'
  }

  private activatePendingMarble() {
    if (!this.pendingReleaseRequests || this.owners.launcher !== null) return false
    const marble = this.createMarble(this.marbles.length)
    if (this.diverterOccupied() || !this.canEnterRail('launch', marble)) return false
    this.marbles.push(marble)
    this.pendingReleaseRequests--
    this.owners.launcher = marble.index
    this.enter(marble, 'waiting', 'launch')
    this.poseMarble(marble)
    this.poseMechanisms()
    return true
  }

  private upcomingRoute(): LoopRoute {
    return this.routeMode === 'HELIX' ? 'A' : this.routeMode === 'ORBIT' ? 'B' : this.nextRoute
  }

  private diverterOccupied() {
    return this.marbles.some(marble => marble.phase === 'rail' && (
      marble.segment === 'launch' || ((marble.segment === 'feedA' || marble.segment === 'feedB') && marble.distance < clearance)
    ))
  }

  private createMarble(index: number): Marble {
    return {
      id: `LOOP-${String(index + 1).padStart(3, '0')}`, index, position: new Vector3(),
      phase: 'waiting' as LoopPhase, segment: 'launch' as LoopTrackId, route: null,
      distance: 0, elapsed: 0, progress: 0, cycles: 0, visible: true, scale: 1,
      phaseDuration: null,
      waitReason: null, waitSeconds: 0,
      motionProfile: null, motionSpeed: 1, profileElapsed: 0, phaseChaos: false,
    }
  }

  // Development-only use: changing population starts a fresh, safely staged cycle.
  setCount(count: number) {
    if (!Number.isFinite(count)) return
    const total = Math.max(1, Math.min(3, Math.floor(count)))
    this.initialCount = total
    this.reset()
  }

  reset() {
    while (this.marbles.length > this.initialCount) this.marbles.pop()
    while (this.marbles.length < this.initialCount) this.marbles.push(this.createMarble(this.marbles.length))
    this.pendingReleaseRequests = 0
    this.operatingMode = 'FLOW'
    this.visualChaos = 0
    this.routeMode = 'AUTO'
    this.tempo = 1
    this.userPaused = false
    this.owners.launcher = 0
    this.owners.portal = null
    this.owners.platform = null
    this.owners.disc = null
    this.owners.chamber = null
    this.platformReturn = -1
    this.discReturn = -1
    this.chamberReset = -1
    this.cycles = 0
    this.nextRoute = 'A'
    this.flowNextRoute = 'A'
    this.randomState = this.initialSeed
    this.chaosLastRoute = null
    this.chaosRouteStreak = 0
    this.chaosProfileCursor = 0
    this.chaosProfileOffset = 0
    this.burstCountdown = -1
    this.diverterAngle = -.23
    this.transitions.length = 0
    for (const marble of this.marbles) {
      marble.phase = marble.index === 0 ? 'waiting' : 'rail'
      marble.segment = marble.index === 2 ? 'elevatedReturn' : marble.index === 1 ? 'return' : 'launch'
      marble.distance = marble.index === 1 ? Math.max(0, loopTracks.return.curve.getLength() - .48) : marble.index === 2 ? Math.max(0, loopTracks.elevatedReturn.curve.getLength() - .48) : 0
      marble.elapsed = 0
      marble.phaseDuration = marble.phase === 'waiting' ? .52 : null
      marble.progress = marble.phase === 'rail' ? marble.distance / loopTracks[marble.segment].curve.getLength() : 0
      marble.cycles = 0
      marble.route = null
      marble.waitReason = null
      marble.waitSeconds = 0
      marble.motionProfile = null
      marble.motionSpeed = 1
      marble.profileElapsed = 0
      marble.phaseChaos = false
      this.poseMarble(marble)
      this.record(`${marble.id}:${marble.phase}:${marble.segment}`)
    }
    this.poseMechanisms()
    this.publishControlState()
  }

  private record(event: string) {
    this.transitions.push(event)
    if (this.transitions.length > 120) this.transitions.shift()
  }

  private enter(marble: Marble, phase: LoopPhase, segment: LoopTrackId) {
    marble.phase = phase
    marble.segment = segment
    marble.distance = 0
    marble.elapsed = 0
    marble.phaseDuration = this.phaseTiming(phase)
    marble.phaseChaos = this.operatingMode === 'CHAOS'
    if (phase === 'rail') this.assignMotionProfile(marble)
    marble.progress = 0
    marble.waitReason = null
    marble.waitSeconds = 0
    this.record(`${marble.id}:${phase}:${segment}`)
  }

  private owner(name: Mechanism) {
    const index = this.owners[name]
    return index === null ? null : this.marbles[index]
  }

  private duration(marble: Marble) {
    if (marble.phaseDuration !== null) return marble.phaseDuration
    switch (marble.phase) {
      case 'waiting': return .52
      case 'rail': return loopTracks[marble.segment].curve.getLength() / (speed[marble.segment] ?? 1.3)
      case 'portalIn': return .3
      case 'portalTransit': return .27
      case 'portalOut': return .28
      case 'landing': return .8
      case 'impact': return .68
      case 'descending': return 2.05
      case 'docked': return .32
      case 'releasing': return loopTracks.platformRelease.curve.getLength() / 1.1
      case 'discReceiving': return .34
      case 'discRotating': return 1.62
      case 'chamberReceiving': return .36
      case 'chamberActivation': return .85
      case 'chamberRising': return 2.65
      case 'chamberDocked': return .44
      case 'chamberReleasing': return loopTracks.chamberRelease.curve.getLength() / 1.1
    }
  }

  private canEnterRail(segment: LoopTrackId, except: Marble) {
    for (const other of this.marbles) {
      if (other !== except && other.phase === 'rail' && other.segment === segment && other.distance < clearance) return false
    }
    return true
  }

  private nextRail(marble: Marble): LoopTrackId | null {
    if (marble.segment === 'launch') return marble.route === 'B' ? 'feedB' : 'feedA'
    return loopTracks[marble.segment].next[0] ?? null
  }

  private canFinishRail(marble: Marble) {
    if (marble.segment === 'collect') return this.owners.portal === null && this.owners.platform === null && this.platformReturn < 0
    if (marble.segment === 'suspendedB') return this.owners.chamber === null && this.chamberReset < 0 && this.canEnterRail('chamberReceive', marble)
    if (marble.segment === 'return') return this.owners.launcher === null && this.canEnterRail('launch', marble)
    if (marble.segment === 'chamberReceive') return true
    const next = this.nextRail(marble)
    return next !== null && loopTracks[next].kind === 'rail' && this.canEnterRail(next, marble)
  }

  private finishRail(marble: Marble) {
    switch (marble.segment) {
      case 'launch':
        this.enter(marble, 'rail', marble.route === 'B' ? 'feedB' : 'feedA')
        this.owners.launcher = null
        return
      case 'collect':
        this.owners.portal = marble.index
        this.owners.platform = marble.index
        this.enter(marble, 'portalIn', 'portalTransfer')
        return
      case 'suspendedB':
        this.owners.chamber = marble.index
        this.enter(marble, 'rail', 'chamberReceive')
        return
      case 'chamberReceive':
        this.enter(marble, 'chamberReceiving', 'chamberRise')
        return
      case 'return':
        if (marble.route !== null) {
          marble.cycles++
          this.cycles++
        }
        marble.route = null
        this.owners.launcher = marble.index
        this.enter(marble, 'waiting', 'launch')
        return
      default: {
        const next = this.nextRail(marble)
        if (!next || loopTracks[next].kind !== 'rail') throw new Error(`Unsupported LOOP handoff: ${marble.segment} → ${next}`)
        this.enter(marble, 'rail', next)
      }
    }
  }

  private wait(marble: Marble, reason: string, delta: number) {
    marble.waitReason = reason
    marble.waitSeconds += delta
  }

  private moveOnRail(marble: Marble, delta: number) {
    const length = loopTracks[marble.segment].curve.getLength()
    const rate = speed[marble.segment] ?? 1.3
    const gravity = marble.segment === 'helix' ? .84 + .32 * marble.distance / length : marble.segment === 'orbit' ? .74 + .52 * marble.distance / length : 1
    marble.profileElapsed += delta
    marble.motionSpeed += (this.motionTarget(marble) - marble.motionSpeed) * Math.min(1, delta * 2.8)
    let destination = Math.min(length, marble.distance + rate * gravity * marble.motionSpeed * delta)
    let reason: string | null = null
    for (const other of this.marbles) {
      if (other === marble || other.phase !== 'rail' || other.segment !== marble.segment || other.distance <= marble.distance) continue
      if (destination > other.distance - spacing) {
        destination = Math.max(marble.distance, other.distance - spacing)
        reason = `spacing:${marble.segment}`
      }
    }
    if (!this.canFinishRail(marble) && destination > length - clearance) {
      destination = Math.max(marble.distance, length - clearance)
      reason = `handoff:${marble.segment}`
    }
    marble.distance = destination
    marble.progress = clamp(destination / length)
    if (reason) this.wait(marble, reason, delta)
    else { marble.waitReason = null; marble.waitSeconds = 0 }
    if (marble.distance >= length - 1e-6 && this.canFinishRail(marble)) this.finishRail(marble)
  }

  private updateDiverter(delta: number) {
    const launcher = this.owner('launcher')
    if ((launcher && launcher.phase !== 'waiting') || this.diverterOccupied()) return
    const target = this.upcomingRoute() === 'A' ? -.23 : .23
    const difference = target - this.diverterAngle
    this.diverterAngle += Math.sign(difference) * Math.min(Math.abs(difference), .9 * delta)
  }

  private updateWaiting(marble: Marble, delta: number) {
    const route = this.upcomingRoute()
    const feed = route === 'A' ? 'feedA' : 'feedB'
    const aligned = Math.abs(this.diverterAngle - (route === 'A' ? -.23 : .23)) < .001
    const ready = aligned && !this.diverterOccupied() && this.canEnterRail('launch', marble) && this.canEnterRail(feed, marble)
    if (!ready) {
      marble.elapsed = 0
      this.wait(marble, aligned ? `launch-blocked:${feed}` : 'diverter-switching', delta)
      return
    }
    marble.waitReason = null
    marble.waitSeconds = 0
    marble.elapsed = Math.min(this.duration(marble), marble.elapsed + delta)
    if (marble.elapsed >= this.duration(marble) - 1e-7) {
      marble.route = route
      if (this.routeMode === 'AUTO') {
        this.flowNextRoute = route === 'A' ? 'B' : 'A'
        if (this.operatingMode === 'CHAOS') {
          this.chaosRouteStreak = this.chaosLastRoute === route ? this.chaosRouteStreak + 1 : 1
          this.chaosLastRoute = route
          this.nextRoute = this.chooseChaosRoute()
        } else this.nextRoute = this.flowNextRoute
      }
      this.record(`${marble.id}:route:${route}`)
      this.enter(marble, 'rail', 'launch')
    }
  }

  private updateTimed(marble: Marble, delta: number) {
    if (marble.phase === 'docked' && this.owners.disc !== marble.index) {
      if (this.owners.disc !== null || this.discReturn >= 0) {
        marble.elapsed = 0
        this.wait(marble, 'disc-occupied', delta)
        return
      }
      this.owners.disc = marble.index
      marble.waitReason = null
      marble.waitSeconds = 0
    }
    const duration = this.duration(marble)
    marble.elapsed = Math.min(duration, marble.elapsed + delta)
    if (marble.elapsed < duration - 1e-7) return
    switch (marble.phase) {
      case 'portalIn': this.enter(marble, 'portalTransit', 'portalTransfer'); return
      case 'portalTransit': this.enter(marble, 'portalOut', 'portalTransfer'); return
      case 'portalOut': this.enter(marble, 'landing', 'portalDrop'); return
      case 'landing': this.owners.portal = null; this.enter(marble, 'impact', 'platformDescent'); return
      case 'impact': this.enter(marble, 'descending', 'platformDescent'); return
      case 'descending': this.enter(marble, 'docked', 'platformDescent'); return
      case 'docked':
        this.enter(marble, 'releasing', 'platformRelease')
        return
      case 'releasing':
        this.owners.platform = null
        this.platformReturn = 0
        this.enter(marble, 'discReceiving', 'discCarry')
        return
      case 'discReceiving': this.enter(marble, 'discRotating', 'discCarry'); return
      case 'discRotating':
        if (!this.canEnterRail('suspendedA', marble)) { this.wait(marble, 'suspended-rail-occupied', delta); return }
        this.enter(marble, 'rail', 'suspendedA')
        return
      case 'chamberReceiving': this.enter(marble, 'chamberActivation', 'chamberRise'); return
      case 'chamberActivation': this.enter(marble, 'chamberRising', 'chamberRise'); return
      case 'chamberRising': this.enter(marble, 'chamberDocked', 'chamberRise'); return
      case 'chamberDocked': this.enter(marble, 'chamberReleasing', 'chamberRelease'); return
      case 'chamberReleasing':
        if (!this.canEnterRail('elevatedReturn', marble)) { this.wait(marble, 'elevated-return-occupied', delta); return }
        this.enter(marble, 'rail', 'elevatedReturn')
        return
      case 'waiting':
      case 'rail':
    }
  }

  private tick(delta: number) {
    this.visualChaos += ((this.operatingMode === 'CHAOS' ? 1 : 0) - this.visualChaos) * Math.min(1, delta * 2.2)
    if (this.platformReturn >= 0) { this.platformReturn += delta; if (this.platformReturn >= 1.5) this.platformReturn = -1 }
    if (this.discReturn >= 0) { this.discReturn += delta; if (this.discReturn >= 1.15) this.discReturn = -1 }
    if (this.chamberReset >= 0) { this.chamberReset += delta; if (this.chamberReset >= .55) this.chamberReset = -1 }
    this.updateDiverter(delta)
    for (const marble of this.marbles) {
      if (marble.phase === 'waiting') this.updateWaiting(marble, delta)
      else if (marble.phase === 'rail') this.moveOnRail(marble, delta)
      else this.updateTimed(marble, delta)

      if (this.owners.disc === marble.index && marble.phase === 'rail' && marble.segment === 'suspendedA' && marble.distance >= clearance) {
        this.owners.disc = null
        this.discReturn = 0
      }
      if (this.owners.chamber === marble.index && marble.phase === 'rail' && marble.segment === 'elevatedReturn' && marble.distance >= clearance) {
        this.owners.chamber = null
        this.chamberReset = 0
      }
    }
    this.activatePendingMarble()
    if (this.operatingMode === 'CHAOS') {
      this.burstCountdown -= delta
      if (this.burstCountdown <= 0) {
        // A burst is a normal launcher admission, never a direct track spawn.
        // Keep one spare capacity slot for the visitor's Release control.
        if (this.marbles.length + this.pendingReleaseRequests < Math.min(MAX_LOOP_MARBLES - 1, this.initialCount + 2) &&
          this.pendingReleaseRequests === 0 && this.owners.launcher === null && !this.diverterOccupied()) this.requestMarble()
        this.burstCountdown = 2.5 + this.random() * 3.5
      }
    }
    for (const marble of this.marbles) this.poseMarble(marble)
    this.poseMechanisms()
  }

  step(delta: number, force = false) {
    if (this.paused && !force) return
    let remaining = Math.min(Math.max(0, delta), .25) * this.tempo
    while (remaining > 1e-8) {
      const slice = Math.min(remaining, .02)
      this.tick(slice)
      remaining -= slice
    }
    this.publishControlState()
  }

  // Development inspection skips intermediate renders, not simulation updates.
  advance(seconds: number) {
    let remaining = Math.min(Math.max(0, seconds), 120)
    while (remaining > 1e-8) {
      const slice = Math.min(remaining, .05)
      this.step(slice, true)
      remaining -= slice
    }
  }

  private poseMarble(marble: Marble) {
    const t = marble.phase === 'rail' ? marble.progress : clamp(marble.elapsed / this.duration(marble))
    marble.progress = t
    marble.visible = true
    marble.scale = 1
    switch (marble.phase) {
      case 'waiting': marble.position.copy(loopTracks.launch.start); return
      case 'rail': loopTracks[marble.segment].curve.getPointAt(t, marble.position); return
      case 'portalIn': {
        const transfer = marble.phaseChaos ? ease((t - .27) / .73) : t
        marble.position.copy(module.portalEntrance).addScaledVector(module.portalNormal, .14 * transfer)
        marble.scale = 1 - ease(transfer)
        return
      }
      case 'portalTransit': marble.position.copy(module.portalExit); marble.visible = false; marble.scale = 0; return
      case 'portalOut': marble.position.copy(module.portalExit).addScaledVector(module.portalNormal, -.1 * (1 - t)); marble.scale = ease(t); return
      case 'landing': loopTracks.portalDrop.curve.getPointAt(t * t, marble.position); return
      case 'impact':
        marble.position.copy(module.platformUpper)
        marble.position.y += impactOffset(marble)
        return
      case 'descending': marble.position.copy(module.platformUpper); marble.position.y -= module.platformTravel * ease(t); return
      case 'docked': marble.position.copy(module.platformLower); return
      case 'releasing': loopTracks.platformRelease.curve.getPointAt(t, marble.position); return
      case 'discReceiving': marble.position.copy(module.discEntry); return
      case 'discRotating': loopTracks.discCarry.curve.getPointAt(ease(t), marble.position); return
      case 'chamberReceiving':
      case 'chamberActivation': marble.position.copy(module.chamberLower); return
      case 'chamberRising': marble.position.copy(module.chamberLower).lerp(module.chamberUpper, liftProgress(marble)); return
      case 'chamberDocked': marble.position.copy(module.chamberUpper); return
      case 'chamberReleasing': loopTracks.chamberRelease.curve.getPointAt(ease(t), marble.position); return
    }
  }

  private poseMechanisms() {
    const launcher = this.owner('launcher')
    const portal = this.owner('portal')
    const platform = this.owner('platform')
    const disc = this.owner('disc')
    const chamber = this.owner('chamber')
    this.launcherGateOpen = launcher?.phase === 'waiting' ? ease((launcher.progress - .2) / .65) : 0
    if (launcher?.phase === 'rail' && launcher.segment === 'launch') this.launcherGateOpen = 1 - ease((launcher.progress - .34) / .35)
    this.entrancePulse = portal?.phase === 'portalIn' ? (portal.phaseChaos ? .25 + .75 * Math.sin(Math.PI * portal.progress) : Math.sin(Math.PI * portal.progress)) : portal?.phase === 'portalTransit' ? 1 - ease(portal.progress) : 0
    this.exitPulse = portal?.phase === 'portalTransit' ? ease(portal.progress) : portal?.phase === 'portalOut' ? Math.sin(Math.PI * portal.progress) : 0

    this.platformOffset = this.platformReturn >= 0 ? -module.platformTravel * (1 - ease(this.platformReturn / 1.5)) : 0
    this.platformGateOpen = 0
    this.platformPulse = 0
    if (platform) {
      const t = platform.progress
      if (platform.phase === 'impact') { this.platformOffset = impactOffset(platform); this.platformPulse = (platform.phaseChaos ? 1.2 : 1) * (1 - ease(t)) }
      if (platform.phase === 'descending') { this.platformOffset = -module.platformTravel * ease(t); this.platformPulse = .22 }
      if (platform.phase === 'docked' || platform.phase === 'releasing') this.platformOffset = -module.platformTravel
      if (platform.phase === 'docked' && this.owners.disc === platform.index) this.platformGateOpen = ease(t)
      if (platform.phase === 'releasing') this.platformGateOpen = 1 - ease((t - .78) / .22)
      if (platform.phase === 'landing' && t > .82) this.platformPulse = ease((t - .82) / .18)
    }

    this.discAngle = this.discReturn >= 0 ? module.discTravelAngle * (1 - ease(this.discReturn / 1.15)) : 0
    this.discPulse = 0
    if (disc) {
      if (disc.phase === 'discRotating') { this.discAngle = module.discTravelAngle * ease(disc.progress); this.discPulse = .5 }
      if (disc.phase === 'rail' && disc.segment === 'suspendedA') this.discAngle = module.discTravelAngle
      if (disc.phase === 'discReceiving') this.discPulse = ease(disc.progress)
    }

    this.chamberLowerGateOpen = 0
    this.chamberUpperGateOpen = 0
    this.chamberStatusPulse = 0
    this.chamberRingPulse[0] = this.chamberRingPulse[1] = this.chamberRingPulse[2] = 0
    if (chamber) {
      const t = chamber.progress
      if (chamber.phase === 'rail' && chamber.segment === 'chamberReceive') this.chamberLowerGateOpen = 1 - ease((t - .7) / .3)
      if (chamber.phase === 'chamberReceiving') this.chamberStatusPulse = ease(t)
      if (chamber.phase === 'chamberActivation') {
        this.chamberStatusPulse = .5 + .5 * ease(t)
        for (let index = 0; index < 3; index++) this.chamberRingPulse[index] = (chamber.phaseChaos ? .75 : .4) * ease((t - index * .23) / .31)
      }
      if (chamber.phase === 'chamberRising') {
        this.chamberStatusPulse = chamber.phaseChaos ? .9 : .55
        for (let index = 0; index < 3; index++) {
          const distance = Math.abs(chamber.position.y - module.chamberRingHeights[index])
          this.chamberRingPulse[index] = (chamber.phaseChaos ? .55 : .4) + (chamber.phaseChaos ? .65 : .6) * Math.max(0, 1 - distance / .48)
        }
      }
      if (chamber.phase === 'chamberDocked') {
        this.chamberUpperGateOpen = ease(t)
        this.chamberStatusPulse = .55 * (1 - ease(t))
        for (let index = 0; index < 3; index++) this.chamberRingPulse[index] = .4 * (1 - ease(t))
      }
      if (chamber.phase === 'chamberReleasing') this.chamberUpperGateOpen = 1
    }
  }

  snapshot() {
    const occupancy = Object.fromEntries((Object.keys(this.owners) as Mechanism[]).map(name => [name, this.owner(name)?.id ?? null])) as Record<Mechanism, string | null>
    return {
      marbleCount: this.marbles.length, maxMarbles: MAX_LOOP_MARBLES, pendingReleaseRequests: this.pendingReleaseRequests,
      cycles: this.cycles, paused: this.paused, routeMode: this.routeMode, nextRoute: this.upcomingRoute(),
      operatingMode: this.operatingMode, visualChaos: this.visualChaos, randomState: this.randomState,
      routeChangePending: this.routeChangePending, tempo: this.tempo,
      diverterAngle: this.diverterAngle, occupancy,
      marbles: this.marbles.map(marble => ({ id: marble.id, phase: marble.phase, segment: marble.segment, route: marble.route, phaseDuration: marble.phaseDuration, phaseChaos: marble.phaseChaos, motionProfile: marble.motionProfile, motionSpeed: marble.motionSpeed, progress: marble.progress, cycles: marble.cycles, visible: marble.visible, position: marble.position.toArray(), waitReason: marble.waitReason, waitSeconds: marble.waitSeconds })),
      stalled: this.marbles.filter(marble => marble.waitSeconds > 12).map(marble => `${marble.id}:${marble.waitReason}`),
      transitions: [...this.transitions], radius, spacing,
    }
  }
}
