import type { AuraRig } from './AuraRig'

export function AuraLighting({ rig }: { rig: AuraRig }) {
  return <>
    <ambientLight ref={node => { rig.ambientLight = node }} intensity={0.48} color="#9bb1b8" />
    <hemisphereLight args={['#d8eef0', '#101b20', 0.72]} />
    <directionalLight ref={node => { rig.keyLight = node }} position={[-4, 5, 7]} intensity={1.42} color="#d8e7e6" />
    <directionalLight ref={node => { rig.fillLight = node }} position={[4, 0, 4]} intensity={0.48} color="#86aeb8" />
    <directionalLight ref={node => { rig.rimLight = node }} position={[-3, 2, -5]} intensity={0.72} color="#9dbfc7" />
  </>
}
