import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { About, Applications, Brands, Certifications, Cta, Process, Reviews, Ticker } from './components/Sections.jsx';
import PackTour from './components/PackTour.jsx';
import Products from './components/Products.jsx';
import BatteryFinder from './components/BatteryFinder.jsx';
import Why from './components/Why.jsx';
import Faq from './components/Faq.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ProductModal from './components/ProductModal.jsx';
import Loader from './components/Loader.jsx';

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
      gsap.timeline({ delay: 1.55 })   // starts as the loader curtain lifts
        .from('.hero h1 .ln>span', { yPercent: 110, duration: 1.3, stagger: 0.09, ease: 'expo.out' })
        .from('.h-in', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, '-=1.05')
        .from('.h-stage', { opacity: 0, scale: 0.94, duration: 1.6, ease: 'expo.out' }, 0.2);

      // hero headline drifts apart as you leave
      gsap.to('.hero-title .l1', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-title .l3', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });


      // ---------- counters ----------
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const o = { v: 0 }, end = +el.dataset.count;
        gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
      });

      // ---------- process: photo parallax + timeline fills ----------
      gsap.fromTo('#procImg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.proc-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      const steps = gsap.utils.toArray('.step');
      ScrollTrigger.create({
        trigger: '#steps', start: 'top 75%', end: 'bottom 45%',
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('on', self.progress >= i / steps.length + 0.05 || self.progress > 0.97)),
      });

      // CTA headline slides in from the side
      gsap.fromTo('.cta-t', { xPercent: -8 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 30%', scrub: true } });
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
    root.current.querySelectorAll('.rv, .rv-img').forEach((el) => io.observe(el));
    // elements added later (e.g. filtered products) — watch the DOM for new .rv nodes
    const mo = new MutationObserver(() => root.current?.querySelectorAll('.rv:not(.in), .rv-img:not(.in)').forEach((el) => io.observe(el)));
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
      <Loader />
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Brands />
        <About />
        <PackTour />
        <Applications onPick={setFilter} />
        <Products filter={filter} setFilter={setFilter} onOpen={setQuick} />
        <BatteryFinder />
        <Process />
        <Why />
        <Certifications />
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
