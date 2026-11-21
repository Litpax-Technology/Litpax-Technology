// Smaller sections of the page, kept together: shared section heading,
// ticker, about + stats, applications bento, process, reviews, CTA.
import { APPLICATIONS, PHOTOS, REVIEWS, STATS, STEPS, waLink } from '../data.js';

export function SectionHead({ n, label, title, lead, center }) {
  return (
    <div className={`sh${center ? ' center' : ''}`}>
      <div>
        <div className="eyebrow rv"><span className="dot" />{n && <span className="num">{n} /</span>}{label}</div>
        <h2 className="rv">{title}</h2>
      </div>
      {lead && <p className="lead rv">{lead}</p>}
    </div>
  );
}

const WORDS = ['E-Bike & Scooter', 'E-Rickshaw', 'Solar & Inverter', 'E-Cycle', 'Medical', 'Telecom', 'Custom packs'];
export function Ticker() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((k) => row.map((w, i) => <span key={`${k}-${i}`}><b>{w}</b><i /></span>))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <div className="about-in">
          <div>
            <div className="eyebrow rv"><span className="dot" /><span className="num">01 /</span>About Litpax</div>
            <h2 className="rv">Lithium power that moves <span className="grad">India forward.</span></h2>
          </div>
          <div className="about-copy">
            <p className="rv">Litpax Technology builds lithium battery packs for <strong>e-rickshaws on busy streets, solar homes and hospital equipment.</strong></p>
            <p className="rv">Every pack is engineered in-house, tested to <strong>ISO 9001:2015</strong> standards and backed by service across the country.</p>
          </div>
        </div>
        <div className="stats rv">
          {STATS.map(([n, label]) => (
            <div className="stat" key={label}>
              <b><span data-count={n}>{n}</span><sup>+</sup></b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Applications({ onPick }) {
  const size = ['big', '', '', '', '', 'wide'];
  return (
    <section id="applications">
      <div className="wrap">
        <SectionHead n="03" label="Applications" title={<>One partner for <span className="grad">every</span> application.</>}
          lead="From two-wheelers to hospitals — tap a category to see the matching batteries." />
        <div className="bento">
          {APPLICATIONS.map((a, i) => (
            <a key={a.title} href={a.go ? '#products' : '#contact'} className={`tile rv ${size[i] || ''}`} onClick={() => a.go && onPick(a.go)}>
              <div className="tile-img" style={{ backgroundImage: `url("${a.img}")` }} />
              <span className="tile-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="tile-go" aria-hidden="true">↗</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <div className="chips">{a.chips.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
            </a>
          ))}
          <a href="#contact" className="tile custom wide rv">
            <span className="mono" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>Custom engineering</span>
            <div className="row">
              <div>
                <h3>Need a custom pack?</h3>
                <p>Tell us your voltage, capacity and size — we'll engineer it.</p>
              </div>
              <span className="btn sm">Start a project <span className="ar">→</span></span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <SectionHead n="06" label="How we build" title={<>From cell to <span className="grad">full power.</span></>}
          lead="Every Litpax pack passes through our in-house production and testing line before it reaches you." />
        <div className="proc-photo rv-img">
          <div id="procImg" style={{ backgroundImage: `url("${PHOTOS.process}")` }} />
          <div className="cap"><span>Sirsa, Haryana</span><b>Built and tested on our own line.</b></div>
        </div>
        <div className="steps" id="steps">
          <div className="steps-line" aria-hidden="true"><i id="stepsFill" /></div>
          {STEPS.map(([h, p], i) => (
            <div className="step rv" key={h}>
              <div className="step-n">0{i + 1}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section id="reviews">
      <div className="wrap">
        <SectionHead n="08" label="Reviews" title={<>Trusted on the <span className="grad">road.</span></>} />
        <div className="reviews">
          {REVIEWS.map(([name, role, text]) => (
            <figure className="rc rv" key={name}>
              <div className="stars" aria-label="5 stars">★★★★★</div>
              <p>“{text}”</p>
              <figcaption className="who">
                <span className="av">{name[0]}</span>
                <div><b>{name}</b><span>{role}</span></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-card rv">
          <div className="bg" style={{ backgroundImage: `url("${PHOTOS.cta}")` }} />
          <div className="ambient" aria-hidden="true"><i /><i /><i /></div>
          <div className="eyebrow"><span className="dot" />Dealership open</div>
          <h2>Become a<br />Litpax dealer.</h2>
          <p>Competitive pricing, flexible bulk orders and pan-India service support. Grow with a Made-in-India battery brand.</p>
          <div className="row">
            <a className="btn btn-light" href={waLink('Hi Litpax, I am interested in dealership.')} target="_blank" rel="noopener">Apply for dealership <span className="ar">→</span></a>
            <a className="btn btn-ghost" href="#contact">Talk to sales</a>
          </div>
        </div>
      </div>
    </section>
  );
}
