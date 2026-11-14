import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { XMark } from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

// Animated "Quick view" window for a product.
export default function ProductModal({ product: p, onClose }) {
  const wrap = useRef(null);

  useEffect(() => {
    if (!p) return;
    window.__lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const tl = gsap.timeline();
      tl.from('.pm-overlay', { opacity: 0, duration: 0.4 })
        .from('.pm-panel', { y: 80, scale: 0.94, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0)
        .from('.pm-visual .pack', { y: 40, rotate: -8, opacity: 0, duration: 1, ease: 'expo.out' }, 0.15)
        .from('.pm-info > *', { y: 24, opacity: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out' }, 0.2);
    }
    const esc = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', esc);
    return () => {
      removeEventListener('keydown', esc);
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
    };
  }, [p, onClose]);

  if (!p) return null;

  const rows = [
    ['Voltage', `${p.v} V`],
    ['Capacity', p.cap],
    ['Chemistry', p.ch === 'LFP' ? 'LFP (LiFePO₄)' : 'Lithium-ion'],
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
        <div className="pm-visual">
          <div className="pm-glow" />
          <div className="pack">
            <div className="cap" />
            <div className="strip" />
            <div className="p-logo logo">Litpa<XMark size={24} /></div>
            <div className="p-spec">{p.ch === 'LFP' ? 'LiFePO₄' : 'LI-ION'} · SMART BMS</div>
            <div className="p-volt">{p.v}<small>V</small></div>
            <div className="p-lvl"><i /><i /><i /><i /><i /></div>
          </div>
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
            <a className="btn btn-red" href={waLink(`Hi Litpax, I want details & price of ${p.n}.`)} target="_blank" rel="noopener">Get price <span className="ar">→</span></a>
            <a className="btn btn-out" href={CONTACT.shop} target="_blank" rel="noopener">Buy online <span className="ar">↗</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}
