import type { ChronosPlayback as PlaybackMode } from './ChronosRig'

const modes: { id: PlaybackMode; label: string }[] = [
  { id: 'paused', label: 'PAUSED' },
  { id: 'normal', label: 'NORMAL' },
  { id: 'slow', label: 'SLOW' },
]

export function ChronosPlayback({ value, onChange }: {
  value: PlaybackMode; onChange: (value: PlaybackMode) => void
}) {
  return <div className="chronos-playback" role="group" aria-label="Mechanical movement playback">
    <span className="chronos-playback__caption">MOVEMENT / PLAYBACK</span>
    <div className="chronos-playback__buttons" role="group" aria-label="Mechanical movement speed">
      {modes.map(mode => <button key={mode.id} type="button" aria-pressed={value === mode.id} onClick={() => onChange(mode.id)}>{mode.label}</button>)}
    </div>
    <span className="chronos-playback__note">The live clock continues independently.</span>
  </div>
}
