export type ChronosCraftView = 'case' | 'dial' | 'movement'
export type ChronosCraftFrame = { x: number; y: number; z: number; yaw: number; pitch: number }

export const chronosCraftViews: Record<ChronosCraftView, { number: string; label: string; description: string }> = {
  case: { number: '01', label: 'CASE', description: 'Sculpted edges, a stepped bezel, and a finely machined crown.' },
  dial: { number: '02', label: 'DIAL', description: 'An open chapter ring surrounds the hands and movement below.' },
  movement: { number: '03', label: 'MOVEMENT', description: 'Bridges, bearings, and wheels occupy distinct working planes.' },
}

export const chronosCraftViewOrder: ChronosCraftView[] = ['case', 'dial', 'movement']

const desktop: Record<ChronosCraftView, ChronosCraftFrame> = {
  case: { x: .18, y: .03, z: 8.2, yaw: .34, pitch: -.15 },
  dial: { x: 0, y: 0, z: 7.65, yaw: .08, pitch: -.05 },
  movement: { x: -.42, y: -.08, z: 6.7, yaw: .2, pitch: -.11 },
}
const mobile: Record<ChronosCraftView, ChronosCraftFrame> = {
  case: { x: .08, y: -.06, z: 9.7, yaw: .27, pitch: -.12 },
  dial: { x: 0, y: -.04, z: 9.35, yaw: .06, pitch: -.04 },
  movement: { x: -.06, y: -.08, z: 8.95, yaw: .16, pitch: -.08 },
}

export function craftFrame(view: ChronosCraftView, isMobile: boolean) {
  return { ...(isMobile ? mobile : desktop)[view] }
}
