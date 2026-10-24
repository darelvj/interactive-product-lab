import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, DoubleSide, Vector2, Vector3 } from 'three'
import { bodyFinish, createWordmarkTexture, metalFinish } from './AuraMaterials'
import type { AuraRig } from './AuraRig'

// Radius, height. Overall ratio follows the 240 × 623 visible silhouette of the SVG.
const bodyProfile = [
  [0, -2.30], [.70, -2.30], [.8, -2.27], [.865, -2.19],
  [.895, -2.08], [.90, -1.92], [.90, 1.04], [.895, 1.10],
].map(([radius, height]) => new Vector2(radius, height))

const shoulderProfile = [
  [.895, 1.09], [.887, 1.16], [.85, 1.25], [.77, 1.35],
  [.65, 1.48], [.52, 1.61], [.38, 1.72], [.35, 1.76],
].map(([radius, height]) => new Vector2(radius, height))

const neckProfile = [
  [.35, 1.73], [.35, 1.77], [.35, 1.95], [.335, 1.98],
  [.27, 1.98], [.265, 1.92], [.265, 1.72],
].map(([radius, height]) => new Vector2(radius, height))

// The cap is open underneath. The profile doubles back to form a visible wall.
const capShellProfile = [
  [.425, 1.75], [.475, 1.75], [.49, 1.78], [.49, 2.25],
  [.475, 2.30], [.43, 2.33], [.32, 2.34], [0, 2.34],
  [0, 2.275], [.405, 2.275], [.425, 2.24], [.425, 1.75],
].map(([radius, height]) => new Vector2(radius, height))

const insertProfile = [
  [.365, 1.76], [.417, 1.76], [.417, 2.14], [.405, 2.17],
  [.365, 2.17], [.365, 1.76],
].map(([radius, height]) => new Vector2(radius, height))

const gasketProfile = [
  [.30, 1.975], [.36, 1.975], [.37, 1.99], [.37, 2.03],
  [.36, 2.045], [.30, 2.045], [.30, 1.975],
].map(([radius, height]) => new Vector2(radius, height))

const vesselProfile = [
  [0, -2.08], [.64, -2.08], [.71, -2.03], [.73, -1.94],
  [.73, .91], [.72, 1.00], [.68, 1.03], [.64, 1.03],
].map(([radius, height]) => new Vector2(radius, height))

function helix(radius: number, start: number, end: number) {
  const points = Array.from({ length: 141 }, (_, index) => {
    const t = index / 140
    const angle = t * Math.PI * 4.5
    return new Vector3(Math.sin(angle) * radius, start + (end - start) * t, Math.cos(angle) * radius)
  })
  return new CatmullRomCurve3(points)
}

const neckThread = helix(.353, 1.79, 1.93)
const insertThread = helix(.363, 1.79, 2.07)

const baseProfile = [
  [0, -2.39], [.69, -2.39], [.79, -2.36], [.85, -2.31],
  [.88, -2.26], [.89, -2.19], [.89, -2.12],
].map(([radius, height]) => new Vector2(radius, height))

export function AuraBody({ rig }: { rig: AuraRig }) {
  const wordmark = useMemo(createWordmarkTexture, [])
  useEffect(() => () => wordmark.dispose(), [wordmark])

  return <group ref={node => { rig.body = node }} name="aura-body">
    <mesh name="body-shell">
      <latheGeometry args={[bodyProfile, 64]} />
      <meshPhysicalMaterial ref={node => { rig.bodyMaterial = node }} {...bodyFinish} opacity={1} />
    </mesh>
    <mesh name="front-wordmark" position={[0, -.65, 0]}>
      <cylinderGeometry args={[.905, .905, .68, 64, 1, true, -.68, 1.36]} />
      <meshBasicMaterial ref={node => { rig.wordmarkMaterial = node }} map={wordmark} transparent opacity={.85} depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
    <group ref={node => { rig.innerVessel = node }} name="inner-vessel">
      <mesh>
        <latheGeometry args={[vesselProfile, 48]} />
        <meshPhysicalMaterial ref={node => { rig.innerMaterial = node }} color="#748e96" metalness={.05} roughness={.5} side={DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.02, 0]}>
        <torusGeometry args={[.68, .018, 8, 64]} />
        <meshStandardMaterial color="#9bb2b7" roughness={.48} />
      </mesh>
    </group>
  </group>
}

