import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { AnnularPlate } from './ChronosGeometry'
import { champagne, edgeMetal, movementDark, paleMarker } from './ChronosMaterials'
import type { ChronosRig } from './ChronosRig'

const markers = Array.from({ length: 60 }, (_, index) => index).filter(index => index % 5 === 0 || index % 2 === 0)

function DialSignature() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const context = canvas.getContext('2d')
    if (!context) return null
    context.fillStyle = '#e7dec9'
    context.font = '600 39px Manrope, Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('CHRONOS', 256, 48)
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [])
  useEffect(() => () => texture?.dispose(), [texture])
  return <group name="dial-signature">
    <mesh position={[0, 0.81, 0.314]}><boxGeometry args={[0.64, 0.15, 0.025]} /><meshStandardMaterial {...movementDark} /></mesh>
    {texture && <mesh position={[0, 0.81, 0.332]}><planeGeometry args={[0.57, 0.105]} /><meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} /></mesh>}
  </group>
}

export function ChronosDial() {
  return <group name="skeleton-dial">
    <AnnularPlate name="open-chapter-ring" outer={1.26} inner={0.995} z={0.22} depth={0.058}><meshStandardMaterial {...movementDark} /></AnnularPlate>
    <mesh position={[0, 0, 0.29]}><torusGeometry args={[1.205, 0.009, 6, 64]} /><meshStandardMaterial {...edgeMetal} /></mesh>
    <mesh position={[0, 0, 0.29]}><torusGeometry args={[1.018, 0.009, 6, 64]} /><meshStandardMaterial {...champagne} /></mesh>
    {markers.map(index => {
      const angle = (index / 60) * Math.PI * 2
      const major = index % 5 === 0
      return <mesh key={index} position={[Math.sin(angle) * (major ? 1.115 : 1.143), Math.cos(angle) * (major ? 1.115 : 1.143), 0.307]} rotation={[0, 0, -angle]} name={major ? 'hour-marker' : 'minute-marker'}>
        <boxGeometry args={[major ? 0.026 : 0.009, major ? 0.15 : 0.045, 0.013]} />
        <meshStandardMaterial {...(major ? paleMarker : edgeMetal)} />
      </mesh>
    })}
    {[0, 3, 6, 9].map(index => {
      const angle = (index / 12) * Math.PI * 2
      return <mesh key={index} position={[Math.sin(angle) * 0.89, Math.cos(angle) * 0.89, 0.311]} rotation={[0, 0, -angle]} name="quarter-index">
        <boxGeometry args={[0.027, 0.14, 0.013]} />
        <meshStandardMaterial {...champagne} />
      </mesh>
    })}
    <DialSignature />
  </group>
}

export function ChronosCrystal({ rig }: { rig: ChronosRig }) {
  return <group name="crystal">
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.535]}>
      <cylinderGeometry args={[1.265, 1.265, 0.01, 64]} />
      <meshPhysicalMaterial ref={node => { rig.crystalMaterial = node }} color="#dce3df" transparent opacity={0.018} roughness={0.08} metalness={0} depthWrite={false} />
    </mesh>
    <mesh position={[0, 0, 0.548]}><torusGeometry args={[1.267, 0.011, 6, 64]} /><meshStandardMaterial {...edgeMetal} /></mesh>
  </group>
}
