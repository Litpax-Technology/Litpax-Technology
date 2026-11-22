import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const [dark, setDark] = useState(true);     // header follows the theme of the section under it
  const [active, setActive] = useState('');   // nav link of the section in view
  const [prog, setProg] = useState(0);        // page scroll progress 0..1
  const [hover, setHover] = useState('');     // link under the mouse (sliding highlight)
  const [ind, setInd] = useState(null);       // highlight position { x, w }
  const navRef = useRef(null);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 30);
      setHidden(y > last && y > 600);
      last = y;
      // theme of whatever sits under the header bar
      const under = [...document.querySelectorAll('main section, footer')].filter((s) => { const r = s.getBoundingClientRect(); return r.top <= 44 && r.bottom > 44; }).pop();
      setDark(under?.getAttribute('data-theme') === 'dark');
      // active link: the last linked section whose top has passed 40% of the screen
      let cur = '';
      LINKS.forEach(([href]) => { const s = document.querySelector(href); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = href; });
      setActive(cur);
      setProg(Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
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

  // the highlight slides to the hovered link, or rests on the active one
  useLayoutEffect(() => {
    const target = hover || active;
    const a = target && navRef.current?.querySelector(`a[href="${target}"]`);
    if (!a) { setInd(null); return; }
    setInd({ x: a.offsetLeft, w: a.offsetWidth });
  }, [hover, active]);

  const close = () => setOpen(false);
  const cls = ['hd', scrolled && !open && 'is-scrolled', hidden && !open && 'is-hidden'].filter(Boolean).join(' ');
  const theme = !open && dark ? 'dark' : 'light';   // black on the yellow menu

  return (
    <>
      <header className={cls} data-theme={theme}>
        <div className="hd-in">
          <div className="hd-prog" aria-hidden="true"><i style={{ transform: `scaleX(${prog})` }} /></div>
          <Logo />
          <nav className="hd-nav" aria-label="Main" ref={navRef} onMouseLeave={() => setHover('')}>
            <ul>
              <li className={`hd-ind${ind ? ' on' : ''}${hover ? ' hov' : ''}`} aria-hidden="true" style={ind ? { transform: `translateX(${ind.x}px)`, width: ind.w } : undefined} />
              {LINKS.map(([href, label]) => <li key={href}><a href={href} onMouseEnter={() => setHover(href)} onFocus={() => setHover(href)} onBlur={() => setHover('')} className={active === href ? 'active' : ''} aria-current={active === href ? 'true' : undefined}>{label}</a></li>)}
            </ul>
          </nav>
          <div className="hd-act">
            <a className="hd-call hide-m" href={`tel:${CONTACT.tollFree.tel}`} aria-label={`Call toll free ${CONTACT.tollFree.label}`} title={`Toll free · ${CONTACT.tollFree.label}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
            </a>
            <a className="btn btn-ghost sm hide-m" href={CONTACT.shop} target="_blank" rel="noopener">Shop</a>
            <a className="btn btn-primary sm hd-quote" href="#contact">Get a quote <span className="ar" aria-hidden="true">→</span></a>
            <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
              <span /><span /><span />
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
