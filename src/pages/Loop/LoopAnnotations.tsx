import type { RefObject } from 'react'
import { LOOP_ANNOTATIONS, LOOP_BEATS } from './LoopCameraStory'

export function LoopAnnotations({ activeBeat, overlayRef }: { activeBeat: number; overlayRef: RefObject<HTMLDivElement | null> }) {
  const beat = activeBeat >= 0 ? LOOP_BEATS[activeBeat] : null
  return <div className="loop-story__overlay" ref={overlayRef} aria-hidden="true">
    <svg className="loop-story__leaders" aria-hidden="true">
      {beat?.annotations.map(id => <g key={id}><line data-loop-line={id} /><circle data-loop-marker={id} r="3" /></g>)}
    </svg>
    {beat?.annotations.map((id, index) => <div key={id} className={`loop-story__callout loop-story__callout--${LOOP_ANNOTATIONS[id].side} loop-story__callout--${index}`} data-loop-anchor={id}>
      <span>{beat.number.slice(0, 2)} / {LOOP_ANNOTATIONS[id].title}</span><p>{LOOP_ANNOTATIONS[id].detail}</p>
    </div>)}
  </div>
}
