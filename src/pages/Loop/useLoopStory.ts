import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { loopBeatAt } from './LoopCameraStory'
import type { LoopStoryProgress } from './LoopStoryCamera'

gsap.registerPlugin(ScrollTrigger)

const headerHeight = () => document.querySelector<HTMLElement>('.nav')?.getBoundingClientRect().height ?? 94

export function useLoopStory({ storyRef, playgroundRef, finaleRef, progress, onBeatChange }: {
  storyRef: RefObject<HTMLDivElement | null>
  playgroundRef: RefObject<HTMLElement | null>
  finaleRef: RefObject<HTMLElement | null>
  progress: LoopStoryProgress
  onBeatChange: (beat: number) => void
}) {
  const currentBeat = useRef(-1)

  useLayoutEffect(() => {
    const story = storyRef.current
    const playground = playgroundRef.current
    const finale = finaleRef.current
    if (!story || !playground || !finale) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const updateBeat = () => {
          const beat = loopBeatAt(progress.value)
          if (beat !== currentBeat.current) { currentBeat.current = beat; onBeatChange(beat) }
          progress.invalidate?.()
        }
        gsap.fromTo(progress, { value: 0 }, {
          value: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: story,
            start: 'top top',
            endTrigger: playground,
            // Complete the return shot before an anchor lands below the
            // persistent navigation, rather than after the playground starts.
            end: () => `top top+=${headerHeight()}`,
            scrub: .55,
            invalidateOnRefresh: true,
            onRefresh: updateBeat,
          },
          onUpdate: updateBeat,
        })
        gsap.fromTo(progress, { entrance: 0 }, { entrance: 1, duration: 1.8, ease: 'power2.out', onUpdate: () => progress.invalidate?.() })
        gsap.fromTo(progress, { finale: 0 }, {
          finale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: finale,
            start: 'top bottom',
            end: () => `top top+=${headerHeight()}`,
            scrub: .55,
            invalidateOnRefresh: true,
          },
          onUpdate: () => progress.invalidate?.(),
        })
        const copy = finale.querySelector('.loop-finale__copy')
        if (copy) gsap.fromTo(copy, { opacity: 0, y: 20 }, {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: finale, start: 'top 82%', end: 'top 38%', scrub: true },
        })
      }, story)
      return () => context.revert()
    })
    media.add('(prefers-reduced-motion: reduce)', () => {
      progress.value = 0
      progress.entrance = 1
      progress.finale = 0
      currentBeat.current = -1
      onBeatChange(-1)
      progress.invalidate?.()
    })
    return () => {
      media.revert()
      progress.value = 0
      progress.entrance = 0
      progress.finale = 0
      currentBeat.current = -1
    }
  }, [storyRef, playgroundRef, finaleRef, progress, onBeatChange])
}
