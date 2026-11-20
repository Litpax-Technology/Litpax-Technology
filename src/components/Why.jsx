import { COMPARE, WHY } from '../data.js';
import { SectionHead } from './Sections.jsx';

const ICONS = [
  <><path d="M3 21V10l6 3.5V10l6 3.5V6l6-3v18z" /><path d="M3 21h18" /><path d="M7 17h2M12 17h2M17 17h2" /></>,
  <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /><path d="m9 12 2 2 4-4" /></>,
  <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>,
  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  <><path d="M8 12 4 8l4-4 4 4" /><path d="m16 12 4 4-4 4-4-4" /><path d="m9 15 6-6" /></>,
];

export default function Why() {
  const spot = (e) => {
    const c = e.currentTarget, r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <section id="why">
      <div className="wrap">
        <SectionHead n="07" label="Why Litpax" title={<>Built in-house. <span className="grad">Backed nationwide.</span></>}
          lead="We design, assemble and test every battery pack in our own facility — consistent quality at a competitive price." />
        <div className="why-grid">
          {WHY.map(([h, p], i) => (
            <article className="wc rv" key={h} onMouseMove={spot}>
              <span className="wc-n">0{i + 1}</span>
              <span className="wc-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[i]}</svg>
              </span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <div className="badges">
          <div className="rv"><span className="ic">ISO</span><div><b>ISO 9001:2015</b><span>Certified quality management</span></div></div>
          <div className="rv"><span className="ic">IN</span><div><b>Make in India</b><span>Designed &amp; built in Sirsa, Haryana</span></div></div>
          <div className="rv"><span className="ic">BMS</span><div><b>Smart BMS</b><span>In every pack we ship</span></div></div>
        </div>

        <div className="cmp">
          <SectionHead label="Lithium vs Lead-acid" title={<>Why <span className="grad">switch</span> to lithium.</>} />
          <div className="cmp-table rv" role="table" aria-label="Litpax lithium compared with lead-acid">
            <div className="cmp-row head" role="row">
              <span className="k" role="columnheader">Feature</span>
              <span className="a" role="columnheader">Litpax Lithium<small>LFP &amp; Li-ion · Smart BMS</small></span>
              <span className="b" role="columnheader">Lead-acid<small>Conventional</small></span>
            </div>
            {COMPARE.map(([k, a, b]) => (
              <div className="cmp-row" role="row" key={k}>
                <span className="k" role="cell">{k}</span>
                <span className="a" role="cell">{a}</span>
                <span className="b" role="cell">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
