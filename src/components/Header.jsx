import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { CONTACT } from '../data.js';

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

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 500);
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { document.body.classList.toggle('menu-open', open); }, [open]);

  const cls = ['', scrolled && 'scrolled', hidden && !open && 'hide'].filter(Boolean).join(' ');

  return (
    <header id="hdr" className={cls}>
      <div className="wrap">
        <Logo />
        <nav id="nav">
          <ul>
            {LINKS.map(([href, label]) => (
              <li key={href}><a href={href} onClick={() => setOpen(false)}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="h-cta">
          <a className="btn btn-out magnetic" href={CONTACT.shop} target="_blank" rel="noopener">Shop</a>
          <a className="btn btn-ink magnetic" href="#contact">Get a Quote</a>
          <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
