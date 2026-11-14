import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { FILTERS, PRODUCTS, waLink } from '../data.js';

// Premium "store" grid: one large featured pack, then clean equal cards.
// Every battery sits centred on a soft studio gradient (transparent cut-outs).
const FEATURED = '60V 32Ah Lithium Battery';
const chem = (ch) => (ch === 'LFP' ? 'LFP' : ch === 'Li-ion' ? 'Li-ion' : 'Lithium');
const ah = (cap) => (cap === 'On request' ? null : parseFloat(cap));

function Card({ p, onOpen, big }) {
  return (
    <article className={`sc${big ? ' sc-big' : ''}${p.img ? '' : ' sc-noimg'}`} onClick={() => onOpen(p)} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(p)} data-cursor="View">
      <div className="sc-top">
        <span className="sc-cat">{p.t}</span>
        <span className="sc-chem">{chem(p.ch)}</span>
      </div>
      <div className="sc-media">
        <span className="sc-glow" />
        {p.img
          ? <img src={`${p.img[0]}-${big ? 'lg' : 'sm'}.webp`} alt={p.n} loading={big ? 'eager' : 'lazy'} decoding="async" width={big ? 1200 : 640} height={big ? 900 : 480} />
          : <span className="sc-v">{p.v}<small>V</small></span>}
      </div>
      <div className="sc-body">
        {big && <span className="sc-flag">Best seller</span>}
        <h3>{p.n}</h3>
        <div className="sc-spec"><b>{p.v}<small>V</small></b>{ah(p.cap) && <b className="r">{ah(p.cap)}<small>Ah</small></b>}</div>
        {big && <p className="sc-desc">High-range lithium-ion pack with Smart BMS for e-scooters and e-bikes. Built and tested in Sirsa, Haryana.</p>}
        <div className="sc-acts" onClick={(e) => e.stopPropagation()}>
          <a className="sc-price" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price</a>
          <button className="sc-more" type="button" onClick={() => onOpen(p)}>Details <span>→</span></button>
        </div>
      </div>
    </article>
  );
}

export default function Products({ filter, setFilter, onOpen }) {
  const tabsRef = useRef(null);
  const gridRef = useRef(null);
  const first = useRef(true);
  const [pill, setPill] = useState({ w: 0, x: 0 });
  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);
  const featured = list.find((p) => p.n === FEATURED) || list.find((p) => p.img) || list[0];
  const rest = list.filter((p) => p !== featured);

  useLayoutEffect(() => {
    const place = () => {
      const a = tabsRef.current?.querySelector('.tab.active');
      if (a) setPill({ w: a.offsetWidth, x: a.offsetLeft - 5 });
    };
    place();
    document.fonts?.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [filter]);

  // cards glide in when the filter changes
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(gridRef.current.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
  }, [filter]);

  return (
    <section className="prods store" id="products">
      <div className="wrap">
        <div className="p-head">
          <div>
            <div className="label rv"><i />Our batteries</div>
            <h2 className="rv">Find your <span className="serif red">pack</span></h2>
          </div>
          <div className="tabs rv" ref={tabsRef}>
            <span className="tab-pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
            {FILTERS.map(({ f, label }) => (
              <button key={f} className={`tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="store-grid" ref={gridRef}>
          {featured && <Card p={featured} onOpen={onOpen} big />}
          {rest.map((p) => <Card key={p.n} p={p} onOpen={onOpen} />)}
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
