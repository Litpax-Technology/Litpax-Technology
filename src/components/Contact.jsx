import { useState } from 'react';
import { CONTACT, waLink } from '../data.js';

const OPTIONS = ['E-Bike / E-Scooter', 'E-Rickshaw', 'E-Cycle', 'Solar / Inverter', 'Medical Application', 'Telecom / Portable', 'Dealership'];

function Row({ label, children, href, external }) {
  const ext = external ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <div className="c-row rv">
      <div><small>{label}</small>{children}</div>
      <a className="go" href={href} aria-label={label} {...ext}>↗</a>
    </div>
  );
}

// The quote form opens WhatsApp with the enquiry pre-filled (no server needed).
export default function Contact() {
  const [f, setF] = useState({ name: '', phone: '', city: '', type: OPTIONS[0], req: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const msg = `Hi Litpax, new enquiry:\nName: ${f.name}\nPhone: ${f.phone}\nCity: ${f.city}\nBattery for: ${f.type}\nRequirement: ${f.req}`;
    window.open(waLink(msg), '_blank');
  };

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div>
          <div className="eyebrow rv"><span className="dot" /><span className="num">10 /</span>Contact</div>
          <h2 className="rv">Let's talk <span className="grad">power.</span></h2>
          <div className="c-rows">
            <Row label="Toll free" href={`tel:${CONTACT.tollFree.tel}`}><a href={`tel:${CONTACT.tollFree.tel}`}>{CONTACT.tollFree.label}</a></Row>
            <Row label="Sales enquiry" href={`tel:${CONTACT.sales.tel}`}><a href={`tel:${CONTACT.sales.tel}`}>{CONTACT.sales.label}</a></Row>
            <Row label="Customer care · Service" href={`tel:${CONTACT.care.tel}`}>
              <a href={`tel:${CONTACT.care.tel}`}>{CONTACT.care.label}</a> · <a href={`tel:${CONTACT.service.tel}`}>{CONTACT.service.label}</a>
            </Row>
            <Row label="Email" href={`mailto:${CONTACT.email}`}><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></Row>
            <Row label={`Factory · ${CONTACT.hours}`} href={CONTACT.map} external><a href={CONTACT.map} target="_blank" rel="noopener">{CONTACT.address}</a></Row>
          </div>
        </div>

        <form className="rv" onSubmit={submit}>
          <h3>Request a quote</h3>
          <p className="sub">Your enquiry opens in WhatsApp, pre-filled — our team replies fast.</p>
          <div className="row">
            <div className="fld"><input id="fn" required placeholder=" " value={f.name} onChange={set('name')} /><label htmlFor="fn">Your name</label></div>
            <div className="fld"><input id="fp" type="tel" required placeholder=" " value={f.phone} onChange={set('phone')} /><label htmlFor="fp">Phone number</label></div>
          </div>
          <div className="row">
            <div className="fld"><input id="fc" placeholder=" " value={f.city} onChange={set('city')} /><label htmlFor="fc">City</label></div>
            <div className="fld sel">
              <select id="fs" value={f.type} onChange={set('type')}>{OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
              <label htmlFor="fs">Battery for</label>
            </div>
          </div>
          <div className="fld"><textarea id="fm" placeholder=" " value={f.req} onChange={set('req')} /><label htmlFor="fm">Requirement (e.g. 60V 30Ah × 10)</label></div>
          <button className="btn btn-primary" type="submit">Send enquiry on WhatsApp <span className="ar">→</span></button>
        </form>
      </div>
    </section>
  );
}
