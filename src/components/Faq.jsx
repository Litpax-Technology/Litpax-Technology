import { useState } from 'react';
import { FAQ, waLink } from '../data.js';
import { SectionHead } from './Sections.jsx';

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <SectionHead n="10" label="FAQ" title={<>Questions, <mark>answered.</mark></>} lead="Still unsure? Our team is one WhatsApp message away." />
      <div className="faq-in">
        <div className="faq-left">
          <p className="faq-note rv">Can't find your answer? Ask us directly — we usually reply within minutes during working hours.</p>
          <a className="btn btn-k rv" href={waLink('Hi Litpax, I have a question.')} target="_blank" rel="noopener">Ask on WhatsApp <span className="ar">→</span></a>
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
      </div>
    </section>
  );
}
