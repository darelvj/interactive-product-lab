import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { AuraBottleModel } from './AuraBottleModel'
import { AuraBottle } from './AuraBottle'
import { AuraLighting } from './AuraLighting'
import { AuraWater } from './AuraWater'
import type { AuraRig } from './AuraRig'

function SceneBridge({ rig, onReady }: { rig: AuraRig; onReady: () => void }) {
  const { camera, invalidate } = useThree()
  useEffect(() => {
    rig.camera = camera
    rig.invalidate = invalidate
    onReady()
    return () => { rig.camera = null; rig.invalidate = null }
  }, [camera, invalidate, onReady, rig])
  return null
}

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  }
  catch { return false }
}

export default function AuraCanvas({ rig, onReady }: { rig: AuraRig; onReady: () => void }) {
  const [failed, setFailed] = useState(() => !supportsWebGL())
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onContextLost = (event: Event) => { event.preventDefault(); setFailed(true) }

  useEffect(() => () => {
    canvasRef.current?.removeEventListener('webglcontextlost', onContextLost)
  }, [])

  if (failed) return <AuraBottle className="aura-hero__bottle" />

  return <div className="aura-hero__bottle aura-hero__canvas" role="img" aria-label="Three-dimensional AURA bottle in smoked silver with a brushed metal cap">
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 10], fov: 34, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.2
        canvasRef.current = gl.domElement
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true })
      }}
    >
      <AuraLighting rig={rig} />
      <group ref={node => { rig.turntable = node }} name="aura-turntable">
        <group ref={node => { rig.fluidPose = node }} name="aura-fluid-pose">
          <AuraBottleModel rig={rig} />
          <AuraWater rig={rig} />
        </group>
      </group>
      <SceneBridge rig={rig} onReady={onReady} />
    </Canvas>
  </div>
}
