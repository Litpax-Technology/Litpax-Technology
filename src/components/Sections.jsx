// Page sections (Industrial Editorial design): shared section header,
// tape ticker, about, applications accordion, process, reviews slider, CTA.
import { useEffect, useState } from 'react';
import { APPLICATIONS, PHOTOS, REVIEWS, STATS, STEPS, waLink } from '../data.js';

export function SectionHead({ n, label, title, lead }) {
  return (
    <header className="sx-head">
      <div className="sx-meta rv">
        {n && <span className="sx-n">{n}</span>}
        <span className="sx-l">{label}</span>
        <span className="sx-rule" aria-hidden="true" />
      </div>
      <div className="sx-row">
        <h2 className="rv">{title}</h2>
        {lead && <p className="sx-lead rv">{lead}</p>}
      </div>
    </header>
  );
}

const WORDS = ['Lithium-ion', 'LFP power', 'Smart BMS', 'Made in India', 'E-Bike', 'E-Rickshaw', 'Solar & Inverter', 'Custom packs'];
export function Ticker() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="tape" aria-hidden="true">
      <div className="tape-track">
        {[0, 1].map((k) => row.map((w, i) => <span key={`${k}-${i}`}>{w}<i>✦</i></span>))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <SectionHead n="01" label="About Litpax" title={<>Power that moves <mark>India</mark> forward.</>} />
        <div className="about-body">
          <p className="about-big rv">
            Litpax Technology builds lithium battery packs for e-rickshaws on busy streets, solar homes and hospital
            equipment. Every pack is <u>engineered in-house</u>, tested to <u>ISO 9001:2015</u> standards and backed by
            service across the country.
          </p>
        </div>
        <div className="figures">
          {STATS.map(([n, label]) => (
            <div className="fig rv" key={label}>
              <b><span data-count={n}>{n}</span><em>+</em></b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Expanding panel accordion: hover (desktop) or tap (mobile) opens a panel.
export function Applications({ onPick }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="applications">
      <div className="wrap">
        <SectionHead n="03" label="Applications" title={<>One partner. <mark>Every</mark> application.</>}
          lead="From two-wheelers to hospitals — open a category to see what we build for it." />
        <div className="acc rv" role="list">
          {APPLICATIONS.map((a, i) => (
            <article key={a.title} role="listitem" className={`acc-p${open === i ? ' on' : ''}`}
              onMouseEnter={() => setOpen(i)} onFocus={() => setOpen(i)} onClick={() => setOpen(i)} tabIndex={0}>
              <div className="acc-img" style={{ backgroundImage: `url("${a.img}")` }} />
              <span className="acc-n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="acc-v">{a.title}</h3>
              <div className="acc-body">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <div className="acc-chips">{a.chips.map((c) => <span key={c}>{c}</span>)}</div>
                {a.go
                  ? <a className="btn btn-y sm" href="#products" onClick={() => onPick(a.go)}>View batteries <span className="ar">→</span></a>
                  : <a className="btn btn-y sm" href="#contact">Enquire <span className="ar">→</span></a>}
              </div>
            </article>
          ))}
        </div>
        <a href="#contact" className="custom-line rv">
          <span className="cl-k">Custom engineering</span>
          <span className="cl-t">Need a custom pack? Tell us your voltage, capacity and size — we'll engineer it.</span>
          <span className="cl-go" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section id="process" className="process">
      <div className="wrap">
        <SectionHead n="06" label="How we build" title={<>From cell to <mark>full power.</mark></>} />
        <div className="proc">
          <div className="proc-photo rv-img">
            <div id="procImg" style={{ backgroundImage: `url("${PHOTOS.process}")` }} />
            <span className="proc-tag">In-house line · Sirsa, Haryana</span>
          </div>
          <ol className="proc-steps" id="steps">
            {STEPS.map(([h, p], i) => (
              <li className="step rv" key={h}>
                <span className="step-n">0{i + 1}</span>
                <div><h4>{h}</h4><p>{p}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// One big quote at a time, auto-advancing; arrows and dots to navigate.
export function Reviews() {
  const [i, setI] = useState(0);
  const n = REVIEWS.length;
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 6500);
    return () => clearTimeout(id);
  }, [i, n]);
  const [name, role, text] = REVIEWS[i];
  return (
    <section id="reviews" className="reviews">
      <div className="wrap">
        <SectionHead n="08" label="Reviews" title={<>Trusted on the <mark>road.</mark></>} />
        <div className="quote rv">
          <span className="q-mark" aria-hidden="true">“</span>
          <blockquote key={i} aria-live="polite">
            <p>{text}</p>
            <footer><b>{name}</b><span>{role}</span><span className="q-stars" aria-label="5 stars">★★★★★</span></footer>
          </blockquote>
          <div className="q-nav">
            <span className="q-count">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <div className="q-bars">
              {REVIEWS.map((r, k) => (
                <button key={r[0]} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Review ${k + 1}`}>
                  {k === i && <i key={i} />}
                </button>
              ))}
            </div>
            <button className="q-arrow" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous review">←</button>
            <button className="q-arrow" onClick={() => setI((i + 1) % n)} aria-label="Next review">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="cta" id="dealer">
      <div className="wrap">
        <span className="cta-k rv">Dealership open — across India</span>
        <h2 className="cta-t rv">Become a<br />Litpax dealer.</h2>
        <div className="cta-row rv">
          <p>Competitive pricing, flexible bulk orders and pan-India service support. Grow with a Made-in-India battery brand.</p>
          <div className="cta-btns">
            <a className="btn btn-k" href={waLink('Hi Litpax, I am interested in dealership.')} target="_blank" rel="noopener">Apply for dealership <span className="ar">→</span></a>
            <a className="btn btn-line-k" href="#contact">Talk to sales</a>
          </div>
        </div>
      </div>
    </section>
  );
}
