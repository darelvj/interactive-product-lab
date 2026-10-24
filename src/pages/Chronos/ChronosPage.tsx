import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { ChronosVisual } from './ChronosVisual'
import { ChronosControls } from './ChronosControls'
import { ChronosPlayback } from './ChronosPlayback'
import { createChronosRig, type ChronosPlayback as PlaybackMode } from './ChronosRig'
import { useChronosStory } from './useChronosStory'
import { localDaySeconds, type ChronosMode } from './ChronosTime'
import { CHRONOS_LAYERS } from './ChronosAnatomyConfig'
import { useChronosFinish } from './useChronosFinish'
import { chronosFinishes, chronosFinishOrder, type ChronosFinishId } from './ChronosFinishes'
import { chronosCraftViews, chronosCraftViewOrder, type ChronosCraftView } from './ChronosCraftMotion'
import './chronos.css'

export function ChronosPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const movementRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const anatomyRef = useRef<HTMLElement>(null)
  const anatomyOverlayRef = useRef<HTMLDivElement>(null)
  const craftRef = useRef<HTMLElement>(null)
  const storyRefs = useMemo(() => ({ story: storyRef, movement: movementRef, overlay: overlayRef, anatomy: anatomyRef, anatomyOverlay: anatomyOverlayRef, craft: craftRef }), [])
  const rig = useMemo(createChronosRig, [])
  const [sceneReady, setSceneReady] = useState(false)
  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const [mode, setMode] = useState<ChronosMode>('live')
  const [exploreMinutes, setExploreMinutes] = useState(() => Math.floor(localDaySeconds(new Date()) / 60))
  const [playback, setPlayback] = useState<PlaybackMode>('normal')
  const [finish, setFinish] = useState<ChronosFinishId>('graphite')
  const [craftView, setCraftView] = useState<ChronosCraftView>('case')
  const changeMode = (next: ChronosMode) => {
    if (next === 'explore' && mode !== 'explore') setExploreMinutes(Math.floor(localDaySeconds(new Date()) / 60))
    setMode(next)
  }

  useChronosStory(storyRefs, rig, sceneReady, craftView)
  useChronosFinish(rig, sceneReady, finish)

  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ambient = page.querySelector('.chronos-hero__ambient')
      const orbit = page.querySelector('.chronos-hero__orbit')
      const watch = page.querySelector('.chronos-hero__watch')
      const title = page.querySelector('.chronos-hero__title')
      const details = page.querySelectorAll('.chronos-hero__meta, .chronos-hero__side, .chronos-hero__bottom-copy, .chronos-controls')
      const scroll = page.querySelector('.chronos-scroll')
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(ambient, { opacity: 0 }, { opacity: 1, duration: 0.85 }, 0)
        .fromTo(orbit, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1 }, 0.08)
        .fromTo(title, { opacity: 0, y: 20 }, { opacity: 0.15, y: 0, duration: 0.85 }, 0.2)
        .fromTo(watch, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, 0.36)
        .fromTo(details, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.55 }, 0.75)
        .fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.06)
      return () => timeline.kill()
    })
    return () => media.revert()
  }, [])

  return <div className={`site chronos-page${sceneReady ? ' is-scene-ready' : ''}`} ref={pageRef}>
    <main><div className="chronos-story" ref={storyRef}>
      <section className="chronos-hero" aria-labelledby="chronos-title">
        <div className="chronos-hero__ambient" aria-hidden="true" />
        <div className="chronos-hero__orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="chronos-hero__meta"><span>OBJECT 002 / 003</span><span>ODDLY. / VOL. 02</span></div>
        <h1 className="chronos-hero__title" id="chronos-title">CHRONOS<span>.</span></h1>
        <div className="chronos-hero__side"><span className="chronos-hero__rule"/>A STUDY IN<br/>PRECISION</div>
        <ChronosControls mode={mode} exploreMinutes={exploreMinutes} onModeChange={changeMode} onExploreChange={setExploreMinutes} />
        <div className="chronos-hero__bottom"><div className="chronos-hero__bottom-copy"><span>INTRODUCING CHRONOS</span><p>A study of <em>time.</em></p></div><a className="chronos-scroll" href="#chronos-movement" aria-label="Scroll to CHRONOS movement exploration"><span>SCROLL TO EXPLORE</span><b aria-hidden="true">↓</b></a><span className="chronos-hero__edition">FORM / 01</span></div>
      </section>
      <div className="chronos-story__visual">
        <div className="chronos-story__stage">
          <div className="chronos-hero__watch"><ChronosVisual mode={mode} exploreMinutes={exploreMinutes} playback={playback} rig={rig} overlayRef={overlayRef} anatomyOverlayRef={anatomyOverlayRef} onReady={onSceneReady} /></div>
          <div className="chronos-movement-overlay" ref={overlayRef}>
            <div className="chronos-movement-overlay__intro" aria-hidden="true"><span>UNDER THE DIAL / 01</span><p>Motion,<br/><em>measured.</em></p></div>
            <svg className="chronos-movement-overlay__leaders" aria-hidden="true">
              {(['gear', 'escapement', 'balance'] as const).map(system => <g key={system}><line data-chronos-line={system} /><circle data-chronos-marker={system} r="3" /></g>)}
            </svg>
            <div className="chronos-annotation chronos-annotation--gear" data-chronos-label="gear"><span>01 / GEAR TRAIN</span><p>Transmitting motion through a carefully balanced sequence of wheels.</p></div>
            <div className="chronos-annotation chronos-annotation--escapement" data-chronos-label="escapement"><span>02 / ESCAPEMENT</span><p>Releasing energy in controlled increments.</p></div>
            <div className="chronos-annotation chronos-annotation--balance" data-chronos-label="balance"><span>03 / BALANCE</span><p>An oscillating regulator at the heart of the movement.</p></div>
            <div className="chronos-movement-overlay__overview" aria-hidden="true"><span>THE WHOLE / 04</span><p>One continuous conversation between movement and time.</p></div>
            <ChronosPlayback value={playback} onChange={setPlayback} />
          </div>
          <div className="chronos-anatomy-overlay" ref={anatomyOverlayRef} aria-hidden="true">
            <svg className="chronos-anatomy-overlay__leaders" aria-hidden="true">
              {CHRONOS_LAYERS.map(part => <g key={part.id}><line data-chronos-anatomy-line={part.id} /><circle data-chronos-anatomy-marker={part.id} r="3" /></g>)}
            </svg>
            {CHRONOS_LAYERS.map(part => <div key={part.id} className={`chronos-anatomy-label chronos-anatomy-label--${part.id}`} data-chronos-anatomy-label={part.id}>
              <span>{part.number} / {part.title}</span><p>{part.description}</p>
            </div>)}
            <div className="chronos-anatomy-overlay__complete" aria-hidden="true"><span>ASSEMBLY / COMPLETE</span><p>Every layer, in its place.</p></div>
          </div>
        </div>
      </div>
      <section className="chronos-movement" id="chronos-movement" ref={movementRef} aria-labelledby="chronos-movement-title">
        <div className="chronos-movement__entry"><span>01 / MOVEMENT STUDY</span><h2 id="chronos-movement-title">Beneath the <em>surface.</em></h2><p>Every second is a thousand moving parts.</p></div>
        <div className="chronos-movement__systems" aria-label="Movement systems">
          <p>AN ILLUSTRATIVE MECHANICAL STUDY</p>
          <dl><div><dt>01 / GEAR TRAIN</dt><dd>Transmitting motion through a sequence of wheels.</dd></div><div><dt>02 / ESCAPEMENT</dt><dd>Releasing energy in controlled increments.</dd></div><div><dt>03 / BALANCE</dt><dd>An oscillating regulator for the movement.</dd></div></dl>
        </div>
      </section>
      <section className="chronos-anatomy" id="chronos-anatomy" ref={anatomyRef} aria-labelledby="chronos-anatomy-title">
        <div className="chronos-anatomy__entry"><span>02 / THE ARCHITECTURE</span><h2 id="chronos-anatomy-title">Anatomy of a <em>second.</em></h2><p>Precision, assembled one layer at a time.</p><span className="chronos-anatomy__scroll-note">SCROLL TO DISASSEMBLE ↓</span></div>
        <div className="chronos-anatomy__static" aria-label="Watch assembly layers">
          <p>CHRONOS / ASSEMBLY STUDY</p>
          <ol>{CHRONOS_LAYERS.map(part => <li key={part.id}><strong>{part.number} / {part.title}</strong><span>{part.description}</span></li>)}</ol>
        </div>
      </section>
      <section className="chronos-craft" id="chronos-craft" ref={craftRef} aria-labelledby="chronos-craft-title">
        <div className="chronos-craft__stage">
          <div className="chronos-craft__heading"><span>03 / THE CRAFT</span><h2 id="chronos-craft-title">Precision in<br/><em>every detail.</em></h2><p>An exploration of the surfaces, structures, and small decisions that shape time.</p></div>
          <div className="chronos-craft__controls">
            <div className="chronos-craft__views">
              <span>MACRO / INSPECTION</span>
              <div className="chronos-craft__view-buttons" role="group" aria-label="Inspect a watch component">
                {chronosCraftViewOrder.map(id => <button key={id} type="button" data-chronos-view={id} disabled={!sceneReady} aria-pressed={craftView === id} onClick={() => setCraftView(id)}>{chronosCraftViews[id].number} / {chronosCraftViews[id].label}</button>)}
              </div>
              <p aria-live="polite">{chronosCraftViews[craftView].description}</p>
            </div>
            <fieldset className="chronos-craft__finishes" disabled={!sceneReady}>
              <legend>FINISH / SELECT</legend>
              <div className="chronos-craft__finish-options">
                {chronosFinishOrder.map(id => <label key={id} className={finish === id ? 'is-selected' : ''}>
                  <input type="radio" name="chronos-finish" value={id} checked={finish === id} onChange={() => setFinish(id)} />
                  <span className="chronos-craft__swatch" style={{ backgroundColor: chronosFinishes[id].swatch }} aria-hidden="true" />
                  <span>{chronosFinishes[id].label}</span>
                </label>)}
              </div>
              <p aria-live="polite">{chronosFinishes[finish].description}</p>
            </fieldset>
            {!sceneReady && <p className="chronos-craft__fallback">The 3D material and macro preview requires WebGL.</p>}
          </div>
        </div>
      </section>
    </div>
      <section className="chronos-detail" id="chronos-detail" aria-labelledby="chronos-detail-title">
        <span className="chronos-detail__index">01 / FIRST IMPRESSION</span>
        <div><h2 id="chronos-detail-title">Every second,<br/><em>considered.</em></h2><p>Charcoal, brushed metal, and a measured touch of warmth. CHRONOS begins with the quiet architecture of a watch.</p><Link to="/#collection" className="chronos-return">Back to the collection <span aria-hidden="true">↗</span></Link></div>
      </section>
    </main>
  </div>
}
