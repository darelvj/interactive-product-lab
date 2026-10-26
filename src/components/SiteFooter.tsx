import { Link } from 'react-router-dom'
import './site-footer.css'

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer__identity"><Link to="/" aria-label="ODDLY. homepage">ODDLY.</Link><span>The ordinary, made interesting.</span></div>
    <nav aria-label="Footer navigation"><Link to="/#collection">Collection <span aria-hidden="true">↑</span></Link><Link to="/#about">About</Link><a href="https://github.com/darelvj/interactive-product-lab" target="_blank" rel="noopener noreferrer" aria-label="Project on GitHub (opens in a new tab)">GitHub <span aria-hidden="true">↗</span></a></nav>
    <span className="site-footer__note">A CONCEPTUAL PORTFOLIO EXPERIMENT<br />© {new Date().getFullYear()} ODDLY.</span>
  </footer>
}
