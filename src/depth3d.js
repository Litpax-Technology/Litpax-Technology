import gsap from 'gsap';

// Site-wide 3D layer:
//  1. Cards tilt in 3D toward the mouse, with a moving light glare and
//     inner parts (photos, icons) floating on a deeper layer.
//  2. Cards and sections fly in from depth (rotateX + z) as you scroll.
//  3. Hero text block leans toward the mouse.
// Uses GSAP transforms only, so it composes with the existing reveal animations.

const TILT = '.sc, .wc, .cmp, .t, .app.photo, .app.end, .bt, .stat, .cell-big, .bf-panel, .fq';
const FLOAT = '.sc-media img, .wc-ic, .t .q, .stat b, .ic, .pct';

export function initDepth3D(root) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return () => {};
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.documentElement.classList.add('has-3d');
  const cleanups = [];

  // ---------- 1. Mouse tilt (desktop) ----------
  if (fine) {
    const tools = new WeakMap();
    const get = (el) => {
      let t = tools.get(el);
      if (!t) {
        gsap.set(el, { transformPerspective: 1100, transformStyle: 'preserve-3d' });
        const inner = el.querySelectorAll(FLOAT);
        if (!el.querySelector(':scope > .glare3d')) { const g = document.createElement('span'); g.className = 'glare3d'; g.setAttribute('aria-hidden', 'true'); el.appendChild(g); }
        t = {
          rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }),
          ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' }),
          z: gsap.quickTo(el, 'z', { duration: 0.6, ease: 'power3' }),
          ix: [...inner].map((i) => gsap.quickTo(i, 'x', { duration: 0.8, ease: 'power3' })),
          iy: [...inner].map((i) => gsap.quickTo(i, 'y', { duration: 0.8, ease: 'power3' })),
          // big panels tilt less than small cards
          k: el.matches('.bf-panel, .cmp, .fq') ? 0.35 : el.matches('.sc-big') ? 0.6 : 1,
        };
        tools.set(el, t);
      }
      return t;
    };
    let cur = null;
    const reset = (el) => {
      const t = get(el);
      t.rx(0); t.ry(0); t.z(0);
      t.ix.forEach((f) => f(0)); t.iy.forEach((f) => f(0));
      el.classList.remove('tilting');
    };
    const onMove = (e) => {
      const el = e.target.closest?.(TILT);
      if (cur && cur !== el) { reset(cur); cur = null; }
      if (!el) return;
      cur = el;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const t = get(el);
      t.ry(px * 16 * t.k); t.rx(-py * 14 * t.k); t.z(30 * t.k);
      t.ix.forEach((f) => f(px * 22)); t.iy.forEach((f) => f(py * 22));
      el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
      el.classList.add('tilting');
    };
    const onLeave = () => { if (cur) { reset(cur); cur = null; } };
    addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    cleanups.push(() => { removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); });

    // Hero copy leans toward the mouse; the H1 gets a live 3D shadow direction
    const copy = root.querySelector('.hero .wrap > div:first-child');
    if (copy) {
      gsap.set(copy, { transformPerspective: 1400, transformOrigin: '30% 50%' });
      const hx = gsap.quickTo(copy, 'rotationY', { duration: 1.2, ease: 'power3' });
      const hy = gsap.quickTo(copy, 'rotationX', { duration: 1.2, ease: 'power3' });
      const h1 = root.querySelector('.hero h1');
      const onHero = (e) => {
        if (scrollY > innerHeight) return;
        const px = e.clientX / innerWidth - 0.5, py = e.clientY / innerHeight - 0.5;
        hx(px * 10); hy(-py * 8);
        h1?.style.setProperty('--sx', (-px * 2).toFixed(3));
        h1?.style.setProperty('--sy', (-py * 2).toFixed(3));
      };
      addEventListener('mousemove', onHero, { passive: true });
      cleanups.push(() => removeEventListener('mousemove', onHero));
    }
  }

  // ---------- 2. Scroll: things arrive from depth ----------
  const ctx = gsap.context(() => {
    const fly = (sel, trigger, opts = {}) => {
      const els = gsap.utils.toArray(sel, root);
      if (!els.length) return;
      gsap.from(els, {
        rotationX: -55, z: -260, transformPerspective: 1200, transformOrigin: '50% 100%',
        duration: 1.4, ease: 'expo.out', stagger: { each: 0.08, from: 'start' },
        scrollTrigger: { trigger: trigger || els[0], start: 'top 88%' },
        ...opts,
      });
    };
    fly('.store-grid > .sc', '.store-grid');
    fly('.wc-grid > .wc', '.wc-grid');
    fly('.stats .stat', '.stats', { rotationX: -70 });
    fly('.cmp', '.cmp-grid', { rotationX: 0, rotationY: (i) => (i ? -40 : 40), transformOrigin: (i) => (i ? '0% 50%' : '100% 50%') });
    fly('.fq', '.faq-list', { rotationX: -80, z: -120 });

    // Whole sections tip up from the floor as they scroll in (not pinned ones)
    gsap.utils.toArray('.statement .wrap, .prods .wrap, #why .wrap, .testi .wrap, .faq .wrap, .contact .wrap, #contact .wrap', root).forEach((el) => {
      gsap.fromTo(el, { rotationX: 14, scale: 0.94, transformPerspective: 1600, transformOrigin: '50% 0%' },
        { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: true } });
    });

    // Statement text rolls in like a 3D drum
    gsap.fromTo('#stmt', { rotationX: 35, transformPerspective: 900, transformOrigin: '50% 100%' },
      { rotationX: 0, ease: 'none', scrollTrigger: { trigger: '#stmt', start: 'top bottom', end: 'top 40%', scrub: true } });

    // Footer letters: 3D flip-up
    gsap.utils.toArray('#giant span', root).forEach((s, i) =>
      gsap.fromTo(s, { rotationX: -90, transformPerspective: 600, transformOrigin: '50% 100%' },
        { rotationX: 0, duration: 1.4, delay: i * 0.06, ease: 'expo.out', scrollTrigger: { trigger: '#giant', start: 'top 95%' } }));

    // Hero 3D stage pushes back in depth while scrolling away
    gsap.to('.hero .wrap > div:first-child', { z: -260, transformPerspective: 1400, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }, root);
  cleanups.push(() => ctx.revert());

  return () => { cleanups.forEach((f) => f()); document.documentElement.classList.remove('has-3d'); };
}
