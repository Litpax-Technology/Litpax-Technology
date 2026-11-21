import Logo from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

const WaIcon = ({ size = 17, fill = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" /></svg>
);

export default function Footer() {
  return (
    <>
      <footer className="foot" data-theme="dark">
        <div className="wrap">
          <div className="f-top">
            <div className="f-brand">
              <Logo />
              <p>ISO 9001:2015 certified manufacturer of Lithium-ion &amp; LFP battery packs. Proudly Made in India.</p>
              <a className="f-tel" href={`tel:${CONTACT.tollFree.tel}`}>{CONTACT.tollFree.label}<small>Toll free · {CONTACT.hours}</small></a>
            </div>
            <div><h5>Products</h5><ul><li><a href="#products">E-Bike battery</a></li><li><a href="#products">E-Rickshaw battery</a></li><li><a href="#products">Solar / Inverter</a></li><li><a href="#applications">Medical &amp; Telecom</a></li></ul></div>
            <div><h5>Company</h5><ul><li><a href="#about">About us</a></li><li><a href="#process">Process</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li></ul></div>
            <div><h5>Connect</h5><ul>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><a href={CONTACT.shop} target="_blank" rel="noopener">Online shop ↗</a></li>
              <li><a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook ↗</a></li>
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram ↗</a></li>
            </ul></div>
          </div>
        </div>
        <div className="f-word" aria-hidden="true">LITPAX</div>
        <div className="wrap f-bot">
          <span>© {new Date().getFullYear()} Litpax Technology. All rights reserved.</span>
          <span>Sirsa, Haryana, India</span>
        </div>
      </footer>
      <a className="wa" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <WaIcon size={26} fill="#fff" />
      </a>
    </>
  );
}
