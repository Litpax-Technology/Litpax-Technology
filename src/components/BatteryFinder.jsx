import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { PRODUCTS, waLink } from '../data.js';
import { SectionHead } from './Sections.jsx';

// Closest real Litpax model (same application + voltage, nearest capacity) that has a photo
function closestModel(type, v, ah) {
  const list = PRODUCTS.filter((p) => p.img && p.c === type && Number(p.v) === Number(v) && parseFloat(p.cap));
  if (!list.length) return null;
  return list.reduce((best, p) => (Math.abs(parseFloat(p.cap) - ah) < Math.abs(parseFloat(best.cap) - ah) ? p : best));
}

// Rough sizing rules — an estimate only; the sales team confirms the final pack.
const TYPES = {
  ebike: { label: 'E-Bike / Scooter', volts: [40, 48, 60, 74], km: [20, 150, 5, 60], whPerKm: 30 },
  erick: { label: 'E-Rickshaw', volts: [51.2, 60], km: [40, 160, 5, 90], whPerKm: 70 },
  solar: { label: 'Solar / Inverter' },
};

function Slider({ label, value, min, max, step, unit, onChange }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="bf-slider">
      <div className="bf-sl-top"><span>{label}</span><b>{value}<small> {unit}</small></b></div>
      <input type="range" min={min} max={max} step={step} value={value} style={{ '--p': `${p}%` }}
        onChange={(e) => onChange(+e.target.value)} aria-label={label} />
      <div className="bf-sl-scale"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

export default function BatteryFinder() {
  const [type, setType] = useState('ebike');
  const [volt, setVolt] = useState(60);
  const [km, setKm] = useState(60);
  const [load, setLoad] = useState(600);
  const [hours, setHours] = useState(4);
  const ahRef = useRef(null);
  const kwhRef = useRef(null);
  const shown = useRef({ ah: 0, kwh: 0 });

  const pickType = (t) => {
    setType(t);
    if (t !== 'solar') { setVolt(TYPES[t].volts[TYPES[t].volts.length > 2 ? 1 : 0]); setKm(TYPES[t].km[3]); }
  };

  const res = useMemo(() => {
    if (type === 'solar') {
      const v = load <= 800 ? 12.8 : load <= 1600 ? 25.6 : 51.2;
      const wh = (load * hours) / 0.9;
      const ah = Math.max(50, Math.ceil(wh / v / 10) * 10);
      return { v, ah, detail: `${load} W load, ${hours} h backup` };
    }
    const wh = km * TYPES[type].whPerKm * 1.1;
    const ah = Math.max(20, Math.ceil(wh / volt / 5) * 5);
    return { v: volt, ah, detail: `${km} km per ${type === 'erick' ? 'day' : 'charge'}` };
  }, [type, volt, km, load, hours]);

  const kwh = (res.v * res.ah) / 1000;
  const match = closestModel(type, res.v, res.ah);
  const level = Math.min(1, res.ah / (type === 'solar' ? 400 : 120));

  // Animate the numbers whenever the result changes
  useEffect(() => {
    const o = shown.current;
    gsap.to(o, {
      ah: res.ah, kwh, duration: 0.8, ease: 'expo.out', overwrite: true,
      onUpdate: () => {
        if (ahRef.current) ahRef.current.textContent = Math.round(o.ah);
        if (kwhRef.current) kwhRef.current.textContent = o.kwh.toFixed(2);
      },
    });
  }, [res.ah, kwh]);

  const msg = `Hi Litpax, the Battery Finder suggests a ${res.v}V ${res.ah}Ah pack for ${TYPES[type].label} (${res.detail}). Please share price and details.`;

  return (
    <section className="finder" id="finder" data-theme="dark">
      <div className="wrap">
        <SectionHead n="05" label="Battery Finder" title={<>Which battery do <span className="grad">you need?</span></>}
          lead="Tell us how you use it — we'll estimate the right voltage and capacity in seconds." />

        <div className="bf-grid">
          <div className="bf-panel rv">
            <div className="bf-step">01 · Application</div>
            <div className="bf-types">
              {Object.entries(TYPES).map(([k, t]) => (
                <button key={k} className={`bf-type${type === k ? ' on' : ''}`} onClick={() => pickType(k)}>{t.label}</button>
              ))}
            </div>

            {type !== 'solar' ? (
              <>
                <div className="bf-step">02 · System voltage</div>
                <div className="bf-volts">
                  {TYPES[type].volts.map((v) => (
                    <button key={v} className={`bf-volt${volt === v ? ' on' : ''}`} onClick={() => setVolt(v)}>{v}V</button>
                  ))}
                </div>
                <div className="bf-step">03 · Your usage</div>
                <Slider label={type === 'erick' ? 'Distance per day' : 'Range you need per charge'} unit="km"
                  value={km} min={TYPES[type].km[0]} max={TYPES[type].km[1]} step={TYPES[type].km[2]} onChange={setKm} />
              </>
            ) : (
              <>
                <div className="bf-step">02 · Your usage</div>
                <Slider label="Load to run (fans, lights, TV…)" unit="W" value={load} min={100} max={3000} step={50} onChange={setLoad} />
                <Slider label="Backup time needed" unit="hours" value={hours} min={1} max={12} step={1} onChange={setHours} />
              </>
            )}
          </div>

          <div className="bf-result rv">
            <div className="bf-r-top">
              <span>Recommended pack</span>
              <em>{type === 'solar' ? 'LFP' : type === 'erick' ? 'LFP' : 'Li-ion'}</em>
            </div>
            <div className="bf-r-main">
              <div className="bf-bat" aria-hidden="true">
                <div className="bf-bat-fill" style={{ height: `${18 + level * 82}%` }} />
              </div>
              <div>
                <div className="bf-big">{res.v}<small>V</small></div>
                <div className="bf-big ah"><span ref={ahRef}>{res.ah}</span><small>Ah</small></div>
              </div>
            </div>
            <div className="bf-stats">
              <div><small>Energy</small><b><span ref={kwhRef}>{kwh.toFixed(2)}</span> kWh</b></div>
              <div><small>Based on</small><b>{res.detail}</b></div>
            </div>
            {match && (
              <div className="bf-match" key={match.n}>
                <img src={`${match.img[0]}-sm.webp`} alt={match.n} loading="lazy" width="640" height="480" />
                <div><small>Closest Litpax model</small><b>{match.n}</b></div>
              </div>
            )}
            <a className="btn btn-primary" href={waLink(msg)} target="_blank" rel="noopener">
              Get price for this pack <span className="ar">→</span>
            </a>
            <p className="bf-note">Estimate only. Our team will confirm the exact pack for your vehicle or home.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
