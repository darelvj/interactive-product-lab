import { Link } from 'react-router-dom'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import { LoopVisual } from './LoopVisual'
import { LoopPlaygroundControls } from './LoopPlaygroundControls'
import { LoopTrafficSimulation } from './LoopTrafficSimulation'
import { LOOP_BEATS } from './LoopCameraStory'
import { LoopAnnotations } from './LoopAnnotations'
import { useLoopStory } from './useLoopStory'
import type { LoopStoryProgress } from './LoopStoryCamera'
import './loop.css'

export function LoopInspectionPage() {
  // The controller outlives the canvas and will also serve the playground controls.
  const [simulation] = useState(() => new LoopTrafficSimulation(3))
  const controls = useSyncExternalStore(simulation.subscribe, simulation.getControlState, simulation.getControlState)
  const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const storyRef = useRef<HTMLDivElement>(null)
  const playgroundRef = useRef<HTMLElement>(null)
  const finaleRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const progress = useRef<LoopStoryProgress>({ value: 0, entrance: 0, finale: 0 }).current
  const [activeBeat, setActiveBeat] = useState(-1)
  const onSceneReady = useCallback(() => setSceneStatus('ready'), [])
  const onSceneUnavailable = useCallback(() => setSceneStatus('unavailable'), [])
  useLoopStory({ storyRef, playgroundRef, finaleRef, progress, onBeatChange: setActiveBeat })
  return <div className="site loop-inspection" data-simulation-mode={controls.operatingMode}>
    <main id="main-content" tabIndex={-1} className="loop-inspection__main">
      <div className="loop-inspection__mast"><span>OBJECT 003 / MOTION STUDY</span><span>APPARATUS 01 + MODULE 02</span></div>
      <div className="loop-story" ref={storyRef}>
        <div className="loop-story__stage">
          <div className="loop-inspection__scene"><LoopVisual simulation={simulation} progress={progress} overlayRef={overlayRef} activeBeat={activeBeat} onReady={onSceneReady} onUnavailable={onSceneUnavailable} /></div>
          <LoopAnnotations activeBeat={activeBeat} overlayRef={overlayRef} />
        </div>
        <div className="loop-story__content">
          <section className="loop-inspection__intro" aria-labelledby="loop-title">
            <div className="loop-inspection__intro-copy"><span className="loop-inspection__eyebrow">AN EXPERIMENT IN PERPETUAL MOTION</span><h1 id="loop-title">LOOP<span>.</span></h1><p className="loop-inspection__tagline">Beautifully pointless.</p><p className="loop-inspection__description">A machine built to go nowhere. Every ending becomes another beginning.</p></div>
            <div className="loop-inspection__intro-links"><a className="loop-inspection__enter" href="#loop-exploration">Explore the mechanism <span aria-hidden="true">↓</span></a><a href="#playground">Enter playground ↗</a></div>
          </section>
          <section className="loop-cinematic" id="loop-exploration" aria-label="Explore the LOOP apparatus">
            {LOOP_BEATS.map((beat, index) => <div className={`loop-cinematic__beat loop-cinematic__beat--${index + 1}`} key={beat.number}>
              <div className="loop-cinematic__copy"><span className="loop-inspection__eyebrow">{beat.number}</span><h2>{beat.title}</h2><p>{beat.copy}</p><span className="loop-cinematic__index">LOOP / {String(index + 1).padStart(2, '0')} — 05</span></div>
            </div>)}
          </section>
          <section className="loop-playground" id="playground" ref={playgroundRef} aria-labelledby="playground-title">
            <div className="loop-playground__heading"><div><span className="loop-inspection__eyebrow">THE MACHINE IS YOURS / 001</span><h2 id="playground-title">Take control.</h2></div><div><p>A little interference makes everything more interesting.</p><p>Choose a route, release a marble, or change the tempo. The machine responds in real time.</p></div></div>
            <div className="loop-playground__machine-space" aria-hidden="true" />
            <LoopPlaygroundControls simulation={simulation} sceneStatus={sceneStatus} />
          </section>
          <section className="loop-finale" id="loop-finale" ref={finaleRef} aria-labelledby="loop-finale-title">
            <div className="loop-finale__copy">
              <span className="loop-inspection__eyebrow">LOOP / CONTINUOUS MOTION</span>
              <h2 id="loop-finale-title"><span>Nothing ends.</span><span>Everything returns.</span></h2>
              <p>A continuous experiment in motion.</p>
              <Link to="/#collection">Back to the collection <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        </div>
      </div>
      <div className="loop-inspection__route"><span>THE CLOSED ROUTE</span><p>Launcher → Diverter → Helix or Orbit → Collection → Portals → Magnetic Platform → Transfer Disc → Suspended Rails → Reverse Gravity Chamber → Elevated Return → Launcher</p><Link to="/#collection">← Back to the collection</Link></div>
    </main>
  </div>
}
