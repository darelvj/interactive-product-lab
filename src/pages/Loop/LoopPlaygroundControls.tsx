import { useState, useSyncExternalStore } from 'react'
import { type LoopOperatingMode, type LoopRouteMode, type LoopTrafficSimulation } from './LoopTrafficSimulation'

const modes: { value: LoopRouteMode; label: string }[] = [
  { value: 'AUTO', label: 'Auto' },
  { value: 'HELIX', label: 'Helix' },
  { value: 'ORBIT', label: 'Orbit' },
]

export function LoopPlaygroundControls({ simulation, sceneStatus }: { simulation: LoopTrafficSimulation; sceneStatus: 'loading' | 'ready' | 'unavailable' }) {
  const state = useSyncExternalStore(simulation.subscribe, simulation.getControlState, simulation.getControlState)
  const [feedback, setFeedback] = useState('The machine is ready.')
  const atCapacity = state.marbleCount + state.pendingReleaseRequests >= state.maxMarbles
  const available = sceneStatus === 'ready'

  const chooseRoute = (mode: LoopRouteMode) => {
    simulation.setRouteMode(mode)
    setFeedback(mode === 'AUTO' ? 'Automatic alternation selected for future launches.' : `${mode === 'HELIX' ? 'Helix' : 'Orbit'} selected for future launches.`)
  }

  const releaseMarble = () => {
    const result = simulation.requestMarble()
    setFeedback(result === 'released' ? 'A marble is at the launcher.' : result === 'queued' ? 'Marble queued for the launcher.' : 'The machine is at capacity.')
  }

  const togglePlayback = () => {
    if (state.paused) { simulation.resume(); setFeedback('Machine resumed.') }
    else { simulation.pause(); setFeedback('Machine paused in place.') }
  }

  const reset = () => { simulation.reset(); setFeedback('Machine reset to Flow, three marbles, Auto route, and 1.0× tempo.') }

  const chooseOperatingMode = (mode: LoopOperatingMode) => {
    simulation.setOperatingMode(mode)
    setFeedback(mode === 'FLOW' ? 'Flow: synchronized circulation restored.' : 'Chaos: magnetic surges and varied rail motion active.')
  }

  return <div className="loop-console" role="group" aria-label="LOOP playground controls">
    <div className="loop-console__panel loop-console__panel--left">
      <div className="loop-console__topline"><span>EXPERIMENT / 001</span></div>
      <fieldset className="loop-console__mode">
        <legend>OPERATING MODE</legend>
        <div className="loop-console__mode-body">
          <div className="loop-console__segments loop-console__mode-options">
            {(['FLOW', 'CHAOS'] as const).map(mode => <button key={mode} type="button" aria-pressed={state.operatingMode === mode} disabled={!available} onClick={() => chooseOperatingMode(mode)}>{mode}</button>)}
          </div>
          <p>{state.operatingMode === 'FLOW' ? 'Predictable motion. Perfect rhythm.' : 'Same machine. Unexpected decisions.'}</p>
          <span className="loop-console__mode-status">{state.operatingMode === 'FLOW' ? 'FLOW / SYNCHRONIZED' : 'CHAOS / SURGES ACTIVE'}</span>
        </div>
      </fieldset>
      <fieldset className="loop-console__module loop-console__module--route">
        <legend>01 / CHOOSE A ROUTE</legend>
        <div className="loop-console__segments">
          {modes.map(mode => <button key={mode.value} type="button" aria-pressed={state.routeMode === mode.value} disabled={!available} onClick={() => chooseRoute(mode.value)}>{mode.label}</button>)}
        </div>
        <p>{state.routeMode === 'AUTO' ? `Next: ${state.nextRoute === 'A' ? 'Helix' : 'Orbit'}` : `${state.routeMode === 'HELIX' ? 'Helix' : 'Orbit'} on future launches`}{state.routeChangePending ? ' · Diverter aligning' : ''}</p>
      </fieldset>
    </div>
    <div className="loop-console__panel loop-console__panel--right">
      <div className="loop-console__topline"><span className="loop-console__system"><i aria-hidden="true" data-paused={state.paused} />SYSTEM {state.paused ? 'PAUSED' : 'ACTIVE'}</span></div>
      <div className="loop-console__module loop-console__module--release">
        <span className="loop-console__label">02 / ADD MOTION</span>
        <button className="loop-console__release" type="button" onClick={releaseMarble} disabled={!available || atCapacity}>Release marble <span aria-hidden="true">↗</span></button>
        <p>{state.marbleCount} active / {state.maxMarbles} maximum{state.pendingReleaseRequests ? ` · ${state.pendingReleaseRequests} queued` : ''}{atCapacity ? ' · At capacity' : ''}</p>
      </div>

      <div className="loop-console__module loop-console__module--tempo">
        <label className="loop-console__label" htmlFor="loop-tempo">03 / SET THE TEMPO <strong>{state.tempo.toFixed(1)}×</strong></label>
        <input id="loop-tempo" type="range" min="0.5" max="1.5" step="0.1" value={state.tempo} disabled={!available} aria-valuetext={`${state.tempo.toFixed(1)} times speed`} onChange={event => simulation.setTempo(Number(event.target.value))} />
        <div className="loop-console__range"><span>0.5×</span><span>1.5×</span></div>
      </div>

      <div className="loop-console__module loop-console__module--playback">
        <span className="loop-console__label">04 / PLAYBACK</span>
        <div className="loop-console__actions">
          <button type="button" disabled={!available} onClick={togglePlayback}>{state.paused ? 'Resume' : 'Pause'} <span aria-hidden="true">{state.paused ? '▷' : 'Ⅱ'}</span></button>
          <button type="button" disabled={!available} onClick={reset}>Reset <span aria-hidden="true">↺</span></button>
        </div>
        <p>Pause holds every mechanism in place.</p>
      </div>
      <p className="loop-console__feedback" role="status" aria-live="polite">{sceneStatus === 'unavailable' ? '3D preview is unavailable on this device. The route is described below.' : sceneStatus === 'loading' ? 'Preparing the machine…' : feedback}</p>
    </div>
  </div>
}
