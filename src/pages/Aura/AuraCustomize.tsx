import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MathUtils } from 'three'
import { auraFinishes, auraFinishOrder, type AuraFinishId } from './AuraFinishes'
import type { AuraRig } from './AuraRig'

gsap.registerPlugin(ScrollTrigger)

type DragState = { id: number; x: number; y: number; vx: number; vy: number; dragging: boolean } | null

export function AuraCustomize({ rig, sceneReady, selected, onSelect, onVisit }: { rig: AuraRig; sceneReady: boolean; selected: AuraFinishId; onSelect: (finish: AuraFinishId) => void; onVisit: () => void }) {
  const section = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const drag = useRef<DragState>(null)
  const inertia = useRef(0)
  const resetTween = useRef<gsap.core.Tween | null>(null)

  const stopMotion = useCallback(() => {
    cancelAnimationFrame(inertia.current)
    resetTween.current?.kill()
    drag.current = null
  }, [])

  const resetView = useCallback(() => {
    stopMotion()
    const turntable = rig.turntable
    if (!turntable) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resetTween.current = gsap.to(turntable.rotation, {
      x: 0, y: 0, duration: reduced ? 0 : .55, ease: 'power2.out', onUpdate: rig.invalidate ?? undefined,
    })
  }, [rig, stopMotion])

  useLayoutEffect(() => {
    const element = section.current
    const turntable = rig.turntable
    if (!element || !turntable || !sceneReady) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.timeline({
          scrollTrigger: { trigger: element, start: 'top 80%', end: 'top 20%', scrub: .4, invalidateOnRefresh: true },
          onUpdate: rig.invalidate ?? undefined,
        }).to(turntable.scale, { x: 1.22, y: 1.22, z: 1.22, ease: 'none' }, 0)
      }
      const enable = () => {
        onVisit()
        setActive(true)
        if (reduced) {
          turntable.scale.setScalar(1)
          rig.invalidate?.()
        }
      }
      const disable = () => {
        setActive(false)
        resetView()
        if (reduced) { turntable.scale.setScalar(1); rig.invalidate?.() }
      }
      const trigger = ScrollTrigger.create({
        trigger: element, start: 'top 70%', end: 'bottom 20%',
        onEnter: enable, onEnterBack: enable, onLeave: disable, onLeaveBack: disable,
        onRefresh: self => { if (self.isActive) enable() },
      })
      if (trigger.isActive) enable()
    }, element)
    return () => {
      ctx.revert()
      stopMotion()
      turntable.scale.setScalar(1)
      turntable.rotation.set(0, 0, 0)
      rig.invalidate?.()
    }
  }, [rig, sceneReady, resetView, stopMotion, onVisit])

  useEffect(() => () => { stopMotion() }, [stopMotion])

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!active || !sceneReady || !rig.turntable || (event.pointerType === 'mouse' && event.button !== 0)) return
    stopMotion()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, vx: 0, vy: 0, dragging: false }
  }

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const turntable = rig.turntable
    if (!state || state.id !== event.pointerId || !turntable) return
    const dx = event.clientX - state.x
    const dy = event.clientY - state.y
    state.x = event.clientX
    state.y = event.clientY
    if (!state.dragging && Math.abs(dx) < 4 && Math.abs(dy) < 4) return
    if (!state.dragging && event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.2) return
    state.dragging = true
    const yaw = dx * .009
    const pitch = dy * .0025
    turntable.rotation.y += yaw
    turntable.rotation.x = MathUtils.clamp(turntable.rotation.x + pitch, -.16, .16)
    state.vx = yaw
    state.vy = pitch
    rig.invalidate?.()
    if (event.cancelable) event.preventDefault()
  }

  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!state.dragging || event.type === 'pointercancel' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const turntable = rig.turntable
    if (!turntable) return
    let vx = MathUtils.clamp(state.vx, -.055, .055)
    let vy = MathUtils.clamp(state.vy, -.012, .012)
    const coast = () => {
      vx *= .84
      vy *= .8
      turntable.rotation.y += vx
      turntable.rotation.x = MathUtils.clamp(turntable.rotation.x + vy, -.16, .16)
      rig.invalidate?.()
      if (Math.abs(vx) > .0004 || Math.abs(vy) > .0004) inertia.current = requestAnimationFrame(coast)
    }
    inertia.current = requestAnimationFrame(coast)
  }

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const turntable = rig.turntable
    if (!active || !turntable) return
    if (event.key === 'Home') { event.preventDefault(); resetView(); return }
    const amount = Math.PI / 12
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      stopMotion()
      turntable.rotation.y += event.key === 'ArrowLeft' ? -amount : amount
      rig.invalidate?.()
    }
  }

  return <section className="aura-customize" ref={section} aria-labelledby="aura-customize-title">
    <div className="aura-customize__stage">
      <div className="aura-customize__heading">
        <span className="aura-anatomy__eyebrow">03 / THE FINISH</span>
        <h2 id="aura-customize-title">Make it <em>yours.</em></h2>
        <p>Three expressions of the same idea.</p>
      </div>
      <div className={`aura-customize__drag${active && sceneReady ? ' is-active' : ''}`}
        role="group" tabIndex={active && sceneReady ? 0 : -1}
        aria-label="Rotate the three-dimensional AURA bottle"
        aria-describedby="aura-drag-help"
        onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onKeyDown={keyboard} />
      <div className="aura-customize__controls">
        <p id="aura-drag-help" className="aura-customize__hint">{sceneReady ? 'DRAG TO EXPLORE · ARROW KEYS TO ROTATE' : '3D PREVIEW UNAVAILABLE ON THIS DEVICE'}</p>
        <fieldset className="aura-customize__choices" disabled={!sceneReady}>
          <legend>SELECT A FINISH</legend>
          <div className="aura-customize__options">
            {auraFinishOrder.map(id => <label key={id} className={`aura-customize__option${selected === id ? ' is-selected' : ''}`}>
              <input type="radio" name="aura-finish" value={id} checked={selected === id} onChange={() => onSelect(id)} />
              <span className="aura-customize__swatch" style={{ backgroundColor: auraFinishes[id].swatch }} aria-hidden="true" />
              <span>{auraFinishes[id].label}</span>
            </label>)}
          </div>
        </fieldset>
        <p className="aura-customize__description" aria-live="polite">{auraFinishes[selected].description}</p>
        <button className="aura-customize__reset" type="button" onClick={resetView} disabled={!sceneReady}>Reset view ↺</button>
      </div>
    </div>
  </section>
}
