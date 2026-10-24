export type ChronosFinishId = 'graphite' | 'titanium' | 'champagne'

type Surface = { color: string; metalness: number; roughness: number }
export type ChronosMaterialRole =
  'case' | 'bezel' | 'edge' | 'bridge' | 'dark' | 'champagne' | 'marker' |
  'strap' | 'strap-seam' | 'case-back' | 'hand-inlay' |
  'main-wheel' | 'transfer-wheel' | 'escape-wheel'

type Lighting = { key: string; fill: string; rim: string; keyPower: number; fillPower: number; rimPower: number }
type Finish = { label: string; description: string; swatch: string; surfaces: Record<ChronosMaterialRole, Surface>; light: Lighting }
const surface = (color: string, metalness: number, roughness: number): Surface => ({ color, metalness, roughness })

const graphite: Finish = {
  label: 'Graphite', description: 'Satin gunmetal. A quiet frame for the movement.', swatch: '#515c5b',
  surfaces: {
    case: surface('#545f5e', .67, .46), bezel: surface('#3d4848', .64, .41), edge: surface('#a3aaa4', .7, .31),
    bridge: surface('#727f7c', .57, .48), dark: surface('#252e2d', .4, .63), champagne: surface('#c4a77b', .65, .39),
    marker: surface('#e2d9c7', .32, .42), strap: surface('#252a29', .04, .89), 'strap-seam': surface('#454e4a', .07, .82),
    'case-back': surface('#171e1d', .28, .68), 'hand-inlay': surface('#737d77', .38, .45),
    'main-wheel': surface('#b9a27b', .6, .44), 'transfer-wheel': surface('#9aa7a2', .6, .44), 'escape-wheel': surface('#cfb88b', .6, .44),
  },
  light: { key: '#e8e8db', fill: '#a9bfbd', rim: '#b69d79', keyPower: 1.7, fillPower: .85, rimPower: .8 },
}

export const chronosFinishes: Record<ChronosFinishId, Finish> = {
  graphite,
  titanium: {
    label: 'Titanium', description: 'Brushed silver, softened at every edge.', swatch: '#a6aeae',
    surfaces: {
      ...graphite.surfaces,
      case: surface('#a1aaa9', .7, .46), bezel: surface('#8d9898', .69, .39), edge: surface('#d0d4ce', .72, .29),
      bridge: surface('#4f5c5c', .55, .49), dark: surface('#26302f', .4, .63),
      'case-back': surface('#4b5553', .52, .55), 'hand-inlay': surface('#c1c9c1', .45, .4),
    },
    light: { key: '#f0f1e9', fill: '#bacaca', rim: '#b8ad91', keyPower: 1.7, fillPower: .9, rimPower: .76 },
  },
  champagne: {
    label: 'Champagne', description: 'Measured warmth against the openworked dial.', swatch: '#b99b70',
    surfaces: {
      ...graphite.surfaces,
      case: surface('#a48b6d', .69, .43), bezel: surface('#b39b78', .68, .39), edge: surface('#d3d1c2', .7, .3),
      bridge: surface('#61675e', .56, .49), dark: surface('#242b29', .4, .65), champagne: surface('#d3b37f', .67, .37),
      marker: surface('#e6ded0', .35, .4), 'case-back': surface('#4c4338', .43, .59),
      'main-wheel': surface('#c7a36d', .64, .42), 'transfer-wheel': surface('#aab2a8', .61, .43),
      'escape-wheel': surface('#dbc291', .64, .42),
    },
    light: { key: '#f0e7d7', fill: '#b5bfba', rim: '#d0ad76', keyPower: 1.66, fillPower: .82, rimPower: .92 },
  },
}

export const chronosFinishOrder: ChronosFinishId[] = ['titanium', 'graphite', 'champagne']
