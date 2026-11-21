import { COMPARE, WHY } from '../data.js';
import { SectionHead } from './Sections.jsx';

// "Why Litpax" as an editorial ruled list, then a Lithium VS Lead-acid face-off.
export default function Why() {
  return (
    <>
      <section id="why" className="why">
        <div className="wrap">
          <SectionHead n="07" label="Why Litpax" title={<>Built in-house. <mark>Backed nationwide.</mark></>}
            lead="We design, assemble and test every battery pack in our own facility — consistent quality at a competitive price." />
          <ol className="why-list">
            {WHY.map(([h, p], i) => (
              <li className="why-row rv" key={h}>
                <span className="wr-n">0{i + 1}</span>
                <h3>{h}</h3>
                <p>{p}</p>
                <span className="wr-go" aria-hidden="true">→</span>
              </li>
            ))}
          </ol>
          <div className="seals">
            <div className="seal rv"><b>ISO</b><span>9001:2015<small>Certified quality</small></span></div>
            <div className="seal rv"><b>IN</b><span>Make in India<small>Sirsa, Haryana</small></span></div>
            <div className="seal rv"><b>BMS</b><span>Smart BMS<small>In every pack</small></span></div>
          </div>
        </div>
      </section>

      <section id="compare" className="versus" data-theme="dark">
        <div className="wrap">
          <SectionHead label="Lithium vs Lead-acid" title={<>Why <mark>switch</mark> to lithium.</>} />
          <div className="vs rv" role="table" aria-label="Litpax lithium compared with lead-acid">
            <div className="vs-head" role="row">
              <span className="vs-k" role="columnheader" />
              <span className="vs-a" role="columnheader">Litpax Lithium<small>LFP &amp; Li-ion · Smart BMS</small></span>
              <span className="vs-x" aria-hidden="true">VS</span>
              <span className="vs-b" role="columnheader">Lead-acid<small>Conventional</small></span>
            </div>
            {COMPARE.map(([k, a, b]) => (
              <div className="vs-row" role="row" key={k}>
                <span className="vs-k" role="rowheader">{k}</span>
                <span className="vs-a" role="cell">{a}</span>
                <span className="vs-x" aria-hidden="true" />
                <span className="vs-b" role="cell">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
