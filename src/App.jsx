import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import BatteryFinder from './components/BatteryFinder.jsx';
import ProductModal from './components/ProductModal.jsx';
import Faq from './components/Faq.jsx';
import SideNav from './components/SideNav.jsx';

import Loader from './components/Loader.jsx';
import Cursor from './components/Cursor.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Statement from './components/Statement.jsx';
import Applications from './components/Applications.jsx';
import ImageBand from './components/ImageBand.jsx';
import Process from './components/Process.jsx';
import Products from './components/Products.jsx';
import Why from './components/Why.jsx';
import Compare from './components/Compare.jsx';
import Testimonials from './components/Testimonials.jsx';
import Cta from './components/Cta.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { initDepth3D } from './depth3d.js';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [filter, setFilter] = useState('all');
  const [quick, setQuick] = useState(null);
  const closeQuick = useCallback(() => setQuick(null), []);
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const q = (s) => root.current.querySelector(s);
    const qa = (s) => [...root.current.querySelectorAll(s)];
    const loader = q('#loader');

    // ---------- Smooth scrolling (Lenis) synced with GSAP ----------
    let lenis = null;
    const raf = (t) => lenis.raf(t * 1000);
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
    // In-page links (#products etc.) glide smoothly
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || !lenis) return;
      const id = a.getAttribute('href');
      const el = id === '#' || id === '#top' ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      // If the mobile menu is open, wait until it has closed and scrolling is resumed
      const fromMenu = document.body.classList.contains('menu-open');
      setTimeout(() => lenis.scrollTo(el, { offset: id === '#top' || id === '#' ? 0 : -20, duration: 1.6, force: true }), fromMenu ? 80 : 0);
    };
    document.addEventListener('click', onAnchor);

    const endLoader = () => { loader.style.display = 'none'; document.body.classList.remove('loading'); lenis?.start(); };

    // ---- Reduced motion: show everything in its final state ----
    if (reduce) {
      endLoader();
      qa('.statement .w').forEach((w) => (w.style.opacity = 1));
      q('#fill').style.height = '100%';
      q('#pct').textContent = '100%';
      qa('.pstep').forEach((s) => s.classList.add('on'));
      return () => document.removeEventListener('click', onAnchor);
    }

    const ctx = gsap.context(() => {
      // ---------- Preloader → hero intro ----------
      const paths = qa('#ldX path');
      paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      const cnt = { v: 0 };
      gsap.set('.hero h1 .ln>span', { yPercent: 110, rotate: 4 });
      gsap.set('.h-in', { y: 40, opacity: 0 });
      gsap.set('#heroPhoto', { clipPath: 'inset(100% 0% 0% 0% round 36px)' });
      gsap.set('.pack-wrap, .orbit', { scale: 0.7, opacity: 0 });

      const tl = gsap.timeline();
      tl.to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.14, ease: 'power2.inOut' })
        .to(cnt, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => (q('#ldNum').textContent = Math.round(cnt.v)) }, 0)
        .to('#ldBar', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to('#ldX', { scale: 0.6, opacity: 0, duration: 0.4, ease: 'power2.in' })
        .to('#loader', { yPercent: -100, duration: 0.9, ease: 'expo.inOut', onComplete: endLoader }, '-=.2')
        .to('.hero h1 .ln>span', { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, '-=.45')
        .to('.h-in', { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, '-=1.1')
        .to('#heroPhoto', { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.4, ease: 'expo.inOut' }, '-=1.3')
        .to('.pack-wrap, .orbit', { scale: 1, opacity: 1, duration: 1.4, stagger: 0.08, ease: 'expo.out' }, '-=.8')
        .from('.tagc', { y: 30, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out' }, '-=1.1');
      setTimeout(() => { if (loader.style.display !== 'none') tl.progress(1); }, 6000);

      // ---------- Hero parallax ----------
      const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#stage', { yPercent: 16, ease: 'none', scrollTrigger: heroST });
      gsap.to('.pack-wrap', { yPercent: 12, scale: 0.94, ease: 'none', scrollTrigger: heroST });
      gsap.to('#heroGlow', { yPercent: 40, ease: 'none', scrollTrigger: heroST });
      gsap.to('.hero h1', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { ...heroST, start: '40% top' } });

      // ---------- Marquee: speed, direction & skew follow scroll velocity ----------
      const mq = q('#mq');
      const mqTween = gsap.to(mq, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      const skewTo = gsap.quickTo(mq, 'skewX', { duration: 0.4, ease: 'power3' });
      let mqTimer;
      ScrollTrigger.create({
        onUpdate(self) {
          const v = self.getVelocity(), dir = self.direction === 1 ? 1 : -1;
          skewTo(gsap.utils.clamp(-12, 12, v / -250));
          gsap.to(mqTween, { timeScale: dir * (1 + Math.min(Math.abs(v) / 800, 3)), duration: 0.3, overwrite: true });
          clearTimeout(mqTimer);
          mqTimer = setTimeout(() => gsap.to(mqTween, { timeScale: dir, duration: 1 }), 150);
        },
      });

      // ---------- Section headings: words rise out of a mask, one by one ----------
      qa('main section:not(.hero) h2.rv').forEach((h) => {
        if (h.dataset.split) return;
        h.dataset.split = '1';
        const wrap = (node) => { const o = document.createElement('span'); o.className = 'wd'; const i = document.createElement('span'); o.appendChild(i); i.appendChild(node); return o; };
        [...h.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((t) => { if (!t) return; frag.appendChild(/^\s+$/.test(t) ? document.createTextNode(t) : wrap(document.createTextNode(t))); });
            h.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') {
            const w = wrap(n.cloneNode(true)); h.replaceChild(w, n);
          }
        });
        h.classList.remove('rv');
        gsap.from(h.querySelectorAll('.wd > span'), { yPercent: 115, rotate: 3, duration: 1.1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
      });

      // ---------- Generic reveal ----------
      qa('.rv').forEach((el) =>
        gsap.from(el, { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

      // ---------- Statement: words light up ----------
      gsap.to('.statement .w', { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: '#stmt', start: 'top 80%', end: 'bottom 45%', scrub: true } });

      // ---------- Counters ----------
      qa('[data-count]').forEach((el) => {
        const o = { v: 0 }, end = +el.dataset.count;
        gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
      });

      // ---------- Image band: frame opens + parallax zoom ----------
      gsap.fromTo('#bandFrame', { clipPath: 'inset(10% 8% 10% 8% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '#band', start: 'top 85%', end: 'top top', scrub: true } });
      gsap.fromTo('#bandImg', { scale: 1.3, yPercent: -8 }, { scale: 1, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#band', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.band-text', { y: 80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#band', start: 'top 60%', end: 'top 15%', scrub: true } });

      // ---------- Process: battery charges with scroll ----------
      const steps = qa('.pstep'), pct = q('#pct');
      const charge = (st) =>
        gsap.fromTo('#fill', { height: '0%' }, {
          height: '100%', ease: 'none',
          scrollTrigger: {
            ...st,
            onUpdate(self) {
              const p = self.progress;
              pct.textContent = Math.round(p * 100) + '%';
              steps.forEach((s, i) => s.classList.toggle('on', p >= i / steps.length + 0.02 || p > 0.98));
            },
          },
        });
      gsap.fromTo('.proc-photo', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '#process', start: 'top bottom', end: 'bottom top', scrub: true } });

      const mm = gsap.matchMedia();
      mm.add('(min-width: 981px)', () => {
        // Horizontal applications
        const track = q('#htrack');
        const dist = () => track.scrollWidth - innerWidth;
        const hTween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#hsec', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
        gsap.from('.app', { y: 120, rotate: 3, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#hsec', start: 'top 70%' } });
        // Photos inside cards drift slightly while the row slides
        qa('.app-img').forEach((img) =>
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } }));
        charge({ trigger: '#procPin', start: 'top top', end: '+=1600', pin: true, scrub: 1 });
      });
      mm.add('(max-width: 980px)', () => {
        qa('.app').forEach((a) => gsap.from(a, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: a, start: 'top 90%' } }));
        charge({ trigger: '#procPin', start: 'top 60%', end: 'bottom 70%', scrub: 1 });
      });

      // ---------- CTA: red circle grows ----------
      gsap.to('#ctaBg', { clipPath: 'circle(75% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '#cta', start: 'top 85%', end: 'center 55%', scrub: true } });
      gsap.from('.cta h2', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#cta', start: 'top 70%', end: 'center 60%', scrub: true } });

      // ---------- Footer giant letters ----------
      gsap.from('#giant span', { yPercent: 100, stagger: 0.06, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#giant', start: 'top 95%' } });
    }, root);

    // ---------- Magnetic buttons (desktop) ----------
    const cleanups = [];
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      qa('.magnetic').forEach((b) => {
        const move = (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`; };
        const leave = () => { b.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; b.style.transform = ''; setTimeout(() => (b.style.transition = ''), 600); };
        b.addEventListener('mousemove', move); b.addEventListener('mouseleave', leave);
        cleanups.push(() => { b.removeEventListener('mousemove', move); b.removeEventListener('mouseleave', leave); });
      });
    }

    // ---------- Spotlight glow that follows the mouse on cards ----------
    const onSpot = (e) => {
      const c = e.target.closest?.('.spot, .app, .cmp, .t, .why-item, .wi');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    // Hero glow drifts toward the mouse
    const glowX = gsap.quickTo('#heroGlow', 'x', { duration: 1.2, ease: 'power3' });
    const glowY = gsap.quickTo('#heroGlow', 'y', { duration: 1.2, ease: 'power3' });
    const onGlow = (e) => { if (scrollY < innerHeight) { glowX((e.clientX / innerWidth - 0.7) * 300); glowY((e.clientY / innerHeight - 0.3) * 200); } };
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      addEventListener('mousemove', onSpot);
      addEventListener('mousemove', onGlow);
    }

    // Section reveal for the new parts
    const extra = gsap.context(() => {
      gsap.from('.bf-bat', { scaleY: 0.4, opacity: 0, transformOrigin: 'bottom', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.bf-result', start: 'top 80%' } });
    }, root);

    // ---------- Site-wide 3D: tilt cards, depth entrances ----------
    const undo3d = initDepth3D(root.current);

    const refresh = () => ScrollTrigger.refresh();
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      ctx.revert(); extra.revert(); undo3d(); cleanups.forEach((f) => f());
      removeEventListener('load', refresh);
      removeEventListener('mousemove', onSpot); removeEventListener('mousemove', onGlow);
      document.removeEventListener('click', onAnchor);
      if (lenis) { gsap.ticker.remove(raf); lenis.destroy(); window.__lenis = null; }
    };
  }, []);

  return (
    <div ref={root}>
      <Loader />
      <Cursor />
      <Header />
      <SideNav />
      <main>
        <Hero />
        <Marquee />
        <Statement />
        <Applications onPick={setFilter} />
        <ImageBand />
        <Process />
        <Products filter={filter} setFilter={setFilter} onOpen={setQuick} />
        <BatteryFinder />
        <Why />
        <Compare />
        <Testimonials />
        <Faq />
        <Cta />
        <Contact />
      </main>
      <Footer />
      <ProductModal product={quick} onClose={closeQuick} />
    </div>
  );
}
