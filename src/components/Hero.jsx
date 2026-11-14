import { useEffect, useRef } from 'react';
import { HERO_LINEUP, waLink } from '../data.js';

export default function Hero() {
  const pack = useRef(null);

  // Depth parallax: the three batteries shift by different amounts with the mouse.
  // (No 3D rotation — a flat photo turning in 3D looks like a sheet of paper.)
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const onMove = (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      if (pack.current) { pack.current.style.setProperty('--mx', x.toFixed(3)); pack.current.style.setProperty('--my', y.toFixed(3)); }
    };
    addEventListener('mousemove', onMove);
    return () => removeEventListener('mousemove', onMove);
  }, []);

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

        <div className="stage" id="stage" aria-hidden="true">
          {/* Dark stage: red spotlight, perspective floor grid */}
          <div className="hero-photo stage-dark" id="heroPhoto"><div className="stage-floor" /><div className="stage-spot" /></div>
          <div className="orbit o1" />
          <div className="orbit o2" />
          {/* Line-up of real Litpax packs (AI cut-outs): two inverter packs behind, EV pack in front */}
          <div className="pack-wrap lineup" ref={pack}>
            <span className="hl-layer back l"><img src={HERO_LINEUP.left} alt="Litpax 12.8V 200Ah power pack" width="1200" height="900" /></span>
            <span className="hl-layer back r"><img src={HERO_LINEUP.right} alt="Litpax 25.6V 100Ah power pack" width="1200" height="900" /></span>
            <span className="hl-layer front"><img src={HERO_LINEUP.front} alt="Litpax 60V 32Ah lithium-ion battery pack" width="1200" height="900" fetchpriority="high" /></span>
            <img className="hero-reflect" src={HERO_LINEUP.front} alt="" aria-hidden="true" width="1200" height="900" />
          </div>
          <div className="tagc t1"><div className="ti">⚡</div><div>Charging<b>Fast charge</b></div></div>
          <div className="tagc t2"><div className="ti">◎</div><div>Protection<b>Smart BMS</b></div></div>
          <div className="tagc t3"><div className="ti">✦</div><div>Maintenance<b>Zero</b></div></div>
        </div>
      </div>
      <div className="scroll-cue"><span />Scroll</div>
    </section>
  );
}
