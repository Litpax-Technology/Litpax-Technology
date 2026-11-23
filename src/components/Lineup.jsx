import { useEffect, useState } from 'react';
import { PRODUCTS, waLink } from '../data.js';
import { SectionHead } from './Sections.jsx';
import { cutout } from '../lib/cutout.js';

// "The Litpax lineup": the real product photos, cut out of their white studio
// background and shown large on a dark stage with a red rim light.
const PICK = ['60V 32Ah Lithium Battery', '48V 27Ah Lithium Battery', '12.8V 200Ah Power Pack', '25.6V 100Ah Power Pack'];
const USE = { ebike: 'E-bikes and scooters', erick: 'E-rickshaws', solar: 'Homes, shops and solar' };
const EVERY = 5000;

function Cut({ src, alt, className }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let live = true;
    cutout(src).then((u) => live && setUrl(u)).catch(() => live && setUrl(src));
    return () => { live = false; };
  }, [src]);
  return url
    ? <img src={url} alt={alt} className={className} decoding="async" />
    : <span className={`${className} lu-wait`} aria-hidden="true" />;
}

export default function Lineup({ onOpen }) {
  const items = PICK.map((n) => PRODUCTS.find((p) => p.n === n)).filter(Boolean);
  const [on, setOn] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setOn((i) => (i + 1) % items.length), EVERY);
    return () => clearTimeout(t);
  }, [on, auto, items.length]);

  const p = items[on];
  const pick = (i) => { setOn(i); setAuto(false); };

  return (
    <section className="lu" id="lineup" data-theme="dark">
      <div className="lu-glow" aria-hidden="true" />
      <div className="wrap">
        <SectionHead label="The Litpax lineup" title={<>Real packs. <mark>Real power.</mark></>}
          lead="Every battery here is ours: designed, assembled and tested at our plant in Sirsa, Haryana." />

        <div className="lu-grid">
          <div className="lu-stage">
            <span className="lu-volt" aria-hidden="true" key={`v${on}`}>{p.v}V</span>
            <span className="lu-floor" aria-hidden="true" />
            {items.map((x, i) => (
              <Cut key={x.n} src={`${x.img[0]}-lg.webp`} alt={i === on ? x.n : ''} className={`lu-img${i === on ? ' on' : ''}`} />
            ))}
          </div>

          <div className="lu-info" key={on} aria-live="polite">
            <p className="lu-cat">{p.t}</p>
            <h3 className="lu-name">{p.n}</h3>
            <dl className="lu-specs">
              <div><dt>Voltage</dt><dd>{p.v}V</dd></div>
              <div><dt>Capacity</dt><dd>{p.cap}</dd></div>
              <div><dt>Chemistry</dt><dd>{p.ch}</dd></div>
              <div><dt>Best for</dt><dd>{USE[p.c]}</dd></div>
            </dl>
            <div className="lu-btns">
              <button type="button" className="lu-btn" onClick={() => onOpen?.(p)}>Quick view</button>
              <a className="lu-btn ghost" href={waLink(`Hi Litpax, please share the price of the ${p.n}.`)} target="_blank" rel="noopener">Get price</a>
            </div>
          </div>
        </div>

        <div className="lu-thumbs" role="tablist" aria-label="Choose a battery">
          {items.map((x, i) => (
            <button key={x.n} type="button" role="tab" aria-selected={i === on} className={i === on ? 'on' : ''} onClick={() => pick(i)}>
              <Cut src={`${x.img[0]}-sm.webp`} alt="" className="lu-th" />
              <span><b>{x.v}V · {x.cap}</b><small>{x.t}</small></span>
              {i === on && auto && <i key={on} style={{ animationDuration: `${EVERY}ms` }} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
