import Logo from './Logo.jsx';
import { CONTACT, waLink, PHOTOS } from '../data.js';

// Small line icons (stroke = currentColor)
const I = {
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  pin: <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  tool: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
};
const Icon = ({ n, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg>
);
const WaIcon = ({ size = 17, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" /></svg>
);

const toTop = (e) => {
  e.preventDefault();
  if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
  else scrollTo({ top: 0, behavior: 'smooth' });
};

export default function Footer() {
  return (
    <>
      <footer className="foot">
        <div className="wrap">
          {/* Call-to-action card */}
          <div className="f-cta rv">
            <div className="f-cta-photo" aria-hidden="true" style={{ backgroundImage: `url("${PHOTOS.process}")` }} />
            <div className="f-cta-bat" aria-hidden="true"><i /></div>
            <div className="f-cta-copy">
              <span className="f-cta-k">Ready when you are</span>
              <h3>Let's power your next project.</h3>
              <p>Tell us your vehicle, load or backup need — we'll suggest the right pack and price within a day.</p>
            </div>
            <div className="f-cta-btns">
              <a className="btn f-btn-w" href="#contact">Get a quote <span className="ar">→</span></a>
              <a className="btn f-btn-wa" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener"><WaIcon size={16} /> WhatsApp</a>
            </div>
          </div>

          {/* Main columns */}
          <div className="f-main">
            <div className="f-brand">
              <Logo />
              <p>ISO 9001:2015 certified manufacturer of Lithium-ion &amp; LFP battery packs for electric mobility, solar storage and critical power.</p>
              <div className="f-soc">
                <a href={CONTACT.facebook} target="_blank" rel="noopener" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a5 5 0 0 0-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9a1 1 0 0 1 1-1z" /></svg></a>
                <a href={CONTACT.instagram} target="_blank" rel="noopener" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp"><WaIcon size={16} /></a>
                <a href={CONTACT.shop} target="_blank" rel="noopener" aria-label="Online shop" className="f-shop">Shop online ↗</a>
              </div>
            </div>

            <nav className="f-col" aria-label="Products">
              <h5>Products</h5>
              <a href="#products">E-Bike &amp; Scooter</a>
              <a href="#products">E-Rickshaw</a>
              <a href="#products">Solar &amp; Inverter</a>
              <a href="#applications">Medical &amp; Telecom</a>
              <a href="#contact">Custom packs</a>
            </nav>

            <nav className="f-col" aria-label="Company">
              <h5>Company</h5>
              <a href="#about">About us</a>
              <a href="#process">How we build</a>
              <a href="#finder">Battery Finder</a>
              <a href="#reviews">Reviews</a>
              <a href="#faq">FAQ</a>
            </nav>

            <div className="f-col f-contact">
              <h5>Get in touch</h5>
              <a href={`tel:${CONTACT.tollFree.tel}`}><Icon n="phone" /><span><small>Toll free</small>{CONTACT.tollFree.label}</span></a>
              <a href={`mailto:${CONTACT.email}`}><Icon n="mail" /><span><small>Email</small>{CONTACT.email}</span></a>
              <a href={CONTACT.map} target="_blank" rel="noopener"><Icon n="pin" /><span><small>Factory</small>{CONTACT.address}</span></a>
              <div className="f-hours"><Icon n="clock" /><span><small>Working hours</small>{CONTACT.hours}</span></div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="f-trust">
            <div><Icon n="shield" s={20} /><span><b>ISO 9001:2015</b>Certified quality</span></div>
            <div><Icon n="flag" s={20} /><span><b>Made in India</b>Sirsa, Haryana</span></div>
            <div><Icon n="chip" s={20} /><span><b>Smart BMS</b>In every pack</span></div>
            <div><Icon n="tool" s={20} /><span><b>20+ service centers</b>Pan-India support</span></div>
          </div>

          {/* Bottom bar */}
          <div className="f-bot">
            <span>© {new Date().getFullYear()} Litpax Technology. All rights reserved.</span>
            <span className="f-made">Designed &amp; built in <b>India</b></span>
            <a href="#top" className="f-top-btn" onClick={toTop}>Back to top <span><Icon n="up" s={15} /></span></a>
          </div>
        </div>
      </footer>
      <a className="wa" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <WaIcon size={26} fill="#fff" />
      </a>
    </>
  );
}
