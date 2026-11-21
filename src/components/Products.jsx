import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CONTACT, FILTERS, PRODUCTS, waLink } from '../data.js';
import { SectionHead } from './Sections.jsx';

// Product Explorer: model list on the left, a large showcase on the right.
// Filters (also set by the Applications section) narrow the list;
// "Gallery & details" opens the existing product modal.
const FEATURED = '60V 32Ah Lithium Battery';
const chem = (ch) => (ch === 'LFP' ? 'LFP (LiFePO₄)' : ch === 'Li-ion' ? 'Lithium-ion' : 'Lithium');
const ah = (cap) => (cap === 'On request' ? null : parseFloat(cap));

export default function Products({ filter, setFilter, onOpen }) {
  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);
  const start = Math.max(0, list.findIndex((p) => p.n === FEATURED));
  const [sel, setSel] = useState(start);
  const stage = useRef(null);
  const first = useRef(true);

  // new filter → select its first (or featured) model
  useEffect(() => { setSel(Math.max(0, list.findIndex((p) => p.n === FEATURED))); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = list[Math.min(sel, list.length - 1)] || list[0];

  // showcase swaps with a short slide/fade
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!stage.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(stage.current.querySelectorAll('.ex-anim'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
  }, [p?.n]);

  if (!p) return null;
  const specs = [
    ['Voltage', `${p.v} V`],
    ['Capacity', p.cap],
    ['Chemistry', chem(p.ch)],
    [p.c === 'solar' ? 'Best for' : 'Range', p.r],
    ['Protection', 'Smart BMS'],
    ['Made in', 'Sirsa, India'],
  ];

  return (
    <section id="products" className="products">
      <div className="wrap">
        <SectionHead n="04" label="Product range" title={<>Find your <mark>pack.</mark></>}
          lead="Pick a model to see it up close. Every pack ships with a Smart BMS and is tested before it leaves our line." />

        <div className="filters rv" role="tablist" aria-label="Filter batteries">
          {FILTERS.map(({ f, label }) => (
            <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {label}<small>{PRODUCTS.filter((x) => f === 'all' || x.c === f).length}</small>
            </button>
          ))}
        </div>

        <div className="explorer rv">
          <ul className="ex-list" aria-label="Models">
            {list.map((x, i) => (
              <li key={x.n}>
                <button className={x === p ? 'on' : ''} onClick={() => setSel(i)} aria-pressed={x === p}>
                  <span className="exl-v">{x.v}<small>V</small></span>
                  <span className="exl-n">{x.n}<small>{x.t} · {x.ch}</small></span>
                  <span className="exl-c">{ah(x.cap) ? `${ah(x.cap)}Ah` : '—'}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="ex-stage" ref={stage}>
            <div className="ex-visual">
              <span className="ex-v-bg" aria-hidden="true">{p.v}V</span>
              {p.img
                ? <img className="ex-anim" src={`${p.img[0]}-lg.webp`} alt={p.n} width="1200" height="900" decoding="async" />
                : <span className="ex-noimg ex-anim">{p.v}<small>V</small></span>}
              {p.n === FEATURED && <span className="ex-flag">Best seller</span>}
            </div>
            <div className="ex-info">
              <span className="ex-cat ex-anim">{p.t}</span>
              <h3 className="ex-anim">{p.n}</h3>
              <dl className="ex-specs ex-anim">
                {specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="ex-ctas ex-anim">
                <a className="btn btn-y" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price <span className="ar">→</span></a>
                <button className="btn btn-line-k" type="button" onClick={() => onOpen(p)}>Gallery &amp; details</button>
                <a className="ex-shop" href={CONTACT.shop} target="_blank" rel="noopener">Buy online ↗</a>
              </div>
            </div>
          </div>
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
