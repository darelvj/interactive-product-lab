import { Component, Suspense, lazy, type ReactNode, type RefObject } from 'react'
import type { LoopTrafficSimulation } from './LoopTrafficSimulation'
import type { LoopStoryProgress } from './LoopStoryCamera'

const LoopCanvas = lazy(() => import('./LoopCanvas'))
const fallback = <div className="loop-inspection__fallback">3D preview is unavailable here. The connected track study is described below.</div>

class LoopCanvasBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? fallback : this.props.children }
}

export function LoopVisual({ simulation, progress, overlayRef, activeBeat, onReady, onUnavailable }: {
  simulation: LoopTrafficSimulation
  progress: LoopStoryProgress
  overlayRef: RefObject<HTMLDivElement | null>
  activeBeat: number
  onReady: () => void
  onUnavailable: () => void
}) {
  return <LoopCanvasBoundary onUnavailable={onUnavailable}><Suspense fallback={<div className="loop-inspection__fallback">Preparing the machine study…</div>}><LoopCanvas simulation={simulation} progress={progress} overlayRef={overlayRef} activeBeat={activeBeat} onReady={onReady} onUnavailable={onUnavailable} /></Suspense></LoopCanvasBoundary>
}
