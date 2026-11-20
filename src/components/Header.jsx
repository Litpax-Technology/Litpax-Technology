import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';

const LINKS = [
  ['#applications', 'Applications'],
  ['#products', 'Products'],
  ['#finder', 'Battery Finder'],
  ['#process', 'Process'],
  ['#why', 'Why Litpax'],
  ['#contact', 'Contact'],
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 30);
      setHidden(y > last && y > 600);
      last = y;
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // lock scrolling while the mobile menu is open; Esc closes it
  useEffect(() => {
    if (open) { window.__lenis?.stop(); document.documentElement.style.overflow = 'hidden'; }
    else { window.__lenis?.start(); document.documentElement.style.overflow = ''; }
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open]);

  useEffect(() => {
    const mq = matchMedia('(min-width: 1101px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const close = () => setOpen(false);
  const cls = ['hd', (scrolled || open) && 'is-scrolled', hidden && !open && 'is-hidden'].filter(Boolean).join(' ');

  return (
    <>
      <header className={cls}>
        <div className="hd-in">
          <Logo />
          <nav className="hd-nav" aria-label="Main">
            <ul>{LINKS.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
          </nav>
          <div className="hd-act">
            <a className="btn btn-ghost sm hide-m" href={CONTACT.shop} target="_blank" rel="noopener">Shop</a>
            <a className="btn btn-primary sm" href="#contact">Get a quote</a>
            <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="mnav" className={`mnav${open ? ' open' : ''}`} aria-hidden={!open}>
        <ul>
          {LINKS.map(([href, label], i) => (
            <li key={href} style={{ '--i': i }}>
              <a href={href} onClick={close} tabIndex={open ? 0 : -1}><small>0{i + 1}</small>{label}</a>
            </li>
          ))}
        </ul>
        <div className="mnav-foot">
          <a className="tel" href={`tel:${CONTACT.tollFree.tel}`} tabIndex={open ? 0 : -1}>Toll free · {CONTACT.tollFree.label}</a>
          <div className="btns">
            <a className="btn btn-primary" href={waLink('Hi Litpax, I want to enquire about lithium batteries.')} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>WhatsApp</a>
            <a className="btn btn-ghost" href={CONTACT.shop} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>Shop online</a>
          </div>
        </div>
      </div>
    </>
  );
}
