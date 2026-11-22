import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HERO_LINEUP } from '../data.js';
import Battery3D from './Battery3D.jsx';

// Full-screen hero: the two real-time 3D models (EV pack + solar inverter) float
// over a graphite gradient. The model is "switched off" (graphite monochrome) and
// charges up to full colour wherever the cursor moves, then fades back. Opens with
// a pixelated, zoomed-in preloader that counts to 100% while the model sharpens.
//
// How: Battery3D renders WebGL into a hidden canvas and hands every frame to
// onFrame; we copy it, then compose bare + colour-through-cursor-mask on a 2D
// canvas, pixelated while the intro runs.

const MODELS = [
  { tab: 'E-Bike battery', name: '60V 32Ah Li-ion pack' },
  { tab: 'Solar inverter', name: '1500W · 12V 120Ah' },
];
const SWITCH_EVERY = 7000;

// ---- motion constants ----
const ZOOM_FROM = 2.6, ZOOM_DUR = 0.9;
const PIXEL_FROM = 6, PIXEL_DUR = 1.0;          // log2(64 px) → log2(1 px)
const COUNT_DUR = 0.8, COUNT_FADE_AT = 0.85, COUNT_FADE = 0.4;
const BRUSH = 240, FADE = 1.1, STEP = 0.12;     // design px, seconds, × radius
const MOVE_STRENGTH = 0.5, REST_STRENGTH = 0.25, REST_MS = 50, MIN_ALPHA = 0.004;
const FONT_TIMEOUT = 3000, LOAD_TIMEOUT = 12000;
const BARE_FILTER = 'grayscale(1) brightness(.82) contrast(1.08)';

const LINE1 = 'Pure energy,';
const LINE2 = 'built to last.';

const chars = (s) => [...s].map((c, i) => <span key={i} className="hx-ch">{c}</span>);

