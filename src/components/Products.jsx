import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { FILTERS, PRODUCTS, waLink } from '../data.js';

const FEATURED = '60V 32Ah Lithium Battery';
const chem = (ch) => (ch === 'LFP' ? 'LFP' : ch === 'Li-ion' ? 'Li-ion' : 'Lithium');
const ah = (cap) => (cap === 'On request' ? null : parseFloat(cap));

function Card({ p, onOpen, feat }) {
  return (
    <article className={`pc${feat ? ' feat' : ''}`} onClick={() => onOpen(p)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(p)}>
      <div className="pc-top"><span className="pc-cat">{p.t} · {chem(p.ch)}</span></div>
      {feat && <span className="pc-flag">Best seller</span>}
      <div className="pc-stage">
        <span className="pc-glow" />
        {p.img
          ? <img src={`${p.img[0]}-${feat ? 'lg' : 'sm'}.webp`} alt={p.n} loading={feat ? 'eager' : 'lazy'} decoding="async" width={feat ? 1200 : 640} height={feat ? 900 : 480} />
          : <span className="pc-v">{p.v}<small>V</small></span>}
      </div>
      <div className="pc-body">
        <h3 className="pc-name">{p.n}</h3>
        <div className="pc-spec"><b>{p.v}<small>V</small></b>{ah(p.cap) && <b className="r">{ah(p.cap)}<small>Ah</small></b>}</div>
        {feat && <p className="pc-desc">High-range lithium-ion pack with Smart BMS for e-scooters and e-bikes. Built and tested in Sirsa, Haryana.</p>}
        <div className="pc-act" onClick={(e) => e.stopPropagation()}>
          <a className="pc-price" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price</a>
          <button className="pc-more" type="button" onClick={() => onOpen(p)}>Details →</button>
        </div>
      </div>
    </article>
  );
}

export default function Products({ filter, setFilter, onOpen }) {
  const tabs = useRef(null);
  const grid = useRef(null);
  const first = useRef(true);
  const [pill, setPill] = useState({ w: 0, x: 0 });
  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);
  const featured = list.find((p) => p.n === FEATURED) || list.find((p) => p.img) || list[0];
  const rest = list.filter((p) => p !== featured);

  useLayoutEffect(() => {
    const place = () => {
      const a = tabs.current?.querySelector('button.on');
      if (a) setPill({ w: a.offsetWidth, x: a.offsetLeft });
    };
    place();
    document.fonts?.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [filter]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(grid.current.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'expo.out', clearProps: 'transform,opacity' });
  }, [filter]);

  return (
    <section id="products">
      <div className="wrap">
        <div className="prod-head">
          <div>
            <div className="eyebrow rv"><span className="dot" /><span className="num">04 /</span>Our batteries</div>
            <h2 className="rv">Find your <span className="grad">pack.</span></h2>
          </div>
          <div className="tabs rv" ref={tabs} role="tablist" aria-label="Filter batteries">
            <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} aria-hidden="true" />
            {FILTERS.map(({ f, label }) => (
              <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="pgrid" ref={grid}>
          {featured && <Card p={featured} onOpen={onOpen} feat />}
          {rest.map((p) => <Card key={p.n} p={p} onOpen={onOpen} />)}
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
