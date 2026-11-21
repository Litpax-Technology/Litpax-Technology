import { useEffect, useState } from 'react';
import { HERO_LINEUP, waLink } from '../data.js';
import Battery3D from './Battery3D.jsx';

const MODELS = [
  { tab: 'E-Bike battery', name: '60V 32Ah Li-ion pack' },
  { tab: 'Solar inverter', name: '1500W · 12V 120Ah' },
];
const WORDS = ['E-Bikes', 'E-Rickshaws', 'Solar homes', 'Hospitals', 'Telecom'];
const EVERY = 7000;

export default function Hero() {
  const [model, setModel] = useState(0);
  const [round, setRound] = useState(0);
  const [word, setWord] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setModel((m) => (m + 1) % MODELS.length), EVERY);
    return () => clearTimeout(id);
  }, [model, round]);
  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const pick = (i) => { setModel(i); setRound((r) => r + 1); };

  return (
    <section className="hero" id="top">
      {/* morphing gradient blobs + dotted grid */}
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>
      <div className="dots-bg" aria-hidden="true" />

      <div className="wrap hero-top">
        <p className="kicker h-in"><span className="live" />ISO 9001:2015 certified · Made in India</p>
      </div>

      <h1 className="hero-title wrap">
        <span className="ln l1"><span>Energy,</span></span>
        <span className="ln l2"><span>engineered</span></span>
        <span className="ln l3"><span><span className="shine">to last.</span></span></span>
      </h1>

      <div className="hero-stage h-stage">
        <span className="ring r1" aria-hidden="true" />
        <span className="ring r2" aria-hidden="true" />
        <span className="ring r3" aria-hidden="true" />
        <span className="orbit" aria-hidden="true"><i /><i /><i /></span>
        <div className="hero-3d">
          <Battery3D active={model} fallback={HERO_LINEUP.front} alt={`Litpax ${MODELS[model].tab}, ${MODELS[model].name}, 3D model`} />
        </div>
        <div className="badge b1" aria-hidden="true"><b>Smart BMS</b><span>Protected every ride</span></div>
        <div className="badge b2" aria-hidden="true"><b>125 km+</b><span>Range per charge*</span></div>
        <div className="badge b3" aria-hidden="true"><b>Made in India</b><span>Sirsa, Haryana</span></div>
        <div className="hero-switch" role="tablist" aria-label="Choose product">
          {MODELS.map((m, i) => (
            <button key={m.tab} role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => pick(i)}>
              {m.tab}
              {model === i && <i key={`${model}-${round}`} style={{ animationDuration: `${EVERY}ms` }} />}
            </button>
          ))}
          <span className="hs-name" aria-live="polite">{MODELS[model].name} · drag to rotate</span>
        </div>
      </div>

      <div className="wrap hero-bottom">
        <div className="hb-copy h-in">
          <p className="rotator">Lithium power for{' '}
            <span className="rot-box"><span key={word} className="rot-word">{WORDS[word]}</span></span>
          </p>
          <p>Premium Lithium-ion &amp; LFP battery packs — designed, built and tested in-house in Sirsa, Haryana.</p>
          <div className="hb-ctas">
            <a className="btn btn-y" href="#products">Explore batteries <span className="ar">→</span></a>
            <a className="btn btn-line" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </div>
        <dl className="hb-specs h-in">
          <div><dt>Happy clients</dt><dd>200<em>+</em></dd></div>
          <div><dt>Service centers</dt><dd>20<em>+</em></dd></div>
          <div><dt>Distributors</dt><dd>20<em>+</em></dd></div>
          <div><dt>Expert staff</dt><dd>50<em>+</em></dd></div>
        </dl>
      </div>
      <a className="scroll-cue" href="#about" aria-label="Scroll to next section"><span /></a>
    </section>
  );
}
