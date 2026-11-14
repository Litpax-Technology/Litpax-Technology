import { useEffect, useState } from 'react';
import { SECTIONS } from '../data.js';

// Fixed dots on the right showing which section you're in (desktop only).
export default function SideNav() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <nav className="sidenav" aria-label="Sections">
      {SECTIONS.map(([id, label]) => (
        <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-label={label}>
          <span className="sn-label">{label}</span><span className="sn-dot" />
        </a>
      ))}
    </nav>
  );
}
