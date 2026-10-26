import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Product } from '../data/products'
import { localDaySeconds } from '../pages/Chronos/ChronosTime'
import { usePreviewActivity } from './usePreviewActivity'
import './collection-previews.css'

function AuraPreview() {
  const { ref, animate } = usePreviewActivity()
  return <div ref={ref} className="visual collection-preview aura-preview" data-preview-active={animate} aria-hidden="true">
    <svg viewBox="0 0 360 340" role="presentation">
      <defs>
        <linearGradient id="preview-aura-body" x1="0" x2="1"><stop stopColor="#1c3337"/><stop offset=".28" stopColor="#597079"/><stop offset=".58" stopColor="#2c4148"/><stop offset="1" stopColor="#101d21"/></linearGradient>
        <linearGradient id="preview-aura-cap" x1="0" x2="1"><stop stopColor="#657478"/><stop offset=".4" stopColor="#dae2df"/><stop offset="1" stopColor="#5c6d72"/></linearGradient>
        <radialGradient id="preview-aura-halo"><stop stopColor="#a7cfd1" stopOpacity=".24"/><stop offset="1" stopColor="#a7cfd1" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="185" cy="168" rx="133" ry="143" fill="url(#preview-aura-halo)" />
      <ellipse cx="188" cy="308" rx="94" ry="10" fill="#06100f" opacity=".3" />
      <g className="aura-preview__assembly">
        <g className="aura-preview__bottle">
          <path d="M163 54h34v16h-34z" fill="#425a60" stroke="#9baeb0" strokeWidth="1" />
          <path d="M151 84q0-10 12-15h34q12 5 12 15l6 184q0 17-15 20h-40q-15-3-15-20z" fill="url(#preview-aura-body)" stroke="#8ca8aa" strokeWidth="1.5" />
          <path d="M153 93l4 174q0 10 8 14" fill="none" stroke="#d6eeeb" strokeOpacity=".32" strokeWidth="2" />
          <path d="M207 93l-3 175" fill="none" stroke="#c5dfdf" strokeOpacity=".18" strokeWidth="2" />
          <path d="M152 275q8 10 28 10t28-10" fill="none" stroke="#c2cfd0" strokeOpacity=".5" strokeWidth="1.5" />
          <text x="180" y="190" textAnchor="middle" fill="#d7e2df" opacity=".8" fontSize="12" fontFamily="DM Mono, monospace" letterSpacing="4">AURA</text>
        </g>
        <g className="aura-preview__cap"><path d="M161 52v-20q0-5 5-5h28q5 0 5 5v20q0 4-5 4h-28q-5 0-5-4z" fill="url(#preview-aura-cap)" stroke="#beced0" strokeWidth="1"/><path d="M164 51h32" stroke="#53656b" strokeWidth="1.5"/></g>
      </g>
    </svg>
  </div>
}

