import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { CONTACT, waLink } from '../data.js';
import { quote } from '../lib/quote.js';

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
  const [qCount, setQCount] = useState(quote.count); // batteries in the quote list
  const [qBump, setQBump] = useState(0);
  useEffect(() => quote.subscribe((l) => { setQCount(l.length); setQBump((b) => b + 1); }), []);
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
              <li><a href={CONTACT.shop} target="_blank" rel="noopener" className="hd-shop" onMouseEnter={() => setHover('')}>Shop ↗</a></li>
            </ul>
          </nav>
          <div className="hd-act">
            <button type="button" className="hd-quote-btn" onClick={() => quote.open()} aria-label={`Open quote list (${qCount})`}>
              <svg width="20" height="22" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="5" y="3" width="14" height="21" rx="2" /><path d="M9 3V1.5h6V3M9 10h6M9 14h6M9 18h4" /></svg>
              <span key={qBump} className={`hd-quote-n${qCount ? ' on' : ''}`}>{qCount}</span>
            </button>
            <a className="hd-cta" href="#contact">
              <span className="hd-cta-l">Get a quote</span>
              <span className="hd-cta-c" aria-hidden="true"><svg viewBox="0 0 11.8536 11.8536" fill="none" stroke="currentColor" strokeWidth="1"><path d="M11.3536 11.5V0.5H0.353553M11.3536 0.5L0.353553 11.5" /></svg></span>
            </a>
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
