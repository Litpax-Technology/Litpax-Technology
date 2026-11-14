import { useEffect, useRef } from 'react';
import { WHY } from '../data.js';

// "Why Litpax": six equal cards, each with a line icon that draws itself
// when the section scrolls into view. No photos — clean and balanced.
const ICONS = [
  // in-house manufacturing — factory
  <><path d="M3 21V10l6 3.5V10l6 3.5V6l6-3v18z" /><path d="M3 21h18" /><path d="M7 17h2M12 17h2M17 17h2" /></>,
  // smart BMS — chip with shield tick
  <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /><path d="m9 12 2 2 4-4" /></>,
  // custom solutions — sliders
  <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  // pan-India service — location pin + route
  <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /><path d="M3 21h4M17 21h4" /></>,
  // strong warranty — shield with star
  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m12 7.5 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" /></>,
  // dealer friendly — handshake-ish (two hands / link)
  <><path d="M8 12 4 8l4-4 4 4" /><path d="m16 12 4 4-4 4-4-4" /><path d="m9 15 6-6" /></>,
];

export default function Why() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('drawn'); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="why why-cards" id="why">
      <div className="wrap">
        <div className="wc-head">
          <div>
            <div className="label rv"><i />Why Litpax</div>
            <h2 className="rv">Built in-house. <span className="serif red">Backed</span> nationwide.</h2>
          </div>
          <p className="lead rv">We design, assemble and test every battery pack in our own facility — consistent quality at a competitive price.</p>
        </div>

        <div className="wc-grid" ref={ref}>
          {WHY.map(([h, p], i) => (
            <article className="wc spot rv" key={h} style={{ '--d': `${i * 0.12}s` }}>
              <div className="wc-top">
                <span className="wc-n">0{i + 1}</span>
                <span className="wc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[i]}
                  </svg>
                </span>
              </div>
              <h3>{h}</h3>
              <p>{p}</p>
              <span className="wc-line" />
            </article>
          ))}
        </div>

        <div className="wc-strip rv">
          <div><b>ISO 9001:2015</b><span>Certified quality management</span></div>
          <div><span className="tri" /><b>Make in India</b><span>Designed &amp; built in Sirsa, Haryana</span></div>
          <div><b>Smart BMS</b><span>In every pack we ship</span></div>
        </div>
      </div>
    </section>
  );
}
