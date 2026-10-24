import { useMemo } from 'react'
import { Shape } from 'three'
import { AnnularPlate, ShapedPlate } from './ChronosGeometry'
import { bezelMetal, caseMetal, champagne, edgeMetal, movementDark, strapMaterial, strapSeam } from './ChronosMaterials'

const lugOutline = [
  [0.69, 1.07], [1.03, 1.03], [1.14, 1.17], [1.02, 1.75],
  [0.84, 1.76], [0.77, 1.47],
] as const

function Lugs() {
  return <group name="integrated-lugs">
    {[-1, 1].flatMap(vertical => [-1, 1].map(horizontal =>
      <group key={`${horizontal}-${vertical}`} scale={[horizontal, vertical, 1]}>
        <ShapedPlate points={lugOutline} z={-0.20} depth={0.22} name="sculpted-lug"><meshStandardMaterial {...caseMetal} /></ShapedPlate>
        <mesh position={[0.91, 1.67, 0.045]} name="lug-pin">
          <boxGeometry args={[0.24, 0.025, 0.025]} />
          <meshStandardMaterial {...edgeMetal} />
        </mesh>
      </group>,
    ))}
  </group>
}

function Crown() {
  return <group name="machined-crown">
    <mesh position={[1.55, 0, -0.015]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.085, 0.085, 0.18, 24]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>
    <mesh position={[1.72, 0, -0.015]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.18, 32]} />
      <meshStandardMaterial {...caseMetal} />
    </mesh>
    {Array.from({ length: 20 }, (_, index) => {
      const angle = index * Math.PI / 10
      return <mesh key={index} name="crown-knurl" position={[1.72, Math.sin(angle) * .158, Math.cos(angle) * .158 - .015]} rotation={[angle, 0, 0]}>
        <boxGeometry args={[.127, .011, .008]} />
        <meshStandardMaterial {...bezelMetal} />
      </mesh>
    })}
    <mesh position={[1.82, 0, -0.015]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.119, 0.013, 6, 32]} />
      <meshStandardMaterial {...champagne} />
    </mesh>
  </group>
}

export function ChronosCase() {
  return <group name="layered-case">
    <AnnularPlate name="mid-case" outer={1.5} inner={1.225} z={-0.24} depth={0.37}><meshStandardMaterial {...caseMetal} /></AnnularPlate>
    <mesh position={[0, 0, .136]} name="case-upper-chamfer"><torusGeometry args={[1.483, .014, 6, 72]} /><meshStandardMaterial {...edgeMetal} /></mesh>
    <Lugs />
    <Crown />
  </group>
}

export function ChronosBezel() {
  return <group name="bezel-and-retaining-structure">
    <AnnularPlate name="stepped-shoulder" outer={1.51} inner={1.28} z={0.14} depth={0.075}><meshStandardMaterial {...movementDark} /></AnnularPlate>
    <AnnularPlate name="thin-bezel" outer={1.45} inner={1.27} z={0.25} depth={0.07}><meshStandardMaterial {...bezelMetal} /></AnnularPlate>
    <mesh position={[0, 0, 0.34]} name="bezel-chamfer"><torusGeometry args={[1.414, 0.014, 6, 64]} /><meshStandardMaterial {...edgeMetal} /></mesh>
    <mesh position={[0, 0, 0.34]} name="inner-lip"><torusGeometry args={[1.278, 0.014, 6, 64]} /><meshStandardMaterial {...champagne} /></mesh>
    {Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2 + Math.PI / 8
      return <mesh key={index} position={[Math.sin(angle) * 1.351, Math.cos(angle) * 1.351, 0.35]} name="bezel-fastener">
        <sphereGeometry args={[0.021, 8, 6]} />
        <meshStandardMaterial {...edgeMetal} />
      </mesh>
    })}
  </group>
}

export function ChronosCaseBack() {
  return <group name="case-back">
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.32]}>
      <cylinderGeometry args={[1.205, 1.205, 0.055, 64]} />
      <meshStandardMaterial name="case-back" color="#171e1d" metalness={0.28} roughness={0.68} />
    </mesh>
    <AnnularPlate name="rear-retaining-ring" outer={1.42} inner={1.18} z={-0.35} depth={0.055}><meshStandardMaterial {...movementDark} /></AnnularPlate>
    <mesh position={[0, 0, -0.285]} name="case-back-machined-edge">
      <torusGeometry args={[1.2, 0.011, 6, 64]} />
      <meshStandardMaterial {...edgeMetal} />
    </mesh>
  </group>
}

function StrapPiece({ side }: { side: -1 | 1 }) {
  const profile = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-0.79, 0)
    shape.lineTo(0.79, 0)
    shape.lineTo(0.68, 0.72)
    shape.quadraticCurveTo(0.65, 0.97, 0.53, 1.09)
    shape.lineTo(-0.53, 1.09)
    shape.quadraticCurveTo(-0.65, 0.97, -0.68, 0.72)
    shape.closePath()
    return shape
  }, [])
  return <group position={[0, side * 1.58, -0.18]} rotation={[0, 0, side < 0 ? Math.PI : 0]}>
    <mesh name="tapered-technical-strap">
      <extrudeGeometry args={[profile, { depth: 0.10, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.022, bevelSegments: 2, curveSegments: 8 }]} />
      <meshStandardMaterial {...strapMaterial} />
    </mesh>
    {[-0.59, 0.59].map(edge => <mesh key={edge} position={[edge, 0.47, 0.13]} name="strap-edge-seam">
      <boxGeometry args={[0.012, 0.7, 0.006]} />
      <meshStandardMaterial {...strapSeam} />
    </mesh>)}
    <mesh position={[0, 0.1, 0.15]} name="integrated-attachment">
      <boxGeometry args={[1.47, 0.032, 0.025]} />
      <meshStandardMaterial {...movementDark} />
    </mesh>
  </group>
}

export function ChronosStrap() {
  return <group name="strap"><StrapPiece side={1} /><StrapPiece side={-1} /></group>
}
