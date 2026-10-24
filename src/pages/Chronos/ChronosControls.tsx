import { useEffect, useState } from 'react'
import { formatClock, localDaySeconds, type ChronosMode } from './ChronosTime'

export function ChronosControls({ mode, exploreMinutes, onModeChange, onExploreChange }: {
  mode: ChronosMode
  exploreMinutes: number
  onModeChange: (mode: ChronosMode) => void
  onExploreChange: (minutes: number) => void
}) {
  const [liveSeconds, setLiveSeconds] = useState(() => localDaySeconds(new Date()))
  useEffect(() => {
    if (mode !== 'live') return
    const refresh = () => {
      const current = localDaySeconds(new Date())
      setLiveSeconds(previous => formatClock(previous) === formatClock(current) ? previous : current)
    }
    refresh()
    const timer = window.setInterval(refresh, 1000)
    return () => window.clearInterval(timer)
  }, [mode])

  const time = mode === 'live' ? formatClock(liveSeconds) : formatClock(exploreMinutes * 60)
  return <div className="chronos-controls" aria-label="Watch time controls">
    <div className="chronos-controls__top"><span>TIME / 02</span><output aria-live="off">{time}</output></div>
    <div className="chronos-controls__modes" role="group" aria-label="Time mode">
      <button type="button" aria-pressed={mode === 'live'} onClick={() => onModeChange('live')}>LIVE</button>
      <button type="button" aria-pressed={mode === 'explore'} onClick={() => onModeChange('explore')}>EXPLORE</button>
    </div>
    {mode === 'explore' ? <div className="chronos-controls__adjust">
      <label htmlFor="chronos-time-range">SET THE TIME <span>{time}</span></label>
      <input id="chronos-time-range" type="range" min="0" max="1439" step="1" value={exploreMinutes} aria-valuetext={`${time} local time`} onChange={event => onExploreChange(Number(event.currentTarget.value))} />
      <span className="chronos-controls__hint">DRAG OR USE ARROW KEYS</span>
    </div> : <p className="chronos-controls__hint">YOUR LOCAL TIME, IN MOTION</p>}
  </div>
}
