import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Vite's SSR loader resolves the same TypeScript modules used by the canvas,
// without launching a browser or a second rendering loop.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { LoopTrafficSimulation, MAX_LOOP_MARBLES } = await vite.ssrLoadModule('/src/pages/Loop/LoopTrafficSimulation.ts')
  const { loopTracks, loopModulePositions, validateLoopTrackGraph } = await vite.ssrLoadModule('/src/pages/Loop/LoopTrackGraph.ts')
  assert.deepEqual(validateLoopTrackGraph(), [])
  for (const [first, next] of [['feedB', 'orbit'], ['orbit', 'exitB']]) {
    assert(loopTracks[first].end.distanceTo(loopTracks[next].start) < 1e-6)
    assert(loopTracks[first].curve.getTangentAt(1).dot(loopTracks[next].curve.getTangentAt(0)) > .96, `${first} to ${next} has a sharp handoff`)
  }
  for (let index = 0; index <= 40; index++) {
    const t = index / 40
    const orbit = loopTracks.orbit.curve.getPoint(t)
    assert(Math.abs(Math.hypot(orbit.x - 1.52, orbit.y - .02) - 1.05) < 1e-6)
    for (const id of ['feedB', 'exitB']) {
      const point = loopTracks[id].curve.getPoint(t)
      assert(Math.hypot(point.x - 1.52, point.y - .02) >= 1.05 - .025, `${id} cuts across the orbital ring`)
    }
  }
  const sim = new LoopTrafficSimulation(3)
  assert.equal(MAX_LOOP_MARBLES, 6)
  const pendingRoute = new LoopTrafficSimulation(1)
  const stableState = pendingRoute.getControlState()
  pendingRoute.step(.01)
  assert.equal(pendingRoute.getControlState(), stableState)
  pendingRoute.pause()
  pendingRoute.setRouteMode('ORBIT')
  assert.equal(pendingRoute.getControlState().routeChangePending, true)
  pendingRoute.resume()
  pendingRoute.advance(2)
  assert.equal(pendingRoute.getControlState().routeChangePending, false)
  const alternating = new LoopTrafficSimulation(1)
  alternating.advance(120)
  const autoRoutes = alternating.transitions.filter(event => event.includes(':route:')).map(event => event.slice(-1))
  assert.deepEqual(autoRoutes.slice(0, 3), ['A', 'B', 'A'])

  const chaosA = new LoopTrafficSimulation(3, 123456)
  const chaosB = new LoopTrafficSimulation(3, 123456)
  const chaosOther = new LoopTrafficSimulation(3, 654321)
  const flowComparison = new LoopTrafficSimulation(3, 123456)
  for (const machine of [chaosA, chaosB, chaosOther]) machine.setOperatingMode('CHAOS')
  assert.equal(chaosA.getControlState().operatingMode, 'CHAOS')
  assert.equal(chaosA.marbles[0].phaseDuration, .52, 'mode changes preserve a staged launch duration')
  assert(chaosA.marbles.filter(marble => marble.phase === 'rail').every(marble => marble.motionProfile), 'moving rail marbles receive a profile immediately')
  for (let index = 0; index < 160; index++) {
    chaosA.step(.05)
    chaosB.step(.05)
    chaosOther.step(.05)
    flowComparison.step(.05)
  }
  assert.deepEqual(chaosA.snapshot(), chaosB.snapshot(), 'seeded changes remain deterministic in the first eight seconds')
  assert(chaosA.marbles.some(marble => Math.abs(marble.motionSpeed - 1) > .2), 'CHAOS rail speed visibly differs within eight seconds')
  assert.notDeepEqual(chaosA.snapshot().marbles.map(marble => marble.position), flowComparison.snapshot().marbles.map(marble => marble.position), 'moving marbles visibly diverge from FLOW')
  assert(chaosA.marbles.length >= 3 && chaosA.marbles.length <= 5, 'automatic CHAOS bursts stay bounded')
  const chaosDurations = new Set()
  let chaosMaxWait = 0
  let burstObserved = false
  let portalVariationSeen = false
  let platformAlignmentSeen = false
  let chamberSurgeSeen = false
  for (let index = 0; index < 14000; index++) {
    for (const machine of [chaosA, chaosB, chaosOther]) machine.step(.05)
    if (index % 20 !== 0) continue
    const snap = chaosA.snapshot()
    assert(snap.marbleCount >= 3 && snap.marbleCount <= 5)
    if (snap.marbleCount > 3) burstObserved = true
    assert.equal(new Set(snap.marbles.map(marble => marble.id)).size, snap.marbleCount)
    assert(Object.values(snap.occupancy).every(id => id === null || snap.marbles.some(marble => marble.id === id)))
    for (const marble of chaosA.marbles) {
      if (marble.phase !== 'rail') continue
      for (const other of chaosA.marbles) {
        if (other.index <= marble.index || other.phase !== 'rail' || other.segment !== marble.segment) continue
        assert(Math.abs(other.distance - marble.distance) >= snap.spacing - 1e-5, `CHAOS rail overlap on ${marble.segment}`)
      }
    }
    for (const marble of snap.marbles) {
      chaosMaxWait = Math.max(chaosMaxWait, marble.waitSeconds)
      if (marble.phase === 'waiting' && marble.phaseDuration !== null) chaosDurations.add(marble.phaseDuration.toFixed(4))
      if (marble.phase === 'portalIn' && marble.phaseChaos && Math.abs(marble.phaseDuration - .3) > .03) portalVariationSeen = true
      if (marble.phase === 'impact' && marble.phaseChaos) {
        assert(Math.abs(marble.position[1] - loopModulePositions.platformUpper.y - chaosA.platformOffset) < 1e-6, 'platform and marble share the impact offset')
        platformAlignmentSeen = true
      }
      if (marble.phase === 'chamberRising' && marble.phaseChaos) {
        assert(marble.phaseDuration < 2.1, 'CHAOS chamber rise is faster than FLOW')
        assert(Math.abs(marble.position[0] - loopModulePositions.chamberLower.x) < 1e-6)
        assert(Math.abs(marble.position[2] - loopModulePositions.chamberLower.z) < 1e-6)
        chamberSurgeSeen = true
      }
    }
  }
  assert(burstObserved, 'CHAOS adds a bounded launcher burst when capacity permits')
  assert(portalVariationSeen && platformAlignmentSeen && chamberSurgeSeen, 'portal, platform, and chamber CHAOS phases all occur')
  assert.deepEqual(chaosA.snapshot(), chaosB.snapshot(), 'same seed and time steps reproduce the complete simulation')
  assert.notEqual(chaosA.snapshot().randomState, chaosOther.snapshot().randomState, 'different seeds produce different decisions')
  assert(chaosA.cycles > 20)
  assert(chaosA.marbles.every(marble => marble.cycles >= 2))
  assert(chaosMaxWait < 30)
  assert(chaosDurations.size > 3, 'CHAOS varies future launch intervals')
  assert(chaosA.transitions.some(event => event.includes(':route:A')))
  assert(chaosA.transitions.some(event => event.includes(':route:B')))
  assert(chaosA.marbles.some(marble => marble.phaseDuration !== .52 || marble.phase !== 'waiting'))
  const recentRoutes = chaosA.transitions.filter(event => event.includes(':route:')).map(event => event.slice(-1))
  for (let index = 2; index < recentRoutes.length; index++) assert(!(recentRoutes[index] === recentRoutes[index - 1] && recentRoutes[index] === recentRoutes[index - 2]), 'CHAOS must break long same-route streaks')

  const crowdedChaos = new LoopTrafficSimulation(3, 8080)
  crowdedChaos.setOperatingMode('CHAOS')
  for (let index = 0; index < 3; index++) assert.notEqual(crowdedChaos.requestMarble(), 'capacity')
  let crowdedMaxWait = 0
  for (let index = 0; index < 16000; index++) {
    crowdedChaos.step(.05)
    if (index % 20 !== 0) continue
    const snap = crowdedChaos.snapshot()
    assert.equal(snap.marbleCount + snap.pendingReleaseRequests, 6)
    assert.equal(new Set(snap.marbles.map(marble => marble.id)).size, snap.marbleCount)
    for (const marble of snap.marbles) crowdedMaxWait = Math.max(crowdedMaxWait, marble.waitSeconds)
  }
  assert(crowdedChaos.cycles > 30)
  assert(crowdedChaos.marbles.every(marble => marble.cycles >= 2))
  assert(crowdedMaxWait < 30)

  const chaosNormalTempo = new LoopTrafficSimulation(1, 4242)
  const chaosHalfTempo = new LoopTrafficSimulation(1, 4242)
  chaosNormalTempo.setOperatingMode('CHAOS')
  chaosHalfTempo.setOperatingMode('CHAOS')
  chaosHalfTempo.setTempo(.5)
  for (let index = 0; index < 300; index++) { chaosNormalTempo.step(.025); chaosHalfTempo.step(.05) }
  assert.deepEqual(chaosHalfTempo.snapshot().marbles, chaosNormalTempo.snapshot().marbles, 'tempo scales CHAOS mechanisms and travel together')

  const override = new LoopTrafficSimulation(1, 123456)
  override.setOperatingMode('CHAOS')
  override.setRouteMode('HELIX')
  override.advance(120)
  assert(override.transitions.some(event => event.includes(':route:')))
  assert(override.transitions.filter(event => event.includes(':route:')).every(event => event.endsWith(':A')))
  override.setRouteMode('ORBIT')
  override.advance(120)
  assert(override.transitions.filter(event => event.includes(':route:')).slice(-3).every(event => event.endsWith(':B')))
  const committedChaos = override.marbles.map(marble => [marble.id, marble.route, marble.position.toArray()])
  override.setOperatingMode('FLOW')
  assert.deepEqual(override.marbles.map(marble => [marble.id, marble.route, marble.position.toArray()]), committedChaos, 'mode switching does not displace active marbles')
  override.setOperatingMode('CHAOS')
  override.pause()
  const frozen = override.snapshot()
  override.step(5)
  assert.deepEqual(override.snapshot(), frozen, 'pause freezes mode-driven timing and random decisions')
  override.resume()
  override.setTempo(.5)
  override.step(.05)
  assert.notDeepEqual(override.snapshot(), frozen)
  override.reset()
  assert.equal(override.snapshot().operatingMode, 'FLOW')
  assert.equal(override.snapshot().randomState, 123456)
  assert.equal(override.snapshot().visualChaos, 0)
  let notifications = 0
  const unsubscribe = sim.subscribe(() => { notifications++ })
  sim.setEnvironmentPaused(true)
  assert.equal(sim.paused, true)
  sim.setEnvironmentPaused(false)
  assert.equal(sim.paused, false)

  sim.setRouteMode('HELIX')
  sim.advance(15)
  assert(sim.marbles.filter(marble => marble.route).every(marble => marble.route === 'A'))
  const committed = sim.marbles.filter(marble => marble.route).map(marble => [marble.id, marble.route])
  sim.setRouteMode('ORBIT')
  for (const [id, route] of committed) assert.equal(sim.marbles.find(marble => marble.id === id)?.route, route)
  sim.advance(24)
  assert(sim.transitions.some(event => event.includes(':route:B')))
  sim.setRouteMode('AUTO')
  sim.advance(55)
  assert(sim.transitions.some(event => event.includes(':route:A')))
  assert(sim.transitions.some(event => event.includes(':route:B')))
  assert(notifications >= 5)
  unsubscribe()

  const beforePause = sim.snapshot()
  const mechanismPose = [sim.platformOffset, sim.discAngle, sim.entrancePulse, sim.chamberStatusPulse]
  sim.pause()
  sim.setOperatingMode('CHAOS')
  sim.step(5)
  const afterPause = sim.snapshot()
  assert.deepEqual(afterPause.marbles.map(({ position, progress, phase, segment }) => ({ position, progress, phase, segment })), beforePause.marbles.map(({ position, progress, phase, segment }) => ({ position, progress, phase, segment })))
  assert.equal(afterPause.diverterAngle, beforePause.diverterAngle)
  assert.deepEqual([sim.platformOffset, sim.discAngle, sim.entrancePulse, sim.chamberStatusPulse], mechanismPose)
  sim.resume()
  sim.step(.05)
  assert.notDeepEqual(sim.snapshot().marbles, beforePause.marbles)

  const normal = new LoopTrafficSimulation(1)
  const slow = new LoopTrafficSimulation(1)
  slow.setTempo(.5)
  for (let index = 0; index < 100; index++) { normal.step(.025); slow.step(.05) }
  assert.deepEqual(slow.snapshot().marbles, normal.snapshot().marbles)
  sim.setTempo(10)
  assert.equal(sim.tempo, 1.5)
  sim.setTempo(1)

  for (let index = 0; index < 3; index++) assert.notEqual(sim.requestMarble(), 'capacity')
  assert.equal(sim.requestMarble(), 'capacity')
  assert.equal(sim.marbles.length + sim.pendingReleaseRequests, 6)
  let maxWait = 0
  const routes = new Set()
  for (let index = 0; index < 16000; index++) {
    sim.step(.05)
    if (index % 20 !== 0) continue
    const snap = sim.snapshot()
    assert.equal(snap.marbleCount + snap.pendingReleaseRequests, 6)
    assert.equal(new Set(snap.marbles.map(marble => marble.id)).size, snap.marbleCount)
    assert(Object.values(snap.occupancy).every(id => id === null || snap.marbles.some(marble => marble.id === id)))
    for (const marble of sim.marbles) {
      if (marble.phase !== 'rail') continue
      for (const other of sim.marbles) {
        if (other.index <= marble.index || other.phase !== 'rail' || other.segment !== marble.segment) continue
        assert(Math.abs(other.distance - marble.distance) >= snap.spacing - 1e-5, `rail overlap on ${marble.segment}`)
      }
    }
    for (const marble of snap.marbles) {
      maxWait = Math.max(maxWait, marble.waitSeconds)
      if (marble.route) routes.add(marble.route)
    }
  }
  const final = sim.snapshot()
  assert.equal(final.marbleCount, 6)
  assert.equal(final.pendingReleaseRequests, 0)
  assert(final.cycles > 30)
  assert(final.marbles.every(marble => marble.cycles >= 2))
  assert.deepEqual([...routes].sort(), ['A', 'B'])
  assert(maxWait < 30)

  sim.pause()
  sim.setRouteMode('ORBIT')
  sim.setTempo(.5)
  sim.reset()
  const reset = sim.snapshot()
  assert.equal(reset.marbleCount, 3)
  assert.equal(reset.pendingReleaseRequests, 0)
  assert.equal(reset.routeMode, 'AUTO')
  assert.equal(reset.operatingMode, 'FLOW')
  assert.equal(reset.tempo, 1)
  assert.equal(reset.paused, false)
  assert.equal(reset.cycles, 0)
  console.log(`LOOP controls passed: ${final.cycles} completed cycles, 6 marbles, both routes, maximum wait ${maxWait.toFixed(1)}s`)
} finally {
  await vite.close()
}