export default function Hero() {
  const hero = useRef(null);
  const cv = useRef(null);
  const stage = useRef(null);
  const probe = useRef(null);
  const counter = useRef(null);
  const num = useRef(null);
  const cursor = useRef(null);
  const intro = useRef({ zoom: ZOOM_FROM, pixel: PIXEL_FROM });
  const frame = useRef({ copy: null, has: false });        // latest 3D frame, copied
  const load = useRef({ progress: () => {}, ready: () => {} });

  const [model, setModel] = useState(0);
  const [round, setRound] = useState(0);
  const [mirror, setMirror] = useState(true);            // false if WebGL failed → photo fallback shows

  // auto-switch between the two models until the visitor picks one
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setModel((m) => (m + 1) % MODELS.length), SWITCH_EVERY);
    return () => clearTimeout(id);
  }, [model, round]);
  const pick = (i) => { setModel(i); setRound((r) => r + 1); };

  // the header is part of the intro: hide it before the first paint
  useLayoutEffect(() => {
    const hd = document.querySelector('.hd-in');
    if (hd) gsap.set(hd, { opacity: 0 });
    return () => { if (hd) gsap.set(hd, { clearProps: 'opacity,filter' }); };
  }, []);

  // ---------------- load → intro timeline (M1 + M2) ----------------
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dead = false, tl;
    const st = intro.current;
    const shown = { v: 0 };
    const paint = () => { if (num.current) num.current.textContent = String(Math.round(shown.v * 100)).padStart(2, '0'); };
    const follow = gsap.quickTo(shown, 'v', { duration: 0.4, ease: 'power1.out', onUpdate: paint });
    let best = 0;
    load.current.progress = (p) => { const v = p * 0.9; if (v > best) { best = v; follow(v); } };
    let resolveModel;
    const modelReady = new Promise((r) => { resolveModel = r; });
    load.current.ready = (ok) => { if (!ok) setMirror(false); resolveModel(); };

    if (reduce) { st.zoom = 1; st.pixel = 0; }

    const fonts = Promise.race([
      Promise.all([
        document.fonts.load('italic 400 1em "Instrument Serif"'),
        document.fonts.load('400 1em "Instrument Sans"'),
        document.fonts.load('500 1em "Instrument Sans"'),
      ]),
      new Promise((r) => setTimeout(r, FONT_TIMEOUT)),
    ]).catch(() => {});
    const model3d = Promise.race([modelReady, new Promise((r) => setTimeout(r, LOAD_TIMEOUT))]);

    Promise.all([model3d, fonts]).then(() => {
      if (dead) return;
      const q = (s) => hero.current.querySelectorAll(s);
      const hd = document.querySelector('.hd-in');
      const revealEls = [hd, ...q('.hx-h1, .hx-lead, .hx-bar, .hx-para, .hx-cta, .hx-switch')].filter(Boolean);

      if (reduce) {
        tl = gsap.timeline().to(revealEls, { opacity: 1, duration: 0.4, ease: 'power1.out' });
        return;
      }
      const blurIn = (el, at, from = 10, dur = 0.6) =>
        tl.fromTo(el, { opacity: 0, filter: `blur(${from}px)` }, { opacity: 1, filter: 'blur(0px)', duration: dur, ease: 'power2.out', clearProps: 'filter' }, at);

      tl = gsap.timeline();
      tl.to(shown, { v: 1, duration: COUNT_DUR, ease: 'power1.out', onUpdate: paint, overwrite: true }, 0)
        .to(st, { zoom: 1, duration: ZOOM_DUR, ease: 'expo.out' }, 0)
        .to(st, { pixel: 0, duration: PIXEL_DUR, ease: 'none' }, 0)
        .to(counter.current, { opacity: 0, duration: COUNT_FADE, ease: 'power1.in' }, COUNT_FADE_AT);
      if (hd) blurIn(hd, 1.0, 8, 0.5);
      tl.set(q('.hx-h1'), { opacity: 1 }, 1.3);
      q('.hx-line').forEach((line) => {
        tl.fromTo(line.children, { opacity: 0, filter: 'blur(18px)', xPercent: -30 },
          { opacity: 1, filter: 'blur(0px)', xPercent: 0, duration: 0.8, stagger: 0.035, ease: 'power2.out', clearProps: 'filter,transform' }, 1.3);
      });
      blurIn(q('.hx-lead'), 2.1);
      blurIn(q('.hx-switch'), 2.3);
      blurIn(q('.hx-bar'), 2.5);
      blurIn(q('.hx-para'), 2.7);
      blurIn(q('.hx-cta'), 2.85);
    });

    return () => { dead = true; tl?.kill(); gsap.killTweensOf(shown); };
  }, []);

  // ---------------- 2D compositor: zoom, pixelation, charge mask, cursor (M1 + M3 + M4) ----------------
  useEffect(() => {
    const el = hero.current, canvas = cv.current;
    const ctx = canvas.getContext('2d');
    const mk = () => document.createElement('canvas');
    const copy = mk(), cctx = copy.getContext('2d');
    const mask = mk(), mctx = mask.getContext('2d');
    const layer = mk(), lctx = layer.getContext('2d');
    const scene = mk(), sctx = scene.getContext('2d');
    const small = mk(), smctx = small.getContext('2d');
    const brush = mk();
    const touch = matchMedia('(hover: none)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const canFilter = 'filter' in sctx;

    let W = 0, H = 0, dpr = 1, u = 1, r = 1;
    let box = { x: 0, y: 0, w: 0, h: 0 };                  // the 3D stage, CSS px relative to the hero
    let stamps = [];
    const ptr = { in: false, cx: -9999, cy: -9999, moved: false, lastX: 0, lastY: 0, travel: 0, fresh: true, lastMove: 0, lastRest: 0 };
    const cur = { x: 0, y: 0, shown: false, placed: false };

    // copy every rendered WebGL frame before the browser clears it
    frame.current.copy = (gl) => {
      const w = Math.max(1, Math.round(box.w * dpr)), h = Math.max(1, Math.round(box.h * dpr));
      if (copy.width !== w || copy.height !== h) { copy.width = w; copy.height = h; }
      cctx.clearRect(0, 0, w, h);
      cctx.drawImage(gl, 0, 0, w, h);
      frame.current.has = true;
    };

    const resize = () => {
      W = el.clientWidth; H = el.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 2);
      u = probe.current.getBoundingClientRect().width / 100 || 1;
      const hb = el.getBoundingClientRect(), sb = stage.current.getBoundingClientRect();
      box = { x: sb.left - hb.left, y: sb.top - hb.top, w: sb.width, h: sb.height };
      for (const c of [canvas, layer, scene]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      mask.width = Math.max(1, Math.round(W / 2)); mask.height = Math.max(1, Math.round(H / 2));
      r = Math.max(1, Math.round(BRUSH * u * 0.5));
      brush.width = brush.height = r * 2;
      const b = brush.getContext('2d');
      const g = b.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, '#000'); g.addColorStop(0.45, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = g; b.fillRect(0, 0, r * 2, r * 2);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el); ro.observe(stage.current);

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.in = true; ptr.moved = true; ptr.lastMove = performance.now();
    };
    const onOut = (e) => { if (!e.relatedTarget) { ptr.in = false; ptr.fresh = true; } };
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onOut);

    // pause off-screen; keep the WhatsApp bubble away while the hero fills the screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      document.documentElement.classList.toggle('at-hero', e.intersectionRatio > 0.6);
    }, { threshold: [0, 0.6] });
    io.observe(el);

    let raf = 0, lastT = performance.now();
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(100, t - lastT); lastT = t;
      if (!visible || !W || !H || !canvas.width || !mask.width) return;
      const now = t / 1000;
      const hb = el.getBoundingClientRect();
      const px = ptr.cx - hb.left, py = ptr.cy - hb.top;
      const over = ptr.in && px >= 0 && py >= 0 && px <= W && py <= H;

      // --- stamps: along the path while moving, steady while resting ---
      if (ptr.in) {
        if (ptr.fresh) { ptr.lastX = px; ptr.lastY = py; ptr.travel = 0; ptr.fresh = false; stamps.push({ x: px, y: py, s: MOVE_STRENGTH, born: now }); }
        if (ptr.moved) {
          const step = BRUSH * u * STEP;
          const dx = px - ptr.lastX, dy = py - ptr.lastY, dist = Math.hypot(dx, dy);
          if (dist > 0) {
            for (let d = step - ptr.travel; d <= dist; d += step) stamps.push({ x: ptr.lastX + (dx * d) / dist, y: ptr.lastY + (dy * d) / dist, s: MOVE_STRENGTH, born: now });
            ptr.travel = (ptr.travel + dist) % step;
          }
          ptr.lastX = px; ptr.lastY = py; ptr.moved = false;
        } else if (t - ptr.lastMove > REST_MS && t - ptr.lastRest > REST_MS) {
          stamps.push({ x: px, y: py, s: REST_STRENGTH, born: now }); ptr.lastRest = t;
        }
      }

      // --- mask, redrawn from the stamp list every frame ---
      mctx.clearRect(0, 0, mask.width, mask.height);
      stamps = stamps.filter((s) => {
        const a = s.s * Math.exp(-(now - s.born) / FADE);
        if (a < MIN_ALPHA) return false;
        mctx.globalAlpha = a;
        mctx.drawImage(brush, s.x * 0.5 - r, s.y * 0.5 - r);
        return true;
      });
      mctx.globalAlpha = 1;

      // --- compose: graphite model + colour model through the mask ---
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.clearRect(0, 0, scene.width, scene.height);
      if (frame.current.has) {
        const { zoom } = intro.current;
        const w = box.w * zoom, h = box.h * zoom;
        const x0 = box.x + box.w / 2 - w / 2, y0 = box.y + box.h / 2 - h / 2;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (touch.matches) {
          sctx.drawImage(copy, x0, y0, w, h);         // phones: full colour, no mask
        } else {
          lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          lctx.clearRect(0, 0, W, H);
          lctx.drawImage(copy, x0, y0, w, h);
          lctx.globalCompositeOperation = 'destination-in';
          lctx.drawImage(mask, 0, 0, W, H);
          lctx.globalCompositeOperation = 'source-over';
          if (canFilter) sctx.filter = BARE_FILTER;
          sctx.drawImage(copy, x0, y0, w, h);
          if (canFilter) sctx.filter = 'none';
          sctx.setTransform(1, 0, 0, 1, 0, 0);
          sctx.drawImage(layer, 0, 0);
        }
      }

      // --- to screen, pixelated while the intro runs ---
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const block = Math.pow(2, intro.current.pixel);
      if (block > 1.01) {
        const sw = Math.ceil(W / block), sh = Math.ceil(H / block);
        if (small.width !== sw || small.height !== sh) { small.width = sw; small.height = sh; }
        smctx.clearRect(0, 0, sw, sh);
        smctx.drawImage(scene, 0, 0, sw * block * dpr, sh * block * dpr, 0, 0, sw, sh);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, 0, 0, sw, sh, 0, 0, sw * block * dpr, sh * block * dpr);
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.drawImage(scene, 0, 0);
      }

      // --- custom cursor: eases 30% of the way per 60 fps frame ---
      const c = cursor.current;
      if (c && fine.matches) {
        if (over && !cur.placed) { cur.x = ptr.cx; cur.y = ptr.cy; cur.placed = true; }
        const k = 1 - Math.pow(0.7, dt / 16.67);
        cur.x += (ptr.cx - cur.x) * k; cur.y += (ptr.cy - cur.y) * k;
        c.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
        if (over !== cur.shown) { cur.shown = over; c.style.opacity = over ? '1' : '0'; }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.classList.remove('at-hero');
      frame.current.copy = null; frame.current.has = false;
    };
  }, []);

  return (
    <section className="hx" id="top" data-theme="dark" ref={hero}>
      <canvas className="hx-canvas" ref={cv} aria-hidden="true" />
      <div className="hx-probe" ref={probe} aria-hidden="true" />

      <div className={`hx-stage${mirror ? ' mirrored' : ''}`} ref={stage}>
        <Battery3D active={model} fallback={HERO_LINEUP.front}
          alt={`Litpax ${MODELS[model].tab}, ${MODELS[model].name}, 3D model — drag to rotate`}
          onProgress={(p) => load.current.progress(p)}
          onReady={(ok) => load.current.ready(ok)}
          onFrame={(gl) => frame.current.copy?.(gl)} />
      </div>

      <h1 className="hx-h1" aria-label={`${LINE1} ${LINE2}`}>
        <span className="hx-line hx-serif" aria-hidden="true">{chars(LINE1)}</span>
        <span className="hx-line hx-sans" aria-hidden="true">{chars(LINE2)}</span>
      </h1>
      <p className="hx-lead">Lithium-ion &amp; LFP battery packs for e-bikes, e-rickshaws, solar homes and telecom.</p>

      <div className="hx-switch" role="tablist" aria-label="Choose product">
        {MODELS.map((m, i) => (
          <button key={m.tab} role="tab" aria-selected={model === i} className={model === i ? 'on' : ''} onClick={() => pick(i)}>
            {m.tab}
            {model === i && <i key={`${model}-${round}`} style={{ animationDuration: `${SWITCH_EVERY}ms` }} />}
          </button>
        ))}
        <span className="hx-model" aria-live="polite">{MODELS[model].name} · drag to rotate</span>
      </div>

      <div className="hx-act">
        <p className="hx-para">Litpax designs, builds and tests every pack in-house in Sirsa — Grade-A cells, Smart BMS, ready to ride.</p>
        <a className="hx-cta" href="#contact">Get a quote <span aria-hidden="true">→</span></a>
      </div>

      <div className="hx-bar">
        <a href="#about" className="hx-down"><span className="hx-arrow" aria-hidden="true">↓</span>Scroll down for more</a>
        <span>ISO 9001:2015<span className="hx-hide-s"> · Made in India</span></span>
      </div>

      <p className="hx-count" ref={counter} aria-hidden="true"><span ref={num}>00</span><span className="hx-pct">%</span></p>
      <div className="hx-cursor" ref={cursor} aria-hidden="true" />
    </section>
  );
}
