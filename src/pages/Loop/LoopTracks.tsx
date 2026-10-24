import { useMemo } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'
import { loopTrackOrder, loopTracks, type LoopTrack } from './LoopTrackGraph'
import type { LoopMaterials } from './LoopMaterials'

function TrackSegment({ track, materials }: { track: LoopTrack; materials: LoopMaterials }) {
  const rails = useMemo(() => [-.071, .071].map(offset => new CatmullRomCurve3(track.curve.getPoints(track.id === 'helix' || track.id === 'orbit' ? 128 : 32).map(p => new Vector3(p.x, p.y, p.z + offset)))), [track])
  const count = track.id === 'helix' || track.id === 'orbit' ? 192 : 42
  const edge = track.family === 'helix' ? materials.cyan : track.family === 'orbit' ? materials.coral : track.family === 'module' ? materials.violet : materials.steel
  return <group name={`track-${track.id}`}>
    <mesh material={materials.acrylic} renderOrder={1}><tubeGeometry args={[track.curve, count, .079, 7, false]} /></mesh>
    {rails.map((rail, index) => <mesh key={index} material={index === 0 ? edge : materials.darkSteel}><tubeGeometry args={[rail, count, .014, 5, false]} /></mesh>)}
  </group>
}

export function LoopTracks({ materials }: { materials: LoopMaterials }) {
  return <group name="closed-track-network">
    {loopTrackOrder.filter(id => loopTracks[id].kind === 'rail').map(id => <TrackSegment key={id} track={loopTracks[id]} materials={materials} />)}
  </group>
}
