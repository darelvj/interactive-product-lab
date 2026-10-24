import { CHRONOS_LAYERS, type ChronosAssembly } from './ChronosAnatomyConfig'
import type { ChronosRig } from './ChronosRig'

type Frame = { at: number; z: number; x: number; y: number; yaw: number; pitch: number }

const desktopFrames: Frame[] = [
  { at: 0, z: 8.1, x: 0, y: 0, yaw: 0.09, pitch: -0.03 },
  { at: 0.18, z: 9.5, x: 0, y: 0, yaw: 0.6, pitch: -0.18 },
  { at: 0.37, z: 10.35, x: 0, y: 0, yaw: 0.69, pitch: -0.22 },
  { at: 0.78, z: 11.25, x: 0, y: -0.03, yaw: 0.73, pitch: -0.23 },
  { at: 1, z: 9.8, x: 0, y: 0, yaw: 0.09, pitch: -0.03 },
]

const mobileFrames: Frame[] = [
  { at: 0, z: 8.865, x: 0, y: 0, yaw: 0.09, pitch: -0.03 },
  { at: 0.18, z: 9.5, x: 0, y: -0.1, yaw: 0.54, pitch: -0.14 },
  { at: 0.37, z: 10.2, x: 0, y: -0.16, yaw: 0.61, pitch: -0.18 },
  { at: 0.78, z: 10.8, x: 0, y: -0.2, yaw: 0.66, pitch: -0.19 },
  { at: 1, z: 9.8, x: 0, y: 0, yaw: 0.09, pitch: -0.03 },
]

export function smooth(start: number, end: number, progress: number) {
  const position = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return position * position * (3 - 2 * position)
}

export function anatomyFrame(progress: number, mobile: boolean) {
  const frames = mobile ? mobileFrames : desktopFrames
  const index = frames.findIndex(frame => frame.at >= progress)
  if (index <= 0) return frames[0]
  const before = frames[index - 1]
  const after = frames[index]
  const blend = smooth(before.at, after.at, progress)
  const lerp = (start: number, end: number) => start + (end - start) * blend
  return {
    z: lerp(before.z, after.z), x: lerp(before.x, after.x), y: lerp(before.y, after.y),
    yaw: lerp(before.yaw, after.yaw), pitch: lerp(before.pitch, after.pitch),
  }
}

export function applyAnatomyOffsets(rig: ChronosRig, progress: number, mobile: boolean) {
  const returnToAssembly = 1 - smooth(0.82, 0.985, progress)
  const distance = mobile ? 0.58 : 1
  for (const part of CHRONOS_LAYERS) {
    const group = rig.assemblies[part.id]
    if (group) group.position.z = part.offset * distance * smooth(part.start, part.end, progress) * returnToAssembly
  }
  if (rig.crystalMaterial) {
    const crystalSeparation = smooth(0.19, 0.33, progress) * returnToAssembly
    rig.crystalMaterial.opacity = 0.018 + 0.09 * crystalSeparation
  }
}

const mobileWindows: Record<ChronosAssembly, [number, number, number, number]> = {
  crystal: [0.25, 0.28, 0.32, 0.34],
  bezel: [0.34, 0.36, 0.39, 0.41],
  hands: [0.41, 0.44, 0.47, 0.49],
  dial: [0.49, 0.52, 0.55, 0.57],
  movement: [0.57, 0.60, 0.64, 0.66],
  plate: [0.66, 0.68, 0.70, 0.72],
  case: [0.72, 0.74, 0.76, 0.78],
  back: [0.76, 0.78, 0.87, 0.91],
}

const desktopLeave: Partial<Record<ChronosAssembly, [number, number]>> = {
  bezel: [0.46, 0.52], hands: [0.55, 0.61], dial: [0.65, 0.71], plate: [0.74, 0.79],
}

export function anatomyLabelWeight(id: ChronosAssembly, progress: number, mobile: boolean) {
  if (mobile) {
    const [enter, full, leave, gone] = mobileWindows[id]
    return smooth(enter, full, progress) * (1 - smooth(leave, gone, progress))
  }
  const part = CHRONOS_LAYERS.find(layer => layer.id === id)!
  const [leave, gone] = desktopLeave[id] ?? [0.86, 0.95]
  return smooth(part.end - 0.025, part.end + 0.025, progress) * (1 - smooth(leave, gone, progress))
}
