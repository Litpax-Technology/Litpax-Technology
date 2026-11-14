import { useEffect, useRef } from 'react';
import { HERO_PRODUCT, waLink } from '../data.js';

export default function Hero() {
  const pack = useRef(null);

  // 3D battery pack follows the mouse
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const onMove = (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      if (pack.current) pack.current.style.transform = `rotateY(${x * 26}deg) rotateX(${-y * 18}deg)`;
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
          <div className="hero-photo studio" id="heroPhoto" />
          <div className="orbit o1" />
          <div className="orbit o2" />
          {/* Real Litpax 60V 32Ah pack (studio photo, white blends into the panel) */}
          <div className="pack-wrap real" ref={pack}>
            <img className="hero-product" src={HERO_PRODUCT} alt="Litpax 60V 32Ah lithium-ion battery pack" width="1200" height="900" fetchpriority="high" />
            <div className="hero-floor" />
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
