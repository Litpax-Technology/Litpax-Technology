import { useEffect, useState } from 'react';
import { SectionHead } from './Sections.jsx';

// "Inside every pack" — the real 60V 32Ah product photo with pulsing hotspots.
// Features cycle automatically; tapping a hotspot or a list item takes over.
const BASE = import.meta.env.BASE_URL;
const PHOTO = `${BASE}products/60v32ah-3-lg.webp`;   // 1200×900, so hotspot % map 1:1

const SPOTS = [
  { x: 70, y: 36, k: 'Smart BMS', h: 'A brain in every pack', p: 'Our Smart BMS guards against over-charge, deep discharge and short circuit — every second, every ride.' },
  { x: 80, y: 62, k: 'Grade-A cells', h: 'Matched, cell by cell', p: 'Grade-A Li-ion & LFP cells are tested, matched and sorted before they are assembled into a pack.' },
  { x: 40, y: 56, k: 'Rugged body', h: 'Built for Indian roads', p: 'A tough, sealed body made for daily riding, dust and summer heat — assembled in-house in Sirsa.' },
  { x: 55, y: 17, k: 'Plug-and-play', h: 'Ready to connect', p: 'Output connector and cable glands fitted at the factory, so the pack goes straight into your vehicle.' },
];
const EVERY = 4500;

export default function PackTour() {
  const [on, setOn] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setOn((i) => (i + 1) % SPOTS.length), EVERY);
    return () => clearTimeout(id);
  }, [on, auto]);
  const pick = (i) => { setOn(i); setAuto(false); };
  const s = SPOTS[on];

  return (
    <section className="tour" id="inside">
      <div className="wrap">
        <SectionHead n="02" label="Inside every pack" title={<>Engineered inside <mark>and out.</mark></>}
          lead="Tap a point on the battery to see what makes every Litpax pack safe, long-lasting and ready to ride." />

        <div className="tour-grid">
          <ol className="tour-list rv">
            {SPOTS.map((x, i) => (
              <li key={x.k}>
                <button className={i === on ? 'on' : ''} onClick={() => pick(i)} aria-pressed={i === on}>
                  <span className="tl-n">0{i + 1}</span>
                  <span className="tl-body">
                    <b>{x.k}</b>
                    <span className="tl-more"><span><strong>{x.h}.</strong> {x.p}</span></span>
                  </span>
                  {i === on && auto && <i className="tl-bar" key={`${on}`} style={{ animationDuration: `${EVERY}ms` }} />}
                </button>
              </li>
            ))}
          </ol>

          <div className="tour-stage rv">
            <span className="tour-glow" aria-hidden="true" />
            <div className="tour-pic">
              <img src={PHOTO} alt="Litpax 60V 32Ah lithium battery pack" width="1200" height="900" loading="lazy" decoding="async" />
              {SPOTS.map((x, i) => (
                <button key={x.k} className={`spot${i === on ? ' on' : ''}`} style={{ left: `${x.x}%`, top: `${x.y}%` }}
                  onClick={() => pick(i)} aria-label={x.k}>
                  <span className="spot-dot">{i + 1}</span>
                </button>
              ))}
              <div className="tour-card" key={on} style={{ left: `${Math.min(Math.max(s.x, 24), 76)}%`, top: `${s.y > 50 ? s.y - 6 : s.y + 8}%`, transform: `translate(-50%, ${s.y > 50 ? '-100%' : '0'})` }}>
                <span>{s.k}</span>
                <b>{s.h}</b>
              </div>
            </div>
            <ul className="tour-chips">
              <li>Load tested</li><li>Capacity tested</li><li>Safety tested</li><li>ISO 9001:2015</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
