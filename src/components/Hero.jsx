import { useRef } from 'react';
import { HERO_LINEUP, waLink } from '../data.js';
import Battery3D from './Battery3D.jsx';

export default function Hero() {
  const pack = useRef(null);

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
          <span className="hero-bigtext" aria-hidden="true">60V</span>
          {/* Real-time 3D model of the Litpax 60V 32Ah pack (drag to turn it) */}
          <div className="pack-wrap model3d" ref={pack}>
            <Battery3D fallback={HERO_LINEUP.front} alt="Litpax 60V 32Ah lithium-ion battery pack, 3D model" />
            <span className="drag-hint">Drag to rotate</span>
          </div>
          <div className="tagc t1" aria-hidden="true"><div className="ti">⚡</div><div>Charging<b>Fast charge</b></div></div>
          <div className="tagc t2" aria-hidden="true"><div className="ti">◎</div><div>Protection<b>Smart BMS</b></div></div>
          <div className="tagc t3" aria-hidden="true"><div className="ti">✦</div><div>Maintenance<b>Zero</b></div></div>
          <div className="hero-model-tag" aria-hidden="true"><b>60V · 32Ah</b><span>Lithium-ion EV pack</span></div>
        </div>
      </div>
      <div className="scroll-cue"><span />Scroll</div>
    </section>
  );
}
