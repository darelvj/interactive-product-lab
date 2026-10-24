export type AuraFinishId = 'frost' | 'obsidian' | 'glacier'

type Surface = {
  color: string
  metalness: number
  roughness: number
  clearcoat: number
  clearcoatRoughness: number
  transmission: number
}

export type AuraFinish = {
  id: AuraFinishId
  label: string
  description: string
  swatch: string
  body: Surface
  cap: Surface
  base: Surface
  neck: string
  liner: string
  wordmark: string
  light: { ambient: number; key: number; fill: number; rim: number; keyColor: string; fillColor: string; rimColor: string }
}

export const auraFinishes: Record<AuraFinishId, AuraFinish> = {
  frost: {
    id: 'frost', label: 'Frost', description: 'A quiet, softly diffused white.', swatch: '#c5d3d3',
    body: { color: '#bacbcb', metalness: 0, roughness: .68, clearcoat: .18, clearcoatRoughness: .57, transmission: .14 },
    cap: { color: '#b7c6c5', metalness: .34, roughness: .45, clearcoat: .12, clearcoatRoughness: .4, transmission: 0 },
    base: { color: '#9faeae', metalness: .25, roughness: .5, clearcoat: .12, clearcoatRoughness: .42, transmission: 0 },
    neck: '#a2b5b6', liner: '#c9d5d4', wordmark: '#31434a',
    light: { ambient: .6, key: 1.48, fill: .56, rim: .78, keyColor: '#f0f4f0', fillColor: '#c1d2d2', rimColor: '#c0d1d2' },
  },
  obsidian: {
    id: 'obsidian', label: 'Obsidian', description: 'A deep graphite with a satin edge.', swatch: '#34464c',
    body: { color: '#334b55', metalness: .04, roughness: .42, clearcoat: .28, clearcoatRoughness: .34, transmission: .04 },
    cap: { color: '#63777b', metalness: .38, roughness: .49, clearcoat: .12, clearcoatRoughness: .38, transmission: 0 },
    base: { color: '#536b73', metalness: .18, roughness: .48, clearcoat: .18, clearcoatRoughness: .36, transmission: 0 },
    neck: '#607780', liner: '#748e96', wordmark: '#ecf4f0',
    light: { ambient: .48, key: 1.42, fill: .48, rim: .72, keyColor: '#d8e7e6', fillColor: '#86aeb8', rimColor: '#9dbfc7' },
  },
  glacier: {
    id: 'glacier', label: 'Glacier', description: 'Cool blue, held in a soft frost.', swatch: '#75afbd',
    body: { color: '#70a8b7', metalness: .02, roughness: .5, clearcoat: .3, clearcoatRoughness: .4, transmission: .1 },
    cap: { color: '#a6bdc2', metalness: .38, roughness: .42, clearcoat: .15, clearcoatRoughness: .36, transmission: 0 },
    base: { color: '#7197a1', metalness: .23, roughness: .46, clearcoat: .18, clearcoatRoughness: .4, transmission: 0 },
    neck: '#84aeb8', liner: '#8eb6bf', wordmark: '#f0f8f7',
    light: { ambient: .53, key: 1.4, fill: .6, rim: .88, keyColor: '#d6eaf0', fillColor: '#8dc8d8', rimColor: '#89c5d8' },
  },
}

export const auraFinishOrder: AuraFinishId[] = ['frost', 'obsidian', 'glacier']

/** The approved hero's original silver cap, restored when leaving the configurator. */
export const auraStudioFinish: AuraFinish = {
  ...auraFinishes.obsidian,
  cap: { color: '#9badaf', metalness: .42, roughness: .36, clearcoat: .16, clearcoatRoughness: .3, transmission: 0 },
}
