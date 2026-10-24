import { CanvasTexture, SRGBColorSpace } from 'three'

export const bodyFinish = {
  color: '#334b55',
  metalness: 0.04,
  roughness: 0.42,
  clearcoat: 0.28,
  clearcoatRoughness: 0.34,
  transmission: 0.04,
  thickness: 0.22,
  ior: 1.38,
}

export const metalFinish = {
  color: '#9aaeb0',
  metalness: 0.42,
  roughness: 0.36,
  clearcoat: 0.16,
  clearcoatRoughness: 0.3,
}

export function createWordmarkTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 384
  const context = canvas.getContext('2d')!
  context.textAlign = 'center'
  context.fillStyle = 'rgba(235,244,241,.88)'
  context.font = '600 100px Manrope, Arial, sans-serif'
  context.letterSpacing = '60px'
  context.fillText('AURA', 512, 142)
  context.fillStyle = 'rgba(220,237,234,.48)'
  context.fillRect(232, 177, 560, 2)
  context.font = '24px monospace'
  context.letterSpacing = '4px'
  context.fillText('ORDINARY / EXTRAORDINARY', 512, 245)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
