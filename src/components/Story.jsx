import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Battery3D from './Battery3D.jsx';
import { HERO_LINEUP } from '../data.js';
import { cutoutCropped } from '../lib/cutout.js';

// ============================================================================
// Opening story: one Litpax 60V 32Ah pack stays on screen while four scenes
// change around it.
//   0 hero        — the pack stands on a stone plinth in warm haze, LITPAX behind it
//   1 inside      — the pack grows and drops; five round close-ups ring it
//   2 benefits    — a beige panel rises with a wooden tray that catches the pack
//   3 stage       — a dark stage rises; the pack sinks onto a pedestal and turns
//                   into the live 3D model (battery or inverter)
// Each wheel flick / swipe / arrow key plays one whole, time-based transition.
// After scene 3 the page scrolls on normally into the rest of the site.
// ============================================================================

const BASE = import.meta.env.BASE_URL;
const PACK = `${BASE}products/60v32ah-3-lg.webp`;
const FRONT = `${BASE}model/front-60v32ah.webp`;        // 1024 × 887 front photo of the pack
const PACK_ALT = `${BASE}products/12_8v200ah-3-lg.webp`; // 1200 × 900

// round crops from the real photos: [src, imgW, imgH, centreX, centreY, region]
const crop = ([src, iw, ih, cx, cy, r]) => ({
  backgroundImage: `url("${src}")`,
  backgroundSize: `${(iw / r) * 100}% auto`,
  backgroundPosition: `${((cx - r / 2) / (iw - r)) * 100}% ${((cy - r / 2) / (ih - r)) * 100}%`,
});
const F1 = (cx, cy, r) => [FRONT, 1024, 887, cx, cy, r];

const CHIPS = [
  { name: 'Lithium-ion cells', line: 'Grade-A, matched by hand', img: F1(720, 545, 440), at: [230, 421] },
  { name: '60V · 32Ah', line: 'Power for daily rides', img: F1(150, 545, 230), at: [454, 268] },
  { name: 'Plug-and-play', line: 'Connector fitted at the factory', img: F1(820, 150, 260), at: [720, 196] },
  { name: 'Rugged body', line: 'Sealed lid, steel screws', img: F1(530, 140, 240), at: [988, 278] },
  { name: 'Certified quality', line: 'ISO 9001:2015', img: F1(628, 818, 150), at: [1212, 439] },
];
const ROWS = [
  { h: 'Long life', p: 'Grade-A cells and a Smart BMS keep every pack going, charge after charge.', img: [PACK_ALT, 1200, 900, 600, 470, 640] },
  { h: 'Always protected', p: 'Built-in protection against over-charge, deep discharge and short circuit.', img: F1(790, 340, 330) },
  { h: 'Made in India', p: 'Designed, assembled and tested at our plant in Sirsa, Haryana.', img: F1(458, 818, 92) },
];
const MODELS = ['Battery', 'Inverter'];

// ---- curves (cubic-bezier) ----
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}
const EJ = bezier(0.3, 0, 0.05, 1);   // pack moves
const EP = bezier(0.3, 0, 0.15, 1);   // panels and fades
const EF = bezier(0.25, 0.1, 0.25, 1); // opacity
const EY = bezier(0.5, 0, 0.1, 1);    // delayed drop
const EI = bezier(0.5, 0, 0, 1);      // load intro

const now = () => performance.now();
const ch = (v) => ({ from: v, to: v, t0: 0, dur: 0, ease: EP });
const val = (c, t = now()) => {
  if (!c.dur) return c.to;
  if (t <= c.t0) return c.from;
  const p = Math.min(1, (t - c.t0) / c.dur);
  return c.from + (c.to - c.from) * c.ease(p);
};
const tw = (c, to, dur, ease, delay = 0) => { const t = now(); c.from = val(c, t); c.to = to; c.t0 = t + delay; c.dur = dur; c.ease = ease; };
const snap = (c, to) => { c.from = c.to = to; c.dur = 0; };

