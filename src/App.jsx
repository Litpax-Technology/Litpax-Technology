import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { About, Applications, Cta, Process, Reviews, Ticker } from './components/Sections.jsx';
import InsidePack from './components/InsidePack.jsx';
import Products from './components/Products.jsx';
import BatteryFinder from './components/BatteryFinder.jsx';
import Why from './components/Why.jsx';
import Faq from './components/Faq.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ProductModal from './components/ProductModal.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [filter, setFilter] = useState('all');
  const [quick, setQuick] = useState(null);
  const closeQuick = useCallback(() => setQuick(null), []);
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    document.documentElement.classList.add('js');

    // ---------- smooth scrolling ----------
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = id === '#' || id === '#top' ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      setTimeout(() => lenis.scrollTo(el, { offset: el === 0 ? 0 : -10, duration: 1.4, force: true }), 60);
    };
    document.addEventListener('click', onAnchor);

    const ctx = gsap.context(() => {
      // ---------- hero intro ----------
      gsap.timeline({ delay: 0.15 })
        .from('.hero h1 .ln>span', { yPercent: 110, duration: 1.3, stagger: 0.09, ease: 'expo.out' })
        .from('.h-in', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, '-=1.05')
        .from('.h-stage', { opacity: 0, scale: 0.94, duration: 1.6, ease: 'expo.out' }, 0.2)
        .from('.hd', { y: -30, opacity: 0, duration: 1, ease: 'expo.out' }, 0.1);

      // hero copy drifts up and fades as you leave
      gsap.to('.hero-copy', { yPercent: -10, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });


      // ---------- counters ----------
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const o = { v: 0 }, end = +el.dataset.count;
        gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
      });

      // ---------- process: photo parallax + timeline fills ----------
      gsap.fromTo('#procImg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.proc-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      const steps = gsap.utils.toArray('.step');
      gsap.to('#stepsFill', {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: '#steps', start: 'top 80%', end: 'bottom 55%', scrub: true,
          onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('on', self.progress >= i / steps.length + 0.05 || self.progress > 0.97)),
        },
      });

      // ---------- tiles: subtle image parallax ----------
      gsap.utils.toArray('.tile-img').forEach((img) =>
        gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

      // CTA card scales in
      gsap.fromTo('.cta-card', { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.cta-card', start: 'top bottom', end: 'top 40%', scrub: true } });
    }, root);

    // ---------- reveal on scroll: IntersectionObserver, independent of layout shifts ----------
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${Math.min(k++, 5) * 70}ms`;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    root.current.querySelectorAll('.rv').forEach((el) => io.observe(el));
    // elements added later (e.g. filtered products) — watch the DOM for new .rv nodes
    const mo = new MutationObserver(() => root.current?.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el)));
    mo.observe(root.current, { childList: true, subtree: true });

    const refresh = () => ScrollTrigger.refresh();
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      ctx.revert(); io.disconnect(); mo.disconnect();
      removeEventListener('load', refresh);
      document.removeEventListener('click', onAnchor);
      gsap.ticker.remove(raf); lenis.destroy(); window.__lenis = null;
      document.documentElement.classList.remove('js');
    };
  }, []);

  return (
    <div ref={root}>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <About />
        <InsidePack />
        <Applications onPick={setFilter} />
        <Products filter={filter} setFilter={setFilter} onOpen={setQuick} />
        <BatteryFinder />
        <Process />
        <Why />
        <Reviews />
        <Faq />
        <Cta />
        <Contact />
      </main>
      <Footer />
      <ProductModal product={quick} onClose={closeQuick} />
    </div>
  );
}
