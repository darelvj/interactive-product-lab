import { Link } from 'react-router-dom'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { LoopVisual } from './LoopVisual'
import { LoopPlaygroundControls } from './LoopPlaygroundControls'
import { LoopTrafficSimulation } from './LoopTrafficSimulation'
import './loop.css'

export function LoopInspectionPage() {
  // The controller outlives the canvas and will also serve the playground controls.
  const [simulation] = useState(() => new LoopTrafficSimulation(3))
  const controls = useSyncExternalStore(simulation.subscribe, simulation.getControlState, simulation.getControlState)
  const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const onSceneReady = useCallback(() => setSceneStatus('ready'), [])
  const onSceneUnavailable = useCallback(() => setSceneStatus('unavailable'), [])
  return <div className="site loop-inspection" data-simulation-mode={controls.operatingMode}>
    <main className="loop-inspection__main">
      <div className="loop-inspection__mast"><span>OBJECT 003 / MOTION STUDY</span><span>APPARATUS 01 + MODULE 02</span></div>
      <section className="loop-inspection__intro" aria-labelledby="loop-title">
        <div><span className="loop-inspection__eyebrow">LOOP / A KINETIC EXPERIMENT</span><h1 id="loop-title">A machine built<br/><em>to go nowhere.</em></h1><p>Beginning with three metallic spheres. Two linked assemblies. One continuous journey through mechanics, magnetism, and back again.</p></div>
        <a className="loop-inspection__enter" href="#playground">Enter playground <span aria-hidden="true">↓</span></a>
      </section>
      <section className="loop-playground" id="playground" aria-labelledby="playground-title">
        <div className="loop-playground__heading"><div><span className="loop-inspection__eyebrow">YOUR TURN / 001</span><h2 id="playground-title">Take control.</h2></div><div><p>A little interference makes everything more interesting.</p><p>Choose a route, release a marble, or change the tempo. The machine responds in real time.</p></div></div>
        <div className="loop-inspection__scene"><LoopVisual simulation={simulation} onReady={onSceneReady} onUnavailable={onSceneUnavailable} /></div>
        <LoopPlaygroundControls simulation={simulation} sceneStatus={sceneStatus} />
      </section>
      <div className="loop-inspection__route"><span>THE CLOSED ROUTE</span><p>Launcher → Diverter → Helix or Orbit → Collection → Portals → Magnetic Platform → Transfer Disc → Suspended Rails → Reverse Gravity Chamber → Elevated Return → Launcher</p><Link to="/#collection">← Back to the collection</Link></div>
    </main>
  </div>
}
