import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const motion = {
  entrance: { ambient: 0, title: 0.18, bottle: 0.38, details: 0.83, scroll: 1.12 },
  cursor: { bottleX: 7, bottleY: 5, titleX: -10, haloX: 12, haloY: 8 },
  design: { desktopX: 0.27, desktopY: 40, desktopScale: 0.82, mobileY: -0.16, mobileScale: 0.72 },
}

function smooth(start: number, end: number, value: number) {
  const progress = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return progress * progress * (3 - 2 * progress)
}

export function useAuraMotion(pageRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return

    const hero = page.querySelector<HTMLElement>('.aura-hero')
    const intro = page.querySelector<HTMLElement>('.aura-intro')
    const story = page.querySelector<HTMLElement>('.aura-story')
    const product = page.querySelector<HTMLElement>('.aura-hero__motion')
    const reveal = page.querySelector<HTMLElement>('.aura-hero__reveal')
    const parallax = page.querySelector<HTMLElement>('.aura-hero__parallax')
    const title = page.querySelector<HTMLElement>('.aura-hero__title')
    const halo = page.querySelector<HTMLElement>('.aura-hero__halo')
    const ambient = page.querySelector<HTMLElement>('.aura-hero__ambient')
    const introNumber = page.querySelector<HTMLElement>('.aura-intro__number')
    const introCopy = page.querySelector<HTMLElement>('.aura-intro__copy')
    if (!hero || !intro || !story || !product || !reveal || !parallax || !title || !halo || !ambient || !introNumber || !introCopy) return

    // One owner for the DOM bottle's position. Each frame is derived from
    // absolute scroll position, so skipped sections and reverse scroll agree.
    const positionProduct = () => {
      const viewport = window.innerHeight
      const scroll = window.scrollY
      // Suspense replaces the placeholder section after the feature chunk loads.
      const anatomy = story.querySelector<HTMLElement>('.aura-anatomy')
      if (!anatomy) return
      const introTop = intro.getBoundingClientRect().top + scroll
      const anatomyTop = anatomy.getBoundingClientRect().top + scroll
      const designStart = introTop - viewport * .85
      const designEnd = introTop - viewport * .15
      const returnStart = anatomyTop - viewport * .75
      const returnEnd = anatomyTop - viewport * .15
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const presence = reduced
        ? Number(scroll >= designStart && scroll < returnStart)
        : smooth(designStart, designEnd, scroll) * (1 - smooth(returnStart, returnEnd, scroll))
      const width = window.innerWidth
      const targetX = width > 1024 ? width * motion.design.desktopX : width > 700 ? width * .31 : 0
      const targetY = width > 700 ? motion.design.desktopY : viewport * motion.design.mobileY
      const targetScale = width > 1024 ? motion.design.desktopScale : width > 700 ? .76 : motion.design.mobileScale
      gsap.set(product, { x: targetX * presence, y: targetY * presence, scale: 1 + (targetScale - 1) * presence })
    }
    const productTrigger = ScrollTrigger.create({
      trigger: story, start: 'top top', end: 'bottom bottom',
      onUpdate: positionProduct, onRefresh: positionProduct,
    })
    positionProduct()

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const nav = page.querySelector('.nav')
      const top = hero.querySelector('.aura-hero__top')
      const left = hero.querySelector('.aura-hero__left')
      const right = hero.querySelector('.aura-hero__right')
      const tagline = hero.querySelector('.aura-hero__bottom > div')
      const edition = hero.querySelector('.aura-hero__edition')
      const scroll = hero.querySelector('.aura-scroll')
      const heroBottom = hero.querySelector('.aura-hero__bottom')
      const details = [nav, top, left, right, tagline, edition].filter(Boolean)

      gsap.set(ambient, { opacity: 0 })
      gsap.set(halo, { opacity: 0, scale: 0.9 })
      gsap.set(title, { opacity: 0, y: 18 })
      gsap.set(reveal, { autoAlpha: 0, y: 42, scale: 0.97 })
      gsap.set([...details, scroll].filter(Boolean), { autoAlpha: 0 })

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .to(ambient, { opacity: 0.8, duration: 0.7 }, motion.entrance.ambient)
        .to(halo, { opacity: 1, scale: 1, duration: 0.8 }, motion.entrance.ambient)
        .to(title, { opacity: 0.12, y: 0, duration: 0.8 }, motion.entrance.title)
        .to(reveal, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, motion.entrance.bottle)
        .to(details, { autoAlpha: 1, duration: 0.55, stagger: 0.035 }, motion.entrance.details)
        .to(scroll, { autoAlpha: 1, duration: 0.45 }, motion.entrance.scroll)

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: intro, start: 'top 85%', end: 'top 15%', scrub: 0.65, invalidateOnRefresh: true },
      })
        .to(heroBottom, { autoAlpha: 0, duration: 0.35 }, 0)
        .fromTo([introNumber, introCopy], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.55 }, 0.34)

      let removePointer = () => {}
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const bottleX = gsap.quickTo(parallax, 'x', { duration: 0.7, ease: 'power3.out' })
        const bottleY = gsap.quickTo(parallax, 'y', { duration: 0.7, ease: 'power3.out' })
        const titleX = gsap.quickTo(title, 'x', { duration: 0.8, ease: 'power3.out' })
        const haloX = gsap.quickTo(halo, 'x', { duration: 0.8, ease: 'power3.out' })
        const haloY = gsap.quickTo(halo, 'y', { duration: 0.8, ease: 'power3.out' })
        const move = (event: PointerEvent) => {
          const bounds = hero.getBoundingClientRect()
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
          bottleX(x * motion.cursor.bottleX)
          bottleY(y * motion.cursor.bottleY)
          titleX(x * motion.cursor.titleX)
          haloX(x * motion.cursor.haloX)
          haloY(y * motion.cursor.haloY)
        }
        const reset = () => { bottleX(0); bottleY(0); titleX(0); haloX(0); haloY(0) }
        hero.addEventListener('pointermove', move, { passive: true })
        hero.addEventListener('pointerleave', reset)
        removePointer = () => {
          hero.removeEventListener('pointermove', move)
          hero.removeEventListener('pointerleave', reset)
          gsap.killTweensOf([parallax, title, halo])
        }
      }

      return () => { removePointer() }
    })

    media.add('(prefers-reduced-motion: reduce)', () => {
      positionProduct()
    })

    return () => { productTrigger.kill(); media.revert() }
  }, [pageRef])
}
