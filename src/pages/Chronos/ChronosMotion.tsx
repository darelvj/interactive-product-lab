import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { handAngles, localDaySeconds, movementPose, type ChronosMode } from './ChronosTime'
import type { ChronosPlayback, ChronosRig } from './ChronosRig'

const restingPose = { x: -0.13, y: -0.2, z: -0.13 }

export function ChronosMotion({ rig, mode, exploreSeconds, playback }: {
  rig: ChronosRig; mode: ChronosMode; exploreSeconds: number; playback: ChronosPlayback
}) {
  const { gl, invalidate } = useThree()
  const demonstrationTime = useRef(Date.now() / 1000)
  const lastFrameAt = useRef(performance.now())
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let intersecting = false
    const refresh = () => setVisible(intersecting && !document.hidden)
    const observer = new IntersectionObserver(entries => {
      intersecting = entries[0]?.isIntersecting ?? false
      refresh()
    }, { threshold: 0.03 })
    observer.observe(gl.domElement)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [gl])

  useEffect(() => {
    invalidate()
    if (!visible || (mode !== 'live' && (playback === 'paused' || reducedMotion))) return
    const timer = window.setInterval(invalidate, reducedMotion ? 1000 : 50)
    return () => window.clearInterval(timer)
  }, [visible, mode, playback, reducedMotion, invalidate])

  useEffect(() => { lastFrameAt.current = performance.now(); invalidate() }, [mode, exploreSeconds, playback, invalidate])

  useEffect(() => {
    const canvas = gl.domElement
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reset = () => {
      rig.tiltX = 0
      rig.tiltY = 0
      invalidate()
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion) return
      const bounds = canvas.getBoundingClientRect()
      rig.tiltX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -0.065
      rig.tiltY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.085
      invalidate()
    }
    canvas.addEventListener('pointermove', move, { passive: true })
    canvas.addEventListener('pointerleave', reset)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', reset)
      reset()
    }
  }, [gl, rig, invalidate, reducedMotion])

  useFrame(() => {
    const now = performance.now()
    const delta = Math.min(Math.max((now - lastFrameAt.current) / 1000, 0), 0.1)
    lastFrameAt.current = now
    if (!reducedMotion && playback !== 'paused') demonstrationTime.current += delta * (playback === 'slow' ? 0.25 : 1)
    const date = new Date()
    const dialSeconds = mode === 'live' ? localDaySeconds(date) : exploreSeconds
    const hands = handAngles(dialSeconds)
    const movement = movementPose(demonstrationTime.current)
    if (rig.hour) rig.hour.rotation.z = hands.hour
    if (rig.minute) rig.minute.rotation.z = hands.minute
    if (rig.second) rig.second.rotation.z = hands.second
    if (rig.mainWheel) rig.mainWheel.rotation.z = movement.main
    if (rig.transferWheel) rig.transferWheel.rotation.z = movement.transfer
    if (rig.escapeWheel) rig.escapeWheel.rotation.z = movement.escape
    if (rig.balance) rig.balance.rotation.z = reducedMotion ? 0 : movement.balance
    if (rig.lever) rig.lever.rotation.z = reducedMotion ? 0 : movement.lever
    if (rig.root) rig.root.rotation.set(restingPose.x + (reducedMotion ? 0 : rig.tiltX), restingPose.y + (reducedMotion ? 0 : rig.tiltY), restingPose.z)
  })

  return null
}
