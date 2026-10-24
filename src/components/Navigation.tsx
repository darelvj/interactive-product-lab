import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
export function Navigation() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    if (!menuOpen) return
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
  return <header className={`nav nav--${pathname.slice(1) || 'home'}`}>
    <Link className="logo" to="/">ODDLY<span>.</span></Link>
    <nav aria-label="Main navigation"><Link to={collectionHref}>Collection <span>↘</span></Link><Link to={aboutHref}>About <span>↘</span></Link></nav>
    <button ref={buttonRef} className="menu" type="button" aria-label={menuOpen ? 'Close product menu' : 'Open product menu'} aria-expanded={menuOpen} aria-controls="oddly-product-menu" onClick={() => setMenuOpen(open => !open)}><span/><span/></button>
    {menuOpen && <div ref={menuRef} className="nav-menu" id="oddly-product-menu" aria-label="Products">
      <span className="nav-menu__eyebrow">EXPLORE THE COLLECTION</span>
      <Link to="/aura" onClick={() => setMenuOpen(false)}><span>001</span>AURA <b aria-hidden="true">↗</b></Link>
      <Link to="/chronos" onClick={() => setMenuOpen(false)}><span>002</span>CHRONOS <b aria-hidden="true">↗</b></Link>
      <Link to="/loop" onClick={() => setMenuOpen(false)}><span>003</span>LOOP <b aria-hidden="true">↗</b></Link>
    </div>}
  </header>
}
