import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping, PerspectiveCamera } from 'three'
import { LoopMachine } from './LoopMachine'
import type { LoopTrafficSimulation } from './LoopTrafficSimulation'

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}

function MachineCamera() {
  const { camera, size, invalidate } = useThree()
  useEffect(() => {
    const perspective = camera as PerspectiveCamera
    const narrow = size.width < 650
    const tablet = size.width < 980
    perspective.position.set(narrow ? 6.8 : tablet ? 7.3 : 7.8, narrow ? 3.1 : tablet ? 3.5 : 3.8, narrow ? 20.2 : tablet ? 16.1 : 15.4)
    perspective.fov = narrow ? 34 : tablet ? 28 : 27
    perspective.lookAt(narrow ? 2.05 : 2.1, -.08, -.55)
    perspective.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, size.width])
  return null
}

export default function LoopCanvas({ simulation, onReady, onUnavailable }: { simulation: LoopTrafficSimulation; onReady: () => void; onUnavailable: () => void }) {
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
      <MachineCamera />
      <LoopMachine reducedMotion={reducedMotion} simulation={simulation} />
    </Canvas>
  </div>
}
