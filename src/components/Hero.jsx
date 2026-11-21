import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HERO_LINEUP, waLink } from '../data.js';
import Battery3D from './Battery3D.jsx';

const MODELS = [
  { tab: 'E-Bike battery', name: '60V 32Ah Li-ion pack' },
  { tab: 'Solar inverter', name: '1500W · 12V 120Ah' },
];
const EVERY = 7000;

export default function Hero() {
  const [model, setModel] = useState(0);
  const [round, setRound] = useState(0);
  const seg = useRef(null);
  const [pill, setPill] = useState({ x: 4, w: 0 });

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setModel((m) => (m + 1) % MODELS.length), EVERY);
    return () => clearTimeout(id);
  }, [model, round]);
  const pick = (i) => { setModel(i); setRound((r) => r + 1); };

  useLayoutEffect(() => {
    const place = () => {
      const b = seg.current?.querySelectorAll('button')[model];
      if (b) setPill({ x: b.offsetLeft, w: b.offsetWidth });
    };
    place();
    document.fonts?.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [model]);

  return (
    <section className="hero" id="top" data-theme="dark">
      <div className="ambient" aria-hidden="true"><i /><i /><i /></div>
      <div className="grid-bg" aria-hidden="true" />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <div className="eyebrow h-in"><span className="dot" />ISO 9001:2015 certified · Made in India</div>
          <h1>
            <span className="ln"><span>Energy,</span></span>
            <span className="ln"><span className="grad">engineered</span></span>
            <span className="ln"><span>to last.</span></span>
          </h1>
          <p className="hero-lead h-in">Premium Lithium-ion &amp; LFP battery packs for electric mobility, solar storage and critical power — designed, built and tested in-house in Sirsa, Haryana.</p>
          <div className="hero-cta h-in">
            <a className="btn btn-primary" href="#products">Explore batteries <span className="ar">→</span></a>
            <a className="btn btn-ghost" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener">Talk on WhatsApp</a>
          </div>
          <div className="hero-stats h-in">
            <div><b>200<em>+</em></b><span>Happy clients</span></div>
            <div><b>20<em>+</em></b><span>Service centers</span></div>
            <div><b>125<em>km+</em></b><span>Range / charge*</span></div>
          </div>
        </div>

        <div className="stage h-stage">
          <span className="stage-ring r3" aria-hidden="true" />
          <span className="stage-ring" aria-hidden="true" />
          <span className="stage-ring r2" aria-hidden="true" />
          <span className="stage-floor" aria-hidden="true" />
          <div className="stage-3d">
            <Battery3D active={model} fallback={HERO_LINEUP.front} alt={`Litpax ${MODELS[model].tab}, ${MODELS[model].name}, 3D model`} />
          </div>
          <div className="fcard c1" aria-hidden="true">
            <span className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg></span>
            <div><b>Smart BMS</b><span>Protected every ride</span></div>
          </div>
          <div className="fcard c2" aria-hidden="true">
            <span className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></svg></span>
            <div><b>ISO 9001:2015</b><span>Certified quality</span></div>
          </div>
          <div className="fcard c3" aria-hidden="true">
            <span className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg></span>
            <div><b>Made in India</b><span>Sirsa, Haryana</span></div>
          </div>
          <div className="stage-ui">
            <div className="seg" role="tablist" aria-label="Choose product" ref={seg}>
              <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x - 4}px)` }} aria-hidden="true" />
              {MODELS.map((m, i) => (
                <button key={m.tab} role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => pick(i)}>
                  {m.tab}
                  {model === i && <span key={`${model}-${round}`} className="bar" style={{ animationDuration: `${EVERY}ms` }} />}
                </button>
              ))}
            </div>
            <div className="stage-name" aria-live="polite"><b>{MODELS[model].name}</b> · drag to rotate</div>
          </div>
        </div>
      </div>

      <div className="hero-specs h-in">
        <div className="wrap">
          <div><i />Li-ion &amp; LFP chemistry</div>
          <div><i />Smart BMS in every pack</div>
          <div><i />20 distributors in India</div>
          <div><i />*Range varies by vehicle</div>
        </div>
      </div>
    </section>
  );
}
