import { Component, Suspense, lazy, type ReactNode } from 'react'
import { ChronosFallback } from './ChronosFallback'
import type { ChronosMode } from './ChronosTime'
import type { ChronosPlayback, ChronosRig } from './ChronosRig'
import type { RefObject } from 'react'

const ChronosCanvas = lazy(() => import('./ChronosCanvas'))

class ChronosCanvasBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function ChronosVisual({ mode, exploreMinutes, playback, rig, overlayRef, anatomyOverlayRef, onReady }: {
  mode: ChronosMode; exploreMinutes: number; playback: ChronosPlayback
  rig: ChronosRig; overlayRef: RefObject<HTMLDivElement | null>; anatomyOverlayRef: RefObject<HTMLDivElement | null>; onReady: () => void
}) {
  const fallback = <ChronosFallback mode={mode} exploreMinutes={exploreMinutes} />
  return <ChronosCanvasBoundary fallback={fallback}><Suspense fallback={fallback}><ChronosCanvas mode={mode} exploreMinutes={exploreMinutes} playback={playback} rig={rig} overlayRef={overlayRef} anatomyOverlayRef={anatomyOverlayRef} onReady={onReady} /></Suspense></ChronosCanvasBoundary>
}
