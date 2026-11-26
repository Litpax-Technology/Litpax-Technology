import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS, waLink } from '../data.js';
import { cutoutCropped } from '../lib/cutout.js';
import { quote } from '../lib/quote.js';

// Hero that is also a tool: pick vehicle → voltage → capacity. The real pack
// swaps in on a lit glass plinth (with a charge sweep), tilts with the mouse,
// and an energy gauge (volts × amp-hours) counts up. Circuit traces with
// travelling sparks run behind everything.
const VEHICLES = [
  { c: 'ebike', label: 'E-bike / Scooter' },
  { c: 'erick', label: 'E-rickshaw' },
  { c: 'solar', label: 'Solar / Inverter' },
];
const USE = { ebike: 'E-bikes and scooters', erick: 'E-rickshaws', solar: 'Homes, shops and solar' };
const FALLBACK = `${import.meta.env.BASE_URL}products/60v32ah-3-lg.webp`;
const sortV = (a, b) => parseFloat(a) - parseFloat(b);
const ah = (p) => parseFloat(p.cap) || 0;
const kwh = (p) => (parseFloat(p.v) * ah(p)) / 1000;
const MAX_KWH = Math.max(...PRODUCTS.map(kwh));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// circuit traces (viewBox 1440 × 900)
const TRACES = [
  'M0 180 H260 L300 220 H520', 'M0 640 H180 L230 590 H420 L460 630 H600', 'M1440 120 H1180 L1140 160 H980',
  'M1440 760 H1260 L1210 710 H1000 L960 750 H820', 'M760 0 V90 L800 130 V210', 'M1100 900 V820 L1060 780 V700',
  'M0 420 H120 L160 460 H330', 'M1440 450 H1320 L1280 410 H1150',
];

// number that eases to its target
function useCount(target, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced()) { setV(target); from.current = target; return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 4);
      const x = a + (target - a) * e;
      setV(x); from.current = x;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// pill group with a yellow highlight that slides to the chosen option
