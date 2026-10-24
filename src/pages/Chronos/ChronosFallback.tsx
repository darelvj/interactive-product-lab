import { useEffect, useState } from 'react'
import { formatClock, handAngles, localDaySeconds, type ChronosMode } from './ChronosTime'

export function ChronosFallback({ mode, exploreMinutes }: { mode: ChronosMode; exploreMinutes: number }) {
  const [liveSeconds, setLiveSeconds] = useState(() => localDaySeconds(new Date()))
  useEffect(() => {
    if (mode !== 'live') return
    const timer = window.setInterval(() => setLiveSeconds(localDaySeconds(new Date())), 1000)
    return () => window.clearInterval(timer)
  }, [mode])
  const seconds = mode === 'live' ? liveSeconds : exploreMinutes * 60
  const hands = handAngles(seconds)
  const degrees = (radians: number) => -radians * 180 / Math.PI
  return <svg className="chronos-watch-fallback" viewBox="0 0 500 580" role="img" aria-label={`Illustration of a CHRONOS skeleton watch showing ${formatClock(seconds)}`}>
    <defs>
      <linearGradient id="chronos-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9aa8a3"/><stop offset=".48" stopColor="#465250"/><stop offset="1" stopColor="#7e8c86"/></linearGradient>
      <radialGradient id="chronos-dial"><stop stopColor="#283230"/><stop offset="1" stopColor="#121918"/></radialGradient>
    </defs>
    <path d="M188 86 L312 86 L302 200 L198 200 Z M198 380 L302 380 L312 496 L188 496 Z" fill="#252c2a" stroke="#4e5b56" strokeWidth="3"/>
    <path d="M172 163 L199 154 L210 211 L181 224 Z M301 154 L328 163 L319 224 L290 211 Z M181 356 L210 369 L199 426 L172 417 Z M290 369 L319 356 L328 417 L301 426 Z" fill="url(#chronos-metal)"/>
    <rect x="397" y="281" width="32" height="18" rx="5" fill="url(#chronos-metal)"/>
    <circle cx="250" cy="290" r="158" fill="url(#chronos-metal)"/>
    <circle cx="250" cy="290" r="146" fill="#222b29" stroke="#c4a77b" strokeWidth="2"/>
    <circle cx="250" cy="290" r="129" fill="url(#chronos-dial)" stroke="#778983" strokeWidth="2"/>
    <circle cx="250" cy="290" r="114" fill="none" stroke="#c4a77b" strokeWidth="1"/>
    <g fill="none" stroke="#c4a77b" strokeWidth="8"><circle cx="207" cy="246" r="42"/><circle cx="281" cy="264" r="29"/><circle cx="326" cy="292" r="18"/><circle cx="308" cy="353" r="28"/></g>
    <g stroke="#a8b4ad" strokeWidth="5"><path d="M165 213 L239 262 M173 279 L241 216 M251 239 L307 285 M279 258 L331 275 M288 327 L328 375 M327 328 L288 375"/></g>
    <path d="M162 231 L212 214 L275 239 L301 224 M164 350 L214 326 L283 337 L320 312" fill="none" stroke="#647874" strokeWidth="13" strokeLinejoin="round"/>
    <circle cx="308" cy="353" r="7" fill="#c4a77b"/>
    {Array.from({ length: 12 }, (_, index) => {
      const angle = index * Math.PI / 6
      const x = 250 + Math.sin(angle) * 105
      const y = 290 - Math.cos(angle) * 105
      return <line key={index} x1={x} y1={y} x2={250 + Math.sin(angle) * 90} y2={290 - Math.cos(angle) * 90} stroke="#c9b99c" strokeWidth="3" />
    })}
    <text x="250" y="207" textAnchor="middle" fill="#ddd7c6" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="2">CHRONOS</text>
    <g transform={`rotate(${degrees(hands.hour)} 250 290)`}><path d="M246 305 L247 252 L250 231 L253 252 L254 305 Z" fill="#e2d9c7"/></g>
    <g transform={`rotate(${degrees(hands.minute)} 250 290)`}><path d="M247 305 L248 230 L250 199 L252 230 L253 305 Z" fill="#e2d9c7"/></g>
    <g transform={`rotate(${degrees(hands.second)} 250 290)`}><line x1="250" y1="316" x2="250" y2="188" stroke="#c4a77b" strokeWidth="2"/></g>
    <circle cx="250" cy="290" r="5" fill="#c4a77b"/>
  </svg>
}
