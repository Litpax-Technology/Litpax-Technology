import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

const LINKS = [
  ['#applications', 'Applications'],
  ['#products', 'Products'],
  ['#finder', 'Battery Finder'],
  ['#process', 'Process'],
  ['#contact', 'Contact'],
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);   // header text turns white while it sits over the dark hero

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = scrollY;
      const hero = document.querySelector('.hero');
      setDark(!!hero && y < hero.offsetHeight - 70);
      setScrolled(y > 40);
      setHidden(y > last && y > 500);
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; close it with Esc
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (open) { window.__lenis?.stop(); document.documentElement.style.overflow = 'hidden'; }
    else { window.__lenis?.start(); document.documentElement.style.overflow = ''; }
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open]);

  // Close the menu if the screen becomes desktop-sized
  useEffect(() => {
    const mq = matchMedia('(min-width: 981px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const close = () => setOpen(false);
  const cls = [scrolled && 'scrolled', hidden && !open && 'hide', dark && 'dark'].filter(Boolean).join(' ');

  return (
    <>
      <header id="hdr" className={cls}>
        <div className="wrap">
          <Logo />
          <nav id="nav" aria-label="Main">
            <ul>
              {LINKS.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
            </ul>
          </nav>
          <div className="h-cta">
            <a className="btn btn-out magnetic" href={CONTACT.shop} target="_blank" rel="noopener">Shop</a>
            <a className="btn btn-ink magnetic" href="#contact">Get a Quote</a>
            <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
              aria-controls="mmenu" onClick={() => setOpen(!open)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu (separate from the header so it always covers the full screen) */}
      <div id="mmenu" className={`mmenu${open ? ' open' : ''}`} aria-hidden={!open}>
        <ul>
          {LINKS.map(([href, label], i) => (
            <li key={href} style={{ '--i': i }}>
              <a className="mm-link" href={href} onClick={close} tabIndex={open ? 0 : -1}>
                <span className="mm-n">0{i + 1}</span>{label}<span className="mm-ar">→</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mm-foot">
          <div className="mm-contact">
            <small>Toll free</small>
            <a href={`tel:${CONTACT.tollFree.tel}`} tabIndex={open ? 0 : -1}>{CONTACT.tollFree.label}</a>
          </div>
          <div className="mm-btns">
            <a className="btn btn-red" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>WhatsApp <span className="ar">↗</span></a>
            <a className="btn btn-out" href={CONTACT.shop} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>Shop <span className="ar">↗</span></a>
          </div>
        </div>
      </div>
    </>
  );
}
