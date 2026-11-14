import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONTACT, FILTERS, PRODUCTS, waLink } from '../data.js';

// "Sticky Scroll": the big battery stays pinned on the left while the list of
// models scrolls on the right. Whichever model reaches the middle of the
// screen becomes the one shown on the left (smooth cross-fade).
// On phones every model is its own card with its own photo.
const chemName = (ch) => (ch === 'LFP' ? 'LFP (LiFePO₄)' : ch === 'Li-ion' ? 'Lithium-ion' : 'Lithium');

export default function Products({ filter, setFilter, onOpen }) {
  const tabsRef = useRef(null);
  const listRef = useRef(null);
  const [pill, setPill] = useState({ w: 0, x: 0 });
  const [active, setActive] = useState(0);
  const list = PRODUCTS.filter((p) => filter === 'all' || p.c === filter);
  const p = list[Math.min(active, list.length - 1)] || list[0];

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

  // The model in the middle of the screen becomes active
  useEffect(() => {
    setActive(0);
    const items = [...(listRef.current?.querySelectorAll('.sp-item') || [])];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(+e.target.dataset.i)),
      { rootMargin: '-48% 0px -48% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter]);

  const jump = (i) => {
    const el = listRef.current?.querySelector(`.sp-item[data-i="${i}"]`);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -innerHeight / 2 + el.offsetHeight / 2, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // category headings inside the list
  let lastCat = '';

  return (
    <section className="prods sticky-pack" id="products">
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

        <div className="sp-grid">
          {/* LEFT — pinned stage */}
          <div className="sp-stage" aria-hidden="true">
            <div className="sp-stage-in">
              <span className="sp-ghost" key={'g' + p?.n}>{p?.v}V</span>
              {list.map((m, i) => (
                m.img
                  ? <img key={m.n} className={`sp-img${i === active ? ' on' : ''}`} src={`${m.img[0]}-lg.webp`} alt="" width="1200" height="900" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                  : <div key={m.n} className={`sp-img sp-noimg${i === active ? ' on' : ''}`}><b>{m.v}<small>V</small></b><span>Photo coming soon</span></div>
              ))}
              <div className="sp-caption" key={'c' + p?.n}>
                <span>{p?.t}</span>
                <b>{p?.v}<small>V</small>{p && p.cap !== 'On request' && <> · {parseFloat(p.cap)}<small>Ah</small></>}</b>
              </div>
              <div className="sp-progress">
                {list.map((m, i) => <button key={m.n} className={i === active ? 'on' : ''} onClick={() => jump(i)} aria-label={m.n} tabIndex={-1} />)}
              </div>
            </div>
          </div>

          {/* RIGHT — scrolling list of models */}
          <div className="sp-list" ref={listRef}>
            {list.map((m, i) => {
              const head = m.t !== lastCat ? (lastCat = m.t) : null;
              return (
                <div key={m.n}>
                  {head && <div className="sp-cat">{head}</div>}
                  <article className={`sp-item${i === active ? ' on' : ''}`} data-i={i}>
                    {/* phone-only photo */}
                    <div className="sp-mobile-img">
                      {m.img ? <img src={`${m.img[0]}-sm.webp`} alt={m.n} loading="lazy" width="640" height="480" /> : <b>{m.v}V</b>}
                    </div>
                    <span className="sp-num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{m.n}</h3>
                    <div className="sp-big">
                      <span>{m.v}<small>V</small></span>
                      {m.cap !== 'On request' && <span className="ah">{parseFloat(m.cap)}<small>Ah</small></span>}
                    </div>
                    <dl className="sp-specs">
                      <div><dt>Chemistry</dt><dd>{chemName(m.ch)}</dd></div>
                      <div><dt>{m.c === 'solar' ? 'Best for' : 'Range'}</dt><dd>{m.r}</dd></div>
                      <div><dt>Warranty</dt><dd>{m.w}</dd></div>
                      <div><dt>Protection</dt><dd>Smart BMS</dd></div>
                    </dl>
                    <div className="sp-cta">
                      <a className="btn btn-red" href={waLink(`Hi Litpax, I want details & price of ${m.n}.`)} target="_blank" rel="noopener">Get price <span className="ar">→</span></a>
                      <button className="btn btn-glass" type="button" onClick={() => onOpen(m)}>{m.img ? 'Photos & details' : 'Details'} <span className="ar">+</span></button>
                      <a className="sp-buy" href={CONTACT.shop} target="_blank" rel="noopener">Buy online ↗</a>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
        <p className="p-note">* Specifications marked "On request" will be updated with official data. Range depends on vehicle and usage.</p>
      </div>
    </section>
  );
}
