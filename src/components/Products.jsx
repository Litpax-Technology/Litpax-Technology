import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CONTACT, FILTERS, PRODUCTS, waLink } from '../data.js';

// "Showroom": dark section, one battery at a time in a lit studio box,
// specs beside it, and a model strip underneath to switch between packs.
export default function Products({ filter, setFilter, onOpen }) {
  const tabsRef = useRef(null);
  const stripRef = useRef(null);
  const stageRef = useRef(null);
  const [pill, setPill] = useState({ w: 0, x: 0 });
  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);
  const [idx, setIdx] = useState(0);
  const dir = useRef(1);
  const p = list[Math.min(idx, list.length - 1)];
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sliding pill behind the active filter tab
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

  useEffect(() => { setIdx(0); }, [filter]);

  // Product change: photo glides in, text rises in, active thumb scrolls into view
  useEffect(() => {
    const s = stageRef.current;
    if (s && !reduce) {
      gsap.fromTo(s.querySelectorAll('.sr-img, .sr-reflect'), { x: 80 * dir.current, opacity: 0 }, { x: 0, opacity: (i, el) => (el.classList.contains('sr-reflect') ? 0.14 : 1), duration: 0.9, ease: 'expo.out', clearProps: 'transform,opacity' });
      gsap.fromTo(s.querySelectorAll('.sr-ghost'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out', clearProps: 'opacity' });
      gsap.fromTo(s.querySelectorAll('.sr-info > *'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity' });
    }
    const t = stripRef.current?.querySelector('.sr-thumb.on');
    if (t) stripRef.current.scrollTo({ left: t.offsetLeft - stripRef.current.clientWidth / 2 + t.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [idx, filter, reduce]);

  const go = (n) => {
    if (!list.length) return;
    const next = (n + list.length) % list.length;
    dir.current = next > idx || (idx === list.length - 1 && next === 0) ? 1 : -1;
    setIdx(next);
  };

  // Arrow keys switch models while the showroom is on screen
  useEffect(() => {
    const onKey = (e) => {
      if (document.querySelector('.pm')) return;
      const r = stageRef.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > innerHeight) return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  if (!p) return null;
  const chem = p.ch === 'LFP' ? 'LFP (LiFePO₄)' : p.ch === 'Li-ion' ? 'Lithium-ion' : 'Lithium';

  return (
    <section className="prods showroom" id="products">
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

        <div className="sr-stage rv" ref={stageRef}>
          {/* Lit studio box */}
          <div className="sr-box" onClick={() => onOpen(p)} data-cursor="Gallery">
            <span className="sr-ghost" aria-hidden="true">{p.v}V</span>
            {p.img ? (
              <>
                <img className="sr-img" key={p.n} src={`${p.img[0]}-lg.webp`} alt={p.n} width="1200" height="900" decoding="async" />
                <img className="sr-reflect" key={p.n + '-r'} src={`${p.img[0]}-sm.webp`} alt="" aria-hidden="true" width="640" height="480" />
              </>
            ) : (
              <div className="sr-img sr-noimg" key={p.n}><b>{p.v}<small>V</small></b><span>Photo coming soon</span></div>
            )}
            <div className="sr-count">{String(idx + 1).padStart(2, '0')} <i>/ {String(list.length).padStart(2, '0')}</i></div>
            {p.img && p.img.length > 1 && <div className="sr-more">+{p.img.length - 1} photos</div>}
            <button className="sr-nav prev" aria-label="Previous model" onClick={(e) => { e.stopPropagation(); go(idx - 1); }}>←</button>
            <button className="sr-nav next" aria-label="Next model" onClick={(e) => { e.stopPropagation(); go(idx + 1); }}>→</button>
          </div>

          {/* Specs */}
          <div className="sr-info">
            <div className="sr-cat">{p.t}</div>
            <h3>{p.n}</h3>
            <div className="sr-big">
              <span>{p.v}<small>V</small></span>
              {p.cap !== 'On request' && <span className="ah">{parseFloat(p.cap)}<small>Ah</small></span>}
            </div>
            <dl className="sr-specs">
              <div><dt>Chemistry</dt><dd>{chem}</dd></div>
              <div><dt>{p.c === 'solar' ? 'Best for' : 'Range'}</dt><dd>{p.r}</dd></div>
              <div><dt>Warranty</dt><dd>{p.w}</dd></div>
              <div><dt>Protection</dt><dd>Smart BMS</dd></div>
            </dl>
            <div className="sr-cta">
              <a className="btn btn-red magnetic" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price <span className="ar">→</span></a>
              <button className="btn btn-glass" type="button" onClick={() => onOpen(p)}>Quick view <span className="ar">+</span></button>
            </div>
            <a className="sr-buy" href={CONTACT.shop} target="_blank" rel="noopener">Buy online ↗</a>
          </div>
        </div>

        {/* Model strip */}
        <div className="sr-strip" ref={stripRef} role="tablist" aria-label="Battery models">
          {list.map((m, i) => (
            <button key={m.n} role="tab" aria-selected={i === idx} className={`sr-thumb${i === idx ? ' on' : ''}`}
              onClick={() => { dir.current = i > idx ? 1 : -1; setIdx(i); }}>
              <span className="sr-thumb-img">
                {m.img ? <img src={`${m.img[0]}-sm.webp`} alt="" loading="lazy" width="640" height="480" /> : <b>{m.v}V</b>}
              </span>
              <span className="sr-thumb-t"><b>{m.v}V</b> {m.cap !== 'On request' ? m.cap : ''}<small>{m.t}</small></span>
            </button>
          ))}
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