function Pills({ label, options, value, onPick }) {
  const box = useRef(null);
  const [ind, setInd] = useState(null);
  useLayoutEffect(() => {
    const el = box.current?.querySelector('[aria-checked="true"]');
    if (el) setInd({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, [value, options]);
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const el = box.current?.querySelector('[aria-checked="true"]');
      if (el) setInd({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="hc-pills" role="radiogroup" aria-label={label} ref={box}>
      {ind && <span className="hc-ind" style={{ transform: `translate(${ind.x}px, ${ind.y}px)`, width: ind.w, height: ind.h }} aria-hidden="true" />}
      {options.map((o) => (
        <button type="button" key={o.key} role="radio" aria-checked={value === o.key} className={value === o.key ? 'on' : ''} onClick={() => onPick(o.key)}>{o.label}</button>
      ))}
    </div>
  );
}

export default function HeroChooser() {
  const [c, setC] = useState('ebike');
  const list = useMemo(() => PRODUCTS.filter((p) => p.c === c), [c]);
  const volts = useMemo(() => [...new Set(list.map((p) => p.v))].sort(sortV), [list]);
  const [v, setV] = useState('60');
  const caps = useMemo(() => list.filter((p) => p.v === v), [list, v]);
  const [n, setN] = useState('60V 32Ah Lithium Battery');
  const p = caps.find((x) => x.n === n) || caps[0] || list[0];
  const [imgs, setImgs] = useState({});
  const [thumbs, setThumbs] = useState({});
  const [added, setAdded] = useState(false);
  const stageRef = useRef(null);
  const tilt = useRef(null);

  useEffect(() => { if (!volts.includes(v)) setV(volts.includes('60') ? '60' : volts[0]); }, [volts]); // eslint-disable-line
  useEffect(() => { if (!caps.some((x) => x.n === n) && caps[0]) setN(caps[0].n); }, [caps]); // eslint-disable-line
  useEffect(() => { setAdded(quote.has(p.n)); }, [p.n]);

  // real photos, cut out of their white background (this vehicle's packs, ahead of time)
  useEffect(() => {
    let live = true;
    list.filter((x) => x.img).forEach((x) => {
      if (!imgs[x.n]) cutoutCropped(`${x.img[0]}-lg.webp`).then((r) => live && setImgs((m) => ({ ...m, [x.n]: r.url }))).catch(() => {});
      if (!thumbs[x.n]) cutoutCropped(`${x.img[0]}-sm.webp`).then((r) => live && setThumbs((m) => ({ ...m, [x.n]: r.url }))).catch(() => {});
    });
    return () => { live = false; };
  }, [list]); // eslint-disable-line

  // the pack leans towards the mouse
  useEffect(() => {
    const st = stageRef.current, el = tilt.current;
    if (!st || !el || reduced() || !matchMedia('(hover: hover)').matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 8}deg) translateZ(0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const move = (e) => {
      const r = st.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); };
    const sec = st.closest('.hc');
    sec.addEventListener('pointermove', move);
    sec.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); sec.removeEventListener('pointermove', move); sec.removeEventListener('pointerleave', leave); };
  }, []);

  const energy = kwh(p);
  const shown = useCount(energy);
  const voltShown = useCount(parseFloat(p.v), 700);
  const capShown = useCount(ah(p), 700);
  const R = 46, L = 2 * Math.PI * R;
  const frac = energy ? Math.min(1, energy / MAX_KWH) : 0;
  const src = p.img ? imgs[p.n] : null;
  const capLabel = (x) => (x.cap === 'On request' ? 'Custom' : x.cap);
  const title = 'Which battery do you need?';

  return (
    <section className="hc" id="top" data-theme="dark">
      {/* living background: circuit traces with sparks, a warm orb, film grain */}
      <svg className="hc-circuit" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {TRACES.map((d, i) => (
          <g key={d}>
            <path d={d} className="hc-trace" />
            <path d={d} className="hc-spark" style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${5 + (i % 3)}s` }} />
          </g>
        ))}
      </svg>
      <div className="hc-glow" aria-hidden="true" />
      <div className="hc-grain" aria-hidden="true" />

      <div className="hc-in">
        <div className="hc-left">
          <p className="hc-kick"><i />ISO 9001:2015 · Made in Sirsa, India</p>
          <h1 className="hc-title" aria-label={title}>
            {['Which battery', 'do you '].map((line, li) => (
              <span className="hc-line" key={line} aria-hidden="true">
                {[...line].map((ch, i) => <span className="hc-ch" key={i} style={{ '--d': `${(li * 13 + i) * 28}ms` }}>{ch}</span>)}
                {li === 1 && <em className="hc-ch" style={{ '--d': '640ms' }}>need?</em>}
              </span>
            ))}
          </h1>
          <p className="hc-lead">Pick your vehicle, voltage and capacity. See the exact pack, its stored energy, and get a price on WhatsApp.</p>

          <ol className="hc-steps">
            <li className="hc-step"><span className="hc-n">1</span><div><p className="hc-q">Your vehicle</p>
              <Pills label="Vehicle" value={c} onPick={setC} options={VEHICLES.map((o) => ({ key: o.c, label: o.label }))} /></div></li>
            <li className="hc-step"><span className="hc-n">2</span><div><p className="hc-q">Voltage</p>
              <Pills label="Voltage" value={v} onPick={setV} options={volts.map((o) => ({ key: o, label: `${o}V` }))} /></div></li>
            <li className="hc-step"><span className="hc-n">3</span><div><p className="hc-q">Capacity</p>
              <Pills label="Capacity" value={p.n} onPick={setN} options={caps.map((o) => ({ key: o.n, label: capLabel(o) }))} /></div></li>
          </ol>
        </div>

        <div className="hc-right">
          <div className="hc-stage" ref={stageRef}>
            <span className="hc-volt" key={`v${p.v}`} aria-hidden="true">{p.v}V</span>
            <span className="hc-beam" aria-hidden="true" />
            <span className="hc-dust" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--x': `${30 + ((i * 37) % 40)}%`, '--y': `${10 + ((i * 53) % 55)}%`, '--t': `${6 + (i % 5)}s`, '--o': `${-i * 0.7}s` }} />)}</span>

            {/* energy gauge */}
            <div className="hc-gauge" aria-label={energy ? `Stored energy ${energy.toFixed(2)} kilowatt-hours` : 'Capacity on request'}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r={R} className="hc-g-track" />
                <circle cx="50" cy="50" r={R} className="hc-g-fill" style={{ strokeDasharray: `${L * frac} ${L}` }} />
              </svg>
              <b>{energy ? shown.toFixed(2) : '—'}</b><span>kWh stored</span>
            </div>

            <div className="hc-plinth" aria-hidden="true"><i className="hc-p-side" /><i className="hc-p-top" /><i className="hc-p-rim" /></div>
            <div className="hc-pack" key={p.n}>
              <div className="hc-tilt" ref={tilt}>
                {src || !p.img ? <img src={src || FALLBACK} alt={p.n} /> : <img src={`${p.img[0]}-lg.webp`} alt={p.n} className="raw" />}
                <span className="hc-sweep" aria-hidden="true" />
              </div>
              {src && <img className="hc-refl" src={src} alt="" aria-hidden="true" />}
            </div>
            {!p.img && <span className="hc-rep">Representative image</span>}
          </div>

          <div className="hc-card" key={`c${p.n}`}>
            <div className="hc-card-top">
              <div>
                <p className="hc-cat">{p.t}</p>
                <h2 className="hc-name">{p.n}</h2>
              </div>
              <span className="hc-badge">{p.ch}</span>
            </div>
            <dl className="hc-specs">
              <div><dt>Voltage</dt><dd>{Number.isInteger(parseFloat(p.v)) ? Math.round(voltShown) : voltShown.toFixed(1)}<small>V</small></dd></div>
              <div><dt>Capacity</dt><dd>{ah(p) ? <>{Math.round(capShown)}<small>Ah</small></> : 'Custom'}</dd></div>
              <div><dt>Energy</dt><dd>{energy ? <>{(shown * 1000).toFixed(0)}<small>Wh</small></> : '—'}</dd></div>
              <div><dt>Best for</dt><dd className="hc-use">{USE[p.c]}</dd></div>
            </dl>
            <div className="hc-btns">
              <a className="hc-price" href={waLink(`Hi Litpax, please share the price of the ${p.n}.`)} target="_blank" rel="noopener">Get price on WhatsApp <span aria-hidden="true">→</span></a>
              <button type="button" className={`hc-add${added ? ' done' : ''}`} onClick={() => { quote.add({ name: p.n, qty: '1', img: p.img ? `${p.img[0]}-sm.webp` : '', type: p.t }); setAdded(true); }}>
                {added ? '✓ In quote list' : '+ Quote list'}
              </button>
            </div>
          </div>

          {/* the rest of this range */}
          <div className="hc-strip" role="list" aria-label="Also in this range">
            {list.map((x) => (
              <button type="button" role="listitem" key={x.n} className={x.n === p.n ? 'on' : ''} onClick={() => { setV(x.v); setN(x.n); }} aria-label={x.n}>
                {x.img ? <img src={thumbs[x.n] || `${x.img[0]}-sm.webp`} alt="" /> : <span className="hc-strip-ph">{x.v}V</span>}
                <small>{x.v}V · {capLabel(x)}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
      <a className="hc-down" href="#about" aria-label="Scroll down"><span /></a>
    </section>
  );
}
