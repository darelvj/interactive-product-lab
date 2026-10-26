import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
export function Navigation() {
  const { pathname, hash, key } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { setMenuOpen(false) }, [key, pathname, hash])
  useEffect(() => {
    if (pathname !== '/') { setActiveSection(''); return }
    const sections = ['collection', 'about'].map(id => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node))
    const update = () => {
      const header = document.querySelector<HTMLElement>('.nav')?.getBoundingClientRect().height ?? 94
      const line = Math.max(header + 24, window.innerHeight * .5)
      const passed = sections.filter(node => node.getBoundingClientRect().top <= line)
      setActiveSection(passed[passed.length - 1]?.id ?? '')
    }
    // Observe section boundaries, rather than scheduling a React update every frame.
    const observer = new IntersectionObserver(update, { rootMargin: '-12% 0px -50% 0px' })
    sections.forEach(node => observer.observe(node))
    update()
    return () => observer.disconnect()
  }, [pathname, hash])
  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); buttonRef.current?.focus() }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [menuOpen])
  const collectionHref = pathname === '/' ? '#collection' : '/#collection'
  const aboutHref = pathname === '/' ? '#about' : '/#about'
  return <header className={`nav nav--${pathname.slice(1) || 'home'}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMenuOpen(false) }}>
    <Link className="logo" to="/" aria-label="ODDLY. homepage" aria-current={pathname === '/' && !activeSection ? 'page' : undefined}>ODDLY<span>.</span></Link>
    <nav aria-label="Main navigation"><Link to={collectionHref} aria-current={activeSection === 'collection' ? 'location' : undefined}>Collection <span aria-hidden="true">↘</span></Link><Link to={aboutHref} aria-current={activeSection === 'about' ? 'location' : undefined}>About <span aria-hidden="true">↘</span></Link></nav>
    <button ref={buttonRef} className="menu" type="button" data-current-product={pathname !== '/'} aria-label={menuOpen ? 'Close product menu' : 'Open product menu'} aria-expanded={menuOpen} aria-controls="oddly-product-menu" onClick={() => setMenuOpen(open => !open)}><span/><span/></button>
    <div ref={menuRef} className="nav-menu" id="oddly-product-menu" role="navigation" aria-label="Product navigation" hidden={!menuOpen}>
      <span className="nav-menu__eyebrow">EXPLORE THE COLLECTION</span>
      <Link to="/aura" aria-current={pathname === '/aura' ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span>001</span>AURA <b aria-hidden="true">↗</b></Link>
      <Link to="/chronos" aria-current={pathname === '/chronos' ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span>002</span>CHRONOS <b aria-hidden="true">↗</b></Link>
      <Link to="/loop" aria-current={pathname === '/loop' ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span>003</span>LOOP <b aria-hidden="true">↗</b></Link>
      <div className="nav-menu__sections"><Link to={collectionHref} aria-current={activeSection === 'collection' ? 'location' : undefined} onClick={() => setMenuOpen(false)}>Collection</Link><Link to={aboutHref} aria-current={activeSection === 'about' ? 'location' : undefined} onClick={() => setMenuOpen(false)}>About</Link></div>
    </div>
  </header>
}
