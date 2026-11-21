import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { XMark } from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

// Animated "Quick view" window for a product — real photo gallery when available.
export default function ProductModal({ product: p, onClose }) {
  const wrap = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => { setActive(0); }, [p]);

  useEffect(() => {
    if (!p) return;
    window.__lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const tl = gsap.timeline();
      tl.from('.pm-overlay', { opacity: 0, duration: 0.4 })
        .from('.pm-panel', { y: 80, scale: 0.94, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0)
        .from('.pm-visual .pm-hero, .pm-visual .pack', { y: 40, scale: 0.92, opacity: 0, duration: 1, ease: 'expo.out' }, 0.15)
        .from('.pm-info > *', { y: 24, opacity: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out' }, 0.2);
    }
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (p.img && e.key === 'ArrowRight') setActive((a) => (a + 1) % p.img.length);
      if (p.img && e.key === 'ArrowLeft') setActive((a) => (a - 1 + p.img.length) % p.img.length);
    };
    addEventListener('keydown', key);
    return () => {
      removeEventListener('keydown', key);
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
    };
  }, [p, onClose]);

  // Smooth swap when a thumbnail is chosen
  useEffect(() => {
    if (!p?.img || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.pm-hero', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
  }, [active, p]);

  if (!p) return null;

  const rows = [
    ['Voltage', `${p.v} V`],
    ['Capacity', p.cap],
    ['Chemistry', p.ch === 'LFP' ? 'LFP (LiFePO₄)' : p.ch === 'Li-ion' ? 'Lithium-ion' : 'Lithium'],
    [p.c === 'solar' ? 'Best for' : 'Range', p.r],
    ['Warranty', p.w],
    ['Protection', 'Smart BMS'],
    ['Made in', 'Sirsa, India'],
  ];

  return (
    <div className="pm" ref={wrap} role="dialog" aria-modal="true" aria-label={p.n}>
      <div className="pm-overlay" onClick={onClose} />
      <div className="pm-panel" data-lenis-prevent>
        <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>
        <div className={`pm-visual${p.img ? ' has-img' : ''}`}>
          <div className="pm-glow" />
          {p.img ? (
            <>
              <img className="pm-hero" key={active} src={`${p.img[active]}-lg.webp`} alt={`${p.n} — photo ${active + 1}`} width="1200" height="900" />
              {p.img.length > 1 && (
                <div className="pm-thumbs" role="tablist" aria-label="Product photos">
                  {p.img.map((src, i) => (
                    <button key={src} className={`pm-thumb${i === active ? ' on' : ''}`} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} aria-selected={i === active} role="tab">
                      <img src={`${src}-sm.webp`} alt="" loading="lazy" width="640" height="480" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="pack">
              <div className="cap" />
              <div className="strip" />
              <div className="p-logo logo">Litpa<XMark size={24} /></div>
              <div className="p-spec">{p.ch === 'LFP' ? 'LiFePO₄' : 'LI-ION'} · SMART BMS</div>
              <div className="p-volt">{p.v}<small>V</small></div>
              <div className="p-lvl"><i /><i /><i /><i /><i /></div>
            </div>
          )}
          <span className="pm-tag">{p.t}</span>
        </div>
        <div className="pm-info">
          <div className="label"><i />Quick view</div>
          <h3>{p.n}</h3>
          <p className="pm-desc">Engineered and tested in-house with matched cells and a Smart BMS for safe, long-lasting performance.</p>
          <dl className="pm-specs">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <ul className="pm-feats">
            <li>Zero maintenance</li><li>Fast charging</li><li>Lightweight</li><li>Pan-India service</li>
          </ul>
          <div className="pm-cta">
            <a className="btn btn-y" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price <span className="ar">→</span></a>
            <a className="btn btn-line-k" href={CONTACT.shop} target="_blank" rel="noopener">Buy online <span className="ar">↗</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}
