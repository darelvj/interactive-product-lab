import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { LoopMachine } from './LoopMachine'
import { LoopStoryCamera, type LoopStoryProgress } from './LoopStoryCamera'
import type { LoopTrafficSimulation } from './LoopTrafficSimulation'

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}

export default function LoopCanvas({ simulation, progress, overlayRef, activeBeat, onReady, onUnavailable }: {
  simulation: LoopTrafficSimulation
  progress: LoopStoryProgress
  overlayRef: RefObject<HTMLDivElement | null>
  activeBeat: number
  onReady: () => void
  onUnavailable: () => void
}) {
  const [failed, setFailed] = useState(() => !supportsWebGL())
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onLost = useCallback((event: Event) => { event.preventDefault(); setFailed(true); onUnavailable() }, [onUnavailable])
  useEffect(() => () => canvasRef.current?.removeEventListener('webglcontextlost', onLost), [onLost])
  useEffect(() => { if (failed) onUnavailable() }, [failed, onUnavailable])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  if (failed) return <div className="loop-inspection__fallback">3D preview is unavailable here. The connected track study is described below.</div>

  return <div className="loop-inspection__canvas" role="img" aria-label="Metallic marbles circulate through LOOP's helix and orbital routes, portals, magnetic platform, transfer disc, reverse gravity chamber, and return track">
    <Canvas
      frameloop={reducedMotion ? 'demand' : 'always'}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [7.8, 3.8, 15.4], fov: 27, near: .1, far: 50 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.22
        canvasRef.current = gl.domElement
        gl.domElement.addEventListener('webglcontextlost', onLost, { once: true })
        onReady()
      }}
    >
      <LoopStoryCamera progress={progress} overlayRef={overlayRef} activeBeat={activeBeat} reducedMotion={reducedMotion} />
      <LoopMachine reducedMotion={reducedMotion} simulation={simulation} progress={progress} />
    </Canvas>
  </div>
}
