import { useState } from 'react';
import { CONTACT, MAP_EMBED, waLink } from '../data.js';

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
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const check = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Please enter your name.';
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number.';
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const found = check();
    setErr(found);
    if (Object.keys(found).length) return;
    const msg = `Hi Litpax, new enquiry:\nName: ${f.name}\nPhone: ${f.phone}\nCity: ${f.city}\nBattery for: ${f.type}\nRequirement: ${f.req}`;
    window.open(waLink(msg), '_blank');   // opened directly from the click so pop-up blockers allow it
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };
  const cls = (k) => `fld${err[k] ? ' err' : f[k] && k !== 'type' ? ' ok' : ''}`;

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div>
          <div className="sx-meta rv"><span className="sx-n">11</span><span className="sx-l">Contact</span><span className="sx-rule" aria-hidden="true" /></div>
          <h2 className="contact-t rv">Let's talk <mark>power.</mark></h2>
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

        <form className="rv" onSubmit={submit} noValidate>
          <h3>Request a quote</h3>
          <p className="sub">Your enquiry opens in WhatsApp, pre-filled — our team replies fast.</p>
          <div className="row">
            <div className={cls('name')}>
              <input id="fn" required placeholder=" " autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!err.name} aria-describedby={err.name ? 'fn-e' : undefined} />
              <label htmlFor="fn">Your name</label>
              {err.name && <span className="msg" id="fn-e">{err.name}</span>}
            </div>
            <div className={cls('phone')}>
              <input id="fp" type="tel" inputMode="tel" required placeholder=" " autoComplete="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!err.phone} aria-describedby={err.phone ? 'fp-e' : undefined} />
              <label htmlFor="fp">Phone number</label>
              {err.phone && <span className="msg" id="fp-e">{err.phone}</span>}
            </div>
          </div>
          <div className="row">
            <div className="fld"><input id="fc" placeholder=" " value={f.city} onChange={set('city')} /><label htmlFor="fc">City</label></div>
            <div className="fld sel">
              <select id="fs" value={f.type} onChange={set('type')}>{OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
              <label htmlFor="fs">Battery for</label>
            </div>
          </div>
          <div className="fld"><textarea id="fm" placeholder=" " value={f.req} onChange={set('req')} /><label htmlFor="fm">Requirement (e.g. 60V 30Ah × 10)</label></div>
          <button className="btn btn-y" type="submit">Send enquiry on WhatsApp <span className="ar">→</span></button>
          {sent && <p className="form-ok" role="status">✓ WhatsApp opened with your enquiry — just tap send.</p>}
        </form>

        <div className="map-card rv">
          <div className="map-info">
            <span className="map-k">Visit our factory</span>
            <h3>Litpax Technology, Sirsa</h3>
            <p>{CONTACT.address}</p>
            <p className="map-hours">{CONTACT.hours}</p>
            <div className="map-btns">
              <a className="btn btn-y sm" href={CONTACT.map} target="_blank" rel="noopener">Get directions <span className="ar">→</span></a>
              <a className="btn btn-line sm" href={`tel:${CONTACT.tollFree.tel}`}>Call us</a>
            </div>
          </div>
          <div className="map-frame">
            <iframe title="Litpax Technology factory location on Google Maps" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <span className="map-pin" aria-hidden="true"><i /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
