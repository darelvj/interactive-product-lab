import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Scroll position belongs to navigation, never to an individual product page. */
export function RouteScrollManager() {
  const location = useLocation()
  const previousPath = useRef<string | null>(null)

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])

  useLayoutEffect(() => {
    const samePage = previousPath.current === location.pathname
    previousPath.current = location.pathname
    const hash = location.hash.slice(1)
    const target = hash ? document.getElementById(decodeURIComponent(hash)) : null
    if (target) {
      const smooth = samePage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    // Hash-only navigation does not change pinned measurements. Refreshing here
    // can interrupt a smooth anchor scroll and briefly restore the old position.
    if (samePage) return

    let active = true
    let frame = 0
    void document.fonts.ready.then(() => {
      if (!active) return
      frame = requestAnimationFrame(() => {
        if (!active) return
        const beforeRefresh = window.scrollY
        ScrollTrigger.refresh()
        // ScrollTrigger restores the pre-route scroll after measuring. On a
        // shorter destination page that can land at its maximum scroll.
        window.scrollTo({ top: beforeRefresh, left: 0, behavior: 'instant' })
        ScrollTrigger.update()
        if (target) {
          const smooth = samePage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          target.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' })
        }
      })
    })
    return () => { active = false; cancelAnimationFrame(frame) }
  }, [location.key, location.pathname, location.hash])

  return null
}