export default function Story() {
  const root = useRef(null);
  const els = useRef({});
  const reg = (k) => (el) => { els.current[k] = el; };
  const [jarSrc, setJarSrc] = useState(null);
  const [model, setModel] = useState(0);
  const st = useRef({
    state: 0, R: 900 / 1200, K: null, W: 300, tray: null, vh: 800,
    jx: ch(0), jy: ch(0), jw: ch(0), hero: ch(1), bene: ch(0), out: ch(0), rows: ch(0), scene: ch(0), intro: ch(0),
    timers: [], locked: false, dark: false,
  });

  // the pack photo, cut out of its white background and cropped tight
  useEffect(() => {
    let live = true;
    cutoutCropped(PACK).then((r) => { if (!live) return; st.current.R = r.h / r.w; setJarSrc(r.url); })
      .catch(() => live && setJarSrc(PACK));
    return () => { live = false; };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.add('story-intro');
    const failsafe = setTimeout(() => document.documentElement.classList.remove('story-intro'), 3500);
    return () => { clearTimeout(failsafe); document.documentElement.classList.remove('story-intro'); };
  }, []);

  useEffect(() => {
    const S = st.current, E = els.current, rootEl = root.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setv = (k, v) => rootEl.style.setProperty(k, typeof v === 'number' ? `${v}px` : v);

    // ---------------- layout ----------------
    const layout = () => {
      const vw = rootEl.clientWidth, vh = rootEl.clientHeight;
      S.vh = vh;
      const s = Math.max(vw / 1440, vh / 900), fl = (vw - 1440 * s) / 2, ft = (vh - 900 * s) / 2;
      const c = Math.min(vw / 1440, vh / 900), ul = (vw - 1440 * c) / 2, ut = (vh - 900 * c) / 2;
      const F = (x, y, w) => ({ x: fl + x * s, y: ft + y * s, w: w * s });
      const U = (x, y, w) => ({ x: ul + x * c, y: ut + y * c, w: w * c });
      const portrait = vw / vh < 0.9;
      setv('--s', s); setv('--fl', fl); setv('--ft', ft); setv('--c', c);
      const hd = document.querySelector('.hd-in');
      const navBottom = hd ? hd.getBoundingClientRect().bottom - Math.min(0, rootEl.getBoundingClientRect().top) : 80;
      const R = S.R;

      const K0 = F(720, 490, 290);
      if (portrait) K0.w = Math.min(K0.w, 0.48 * vw);
      rootEl.style.setProperty('--pk', String(K0.w / (290 * s)));   // plinth follows the pack's size
      const K4 = F(720, 697, 183);
      let K1, K2;

      // chips
      const chips = [...rootEl.querySelectorAll('.st-chip')];
      if (!portrait) {
        const D = Math.max(44, 116 * c);
        setv('--chip', D); setv('--cn', Math.max(12, 21 * c)); setv('--cs', Math.max(11, 17.5 * c));
        const kx = Math.max(c, (0.96 * vw) / 1440);
        const dy = Math.max(0, navBottom + 6 - (ut + 196 * c - D / 2));
        CHIPS.forEach((cp, i) => {
          const el = chips[i]; if (!el) return;
          el.style.left = `${vw / 2 + (cp.at[0] - 720) * kx}px`;
          el.style.top = `${ut + cp.at[1] * c + dy}px`;
        });
        K1 = U(720, 1012, 466); K1.y += dy;
        // benefits
        setv('--rt', Math.max(48, 96 * c)); setv('--rh', Math.max(14, 25 * c)); setv('--rp', Math.max(11, 16.5 * c));
        setv('--rg', Math.max(14, 40 * c)); setv('--rw', `${Math.max(200, 330 * c)}px`);
        E.rows.style.cssText = `left:${ul + 915 * c}px;right:auto;top:50%;transform:translateY(-44%)`;
        K2 = U(465, 640, 300);
        // cta
        setv('--th', Math.max(17, 34 * c)); setv('--tf', Math.max(12, 16 * c)); setv('--tb', Math.max(16, 30 * c));
        E.cta.style.top = `${ut + 150 * c}px`;
      } else {
        const D = Math.min(Math.max(58, 0.17 * vw), 96);
        setv('--chip', D);
        setv('--cn', Math.min(Math.max(12, 0.034 * vw), 17)); setv('--cs', Math.min(Math.max(11, 0.029 * vw), 15));
        const top = Math.max(navBottom + 8, 0.06 * vh) + D / 2 + 8;
        const row2 = top + D + Math.max(84, 0.1 * vh);
        const P = [[0.25, row2], [0.2, top + 0.35 * D], [0.5, top], [0.8, top + 0.35 * D], [0.75, row2]];
        P.forEach(([fx, y], i) => { const el = chips[i]; if (!el) return; el.style.left = `${fx * vw}px`; el.style.top = `${y + 0.55 * D}px`; });
        const lastLabel = Math.max(...chips.map((el) => el.getBoundingClientRect().bottom - rootEl.getBoundingClientRect().top));
        const w1 = Math.min(0.72 * vw, 0.42 * vh);
        K1 = { x: vw / 2, y: Math.max(vh + 0.16 * w1 * R, lastLabel + 10 + w1 * R), w: w1 };
        setv('--rt', Math.min(Math.max(48, 0.13 * vw), 76)); setv('--rh', Math.min(Math.max(15, 0.042 * vw), 22));
        setv('--rp', Math.min(Math.max(12, 0.033 * vw), 16)); setv('--rg', Math.min(Math.max(12, 0.022 * vh), 26)); setv('--rw', 'none');
        const side = Math.max(18, 0.06 * vw);
        E.rows.style.cssText = `left:${side}px;right:${side}px;top:${Math.max(navBottom + 8, 0.07 * vh) + 10}px;transform:none`;
        const w2 = Math.min(0.4 * vw, 0.22 * vh);
        K2 = { x: vw / 2, y: 0.8 * vh, w: w2 };
        setv('--th', Math.min(Math.max(16, 0.052 * vw), 34)); setv('--tf', 14); setv('--tb', 20);
        E.cta.style.top = `${Math.max(navBottom + 16, 0.13 * vh)}px`;
      }
      // wooden tray under the pack in scene 2 (stands in for the hand)
      const trW = K2.w * 1.75, trH = trW * 0.2;
      S.tray = { x: K2.x - trW / 2, top: K2.y - trH * 0.42, w: trW };
      E.tray.style.width = `${trW}px`; E.tray.style.height = `${trH}px`;

      S.K = [K0, K1, K2, K4];
      S.W = Math.max(K0.w, K1.w, K2.w, K4.w);
      E.jar.style.width = `${S.W}px`;

      // LITPAX wordmark behind the upper quarter of the pack
      const mk = E.mark;
      mk.style.fontSize = '100px';
      const range = document.createRange(); range.selectNodeContents(mk);
      const w100 = range.getBoundingClientRect().width || 1;
      const target = portrait ? 0.9 * vw : Math.min(960 * s, 0.9 * vw);
      const fs = (target / w100) * 100;
      mk.style.fontSize = `${fs}px`;
      const jarH = K0.w * R, jarTop = K0.y - jarH;
      let capTop = jarTop + 0.25 * jarH - (0.708 * fs) / 2;
      capTop = Math.max(capTop, navBottom + 12);
      mk.style.top = `${capTop - 0.2 * fs}px`;
    };

    // ---------------- render (every frame) ----------------
    let raf = 0, visible = true;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || !S.K) return;
      const t = now();
      const intro = val(S.intro, t) * S.vh;
      const x = val(S.jx, t), y = val(S.jy, t), w = val(S.jw, t);
      E.jar.style.transform = `translate3d(${x - S.W / 2}px, ${y - S.W * S.R + intro}px, 0) scale(${w / S.W})`;
      const hero = val(S.hero, t);
      E.hero.style.opacity = hero;
      E.heroFrame.style.transform = `translate3d(0, ${intro}px, 0) scale(${1 + (1 - hero) * 0.06})`;
      const bene = val(S.bene, t), out = val(S.out, t);
      E.bene.style.transform = `translate3d(0, ${(1 - bene) * 100}%, 0)`;
      const tr = S.tray;
      E.tray.style.transform = `translate3d(${tr.x - out * (tr.x + 1.05 * tr.w)}px, ${tr.top + (1 - bene) * S.vh}px, 0)`;
      E.rows.style.opacity = val(S.rows, t);
      const scene = val(S.scene, t);
      E.scene.style.transform = `translate3d(0, ${(1 - scene) * 100}%, 0)`;
      const dark = scene > 0.96;
      if (dark !== S.dark) {
        S.dark = dark;
        if (dark) rootEl.setAttribute('data-theme', 'dark'); else rootEl.removeAttribute('data-theme');
        dispatchEvent(new Event('scroll'));
      }
    };

    // ---------------- scenes ----------------
    const cls = (el, on) => el.classList.toggle('on', on);
    const later = (ms, fn) => S.timers.push(setTimeout(fn, ms));
    const jarTo = (k, dur = 1150) => { tw(S.jx, k.x, dur, EJ); tw(S.jy, k.y, dur, EJ); tw(S.jw, k.w, dur, EJ); };
    const go = (n, instant = reduce) => {
      n = Math.max(0, Math.min(3, n));
      const prev = S.state;
      S.state = n;
      rootEl.dataset.state = n;
      S.timers.forEach(clearTimeout); S.timers = [];
      const K = S.K;
      if (instant) {
        const k = K[n === 3 ? 3 : n];
        snap(S.jx, k.x); snap(S.jy, k.y); snap(S.jw, k.w);
        snap(S.hero, n === 0 ? 1 : 0); snap(S.bene, n >= 2 ? 1 : 0); snap(S.out, n === 3 ? 1 : 0);
        snap(S.rows, n === 2 ? 1 : 0); snap(S.scene, n === 3 ? 1 : 0);
        cls(E.ingr, n === 1); cls(E.bene, n === 2); cls(E.scene, n === 3); rootEl.classList.toggle('show3d', n === 3);
        return;
      }
      const fwd = n > prev;
      if (n !== 3) { cls(E.scene, false); rootEl.classList.remove('show3d'); }
      if (n !== 2) cls(E.bene, false);
      if (n !== 1) cls(E.ingr, false);
      if (n === 0) {
        jarTo(K[0]); tw(S.hero, 1, 700, EP); tw(S.bene, 0, 650, EP); tw(S.out, 0, 650, EP); tw(S.rows, 0, 400, EF); tw(S.scene, 0, 650, EP);
      } else if (n === 1) {
        jarTo(K[1]); tw(S.hero, 0, 700, EP); tw(S.bene, 0, 650, EP); tw(S.out, 0, 650, EP); tw(S.rows, 0, 400, EF); tw(S.scene, 0, 650, EP);
        later(fwd ? 1000 : 600, () => cls(E.ingr, true));
      } else if (n === 2) {
        jarTo(K[2]); tw(S.hero, 0, 700, EP); tw(S.bene, 1, 650, EP); tw(S.scene, 0, 650, EP);
        if (prev === 3) { tw(S.out, 0, 650, EP, 150); tw(S.rows, 1, 500, EF, 300); } else { snap(S.out, 0); tw(S.rows, 1, 500, EF); }
        later(prev === 3 ? 350 : 550, () => cls(E.bene, true));
      } else {
        const k = K[3];
        if (prev === 2) { tw(S.jx, k.x, 700, EJ); tw(S.jy, k.y, 1600, EY); tw(S.jw, k.w, 1600, EJ); } else jarTo(k);
        tw(S.hero, 0, 700, EP); tw(S.out, 1, 600, EP); tw(S.rows, 0, 400, EF); tw(S.scene, 1, 650, EP, 350);
        later(1350, () => cls(E.scene, true));
        later(1700, () => rootEl.classList.add('show3d'));
      }
    };
    window.litpaxStory = { go: (n, instant) => go(n, instant), get state() { return S.state; } };

    // ---------------- input: one gesture = one scene ----------------
    let lockUntil = 0, acc = 0, lastWheel = 0, prevD = 0, needFresh = false;
    const atTop = () => scrollY <= 2;
    const step = (d) => {
      const n = S.state + d;
      if (n < 0 || n > 3) return;
      go(n);
      lockUntil = now() + 1000;
      needFresh = true;
    };
    const onWheel = (e) => {
      if (!atTop() || e.ctrlKey) return;
      const d = e.deltaY;
      if (!d) return;
      const t = now();
      const fresh = t - lastWheel > 160 || Math.abs(d) > 1.6 * Math.abs(prevD) + 4;
      lastWheel = t; prevD = d;
      if (fresh) { acc = 0; needFresh = false; }
      const down = d > 0;
      // after the last scene, a fresh downward gesture scrolls the page as usual
      if (down && S.state >= 3 && t > lockUntil && !needFresh) return;
      if (!down && S.state <= 0) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (t < lockUntil || needFresh) return;
      acc += d;
      if (Math.abs(acc) > 24) { const dir = Math.sign(acc); acc = 0; step(dir); }
    };
    let ty0 = null;
    const onTouchStart = (e) => { ty0 = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (ty0 == null || !atTop()) return;
      const dy = ty0 - e.touches[0].clientY;
      if ((dy > 0 && S.state < 3) || (dy < 0 && S.state > 0) || now() < lockUntil) e.preventDefault();
    };
    const onTouchEnd = (e) => {
      if (ty0 == null || !atTop()) { ty0 = null; return; }
      const dy = ty0 - e.changedTouches[0].clientY; ty0 = null;
      if (Math.abs(dy) < 40 || now() < lockUntil) return;
      if (dy > 0 && S.state < 3) step(1);
      else if (dy < 0 && S.state > 0) step(-1);
    };
    const onKey = (e) => {
      if (!atTop() || e.target.closest?.('input, textarea, select')) return;
      const k = e.key;
      let d = 0;
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') d = S.state < 3 ? 1 : 0;
      else if (k === 'ArrowUp' || k === 'PageUp') d = S.state > 0 ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      if (now() >= lockUntil) step(d);
    };
    addEventListener('wheel', onWheel, { passive: false, capture: true });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: false });
    addEventListener('touchend', onTouchEnd, { passive: true });
    addEventListener('keydown', onKey);

    // ---------------- start ----------------
    const onResize = () => { layout(); go(S.state, true); };
    layout();
    go(0, true);
    addEventListener('resize', onResize);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      document.documentElement.classList.toggle('at-hero', e.intersectionRatio > 0.6);
    }, { threshold: [0, 0.6] });
    io.observe(rootEl);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); S.timers.forEach(clearTimeout);
      removeEventListener('wheel', onWheel, { capture: true });
      removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove); removeEventListener('touchend', onTouchEnd);
      removeEventListener('keydown', onKey); removeEventListener('resize', onResize);
      document.documentElement.classList.remove('at-hero');
      delete window.litpaxStory;
    };
  }, []);

  // load intro, once the pack cut-out and the fonts are ready
  useEffect(() => {
    if (!jarSrc) return;
    const S = st.current;
    let cancelled = false;
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (cancelled) return;
      dispatchEvent(new Event('resize'));
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) { snap(S.intro, 0.276); tw(S.intro, 0, 1600, EI); }
      document.documentElement.classList.remove('story-intro');
    });
    return () => { cancelled = true; };
  }, [jarSrc]);

  return (
    <section className="story" id="top" ref={root} data-state="0" aria-label="Litpax lithium battery">
      {/* 0 · hero */}
      <div className="st-layer st-hero" ref={reg('hero')}>
        <div className="st-frame" ref={reg('heroFrame')}>
          <div className="st-haze" />
          <i className="st-mist m1" /><i className="st-mist m2" /><i className="st-mist m3" />
          <div className="st-plinth" />
        </div>
        <h1 className="st-mark" ref={reg('mark')} aria-label="Litpax lithium batteries">LITPAX</h1>
        <p className="st-cue" aria-hidden="true">Scroll to explore <span>↓</span></p>
      </div>

      {/* 1 · inside the pack */}
      <div className="st-layer st-ingr" ref={reg('ingr')} aria-label="What goes into a Litpax pack">
        {CHIPS.map((cp) => (
          <div className="st-chip" key={cp.name}>
            <div className="in-w">
              <span className="st-disc"><i style={crop(cp.img)} /></span>
              <b>{cp.name}</b>
              <small>{cp.line}</small>
            </div>
          </div>
        ))}
      </div>

      {/* 2 · benefits */}
      <div className="st-layer st-bene" ref={reg('bene')}>
        <div className="st-rows" ref={reg('rows')}>
          {ROWS.map((r) => (
            <div className="st-row" key={r.h}>
              <span className="st-thumb"><i style={crop(r.img)} /></span>
              <div><h3>{r.h}</h3><p>{r.p}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 · dark stage with the pedestal and the live 3D model */}
      <div className="st-layer st-scene" ref={reg('scene')}>
        <div className="st-frame">
          <div className="st-room" />
          <div className="st-beam" />
          <div className="st-table" />
          <div className="st-ped" />
          <div className="st-3d">
            <Battery3D active={model} fallback={HERO_LINEUP.front} alt={`Litpax ${MODELS[model].toLowerCase()}, 3D model — drag to rotate`} />
          </div>
        </div>
        <div className="st-cta" ref={reg('cta')}>
          <h2>BUILT IN SIRSA,<br />READY FOR YOUR ROAD.</h2>
          <a className="st-btn" href="#products">Explore batteries</a>
          <div className="st-switch" role="tablist" aria-label="Choose 3D model">
            {MODELS.map((m, i) => (
              <button key={m} type="button" role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => setModel(i)}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="st-tray" ref={reg('tray')} aria-hidden="true" />
      <img className="st-jar" ref={reg('jar')} src={jarSrc || undefined} alt="Litpax 60V 32Ah lithium battery" draggable="false" />
    </section>
  );
}
