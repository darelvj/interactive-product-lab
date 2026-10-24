import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { ChronosFallback } from './ChronosFallback'
import { ChronosLighting } from './ChronosLighting'
import { ChronosWatch } from './ChronosWatch'
import type { ChronosPlayback, ChronosRig } from './ChronosRig'
import { ChronosMotion } from './ChronosMotion'
import { ChronosPresentation, ChronosProjection } from './ChronosPresentation'
import type { ChronosMode } from './ChronosTime'

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}

export default function ChronosCanvas({ mode, exploreMinutes, playback, rig, overlayRef, anatomyOverlayRef, onReady }: {
  mode: ChronosMode; exploreMinutes: number; playback: ChronosPlayback
  rig: ChronosRig; overlayRef: RefObject<HTMLDivElement | null>; anatomyOverlayRef: RefObject<HTMLDivElement | null>; onReady: () => void
}) {
  const [failed, setFailed] = useState(() => !supportsWebGL())
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onLost = useCallback((event: Event) => { event.preventDefault(); setFailed(true) }, [])
  useEffect(() => () => canvasRef.current?.removeEventListener('webglcontextlost', onLost), [onLost])

  if (failed) return <ChronosFallback mode={mode} exploreMinutes={exploreMinutes} />

  return <div className="chronos-watch-canvas" role="img" aria-label="Three-dimensional CHRONOS skeleton watch showing local time with visible mechanical movement">
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 9.8], fov: 34, near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.28
        canvasRef.current = gl.domElement
        gl.domElement.addEventListener('webglcontextlost', onLost, { once: true })
      }}
    >
      <ChronosLighting rig={rig} />
      <ChronosPresentation rig={rig} onReady={onReady}>
        <ChronosWatch rig={rig} />
      </ChronosPresentation>
      <ChronosMotion rig={rig} mode={mode} exploreSeconds={exploreMinutes * 60} playback={playback} />
      <ChronosProjection rig={rig} overlayRef={overlayRef} anatomyOverlayRef={anatomyOverlayRef} />
    </Canvas>
  </div>
}
