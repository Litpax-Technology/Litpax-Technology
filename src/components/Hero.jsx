import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HERO_LINEUP } from '../data.js';
import Battery3D from './Battery3D.jsx';

// ============================================================================
// Opening of the site, two screens:
//  1. Hero — the 3D models behind misted glass. A red "charge" point wipes a
//     spiral clear while the counter runs to 100%, the clear patch grows over
//     the screen, the headline blurs in and a sunrise turns night into day.
//  2. "From Factory to Every Road" — as it scrolls up, the scene dissolves into
//     white tile by tile and three stat cards rise in.
// Night/day are drawn in CSS, the fog in a canvas, the timing with GSAP.
// ============================================================================

const MODELS = [
  { tab: 'E-Bike battery', name: '60V 32Ah Li-ion pack' },
  { tab: 'Solar inverter', name: '1500W · 12V 120Ah' },
];
const SWITCH_EVERY = 7000;

// ---- preloader (1920 × 1080 comp, fitted like object-fit: cover) ----
const PATH =
  'M919.486 547.507C899.916 481.274 1030.31 451.248 1074.72 498.165C1090.28 514.612 1103.31 591.523 1019.5 625.5' +
  'C927 663 762.922 637.74 788.275 514.612C804.037 438.067 910.59 386.617 961.741 377.257' +
  'C1088.06 354.142 1125.09 413.127 1153 440.379C1230.39 515.943 1236.2 660.976 992.431 730.647' +
  'C831.999 776.5 631.999 620.5 754 448.5';
const CENTER = { x: 958, y: 555 };                  // middle of the wiped patch: origin of the expansion
const OFF_DESK = { x: -94, y: 150 };               // moves the spiral over the 3D model
const OFF_MOB = { x: 0, y: 130 };
const RES = 0.5;                                    // fog canvas resolution
const BRUSH = 300, SWEEP = 1.2, RAMP = 0.35, WIPE_AT = 0.8;
const FOG_BLUR = 17.3, GRAIN_BLUR = 4.2;
const EXPAND_TO = 7;
const LOAD_TIMEOUT = 12000, FONT_TIMEOUT = 3000;

// ---- scene tiles ----
const TILE_DESK = 180, TILE_MOB = 104;

const RING_R = 85.29, RING_L = 2 * Math.PI * RING_R;

const smoothstep = (t) => { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function order(n) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ranks = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  return ranks;
}

// one span per character, for the letter-by-letter reveal
const Chars = ({ text }) => [...text].map((c, i) => (
  <span key={i} data-char="" style={{ display: 'inline-block', whiteSpace: 'pre' }}>{c}</span>
));