export function AuraShoulder({ rig }: { rig: AuraRig }) {
  return <group ref={node => { rig.shoulder = node }} name="shoulder-and-threaded-neck">
    <mesh name="shoulder-shell">
      <latheGeometry args={[shoulderProfile, 64]} />
      <meshPhysicalMaterial ref={node => { rig.shoulderMaterial = node }} {...bodyFinish} />
    </mesh>
    <mesh name="hollow-neck">
      <latheGeometry args={[neckProfile, 64]} />
      <meshPhysicalMaterial ref={node => { rig.neckMaterial = node }} color="#607780" metalness={.08} roughness={.39} side={DoubleSide} />
    </mesh>
    <mesh name="external-thread">
      <tubeGeometry args={[neckThread, 160, .014, 6, false]} />
      <meshStandardMaterial color="#81969b" metalness={.18} roughness={.43} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.98, 0]}>
      <torusGeometry args={[.301, .016, 8, 64]} />
      <meshStandardMaterial color="#a6b9bb" roughness={.44} />
    </mesh>
  </group>
}

export function AuraCap({ rig }: { rig: AuraRig }) {
  return <group ref={node => { rig.cap = node }} name="cap-assembly">
    <group ref={node => { rig.capShell = node }} name="outer-cap-shell">
      <mesh>
        <latheGeometry args={[capShellProfile, 64]} />
        <meshPhysicalMaterial ref={node => { rig.capMaterial = node }} {...metalFinish} side={DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.79, 0]}>
        <torusGeometry args={[.482, .006, 6, 64]} />
        <meshStandardMaterial color="#c1ced0" metalness={.35} roughness={.45} />
      </mesh>
    </group>
    <group ref={node => { rig.capInsert = node }} name="threaded-insert">
      <mesh>
        <latheGeometry args={[insertProfile, 64]} />
        <meshStandardMaterial color="#75878a" metalness={.22} roughness={.58} side={DoubleSide} />
      </mesh>
      <mesh name="internal-screw-thread">
        <tubeGeometry args={[insertThread, 160, .011, 6, false]} />
        <meshStandardMaterial color="#adbdbe" metalness={.25} roughness={.48} />
      </mesh>
    </group>
    <group ref={node => { rig.gasket = node }} name="silicone-gasket">
      <mesh>
        <latheGeometry args={[gasketProfile, 48]} />
        <meshStandardMaterial color="#76888c" metalness={0} roughness={.9} side={DoubleSide} />
      </mesh>
    </group>
  </group>
}

export function AuraBase({ rig }: { rig: AuraRig }) {
  return <group ref={node => { rig.base = node }} name="integrated-base">
    <mesh name="base-shell">
      <latheGeometry args={[baseProfile, 64]} />
      <meshPhysicalMaterial ref={node => { rig.baseMaterial = node }} color="#536b73" metalness={.18} roughness={.48} clearcoat={.18} />
    </mesh>
    <mesh name="base-seam" rotation={[Math.PI / 2, 0, 0]} position={[0, -2.24, 0]}>
      <torusGeometry args={[.884, .006, 6, 64]} />
      <meshStandardMaterial color="#9fb5b7" transparent opacity={.4} depthWrite={false} />
    </mesh>
  </group>
}

export function AuraBottleModel({ rig }: { rig: AuraRig }) {
  return <group ref={node => { rig.root = node }} name="aura-bottle" position={[0, -.06, 0]}>
    <AuraBody rig={rig} />
    <AuraShoulder rig={rig} />
    <AuraCap rig={rig} />
    <AuraBase rig={rig} />
  </group>
}
