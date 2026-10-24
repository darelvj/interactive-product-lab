import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { AuraVisual } from './AuraVisual'
import { createAuraRig } from './AuraRig'
import { useAuraMotion } from './useAuraMotion'
import { useAuraAppearance } from './useAuraAppearance'
import type { AuraFinishId } from './AuraFinishes'
import './aura.css'
import './aura-motion.css'

const AuraAnatomy = lazy(() => import('./AuraAnatomy').then(module => ({ default: module.AuraAnatomy })))
const AuraCustomize = lazy(() => import('./AuraCustomize').then(module => ({ default: module.AuraCustomize })))
const AuraFluid = lazy(() => import('./AuraFluid').then(module => ({ default: module.AuraFluid })))

export function AuraPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const rig = useMemo(createAuraRig, [])
  const [sceneReady, setSceneReady] = useState(false)
  const [selectedFinish, setSelectedFinish] = useState<AuraFinishId>('obsidian')
  const [hasCustomized, setHasCustomized] = useState(false)
  const [fluidActive, setFluidActive] = useState(false)
  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const onCustomizationVisit = useCallback(() => setHasCustomized(true), [])
  useAuraMotion(pageRef)
  useAuraAppearance(rig, sceneReady, selectedFinish, hasCustomized, fluidActive)

  return <div className="site aura-page" ref={pageRef}>
    <main><div className="aura-story">
      <section className="aura-hero" aria-labelledby="aura-title">
        <div className="aura-hero__ambient" aria-hidden="true" />
        <div className="aura-hero__grain" aria-hidden="true" />
        <div className="aura-hero__top"><span>OBJECT 001 / 003</span><span>A STUDY IN SIMPLICITY</span></div>
        <div className="aura-hero__halo" aria-hidden="true" />
        <h1 id="aura-title" className="aura-hero__title">AURA<span>.</span></h1>
        <div className="aura-hero__left"><span className="aura-rule"/>THE EVERYDAY,<br/>SEEN DIFFERENTLY.</div>
        <div className="aura-hero__right"><span>01 — FORM</span><span>02 — FEELING</span><span>03 — POSSIBILITY</span></div>
        <div className="aura-hero__bottom"><div><span className="aura-hero__kicker">INTRODUCING AURA</span><p>Hydration,<br/><em>reimagined.</em></p></div><a href="#aura-intro" className="aura-scroll" aria-label="Scroll to AURA introduction"><span>SCROLL TO DISCOVER</span><b aria-hidden="true">↓</b></a><span className="aura-hero__edition">ODDLY. / VOL. 01</span></div>
      </section>
      <div className="aura-story__visual"><div className="aura-story__stage"><div className="aura-hero__product"><div className="aura-hero__motion"><div className="aura-hero__reveal"><div className="aura-hero__parallax"><AuraVisual rig={rig} onReady={onSceneReady} /><div className="aura-hero__reflection" aria-hidden="true"/></div></div></div></div></div></div>
      <section className="aura-intro" id="aura-intro" aria-labelledby="aura-intro-title"><div className="aura-intro__number">01 / THE OBJECT</div><div className="aura-intro__copy"><h2 id="aura-intro-title">Simplicity in<br/><em>every detail.</em></h2><p>An everyday form, considered from every angle. AURA begins with a quiet silhouette and room for the imagination to follow.</p></div></section>
      <Suspense fallback={<section className="aura-anatomy" aria-hidden="true" />}><AuraAnatomy rig={rig} sceneReady={sceneReady} /></Suspense>
      <Suspense fallback={<section className="aura-customize" aria-hidden="true" />}><AuraCustomize rig={rig} sceneReady={sceneReady} selected={selectedFinish} onSelect={setSelectedFinish} onVisit={onCustomizationVisit} /></Suspense>
      <Suspense fallback={<section className="aura-fluid" aria-hidden="true" />}><AuraFluid rig={rig} sceneReady={sceneReady} active={fluidActive} onActiveChange={setFluidActive} selected={selectedFinish} /></Suspense>
    </div></main>
  </div>
}
