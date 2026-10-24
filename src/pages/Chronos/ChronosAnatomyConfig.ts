// Offsets are local to the watch's front-to-back (+Z) axis. The original
// assembled coordinates remain untouched so a progress of zero is exact.
export const CHRONOS_LAYERS = [
  { id: 'crystal', number: '01', title: 'SAPPHIRE CRYSTAL', description: 'Protecting the mechanism beneath.', anchor: [0.84, 0.75, 0.54], offset: 2.8, start: 0.19, end: 0.31 },
  { id: 'bezel', number: '02', title: 'BEZEL', description: 'A precise retaining edge.', anchor: [1.32, 0.28, 0.33], offset: 2.08, start: 0.24, end: 0.36 },
  { id: 'hands', number: '03', title: 'HAND ASSEMBLY', description: 'Three indicators. One shared axis.', anchor: [0, 0.21, 0.48], offset: 1.48, start: 0.29, end: 0.43 },
  { id: 'dial', number: '04', title: 'SKELETON DIAL', description: 'Structure without concealment.', anchor: [-1.07, 0.34, 0.3], offset: 0.9, start: 0.41, end: 0.55 },
  { id: 'movement', number: '05', title: 'GEAR TRAIN', description: 'Motion transmitted through precision.', anchor: [-0.43, 0.33, 0.09], offset: 0, start: 0.49, end: 0.63 },
  { id: 'plate', number: '06', title: 'MOVEMENT PLATE', description: 'The foundation of the mechanism.', anchor: [-0.9, -0.43, -0.22], offset: -0.85, start: 0.57, end: 0.69 },
  { id: 'case', number: '07', title: 'CASE ASSEMBLY', description: 'Protection shaped by engineering.', anchor: [-1.36, 0, -0.04], offset: -1.55, start: 0.61, end: 0.73 },
  { id: 'back', number: '08', title: 'CASE BACK', description: 'Completing the mechanical enclosure.', anchor: [-0.72, -0.7, -0.35], offset: -2.35, start: 0.66, end: 0.77 },
] as const

export type ChronosAssembly = (typeof CHRONOS_LAYERS)[number]['id']
