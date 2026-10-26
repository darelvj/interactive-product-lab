import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Vector3, type Group } from 'three'
import type { AuraRig } from './AuraRig'

gsap.registerPlugin(ScrollTrigger)

type LabelId = 'cap' | 'neck' | 'inner' | 'body' | 'base' | 'shell' | 'insert' | 'gasket'

const labels: { id: LabelId; text: string; side: 'left' | 'right'; phase: 'primary' | 'secondary' | 'body' }[] = [
  { id: 'cap', text: '01 / CAP ASSEMBLY', side: 'right', phase: 'primary' },
  { id: 'neck', text: '02 / THREADED NECK', side: 'left', phase: 'primary' },
  { id: 'inner', text: '03 / INNER VESSEL', side: 'right', phase: 'body' },
  { id: 'body', text: '04 / OUTER BODY', side: 'left', phase: 'primary' },
  { id: 'base', text: '05 / BASE', side: 'right', phase: 'primary' },
  { id: 'shell', text: 'OUTER SHELL', side: 'left', phase: 'secondary' },
  { id: 'insert', text: 'THREADED INSERT', side: 'right', phase: 'secondary' },
  { id: 'gasket', text: 'SEALING GASKET', side: 'left', phase: 'secondary' },
]

function anchorFor(id: LabelId, rig: AuraRig): [Group | null, Vector3] {
  switch (id) {
    case 'cap': return [rig.cap, new Vector3(.48, 2.05, 0)]
    case 'neck': return [rig.shoulder, new Vector3(-.35, 1.87, 0)]
    case 'inner': return [rig.innerVessel, new Vector3(.72, .05, 0)]
    case 'body': return [rig.body, new Vector3(-.90, -.65, 0)]
    case 'base': return [rig.base, new Vector3(.86, -2.28, 0)]
    case 'shell': return [rig.capShell, new Vector3(-.48, 2.10, 0)]
    case 'insert': return [rig.capInsert, new Vector3(.42, 1.97, 0)]
    case 'gasket': return [rig.gasket, new Vector3(-.35, 2.01, 0)]
  }
}

