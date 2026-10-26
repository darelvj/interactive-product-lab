import { Component, Suspense, lazy, type ReactNode } from 'react'
import { AuraCanvasFallback } from './AuraCanvasFallback'
import type { AuraRig } from './AuraRig'

const AuraCanvas = lazy(() => import('./AuraCanvas'))

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <AuraCanvasFallback /> : this.props.children }
}

export function AuraVisual({ rig, onReady }: { rig: AuraRig; onReady: () => void }) {
  return <CanvasBoundary><Suspense fallback={<AuraCanvasFallback loading />}><AuraCanvas rig={rig} onReady={onReady} /></Suspense></CanvasBoundary>
}
