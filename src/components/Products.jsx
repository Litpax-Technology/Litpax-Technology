import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CONTACT, FILTERS, PRODUCTS, waLink } from '../data.js';

export default function Products({ filter, setFilter }) {
  const grid = useRef(null);
  const tabsRef = useRef(null);
  const [pill, setPill] = useState({ w: 0, x: 0 });
  const first = useRef(true);

  // Sliding black pill behind the active tab
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

  // Cards animate in whenever the filter changes
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(grid.current.children, { y: 60, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' });
  }, [filter]);

  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);

  return (
    <section className="prods" id="products">
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

        <div className="p-grid" ref={grid}>
          {list.map((p) => (
            <article className="prod" data-cursor="Details" key={p.n}>
              <div className="pt">
                <div className="tg"><span>{p.t}</span><em>{p.ch}</em></div>
                <div className="v">{p.v}<small>V</small></div>
              </div>
              <div className="pb">
                <h3>{p.n}</h3>
                <dl>
                  <div><dt>Capacity</dt><dd>{p.cap}</dd></div>
                  <div><dt>{p.c === 'solar' ? 'Best for' : 'Range'}</dt><dd>{p.r}</dd></div>
                  <div><dt>Warranty</dt><dd>{p.w}</dd></div>
                  <div><dt>Protection</dt><dd>Smart BMS</dd></div>
                </dl>
                <div className="pa">
                  <a className="q" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price</a>
                  <a className="b" href={CONTACT.shop} target="_blank" rel="noopener">Buy</a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
