import type { ChronosRig } from './ChronosRig'

export function ChronosLighting({ rig }: { rig: ChronosRig }) {
  return <>
    <ambientLight intensity={0.58} color="#d4d9d1" />
    <hemisphereLight args={['#e3e9e2', '#242c2a', 0.78]} />
    <directionalLight ref={node => { rig.keyLight = node }} position={[-4, 6, 7]} intensity={1.7} color="#e8e8db" />
    <directionalLight ref={node => { rig.fillLight = node }} position={[5, -2, 5]} intensity={0.85} color="#a9bfbd" />
    <directionalLight ref={node => { rig.rimLight = node }} position={[1, 3, -5]} intensity={0.8} color="#b69d79" />
  </>
}