const ArrowUR = () => (
  <svg viewBox="0 0 11.8536 11.8536" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    <path d="M11.3536 11.5V0.5H0.353553M11.3536 0.5L0.353553 11.5" />
  </svg>
);
const ArrowL = () => (<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M14 9L9 14L14 19M9 14L19 14" /></svg>);
const ArrowR = () => (<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M14 19L19 14L14 9M19 14H9" /></svg>);

// ---------------------------------------------------------------------------
// Scene: fixed background (night, day, glow, shade) + the white tiles
// ---------------------------------------------------------------------------
function Scene({ on, sectionRef }) {
  const tilesRef = useRef(null);

  useEffect(() => {
    const box = tilesRef.current;
    let tiles = [], rank = [], raf = 0;
    const build = () => {
      box.textContent = '';
      const W = innerWidth, H = innerHeight;
      const size = W >= 1024 ? TILE_DESK : TILE_MOB;
      const cols = Math.ceil(W / size), rows = Math.ceil(H / size);
      tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const el = document.createElement('i');
          const l = Math.round(c * size), t = Math.round(r * size);
          el.style.cssText = `left:${l}px;top:${t}px;width:${Math.round((c + 1) * size) - l + 1}px;height:${Math.round((r + 1) * size) - t + 1}px`;
          box.appendChild(el); tiles.push(el);
        }
      }
      rank = order(tiles.length);
      update();
    };
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const q = clamp(1 - sec.getBoundingClientRect().top / innerHeight, 0, 1);
      const n = tiles.length;
      tiles.forEach((el, i) => {
        const start = 0.2 + (0.55 * rank[i]) / Math.max(1, n - 1);
        el.style.opacity = String(clamp((q - start) / 0.15, 0, 1));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    build();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', build);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', build); };
  }, [sectionRef]);

  return (
    <div className={`hx-scene${on ? ' on' : ''}`} aria-hidden="true">
      <div className="hx-night" />
      <div className="hx-day" />
      <div className="hx-glow" />
      <div className="hx-shade" />
      <div className="hx-tiles" ref={tilesRef} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preloader: misted glass, the charge point wipes a spiral, counter to 100%
// ---------------------------------------------------------------------------
function Preloader({ state, snap, onWiped }) {
  const wrap = useRef(null);
  const canvasRef = useRef(null);
  const orbRef = useRef(null);
  const numRef = useRef(null);
  const pathRef = useRef(null);
  const wipedCb = useRef(onWiped);
  wipedCb.current = onWiped;

  useEffect(() => {
    const cv = canvasRef.current, ctx = cv.getContext('2d');
    const base = document.createElement('canvas'), bctx = base.getContext('2d');
    const hasFilter = 'filter' in CanvasRenderingContext2D.prototype;
    const path = pathRef.current, length = path.getTotalLength(), p2d = new Path2D(PATH);
    const f = { s: 1, ox: 0, oy: 0 };
    let snapV = -2, raf = 0, called = false;
    const off = () => (innerWidth >= 1024 ? OFF_DESK : OFF_MOB);

    const blurDraw = (g, src, x, y, w, h, px, extra = '') => {
      if (hasFilter) { g.filter = `blur(${px}px)${extra}`; g.drawImage(src, x, y, w, h); g.filter = 'none'; return; }
      const t = document.createElement('canvas');
      t.width = Math.max(1, Math.round(w / 12)); t.height = Math.max(1, Math.round(h / 12));
      t.getContext('2d').drawImage(src, 0, 0, t.width, t.height);
      g.drawImage(t, x, y, w, h);
    };
    const build = () => {
      const cw = cv.width, ch = cv.height;
      if (!cw || !ch) return;
      base.width = cw; base.height = ch;
      const gr = bctx.createRadialGradient(cw / 2, ch, 0, cw / 2, ch, Math.hypot(cw / 2, ch));
      gr.addColorStop(0, '#3A3F4C'); gr.addColorStop(0.45, '#1B1F29'); gr.addColorStop(1, '#0B0D12');
      bctx.fillStyle = gr; bctx.fillRect(0, 0, cw, ch);
      const sn = snap.current;                              // the 3D model, blurred behind the glass
      if (sn.canvas && sn.rect) {
        const r = sn.rect;
        blurDraw(bctx, sn.canvas, r.x * RES, r.y * RES, r.w * RES, r.h * RES, FOG_BLUR * f.s * RES, ' brightness(.55) saturate(.6)');
      }
      bctx.fillStyle = 'rgba(217,217,217,.15)'; bctx.fillRect(0, 0, cw, ch);
      const n = document.createElement('canvas'); n.width = cw; n.height = ch;
      const nx = n.getContext('2d'), id = nx.createImageData(cw, ch), d = id.data;
      for (let i = 0; i < d.length; i += 4) if (Math.random() < 0.5) { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 26; }
      nx.putImageData(id, 0, 0);
      blurDraw(bctx, n, 0, 0, cw, ch, GRAIN_BLUR * f.s * RES);
      snapV = sn.v;
    };
    const fit = () => {
      const W = innerWidth, H = innerHeight;
      f.s = Math.max(W / 1920, H / 1080); f.ox = (W - 1920 * f.s) / 2; f.oy = (H - 1080 * f.s) / 2;
      cv.width = Math.round(W * RES); cv.height = Math.round(H * RES);
      build();
    };
    fit();
    addEventListener('resize', fit);

    // entrance: glass fades in, the charge point rises to the glass
    const intro = gsap.timeline();
    intro.fromTo(wrap.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0)
      .fromTo('[data-hand]', { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0);

    const t0 = performance.now();
    let last = t0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      const el = (t - t0) / 1000;
      const w = state.current;
      if (snap.current.v !== snapV) build();

      if (el > WIPE_AT) {
        const speed = (1 / SWEEP) * Math.min(1, (el - WIPE_AT) / RAMP);
        let next = w.shown + speed * dt;
        if (!w.ready) next = Math.min(next, w.loaded * 0.9);
        w.shown = Math.min(1, Math.max(w.shown, next));
      }
      if (numRef.current) numRef.current.textContent = `${String(Math.round(w.shown * 100)).padStart(2, '0')}%`;
      if (w.ready && w.shown >= 1 && !called) { called = true; wipedCb.current(); }
      if (!cv.width || !cv.height) return;

      const o = off();
      const drawn = w.shown * length;
      const p = path.getPointAtLength(drawn);
      if (orbRef.current) orbRef.current.style.transform = `translate(${f.ox + f.s * (p.x + o.x)}px, ${f.oy + f.s * (p.y + o.y)}px)`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0, cv.width, cv.height);
      if (drawn > 0.5) {
        const e = w.expand, k = f.s * e * RES;
        const cx = CENTER.x + o.x, cy = CENTER.y + o.y;
        ctx.setTransform(k, 0, 0, k, (f.ox + f.s * cx * (1 - e)) * RES, (f.oy + f.s * cy * (1 - e)) * RES);
        ctx.translate(o.x, o.y);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = BRUSH * (0.35 + 0.65 * smoothstep(w.shown / 0.2));
        ctx.setLineDash([drawn, length + 1]);
        ctx.shadowColor = '#000';
        ctx.shadowBlur = GRAIN_BLUR * 2 * k;
        ctx.stroke(p2d);
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); intro.kill(); };
  }, [state, snap]);

  return (
    <div className="pl" aria-hidden="true">
      <div className="pl-scene" ref={wrap}>
        <canvas ref={canvasRef} />
        <div className="pl-orb" ref={orbRef}><div className="pl-orb-in" data-hand=""><i /></div></div>
      </div>
      <p className="pl-count">[<span ref={numRef}>00%</span>]</p>
      <svg className="pl-path" width="0" height="0"><path ref={pathRef} d={PATH} /></svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glass card: what powers every pack (three slides, ring draws on change)
// ---------------------------------------------------------------------------
const SLIDES = [
  { t: 'Every pack tested', ring: 100, big: '100%', label: 'Packs tested', m: [['Load test', 'Pass'], ['Capacity test', 'Pass'], ['Safety test', 'Pass']] },
  { t: '60V 32Ah e-bike pack', ring: 83, big: '125', label: 'km+ range*', m: [['Voltage', '60V'], ['Capacity', '32Ah'], ['Protection', 'Smart BMS']] },
  { t: 'Solar inverter', ring: 75, big: '1500', label: 'Watt output', m: [['Battery', '12V 120Ah'], ['Use', 'Homes & shops'], ['Made in', 'Sirsa']] },
];

function LensCard({ armed }) {
  const [i, setI] = useState(0);
  const ring = useRef(null);
  const gid = useId().replace(/:/g, '');
  const s = SLIDES[i];

  useEffect(() => {
    const el = ring.current;
    if (!armed) { el.style.strokeDasharray = `0 ${RING_L}`; return; }
    if (reduced()) { el.style.strokeDasharray = `${(RING_L * s.ring) / 100} ${RING_L}`; return; }
    const o = { v: 0 };
    const tw = gsap.to(o, { v: s.ring, duration: 1.2, ease: 'power2.out', onUpdate: () => { el.style.strokeDasharray = `${(RING_L * o.v) / 100} ${RING_L}`; } });
    return () => tw.kill();
  }, [armed, i, s.ring]);

  const go = (d) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);
  return (
    <aside className="hx-card" data-reveal="card">
      <div className="hc-head">
        <p className="hc-title">What powers every pack</p>
        <hr />
        <div className="hc-row">
          <div className="hc-n"><span>0{i + 1}</span><b>{s.t}</b></div>
          <div className="hc-btns">
            <button type="button" aria-label="Previous" onClick={() => go(-1)}><ArrowL /></button>
            <button type="button" aria-label="Next" onClick={() => go(1)}><ArrowR /></button>
          </div>
        </div>
      </div>
      <div className="hc-body">
        <div className="hc-vis">
          <svg viewBox="0 0 175.694 175.694" aria-hidden="true">
            <defs>
              <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="87.8473" y1="0" x2="19.1388" y2="27.334" gradientTransform="rotate(90 87.847 87.847)">
                <stop stopColor="#FF8A8E" /><stop offset="1" stopColor="#E5484D" />
              </linearGradient>
            </defs>
            <circle cx="87.847" cy="87.847" r="87.847" fill="rgba(255,255,255,.12)" />
            <circle ref={ring} cx="87.847" cy="87.847" r={RING_R} fill="none" stroke={`url(#${gid})`} strokeWidth="5.12"
              transform="rotate(-90 87.847 87.847)" style={{ strokeDasharray: `0 ${RING_L}` }} />
          </svg>
          <div className="hc-score" aria-live="polite"><b>{s.big}</b><span>{s.label}</span></div>
        </div>
        <dl className="hc-m">
          {s.m.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Section 2: From Factory to Every Road
// ---------------------------------------------------------------------------
const CARD_PATH = 'M0 28C0 12.536 12.536 0 28 0H345.455C352.252 0 358.817 2.472 363.925 6.956L438.47 72.386C444.527 77.702 448 85.37 448 93.43V375C448 390.464 435.464 403 420 403H102.545C95.748 403 89.183 400.528 84.075 396.044L9.53 330.614C3.473 325.298 0 317.63 0 309.57V28Z';
const STATS = [
  { v: '200+', t: 'Happy clients across India trust Litpax packs for their daily rides and backup power.', n: '01' },
  { v: '20+', t: 'Service centres and distributors keep every customer close to support and spares.', n: '02' },
  { v: 'ISO', t: '9001:2015 certified quality, with every pack load, capacity and safety tested.', n: '03', hot: true },
];

function StatCard({ v, t, n, hot }) {
  const gid = useId().replace(/:/g, '');
  return (
    <div className={`sc${hot ? ' hot' : ''}`}>
      <svg className="sc-bg" viewBox="0 0 448 403" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {hot
            ? <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="224" y1="0" x2="253.204" y2="400.872"><stop stopColor="#E5484D" /><stop offset="1" stopColor="#F7A3A5" /></linearGradient>
            : <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="224" y1="0" x2="224" y2="403"><stop stopColor="#F6F6F6" /><stop offset="1" stopColor="#EAEAEA" /></linearGradient>}
        </defs>
        <path d={CARD_PATH} fill={`url(#${gid})`} />
      </svg>
      <p className="sc-v">{v}</p>
      <p className="sc-t">{t}</p>
      <p className="sc-n">{n}</p>
    </div>
  );
}

function Clarity({ sref }) {
  useEffect(() => {
    const sec = sref.current;
    const reduce = reduced();
    let done = false, raf = 0, tl;
    const ios = [];
    const rise = (el, at) => gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: at, clearProps: 'transform' });
    const play = () => {
      done = true;
      const all = sec.querySelectorAll('[data-reveal]');
      if (reduce) { tl = gsap.to(all, { opacity: 1, duration: 0.4, ease: 'power1.out' }); return; }
      tl = gsap.timeline();
      tl.set(sec.querySelector('h2'), { opacity: 1 }, 0);
      sec.querySelectorAll('h2 [data-line]').forEach((line) => {
        tl.fromTo(line.querySelectorAll('[data-char]'), { opacity: 0, filter: 'blur(18px)', xPercent: -30 },
          { opacity: 1, filter: 'blur(0px)', xPercent: 0, duration: 0.8, stagger: 0.035, ease: 'power2.out', clearProps: 'filter,transform' }, 0);
      });
      tl.fromTo(sec.querySelector('.cl-p'), { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', clearProps: 'filter' }, 0.45);
      let k = 0;
      sec.querySelectorAll('[data-reveal="clarity-card"]').forEach((c) => {
        if (c.getBoundingClientRect().top < innerHeight) { tl.add(rise(c, 0), 0.6 + 0.2 * k++); return; }
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { rise(c, 0); io.disconnect(); } }, { threshold: 0.15 });
        io.observe(c); ios.push(io);
      });
    };
    const check = () => { raf = 0; if (!done && sec.getBoundingClientRect().top <= innerHeight * 0.1) play(); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    check();
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); ios.forEach((o) => o.disconnect()); tl?.kill(); };
  }, [sref]);

  return (
    <section className="hx2" id="promise" ref={sref}>
      <h2 className="cl-h" aria-label="From Factory to Every Road" data-reveal="clarity-headline">
        <span className="hx-line" data-line="" aria-hidden="true"><Chars text="From " /><span className="hx-serif"><Chars text="Factory" /></span></span>
        <span className="hx-line cl-red" data-line="" aria-hidden="true"><Chars text="to Every Road" /></span>
      </h2>
      <p className="cl-p" data-reveal="clarity-text">Every Litpax pack starts with Grade-A cells, a Smart BMS and a rugged body, and is load, capacity and safety tested before it leaves our line in Sirsa. Then it goes to work on e-bikes, e-rickshaws, rooftops and telecom towers across India.</p>
      <div className="cl-cards">
        {STATS.map((s) => <div key={s.n} className="cl-cw" data-reveal="clarity-card"><StatCard {...s} /></div>)}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export default function Hero() {
  const hero = useRef(null);
  const stage = useRef(null);
  const clarity = useRef(null);
  const state = useRef({ loaded: 0, ready: false, shown: 0, expand: 1 });
  const snap = useRef({ canvas: null, rect: null, v: -1, want: true });
  const load = useRef({ model: 0, fonts: 0, done: null });

  const [reduce] = useState(reduced);
  const [pre, setPre] = useState(!reduce);         // preloader mounted
  const [wiped, setWiped] = useState(false);
  const [armed, setArmed] = useState(false);       // lens card ring may draw
  const [model, setModel] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setModel((m) => (m + 1) % MODELS.length), SWITCH_EVERY);
    return () => clearTimeout(id);
  }, [model, round, reduce]);
  const pick = (i) => { setModel(i); setRound((r) => r + 1); };

  // before first paint: header hidden, start at the top, no scrolling during the preloader
  useLayoutEffect(() => {
    const hd = document.querySelector('.hd-in');
    if (hd) gsap.set(hd, { opacity: 0 });
    const html = document.documentElement;
    let t;
    if (!reduce) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      scrollTo(0, 0);
      html.style.overflow = 'hidden';
      t = setTimeout(() => window.__lenis?.stop(), 0);
    } else {
      html.style.setProperty('--sun', '1');
    }
    return () => { clearTimeout(t); html.style.overflow = ''; if (hd) gsap.set(hd, { clearProps: 'opacity,filter' }); };
  }, [reduce]);

  // loading: fonts + the 3D models → ready
  useEffect(() => {
    let dead = false;
    const st = state.current, L = load.current;
    const upd = () => { st.loaded = Math.max(st.loaded, L.model * 0.8 + L.fonts * 0.2); };
    const modelReady = new Promise((r) => { L.done = r; });
    const fonts = Promise.race([
      Promise.all([
        document.fonts.load('400 1em "Instrument Sans"'),
        document.fonts.load('500 1em "Instrument Sans"'),
        document.fonts.load('italic 400 1em "Instrument Serif"'),
      ]),
      new Promise((r) => setTimeout(r, FONT_TIMEOUT)),
    ]).catch(() => {}).then(() => { L.fonts = 1; upd(); });
    L.progress = (p) => { L.model = p; upd(); };
    Promise.all([Promise.race([modelReady, new Promise((r) => setTimeout(r, LOAD_TIMEOUT))]), fonts]).then(() => {
      if (dead) return;
      st.loaded = 1; st.ready = true;
      if (reduce) {
        const els = [document.querySelector('.hd-in'), ...hero.current.querySelectorAll('[data-reveal]')].filter(Boolean);
        gsap.to(els, { opacity: 1, duration: 0.4, ease: 'power1.out' });
        hero.current.classList.add('lit');
        setArmed(true);
      }
    });
    return () => { dead = true; };
  }, [reduce]);

  // keep the WhatsApp bubble away while the hero fills the screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => document.documentElement.classList.toggle('at-hero', e.intersectionRatio > 0.6), { threshold: [0, 0.6] });
    io.observe(hero.current);
    return () => { io.disconnect(); document.documentElement.classList.remove('at-hero'); };
  }, []);

  // the intro, once the spiral is wiped (t = 0)
  useEffect(() => {
    if (!wiped) return;
    const html = document.documentElement;
    const unlock = () => { html.style.overflow = ''; window.__lenis?.start(); };
    const ctx = gsap.context(() => {
      const q = (s) => hero.current.querySelectorAll(s);
      const hd = document.querySelector('.hd-in');
      const glow = document.querySelector('.hx-glow');
      const tl = gsap.timeline();
      const blurIn = (el, at) => tl.fromTo(el, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', clearProps: 'filter' }, at);
      tl.to('[data-hand]', { y: '+=900', duration: 0.55, ease: 'power2.in' }, 0)
        .to('.pl-count', { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.1);
      if (hd) tl.fromTo(hd, { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', clearProps: 'filter' }, 0.2);
      tl.to(state.current, { expand: EXPAND_TO, duration: 0.7, ease: 'power2.in', onComplete: () => { setPre(false); unlock(); } }, 0.3);
      tl.set(q('.hx-h1'), { opacity: 1 }, 0.75);
      q('.hx-h1 [data-line]').forEach((line) => {
        tl.fromTo(line.querySelectorAll('[data-char]'), { opacity: 0, filter: 'blur(18px)', xPercent: -30 },
          { opacity: 1, filter: 'blur(0px)', xPercent: 0, duration: 0.8, stagger: 0.035, ease: 'power2.out', clearProps: 'filter,transform' }, 0.75);
      });
      blurIn(q('.hx-lead'), 1.3);
      blurIn(q('.hx-demo'), 1.5);
      if (glow) tl.to(glow, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 1.6).to(glow, { opacity: 0, duration: 0.9, ease: 'power1.inOut' }, 2.05);
      tl.fromTo(html, { '--sun': 0 }, { '--sun': 1, duration: 1.1, ease: 'power2.inOut', onComplete: () => hero.current?.classList.add('lit') }, 1.75);
      tl.fromTo(q('.hx-card'), { opacity: 0, filter: 'blur(10px)', yPercent: 6 }, { opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 0.7, ease: 'power2.out', clearProps: 'filter,transform' }, 1.9);
      blurIn(q('.hx-discover, .hx-switch'), 1.95);
      tl.call(() => setArmed(true), null, 2.1);
    });
    return () => { ctx.revert(); unlock(); };
  }, [wiped]);

  // the first 3D frame is copied once, so the fog can show the model blurred behind the glass
  const onFrame = (gl) => {
    const sn = snap.current;
    if (!sn.want || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const c = sn.canvas || document.createElement('canvas');
    c.width = Math.max(1, Math.round(r.width / 2)); c.height = Math.max(1, Math.round(r.height / 2));
    c.getContext('2d').drawImage(gl, 0, 0, c.width, c.height);
    sn.canvas = c; sn.rect = { x: r.left, y: r.top, w: r.width, h: r.height }; sn.v++; sn.want = false;
  };

  return (
    <>
      <Scene on sectionRef={clarity} />
      {pre && <Preloader state={state} snap={snap} onWiped={() => setWiped(true)} />}

      <section className="hx" id="top" data-theme="dark" ref={hero}>
        <h1 className="hx-h1" aria-label="Power Beyond Every Limit" data-reveal="headline">
          <span className="hx-line" data-line="" aria-hidden="true"><Chars text="Power " /><span className="hx-serif"><Chars text="Beyond" /></span></span>
          <span className="hx-line hx-l2" data-line="" aria-hidden="true"><Chars text="Every Limit" /></span>
        </h1>

        <div className="hx-lead" data-reveal="lead">
          <p>Lithium-ion and LFP battery packs for e-bikes, e-rickshaws, solar homes and telecom.</p>
          <p>Designed, built and tested in-house in Sirsa, so every pack delivers the power it promises.</p>
        </div>
        <div className="hx-ctas">
          <a className="hx-demo" href="#products" data-reveal="demo"><span>Explore batteries</span><i><ArrowUR /></i></a>
        </div>

        <div className="hx-stage" ref={stage}>
          <Battery3D active={model} fallback={HERO_LINEUP.front}
            alt={`Litpax ${MODELS[model].tab}, ${MODELS[model].name}, 3D model — drag to rotate`}
            onProgress={(p) => load.current.progress?.(p)}
            onReady={() => load.current.done?.()}
            onFrame={onFrame} />
        </div>
        <div className="hx-switch" role="tablist" aria-label="Choose product" data-reveal="switch">
          {MODELS.map((m, i) => (
            <button key={m.tab} role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => pick(i)}>
              {m.tab}
              {model === i && !reduce && <i key={`${model}-${round}`} style={{ animationDuration: `${SWITCH_EVERY}ms` }} />}
            </button>
          ))}
        </div>

        <LensCard armed={armed} />

        <a className="hx-discover" href="#promise" data-reveal="discover"><span className="hx-down" aria-hidden="true">↓</span>Discover more</a>
      </section>

      <Clarity sref={clarity} />
    </>
  );
}
