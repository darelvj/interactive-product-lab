import { AuraBottle } from './AuraBottle'

/** Keep the product visible when WebGL cannot initialize, and explain the reduced experience. */
export function AuraCanvasFallback({ loading = false }: { loading?: boolean }) {
  return <div className="aura-canvas-fallback">
    <AuraBottle className="aura-hero__bottle" />
    <p role="status">{loading ? 'Preparing the interactive AURA view.' : 'Interactive 3D is unavailable. A static AURA illustration is shown instead.'}</p>
  </div>
}
