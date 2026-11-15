import { useEffect, useRef, useState } from 'react';
import { HERO_LINEUP, waLink } from '../data.js';
import Battery3D from './Battery3D.jsx';

const MODELS = [
  { tab: 'E-Bike Battery', name: '60V 32Ah Li-ion Pack' },
  { tab: 'Solar Inverter', name: '1500W · 12V 120Ah' },
];
const EVERY = 7000;   // auto-switch interval (ms)

export default function Hero() {
  const pack = useRef(null);
  const [model, setModel] = useState(0);
  const [round, setRound] = useState(0);   // restarts the timer (and its progress bar) after a click

  // models take turns; each change (auto or click) starts a fresh 7 s timer
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setModel((m) => (m + 1) % MODELS.length), EVERY);
    return () => clearTimeout(id);
  }, [model, round]);
  const pick = (i) => { setModel(i); setRound((r) => r + 1); };

  return (
    <section className="hero" id="top">
      <div className="hero-glow" id="heroGlow" />
      <div className="wrap">
        <div>
          <div className="label h-in"><i />ISO 9001:2015 · Made in India</div>
          <h1>
            <span className="ln"><span>Energy,</span></span>
            <span className="ln"><span><span className="serif red">engineered</span></span></span>
            <span className="ln"><span>to last.</span></span>
          </h1>
          <div className="hero-sub h-in">
            <p className="lead">Premium Lithium-ion &amp; LFP battery packs for electric mobility, solar storage and critical power — designed, built and tested in-house in Sirsa, Haryana.</p>
          </div>
          <div className="hero-ctas h-in">
            <a className="btn btn-red magnetic" href="#products" data-cursor="View">Explore batteries <span className="ar">→</span></a>
            <a className="btn btn-out magnetic" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener">Talk on WhatsApp <span className="ar">↗</span></a>
          </div>
          <div className="hero-meta h-in">
            <div><b>200<em>+</em></b>Happy clients</div>
            <div><b>20<em>+</em></b>Service centers</div>
            <div><b>125<em> km+</em></b>Range per charge*</div>
          </div>
        </div>

        <div className="stage open" id="stage">
          {/* No box: a warm glow, slow rings and a giant outlined "60V" behind the battery */}
          <div className="hero-photo hero-halo" id="heroPhoto" aria-hidden="true" />
          <span className="halo-ring r1" aria-hidden="true" />
          <span className="halo-ring r2" aria-hidden="true" />
          <span className="halo-ring r3" aria-hidden="true" />
          {/* Real-time 3D: EV battery and solar inverter take turns, full 360° (drag / flick to spin) */}
          <div className="pack-wrap model3d" ref={pack}>
            <Battery3D active={model} fallback={HERO_LINEUP.front} alt={`Litpax ${MODELS[model].tab}, ${MODELS[model].name}, 3D model`} />
          </div>
          <div className="model-switch" role="tablist" aria-label="Choose product">
            <span className="ms-pill" style={{ transform: `translateX(${model * 100}%)` }} aria-hidden="true" />
            {MODELS.map((m, i) => (
              <button key={m.tab} role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => pick(i)}>
                {m.tab}
                {model === i && <span key={`${model}-${round}`} className="ms-bar" style={{ animationDuration: `${EVERY}ms` }} />}
              </button>
            ))}
          </div>
          <div className="model-name" key={model} aria-live="polite">{MODELS[model].name}</div>
        </div>
      </div>
      <div className="scroll-cue"><span />Scroll</div>
    </section>
  );
}
