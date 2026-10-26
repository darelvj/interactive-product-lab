import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { RouteScrollManager } from './components/RouteScrollManager'
import { ProductVisual } from './components/ProductVisual'
import { products } from './data/products'
import { SiteFooter } from './components/SiteFooter'
import './components/site-polish.css'

const AuraPage = lazy(() => import('./pages/Aura/AuraPage').then(module => ({ default: module.AuraPage })))
const ChronosPage = lazy(() => import('./pages/Chronos/ChronosPage').then(module => ({ default: module.ChronosPage })))
const LoopInspectionPage = lazy(() => import('./pages/Loop/LoopInspectionPage').then(module => ({ default: module.LoopInspectionPage })))

function RouteLoading({ product }: { product: 'aura' | 'chronos' | 'loop' }) {
  return <main id="main-content" tabIndex={-1} className={`route-loading route-loading--${product}`}>
    <span>ODDLY. / OBJECT {product === 'aura' ? '001' : product === 'chronos' ? '002' : '003'}</span>
    <p role="status" aria-live="polite">Preparing the experience</p>
  </main>
}

function Home() {
  return <div className="site"><main id="main-content" tabIndex={-1}>
    <section className="hero"><div className="eyebrow reveal">A SMALL COLLECTION OF BIG FEELINGS <span>✳</span></div><h1 className="reveal delay">The ordinary,<br/><i>made interesting.</i></h1><div className="hero-bottom reveal delay-2"><p>An experimental collection of everyday objects,<br/>reimagined through design and interaction.</p><a className="circle-link" href="#collection" aria-label="Explore collection">↓</a><p className="aside-note">THREE OBJECTS.<br/>NO PARTICULAR REASON.</p></div></section>
    <section className="collection" id="collection" aria-label="The collection"><div className="section-intro"><span>THE COLLECTION</span><span>03 / 03</span></div><div className="product-list">{products.map((product, i) => <Link to={'/'+product.slug} className={'product product-'+product.mood} key={product.slug}><div className="product-meta"><span>{product.number}</span><span>{product.category}</span></div><ProductVisual product={product}/><div className="product-copy"><div><h2>{product.name}</h2><p>{product.description}</p></div><span className="explore">Explore <b>↗</b></span></div><span className="product-index">0{i+1}</span></Link>)}</div></section>
    <section className="about" id="about" aria-labelledby="about-title"><p className="eyebrow">A NOTE FROM ODDLY.</p><div className="about__body"><h2 className="about-copy" id="about-title">We like ordinary things.<br/><i>We just look at them sideways.</i></h2><p className="about-description">ODDLY. is an experimental collection exploring how everyday objects become immersive digital experiences through interaction, motion, and design.</p><p className="about-description">AURA, CHRONOS, and LOOP are conceptual interactive showcases: a bottle, a watch, and a machine built to go nowhere. Three studies in making the ordinary interesting.</p></div></section>
  </main></div>
}

export default function App() { return <><a className="skip-link" href="#main-content">Skip to main content</a><Navigation/><Routes><Route path="/" element={<Home/>}/><Route path="/aura" element={<Suspense fallback={<RouteLoading product="aura"/>}><AuraPage/></Suspense>}/><Route path="/chronos" element={<Suspense fallback={<RouteLoading product="chronos"/>}><ChronosPage/></Suspense>}/><Route path="/loop" element={<Suspense fallback={<RouteLoading product="loop"/>}><LoopInspectionPage/></Suspense>}/></Routes><SiteFooter/><RouteScrollManager/></> }
