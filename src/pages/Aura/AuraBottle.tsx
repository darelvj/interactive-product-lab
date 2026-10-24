type AuraBottleProps = { className?: string }

/** A stylized, front-facing product illustration. The groups are separate for future anatomy work. */
export function AuraBottle({ className = '' }: AuraBottleProps) {
  return <svg className={className} viewBox="0 0 400 760" role="img" aria-labelledby="aura-bottle-title" xmlns="http://www.w3.org/2000/svg">
    <title id="aura-bottle-title">Stylized AURA bottle in smoked silver with a brushed metal cap</title>
    <defs>
      <linearGradient id="aura-body" x1="0" x2="1"><stop stopColor="#1e292e"/><stop offset=".13" stopColor="#657980"/><stop offset=".29" stopColor="#a7b8b8"/><stop offset=".44" stopColor="#596d73"/><stop offset=".66" stopColor="#26383f"/><stop offset=".88" stopColor="#63757a"/><stop offset="1" stopColor="#131e25"/></linearGradient>
      <linearGradient id="aura-body-overlay" x1="0" y1="0" x2=".1" y2="1"><stop stopColor="#b6d2d4" stopOpacity=".48"/><stop offset=".35" stopColor="#52676c" stopOpacity=".08"/><stop offset=".7" stopColor="#0d2028" stopOpacity=".16"/><stop offset="1" stopColor="#10191f" stopOpacity=".72"/></linearGradient>
      <linearGradient id="aura-metal" x1="0" x2="1"><stop stopColor="#28383e"/><stop offset=".12" stopColor="#a1b2b4"/><stop offset=".28" stopColor="#d8e0dd"/><stop offset=".46" stopColor="#798d91"/><stop offset=".76" stopColor="#334950"/><stop offset=".91" stopColor="#8c9b9c"/><stop offset="1" stopColor="#25363c"/></linearGradient>
      <linearGradient id="aura-edge" x1="0" x2="1"><stop stopColor="#b7d5d8" stopOpacity=".72"/><stop offset=".45" stopColor="#eef6f2" stopOpacity=".04"/><stop offset="1" stopColor="#a2bec4" stopOpacity=".56"/></linearGradient>
      <linearGradient id="aura-sheen" x1="0" x2="1"><stop stopColor="#fff" stopOpacity="0"/><stop offset=".46" stopColor="#fff" stopOpacity=".28"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
    </defs>
    <g className="aura-bottle__base">
      <path d="M82 632h236v22c0 24-17 42-41 44-44 5-110 5-154 0-24-2-41-20-41-44v-22Z" fill="url(#aura-metal)"/>
      <path d="M92 667c14 21 202 24 216 0" fill="none" stroke="#cbd9d6" strokeOpacity=".55" strokeWidth="2"/>
      <path d="M117 693c46 8 120 8 166 0" fill="none" stroke="#0b1419" strokeOpacity=".55" strokeWidth="4"/>
    </g>
    <g className="aura-bottle__body">
      <path d="M135 162h130c4 31 21 48 40 70 10 12 15 27 15 44v350c0 17-11 31-27 34-52 9-134 9-186 0-16-3-27-17-27-34V276c0-17 5-32 15-44 19-22 36-39 40-70Z" fill="url(#aura-body)"/>
      <path d="M135 162h130c4 31 21 48 40 70 10 12 15 27 15 44v350c0 17-11 31-27 34-52 9-134 9-186 0-16-3-27-17-27-34V276c0-17 5-32 15-44 19-22 36-39 40-70Z" fill="url(#aura-body-overlay)"/>
      <path d="M135 163c-5 36-24 55-39 75-8 10-12 23-12 40v346c0 15 10 29 25 32m156-493c5 36 24 55 39 75 8 10 12 23 12 40v346c0 15-10 29-25 32" fill="none" stroke="url(#aura-edge)" strokeWidth="3"/>
      <path d="M111 257c16-20 28-45 34-73v451c-10 0-21-2-30-4l-4-374Z" fill="#e0f1ed" opacity=".15"/>
      <path d="M275 205c22 29 30 45 30 78v334c0 11-4 19-12 23V258c0-17-9-35-18-53Z" fill="#d0e9e7" opacity=".1"/>
      <path d="M130 235c25 7 116 7 141 0" fill="none" stroke="#e1efeb" strokeOpacity=".16" strokeWidth="2"/>
      <path d="M130 618c31 5 109 5 140 0" fill="none" stroke="#ddece8" strokeOpacity=".2" strokeWidth="2"/>
      <text x="200" y="449" textAnchor="middle" fill="#e6eeec" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="22" letterSpacing="8" opacity=".8">AURA</text>
      <path d="M138 468h124" stroke="#d2e3e0" strokeOpacity=".45" strokeWidth=".8"/>
      <text x="200" y="490" textAnchor="middle" fill="#c9d8d5" fontFamily="monospace" fontSize="6" letterSpacing="3" opacity=".7">ORDINARY / EXTRAORDINARY</text>
    </g>
    <g className="aura-bottle__cap">
      <path d="M140 98c0-13 10-23 23-23h74c13 0 23 10 23 23v69H140V98Z" fill="url(#aura-metal)"/>
      <path d="M140 98c0-13 10-23 23-23h74c13 0 23 10 23 23v69H140V98Z" fill="url(#aura-sheen)"/>
      <path d="M141 97h118M141 156h118M140 165h120" stroke="#e3efea" strokeOpacity=".48" strokeWidth="2"/>
      <path d="M150 102v48m10-48v48m10-48v48m10-48v48m10-48v48m10-48v48m10-48v48m10-48v48m10-48v48m10-48v48" stroke="#1b2c33" strokeOpacity=".22" strokeWidth="1"/>
      <path d="M152 74c22-5 73-5 96 0" fill="none" stroke="#f0f6ef" strokeOpacity=".75" strokeWidth="2"/>
      <path d="M142 170c28 4 88 4 116 0" fill="none" stroke="#101f25" strokeOpacity=".7" strokeWidth="4"/>
    </g>
  </svg>
}
