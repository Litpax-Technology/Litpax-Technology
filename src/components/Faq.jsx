import { useState } from 'react';
import { FAQ, waLink } from '../data.js';

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq">
      <div className="wrap faq-in">
        <div className="faq-left">
          <div className="eyebrow rv"><span className="dot" /><span className="num">09 /</span>FAQ</div>
          <h2 className="rv">Questions, <span className="grad">answered.</span></h2>
          <p className="lead rv" style={{ marginTop: 22 }}>Still unsure? Our team is one WhatsApp message away.</p>
          <a className="btn btn-ghost rv" href={waLink('Hi Litpax, I have a question.')} target="_blank" rel="noopener">Ask on WhatsApp <span className="ar">→</span></a>
        </div>
        <div className="faq-list">
          {FAQ.map(([q, a], i) => (
            <div className={`fq rv${open === i ? ' open' : ''}`} key={q}>
              <button className="fq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="fq-n">0{i + 1}</span>
                <span className="fq-t">{q}</span>
                <span className="fq-ic" aria-hidden="true" />
              </button>
              <div className="fq-a"><div><p>{a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
