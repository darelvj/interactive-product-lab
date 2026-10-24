import { Link, Route, Routes } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { RouteScrollManager } from './components/RouteScrollManager'
import { ProductVisual } from './components/ProductVisual'
import { products } from './data/products'
import { AuraPage } from './pages/Aura/AuraPage'
import { ChronosPage } from './pages/Chronos/ChronosPage'
import { LoopInspectionPage } from './pages/Loop/LoopInspectionPage'

function Home() {
  return <div className="site"><main>
    <section className="hero"><div className="eyebrow reveal">A SMALL COLLECTION OF BIG FEELINGS <span>✳</span></div><h1 className="reveal delay">The ordinary,<br/><i>made interesting.</i></h1><div className="hero-bottom reveal delay-2"><p>An experimental collection of everyday objects,<br/>reimagined through design and interaction.</p><a className="circle-link" href="#collection" aria-label="Explore collection">↓</a><p className="aside-note">THREE OBJECTS.<br/>NO PARTICULAR REASON.</p></div></section>
    <section className="collection" id="collection"><div className="section-intro"><span>THE COLLECTION</span><span>03 / 03</span></div><div className="product-list">{products.map((product, i) => <Link to={'/'+product.slug} className={'product product-'+product.mood} key={product.slug}><div className="product-meta"><span>{product.number}</span><span>{product.category}</span></div><ProductVisual product={product}/><div className="product-copy"><div><h2>{product.name}</h2><p>{product.description}</p></div><span className="explore">Explore <b>↗</b></span></div><span className="product-index">0{i+1}</span></Link>)}</div></section>
    <section className="about" id="about"><p className="eyebrow">A NOTE FROM ODDLY.</p><p className="about-copy">We like ordinary things.<br/><i>We just look at them sideways.</i></p></section>
  </main><footer><span>ODDLY. — THREE OBJECTS. NO PARTICULAR REASON.</span><a href="#collection">BACK TO COLLECTION ↑</a><span>© 2026</span></footer></div>
}

export default function App() { return <><Navigation/><Routes><Route path="/" element={<Home/>}/><Route path="/aura" element={<AuraPage/>}/><Route path="/chronos" element={<ChronosPage/>}/><Route path="/loop" element={<LoopInspectionPage/>}/></Routes><RouteScrollManager/></> }
