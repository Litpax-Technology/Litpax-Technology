import Logo from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

const WaIcon = ({ size = 17, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" /></svg>
);

export default function Footer() {
  return (
    <>
      <footer>
        <div className="wrap">
          <div className="f-top">
            <div>
              <Logo />
              <p>ISO 9001:2015 certified manufacturer of Lithium-ion &amp; LFP battery packs. Proudly Made in India.</p>
              <div className="soc">
                <a href={CONTACT.facebook} target="_blank" rel="noopener" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a5 5 0 0 0-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9a1 1 0 0 1 1-1z" /></svg></a>
                <a href={CONTACT.instagram} target="_blank" rel="noopener" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp"><WaIcon size={16} /></a>
              </div>
            </div>
            <div><h5>Products</h5><ul><li><a href="#products">E-Bike battery</a></li><li><a href="#products">E-Rickshaw battery</a></li><li><a href="#products">Solar / Inverter</a></li><li><a href="#applications">Medical &amp; Telecom</a></li></ul></div>
            <div><h5>Company</h5><ul><li><a href="#about">About us</a></li><li><a href="#process">Process</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li></ul></div>
            <div><h5>Contact</h5><ul><li><a href={`tel:${CONTACT.tollFree.tel}`}>{CONTACT.tollFree.label}</a></li><li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li><li>{CONTACT.hours}</li><li><a href={CONTACT.shop} target="_blank" rel="noopener">Online shop ↗</a></li></ul></div>
          </div>
          <div className="f-word" aria-hidden="true">LITPAX</div>
          <div className="f-bot">
            <span>© {new Date().getFullYear()} Litpax Technology. All rights reserved.</span>
            <span>Sirsa, Haryana, India</span>
          </div>
        </div>
      </footer>
      <a className="wa" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <WaIcon size={28} fill="#fff" />
      </a>
    </>
  );
}