export function AuraAnatomy({ rig, sceneReady }: { rig: AuraRig; sceneReady: boolean }) {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const element = section.current
    if (!element || !sceneReady) return
    const { root, cap, capShell, capInsert, gasket, base, innerVessel, bodyMaterial, camera, invalidate } = rig
    const canvas = document.querySelector<HTMLCanvasElement>('.aura-hero__canvas canvas')
    if (!root || !cap || !capShell || !capInsert || !gasket || !base || !innerVessel || !bodyMaterial || !camera || !invalidate || !canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const labelElements = new Map(labels.map(({ id }) => [id, element.querySelector<HTMLElement>(`[data-anatomy-label="${id}"]`)]))
    const lines = new Map(labels.map(({ id }) => [id, element.querySelector<SVGLineElement>(`[data-anatomy-line="${id}"]`)]))
    const visual = element.querySelector<HTMLElement>('.aura-anatomy__visual')
    if (!visual) return

    const placeLabels = () => {
      invalidate()
      root.updateMatrixWorld(true)
      const canvasBounds = canvas.getBoundingClientRect()
      const visualBounds = visual.getBoundingClientRect()
      const mobile = window.innerWidth <= 700
      for (const { id, side } of labels) {
        const label = labelElements.get(id)
        const line = lines.get(id)
        const [group, point] = anchorFor(id, rig)
        if (!label || !line || !group) continue
        const screen = group.localToWorld(point).project(camera)
        const x = canvasBounds.left + (screen.x + 1) * canvasBounds.width / 2 - visualBounds.left
        const y = canvasBounds.top + (1 - screen.y) * canvasBounds.height / 2 - visualBounds.top
        const offset = id === 'cap' ? -43 : id === 'insert' ? 35 : id === 'neck' ? 16 : id === 'inner' ? 38 : id === 'body' ? -20 : id === 'gasket' ? 15 : 0
        const labelY = Math.max(mobile ? 100 : 70, Math.min(visualBounds.height - 50, y + offset))
        label.style.top = `${labelY}px`
        const labelX = side === 'left' ? (mobile ? 12 : visualBounds.width * .075) : (mobile ? visualBounds.width - label.offsetWidth - 12 : visualBounds.width * .77)
        label.style.left = `${labelX}px`
        const startX = side === 'left' ? labelX + label.offsetWidth + 8 : labelX - 8
        line.setAttribute('x1', String(startX))
        line.setAttribute('y1', String(labelY + label.offsetHeight / 2))
        line.setAttribute('x2', String(x))
        line.setAttribute('y2', String(y))
      }
    }

    const ctx = gsap.context(() => {
      const primary = labels.filter(item => item.phase === 'primary').flatMap(item => [labelElements.get(item.id), lines.get(item.id)]).filter(Boolean)
      const secondary = labels.filter(item => item.phase === 'secondary').flatMap(item => [labelElements.get(item.id), lines.get(item.id)]).filter(Boolean)
      const bodyLabels = labels.filter(item => item.phase === 'body').flatMap(item => [labelElements.get(item.id), lines.get(item.id)]).filter(Boolean)
      const allLabels = [...primary, ...secondary, ...bodyLabels]
      gsap.set(allLabels, { autoAlpha: 0 })
      const update = () => {
        const bounds = element.getBoundingClientRect()
        // Once anatomy leaves the viewport, the fluid section owns shell transparency.
        if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
          const shouldBlend = bodyMaterial.opacity < .96
          if (bodyMaterial.transparent !== shouldBlend) {
            bodyMaterial.transparent = shouldBlend
            bodyMaterial.needsUpdate = true
          }
          bodyMaterial.depthWrite = !shouldBlend
        }
        placeLabels()
      }
      if (reduced) {
        const show = () => {
          root.scale.setScalar(.78)
          cap.position.y = window.innerWidth <= 700 ? .33 : .42
          capShell.position.y = window.innerWidth <= 700 ? .48 : .7
          gasket.position.y = .24
          base.position.y = window.innerWidth <= 700 ? -.22 : -.31
          bodyMaterial.opacity = .58
          innerVessel.position.x = .1
          gsap.set(allLabels, { autoAlpha: 1 })
          update()
        }
        const hide = () => {
          gsap.set(allLabels, { autoAlpha: 0 })
          cap.position.y = 0
          capShell.position.y = 0
          gasket.position.y = 0
          base.position.y = 0
          innerVessel.position.x = 0
          root.scale.setScalar(1)
          bodyMaterial.opacity = 1
          update()
        }
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: show,
          onEnterBack: show,
          onLeave: hide,
          onLeaveBack: hide,
          onRefresh: self => { if (self.isActive) show() },
        })
        if (trigger.isActive) show()
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: update,
        scrollTrigger: { trigger: element, start: 'top 75%', end: 'bottom 85%', scrub: .45, invalidateOnRefresh: true, onRefresh: update },
      })
      const capLift = () => window.innerWidth <= 700 ? .33 : .42
      const baseDrop = () => window.innerWidth <= 700 ? -.22 : -.31
      const shellLift = () => window.innerWidth <= 700 ? .48 : .7
      timeline.to(root.scale, { x: .78, y: .78, z: .78, duration: .65 }, 0)
        .to(root.rotation, { y: .12, duration: .65 }, 0)
        .to(cap.position, { y: capLift, duration: .9 }, .65)
        .to(base.position, { y: baseDrop, duration: .9 }, .65)
        .to(primary, { autoAlpha: 1, duration: .32 }, 1.18)
        .to(capShell.position, { y: shellLift, duration: .8 }, 1.55)
        .to(gasket.position, { y: .24, duration: .8 }, 1.55)
        .to(root.rotation, { y: .25, duration: .8 }, 1.55)
        .to(secondary, { autoAlpha: 1, duration: .25 }, 2.05)
        .to(bodyMaterial, { opacity: .5, duration: .75 }, 2.4)
        .to(innerVessel.position, { x: .12, duration: .75 }, 2.4)
        .to(bodyLabels, { autoAlpha: 1, duration: .25 }, 2.75)
        .to({}, { duration: .25 }, 3.15)
        .to([...primary, ...secondary, ...bodyLabels], { autoAlpha: 0, duration: .3 }, 3.45)
        .to(bodyMaterial, { opacity: 1, duration: .65 }, 3.45)
        .to(innerVessel.position, { x: 0, duration: .65 }, 3.45)
        .to(capShell.position, { y: 0, duration: .65 }, 3.45)
        .to(gasket.position, { y: 0, duration: .65 }, 3.45)
        .to(cap.position, { y: 0, duration: .65 }, 3.45)
        .to(base.position, { y: 0, duration: .65 }, 3.45)
        .to(root.rotation, { y: 0, duration: .65 }, 3.45)
        .to(root.scale, { x: 1, y: 1, z: 1, duration: .65 }, 3.45)
        .to({}, { duration: .4 }, 4.1)
      update()
    }, element)
    window.addEventListener('resize', placeLabels)
    return () => {
      window.removeEventListener('resize', placeLabels)
      ctx.revert()
      bodyMaterial.opacity = 1
      bodyMaterial.transparent = false
      bodyMaterial.depthWrite = true
      bodyMaterial.needsUpdate = true
      cap.position.y = 0
      capShell.position.y = 0
      capInsert.position.y = 0
      gasket.position.y = 0
      base.position.y = 0
      innerVessel.position.x = 0
      root.rotation.y = 0
      root.scale.setScalar(1)
      invalidate()
    }
  }, [rig, sceneReady])

  return <section className="aura-anatomy" ref={section} aria-labelledby="aura-anatomy-title">
    <div className="aura-anatomy__intro">
      <span className="aura-anatomy__eyebrow">02 / THE ANATOMY</span>
      <h2 id="aura-anatomy-title">Form follows<br/><em>intention.</em></h2>
      <p>A considered silhouette, opened to reveal the few parts that make it whole.</p>
    </div>
    <div className="aura-anatomy__visual">
      <svg className="aura-anatomy__leaders" aria-hidden="true">{labels.map(item => <line key={item.id} data-anatomy-line={item.id} />)}</svg>
      <div className="aura-anatomy__labels">
        {labels.map(item => <div key={item.id} className={`aura-anatomy__label aura-anatomy__label--${item.phase}`} data-anatomy-label={item.id}>{item.text}</div>)}
      </div>
    </div>
    {!sceneReady && <div className="aura-anatomy__fallback"><p>ANATOMY / STATIC VIEW</p><ol><li>Cap shell, threaded insert, and sealing gasket</li><li>Threaded neck and inner vessel</li><li>Outer body and integrated base</li></ol></div>}
    <Link className="aura-anatomy__return aura-return" to="/#collection">Back to the collection <span aria-hidden="true">↗</span></Link>
  </section>
}
