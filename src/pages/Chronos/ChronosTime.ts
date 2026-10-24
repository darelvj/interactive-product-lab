export type ChronosMode = 'live' | 'explore'

export const GEAR_TEETH = { main: 24, transfer: 16, escape: 11 } as const
export const BEAT_RATE = 1.5 // One visible tooth advance per balance cycle.
const TURN = Math.PI * 2

export function localDaySeconds(date: Date) {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000
}

export function localDayStartEpoch(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000
}

export function formatClock(seconds: number) {
  const wholeMinutes = Math.floor((((seconds % 86400) + 86400) % 86400) / 60)
  return `${String(Math.floor(wholeMinutes / 60)).padStart(2, '0')}:${String(wholeMinutes % 60).padStart(2, '0')}`
}

export function handAngles(seconds: number) {
  return {
    hour: -TURN * (seconds % 43200) / 43200,
    minute: -TURN * (seconds % 3600) / 3600,
    second: -TURN * (seconds % 60) / 60,
  }
}

export function movementPose(seconds: number) {
  // 528 is the least common multiple of the three tooth counts. Reducing by
  // this full cycle prevents large epoch angles and keeps midnight continuous.
  const beat = ((seconds * BEAT_RATE) % 528 + 528) % 528
  const wholeBeat = Math.floor(beat)
  const opening = Math.min((beat - wholeBeat) / 0.22, 1)
  const released = opening * opening * (3 - 2 * opening)
  const teethPassed = wholeBeat + released
  const phase = beat * TURN
  return {
    main: -TURN * teethPassed / GEAR_TEETH.main,
    transfer: TURN * teethPassed / GEAR_TEETH.transfer,
    escape: -TURN * teethPassed / GEAR_TEETH.escape,
    balance: Math.sin(phase) * 0.21,
    lever: Math.sin(phase + Math.PI / 2) * 0.085,
  }
}