function ChronosPreview() {
  const { ref, active, reducedMotion, animate } = usePreviewActivity()
  const [now, setNow] = useState(() => new Date())
  const [phaseTime, setPhaseTime] = useState(() => new Date())
  useEffect(() => {
    if (!active) return
    const current = new Date()
    setNow(current)
    setPhaseTime(current)
    const interval = window.setInterval(() => {
      const currentTime = new Date()
      setNow(currentTime)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [active, reducedMotion])
  const seconds = localDaySeconds(now)
  const hour = (seconds % 43200) / 120
  const minute = (seconds % 3600) / 10
  const second = (phaseTime.getSeconds() + phaseTime.getMilliseconds() / 1000) * 6
  return <div ref={ref} className="visual collection-preview chronos-preview" data-preview-active={animate} aria-hidden="true">
    <div className="chronos-preview__orbit" />
    <div className="chronos-preview__watch" data-local-time={now.toLocaleTimeString()}>
      <div className="chronos-preview__dial">
        <div className="chronos-preview__bridge chronos-preview__bridge--one" /><div className="chronos-preview__bridge chronos-preview__bridge--two" />
        <span className="chronos-preview__gear chronos-preview__gear--one"/><span className="chronos-preview__gear chronos-preview__gear--two"/><span className="chronos-preview__balance"/>
        {Array.from({ length: 12 }, (_, index) => <i key={index} className="chronos-preview__marker" style={{ transform: `rotate(${index * 30}deg)` }} />)}
        <span className="chronos-preview__hand chronos-preview__hand--hour" style={{ transform: `rotate(${hour}deg)` }} />
        <span className="chronos-preview__hand chronos-preview__hand--minute" style={{ transform: `rotate(${minute}deg)` }} />
        <span key={phaseTime.getTime()} className="chronos-preview__hand chronos-preview__hand--second" style={{ '--second-angle': `${second}deg` } as CSSProperties} />
        <span className="chronos-preview__pin"/><span className="chronos-preview__wordmark">CHRONOS</span>
      </div>
      <span className="chronos-preview__crown"/>
    </div>
  </div>
}

function LoopPreview() {
  const { ref, animate, reducedMotion } = usePreviewActivity()
  const svg = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (!svg.current) return
    if (reducedMotion) svg.current.setCurrentTime(0)
    if (animate) svg.current.unpauseAnimations()
    else svg.current.pauseAnimations()
  }, [animate, reducedMotion])
  return <div ref={ref} className="visual collection-preview loop-preview" data-preview-active={animate} aria-hidden="true">
    <svg ref={svg} viewBox="30 0 700 330" role="presentation">
      <defs>
        <linearGradient id="preview-loop-metal"><stop stopColor="#27313c"/><stop offset=".5" stopColor="#53606b"/><stop offset="1" stopColor="#242b35"/></linearGradient>
        <linearGradient id="preview-loop-rail"><stop stopColor="#f6e4d4" stopOpacity=".55"/><stop offset=".5" stopColor="#b1e9ec" stopOpacity=".8"/><stop offset="1" stopColor="#d2c9eb" stopOpacity=".65"/></linearGradient>
      </defs>
      <path d="M85 288V64h275v224M100 288h265" fill="none" stroke="#29323c" strokeWidth="8" strokeLinejoin="round" opacity=".9" />
      <path d="M103 76h252M104 190h252M252 71v194" fill="none" stroke="#55616b" strokeWidth="2" opacity=".7" />
      <rect x="222" y="39" width="58" height="34" rx="7" fill="url(#preview-loop-metal)" stroke="#9bb1b6" strokeWidth="2" /><circle cx="251" cy="55" r="4" fill="#8ddbe0" />
      <path d="M250 73c-53 0-93 8-93 23s136 12 136 30-136 11-136 28 136 12 136 29-136 13-136 30 136 16 136 33-77 21-84 18" fill="none" stroke="#26323b" strokeWidth="13" strokeLinecap="round" /><path id="preview-helix-path" d="M250 73c-53 0-93 8-93 23s136 12 136 30-136 11-136 28 136 12 136 29-136 13-136 30 136 16 136 33-77 21-84 18C130 244 85 171 134 100C175 50 280 73 250 73Z" fill="none" stroke="url(#preview-loop-rail)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="360" cy="174" r="65" fill="none" stroke="#26323b" strokeWidth="14"/><path id="preview-orbit-path" d="M360 109a65 65 0 1 1 0 130a65 65 0 1 1 0-130z" fill="none" stroke="url(#preview-loop-rail)" strokeWidth="5" />
      <path d="M251 74q70 0 74 100M312 241q50 45 119 11" fill="none" stroke="#2c3640" strokeWidth="8" strokeLinecap="round" /><path d="M251 74q70 0 74 100M312 241q50 45 119 11" fill="none" stroke="#bce2e3" strokeWidth="2" opacity=".8" />
      <circle cx="443" cy="249" r="22" fill="#29333c" stroke="#b7a8e8" strokeWidth="4"/><circle cx="515" cy="86" r="19" fill="#29333c" stroke="#8edee2" strokeWidth="4" />
      <path d="M515 106v83" stroke="#5d727c" strokeWidth="2" strokeDasharray="5 5"/><ellipse cx="515" cy="188" rx="49" ry="11" fill="#28313b" stroke="#89dbe0" strokeWidth="3"/><path d="M470 190v78h95v-78" fill="none" stroke="#39444e" strokeWidth="5" />
      <circle cx="583" cy="252" r="24" fill="#29323c" stroke="#c1aee9" strokeWidth="4"/><circle cx="583" cy="252" r="8" fill="#667985" />
      <path d="M537 194q16 46 46 58m24 0q14 9 31 4" fill="none" stroke="#c5e6e4" strokeWidth="4" /><path d="M638 258v-167" stroke="#29343d" strokeWidth="5"/><path d="M625 100q13-12 26 0M625 150q13-12 26 0M625 200q13-12 26 0" fill="none" stroke="#b5a4e8" strokeWidth="5" />
      <path id="preview-chamber-path" d="M638 256V92c16-13 29 2 29 16v129c0 22-29 27-29 19Z" fill="none" stroke="none" />
      <path d="M638 90Q544 18 400 38T252 40" fill="none" stroke="#29323c" strokeWidth="8"/><path d="M638 90Q544 18 400 38T252 40" fill="none" stroke="#a7c8cd" strokeWidth="2" />
      <ellipse cx="378" cy="294" rx="314" ry="13" fill="#301c1a" opacity=".25"/>
      <circle className="loop-preview__marble" r="9" fill="#dbe4e3" stroke="#657782" strokeWidth="2"><animateMotion dur="9s" repeatCount="indefinite"><mpath href="#preview-helix-path" /></animateMotion></circle>
      <circle className="loop-preview__marble" r="9" fill="#c8b4e7" stroke="#756c8e" strokeWidth="2"><animateMotion dur="5.5s" repeatCount="indefinite"><mpath href="#preview-orbit-path" /></animateMotion></circle>
      <circle className="loop-preview__marble" r="9" fill="#f4b4a2" stroke="#9b756e" strokeWidth="2"><animateMotion dur="6.8s" repeatCount="indefinite"><mpath href="#preview-chamber-path" /></animateMotion></circle>
    </svg>
  </div>
}

export function ProductVisual({ product }: { product: Product }) {
  if (product.slug === 'aura') return <AuraPreview />
  if (product.slug === 'chronos') return <ChronosPreview />
  return <LoopPreview />
}
