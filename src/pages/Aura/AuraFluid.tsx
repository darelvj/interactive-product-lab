import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { auraFinishes, type AuraFinishId } from './AuraFinishes'
import type { AuraRig } from './AuraRig'

gsap.registerPlugin(ScrollTrigger)

const defaultLevel = 65

export function AuraFluid({ rig, sceneReady, active, onActiveChange, selected }: {
  rig: AuraRig
  sceneReady: boolean
  active: boolean
  onActiveChange: (active: boolean) => void
  selected: AuraFinishId
}) {
  const section = useRef<HTMLElement>(null)
  const levelMotion = useRef({ value: defaultLevel })
  const [level, setLevel] = useState(defaultLevel)

  useLayoutEffect(() => {
    const element = section.current
    const pose = rig.fluidPose
    const fallbackVisual = document.querySelector<HTMLElement>('.aura-hero__reveal')
    if (!element || !fallbackVisual) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (pose && sceneReady && !reduced) {
        gsap.to(pose.scale, {
          x: .91, y: .91, z: .91, ease: 'none',
          scrollTrigger: { trigger: element, start: 'top 80%', end: 'top 20%', scrub: .45, invalidateOnRefresh: true },
          onUpdate: rig.invalidate ?? undefined,
        })
      }
      const enter = () => {
        onActiveChange(true)
        if (pose && sceneReady) {
          if (reduced) { pose.scale.setScalar(.91); rig.invalidate?.() }
        } else {
          gsap.set(fallbackVisual, { y: window.innerWidth <= 700 ? 170 : 0, scale: window.innerWidth <= 700 ? .8 : 1 })
        }
      }
      const leave = () => {
        onActiveChange(false)
        if (pose && sceneReady) {
          if (reduced) { pose.scale.setScalar(1); rig.invalidate?.() }
        } else {
          gsap.set(fallbackVisual, { y: 0, scale: 1 })
        }
      }
      const trigger = ScrollTrigger.create({
        trigger: element, start: 'top 70%', end: 'bottom 15%',
        onEnter: enter, onEnterBack: enter, onLeave: leave, onLeaveBack: leave,
        onRefresh: self => { if (self.isActive) enter() },
      })
      if (trigger.isActive) enter()
    }, element)
    return () => {
      ctx.revert()
      onActiveChange(false)
      pose?.scale.setScalar(1)
      if (!pose || !sceneReady) gsap.set(fallbackVisual, { y: 0, scale: 1 })
      rig.setFluidVisible?.(false)
      rig.invalidate?.()
    }
  }, [rig, sceneReady, onActiveChange])

  useEffect(() => {
    rig.setFluidVisible?.(active)
    return () => { rig.setFluidVisible?.(false) }
  }, [rig, active])

  useEffect(() => {
    if (!sceneReady) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tween = gsap.to(levelMotion.current, {
      value: level, duration: reduced ? 0 : .58, ease: 'power2.out',
      onUpdate: () => rig.setWaterLevel?.(levelMotion.current.value),
    })
    if (reduced) rig.setWaterLevel?.(level)
    return () => { tween.kill() }
  }, [rig, sceneReady, level])

  const changeLevel = (next: number) => {
    setLevel(next)
    rig.disturbWater?.()
  }

  return <section className="aura-fluid" ref={section} aria-labelledby="aura-fluid-title">
    <div className="aura-fluid__stage">
      <div className="aura-fluid__heading">
        <span className="aura-anatomy__eyebrow">04 / THE MOVEMENT</span>
        <h2 id="aura-fluid-title">A little more<br /><em>fluid.</em></h2>
        <p>An exploration of movement, volume, and the space within.</p>
      </div>
      <button className="aura-fluid__surface" type="button" disabled={!sceneReady || !active}
        aria-label="Create a gentle ripple in the bottle"
        onClick={() => rig.disturbWater?.()} />
      <div className="aura-fluid__controls">
        <div className="aura-fluid__meta">
          <span>INSPECTION / {auraFinishes[selected].label.toUpperCase()}</span>
          <span>{sceneReady ? 'TAP THE BOTTLE TO STIR' : '3D PREVIEW UNAVAILABLE'}</span>
        </div>
        <div className="aura-fluid__level">
          <div className="aura-fluid__level-top">
            <label htmlFor="aura-water-level">Water level</label>
            <output htmlFor="aura-water-level" aria-live="off">{level}%</output>
          </div>
          <input id="aura-water-level" type="range" min="0" max="100" step="1" value={level}
            aria-valuetext={`${level}% full`}
            onChange={event => changeLevel(Number(event.target.value))}
            style={{ '--water-progress': `${level}%` } as CSSProperties} />
          <div className="aura-fluid__scale" aria-hidden="true"><span>EMPTY</span><span>FULL</span></div>
        </div>
        <button className="aura-fluid__reset" type="button" onClick={() => changeLevel(defaultLevel)}>Reset to 65% ↺</button>
        {!sceneReady && <p className="aura-fluid__fallback">Water volume: {level}%. The animated sectional view requires WebGL.</p>}
      </div>
    </div>
  </section>
}
