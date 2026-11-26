import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PRODUCTS } from '../data.js';
import { cutoutCropped } from '../lib/cutout.js';
import { quote } from '../lib/quote.js';

// ============================================================================
// "Find your power." — six real Litpax packs on a turning 3D ring (desktop) or
// a diagonal line (phones). Springs drive the motion; drag, swipe, trackpad,
// arrows and keys move it; it autoplays every 5 s with a 01–06 progress bar.
// The front pack opens a "View pack" popup with numbered dots. The right panel
// lists the pack and its closest siblings; + picks a quantity and adds it to a
// local quote list that is sent to Litpax on WhatsApp.
// ============================================================================

const PICK = [
  '60V 32Ah Lithium Battery', '48V 27Ah Lithium Battery', '74V 27Ah Lithium Battery',
  '12.8V 200Ah Power Pack', '25.6V 100Ah Power Pack', '60V 36Ah Lithium Battery',
];
const USE = { ebike: 'E-bikes and scooters', erick: 'E-rickshaws', solar: 'Homes, shops and solar' };
const PINS = [
  { x: 52, y: 12, t: 'Terminals and connector' },
  { x: 36, y: 52, t: 'Smart BMS inside' },
  { x: 72, y: 70, t: 'Grade-A cells, sealed body' },
];
const QTY = ['1', '2', '5', '10', '25+'];
const SPEED = 5000;
const K = 95, C = 2 * Math.sqrt(K);
const ENTRY = 1.15;

const mod = (a, n) => ((a % n) + n) % n;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const ArrowL = () => <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M25 7H1M7 1L1 7l6 6" /></svg>;
const ArrowR = () => <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6" /></svg>;

// --------------------------------------------------------------------------
// quote list dialog (opened from the header or the panel)
// --------------------------------------------------------------------------
function QuoteDialog() {
  const ref = useRef(null);
  const [items, setItems] = useState(quote.items);
  useEffect(() => quote.subscribe(setItems), []);
  useEffect(() => {
    const open = () => { const d = ref.current; if (d && !d.open) d.showModal?.(); };
    addEventListener('litpax:quote-open', open);
    return () => removeEventListener('litpax:quote-open', open);
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog className="qd" ref={ref} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); }}>
      <div className="qd-head">
        <h2>Your quote list</h2>
        <button type="button" className="qd-x" onClick={close} aria-label="Close quote list">×</button>
      </div>
      <p className="qd-note">A shortlist on this device. Send it to Litpax on WhatsApp and our team replies with prices.</p>
      {items.length === 0
        ? <p className="qd-note">Your list is empty. Tap + beside a battery to add it.</p>
        : (
          <ul className="qd-rows">
            {items.map((e) => (
              <li key={e.name} className="qd-row">
                {e.img ? <img src={e.img} alt="" /> : <span />}
                <div><b>{e.name}</b><small>{e.type} · Quantity {e.qty}</small></div>
                <button type="button" onClick={() => quote.remove(e.name)} aria-label={`Remove ${e.name}`}>×</button>
              </li>
            ))}
          </ul>
        )}
      <div className="qd-actions">
        <a className={`qd-send${items.length ? '' : ' off'}`} href={items.length ? quote.whatsapp() : undefined} target="_blank" rel="noopener" aria-disabled={!items.length}>Send quote request on WhatsApp</a>
        {items.length > 0 && <button type="button" className="qd-clear" onClick={() => quote.clear()}>Clear list</button>}
      </div>
    </dialog>
  );
}

// --------------------------------------------------------------------------
// one panel row: thumbnail, name, + → quantity picker → add to quote
// --------------------------------------------------------------------------
function Row({ p, n, img, hot, onHot, onOpen, inList, engage }) {
  const [picking, setPicking] = useState(false);
  const [qty, setQty] = useState('1');
  const [pop, setPop] = useState(0);
  const add = () => {
    engage();
    quote.add({ name: p.n, qty, img: `${p.img[0]}-sm.webp`, type: p.t });   // stored path, not a temporary blob
    setPicking(false); setPop((x) => x + 1);
    if (!reduced()) navigator.vibrate?.(12);
  };
  return (
    <li className={`rw-item${hot ? ' is-hot' : ''}${picking ? ' is-picking' : ''}${inList ? ' is-added' : ''}`} style={{ '--i': n }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHot(n)} onPointerLeave={(e) => e.pointerType === 'mouse' && onHot(0)}>
      <button type="button" className="rw-media" tabIndex={-1} aria-hidden="true" onClick={() => { engage(); onOpen?.(p); }}>
        {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : null}
        <span className="rw-num">{n}</span>
      </button>
      <div className="rw-info">
        <span className="rw-type">{p.t}</span>
        <button type="button" className="rw-name" onClick={() => { engage(); onOpen?.(p); }}>{p.n}</button>
        <span className="rw-price">{p.v}V · {p.cap} · {p.ch}</span>
      </div>
      <button type="button" className="rw-add" aria-expanded={picking} aria-label={inList ? `In quote list: ${p.n}` : `Add to quote list: ${p.n}`}
        onClick={() => { engage(); setPicking((v) => !v); }}>
        <svg className="i-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg>
        <svg key={pop} className="i-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7" /></svg>
      </button>
      {picking && (
        <div className="rw-picker">
          <fieldset className="rw-opt">
            <legend>Quantity</legend>
            <div className="rw-pills">
              {QTY.map((q) => (
                <label key={q} className="rw-pill">
                  <input type="radio" name={`q-${p.n}`} value={q} checked={qty === q} onChange={() => setQty(q)} />
                  <span>{q}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="rw-confirm" onClick={add}>{inList ? 'Update quote list' : 'Add to quote list'}<span className="rw-sr"> — {p.n}</span></button>
        </div>
      )}
    </li>
  );
}

// --------------------------------------------------------------------------
export default function Runway({ onOpen }) {
  const looks = PICK.map((n) => PRODUCTS.find((p) => p.n === n)).filter((p) => p && p.img);
  const n = looks.length;
  const N = n * Math.ceil(8 / n);

  const root = useRef(null);
  const stage = useRef(null);
  const sweep = useRef(null);
  const cursorRef = useRef(null);
  const lbFig = useRef(null);
  const E = useRef({ target: 0, cur: reduced() ? 0 : -ENTRY, vel: 0, W: 0, H: 0, unit: 200, mode: 'ring', modelH: 200, ars: [], visible: false, drag: null, panelHover: false, zoom: false, engaged: false, kick: () => {}, still: false });

  const [cuts, setCuts] = useState(() => looks.map(() => null));
  const [thumbs, setThumbs] = useState({});
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [hot, setHot] = useState(0);
  const [lb, setLb] = useState(null);        // { look, from: DOMRect }
  const [lbClosing, setLbClosing] = useState(false);
  const [inList, setInList] = useState(() => new Set(quote.items.map((e) => e.name)));
  const [qCount, setQCount] = useState(quote.count);
  const [msg, setMsg] = useState('');
  const first = useRef(true);

  useEffect(() => quote.subscribe((l) => { setInList(new Set(l.map((e) => e.name))); setQCount(l.length); }), []);

  // real product photos, cut out of their white studio background
  useEffect(() => {
    let live = true;
    looks.forEach((p, i) => {
      cutoutCropped(`${p.img[0]}-lg.webp`).then((r) => {
        if (!live) return;
        E.current.ars[i] = r.w / r.h;
        setCuts((c) => { const x = [...c]; x[i] = r; return x; });
      }).catch(() => {});
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = looks[index];
  const rows = [active, ...PRODUCTS.filter((p) => p.c === active.c && p.img && p.n !== active.n)].slice(0, 3);
  useEffect(() => {
    let live = true;
    rows.forEach((p) => {
      if (thumbs[p.n]) return;
      cutoutCropped(`${p.img[0]}-sm.webp`).then((r) => live && setThumbs((t) => ({ ...t, [p.n]: r.url }))).catch(() => live && setThumbs((t) => ({ ...t, [p.n]: `${p.img[0]}-sm.webp` })));
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const engage = () => { E.current.engaged = true; setPlaying(false); };

  // ------------------------------------------------------------------ engine
  useEffect(() => {
    const S = E.current, st = stage.current, sec = root.current;
    const reduce = reduced();
    let raf = 0, last = 0;
    const bodies = () => st.querySelectorAll('.rw-body');

    const put = (el, w, x, bottom, scale, op, blur, z) => {
      if (x + (w * scale) / 2 < -4 || x - (w * scale) / 2 > S.W + 4) op = 0;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${(-bottom).toFixed(2)}px, 0) translateX(-50%) scale(${scale.toFixed(4)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = z;
      el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      el.style.pointerEvents = op < 0.5 ? 'none' : 'auto';
      const b = Math.round(blur * 10) / 10;
      if (el._b !== b) { el._b = b; el.style.filter = b > 0.05 ? `blur(${b}px)` : ''; }
    };
    const render = () => {
      const W = S.W, H = S.H;
      if (!W || !H) return;
      const els = bodies(), cnt = els.length, step = (2 * Math.PI) / cnt;
      els.forEach((el, a) => {
        const w = S.modelH * (S.ars[a % n] || 1.3);
        if (S.mode === 'ring') {
          const cx = 0.5 * W, R = 0.62 * W, P = 1.65 * W, floor = H - 34, horizon = 0.36 * H, fs = 1.08;
          let phi = ((a - S.cur) * step) % (2 * Math.PI);
          if (phi > Math.PI) phi -= 2 * Math.PI;
          if (phi <= -Math.PI) phi += 2 * Math.PI;
          const z = R * (1 - Math.cos(phi)), persp = P / (P + z), sl = Math.abs(phi) / step;
          const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
          const x = cx + R * Math.sin(phi) * persp;
          const feet = horizon + (floor - horizon) * persp;
          const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
          const op = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
          put(el, w, x, H - feet, scale, op, blur, Math.round(scale * 1000));
        } else {
          let k = a - S.cur; k = ((k % cnt) + cnt) % cnt; if (k > cnt / 2) k -= cnt;
          const ax = 0.36, ay = 26, sx = 0.32, sy = 24, sr = 0.76, ex = 0.55;
          if (k < 0) {
            const e = Math.min(-k, 1.4);
            put(el, w, W * (ax - ex * e), ay - 22 * e, 1 + 0.14 * e, Math.max(0, 1 - 1.05 * e), 4 * Math.min(e, 1), 1100);
          } else {
            const op = k <= 3 ? 1 - 0.13 * k : Math.max(0, 0.61 * (4 - k));
            put(el, w, W * (ax + sx * k), ay + sy * k, Math.pow(sr, k), op, Math.min(0.9 * k, 3.2), 1000 - Math.round(10 * k));
          }
        }
      });
    };
    const setStill = (v) => { if (v !== S.still) { S.still = v; sec.toggleAttribute('data-still', v); } };
    const frame = (t) => {
      raf = 0;
      const dt = last ? Math.min(0.034, (t - last) / 1000) : 1 / 60;
      last = t;
      if (reduce) { S.cur = S.target; S.vel = 0; }
      else {
        const h = dt / 3;
        for (let i = 0; i < 3; i++) { const acc = -K * (S.cur - S.target) - C * S.vel; S.vel += acc * h; S.cur += S.vel * h; }
      }
      const settled = !S.drag && Math.abs(S.cur - S.target) <= 0.0005 && Math.abs(S.vel) <= 0.0005;
      if (settled) { S.cur = S.target; S.vel = 0; }
      render();
      setStill(settled);
      if (!settled && S.visible && !document.hidden) raf = requestAnimationFrame(frame); else last = 0;
    };
    S.kick = () => { if (!raf && S.visible) raf = requestAnimationFrame(frame); };

    const measure = () => {
      const r = st.getBoundingClientRect();
      S.W = r.width; S.H = r.height;
      S.mode = innerWidth >= 750 ? 'ring' : 'line';
      S.modelH = Math.max(110, Math.round(S.mode === 'ring' ? Math.min(S.H * 0.42, S.W * 0.3) : Math.min(S.H * 0.4, S.W * 0.42)));
      st.style.setProperty('--rw-mh', `${S.modelH}px`);
      S.unit = S.mode === 'ring' ? Math.max(120, 0.3 * S.W) : Math.max(90, S.W * 0.32 * 1.6);
      render();
    };
    S.render = render;
    S.moveTo = (T) => { S.target = T; setStill(false); S.kick(); setIndex(mod(T, n)); };
    S.next = () => S.moveTo(Math.round(S.target) + 1);
    S.prev = () => S.moveTo(Math.round(S.target) - 1);
    S.go = (i) => { let d = mod(i - mod(Math.round(S.target), n), n); if (d > n / 2) d -= n; S.moveTo(Math.round(S.target) + d); };
    S.rank = (a) => { let k = a - Math.round(S.target); k = ((k % N) + N) % N; if (k > N / 2) k -= N; return k; };

    measure();
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { measure(); S.kick(); }, 120); };
    addEventListener('resize', onResize);
    const ro = new ResizeObserver(() => { measure(); });
    ro.observe(st);
    const io = new IntersectionObserver(([e]) => { S.visible = e.isIntersecting; if (S.visible) S.kick(); }, { threshold: 0 });
    io.observe(sec);
    const reveal = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      reveal.disconnect();
      if (reduce) sec.setAttribute('data-revealed', '');
      else requestAnimationFrame(() => requestAnimationFrame(() => sec.setAttribute('data-revealed', '')));
      if (!reduce) setPlaying(true);
      S.kick();
    }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
    reveal.observe(sec);
    const onVis = () => { if (!document.hidden) S.kick(); };
    document.addEventListener('visibilitychange', onVis);

    // ------------- drag / swipe -------------
    let p = null, suppress = 0;
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: S.target, s: [{ x: e.clientX, t: e.timeStamp }], dragging: false };
    };
    const move = (e) => {
      if (!p || e.pointerId !== p.id) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) { up(e); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (!p.dragging) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { p = null; return; }
        if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
          p.dragging = true; S.drag = true; sec.setAttribute('data-drag', '');
          try { st.setPointerCapture(e.pointerId); } catch {}
        } else return;
      }
      p.s.push({ x: e.clientX, t: e.timeStamp }); if (p.s.length > 6) p.s.shift();
      S.target = p.t - dx / S.unit; S.kick();
    };
    const up = (e) => {
      if (!p) return;
      const was = p.dragging, q = p; p = null;
      if (!was) return;
      S.drag = false; sec.removeAttribute('data-drag'); suppress = performance.now();
      const f = q.s[0], l = q.s[q.s.length - 1];
      const vx = (l.x - f.x) / Math.max(1, l.t - f.t);
      const dx = (e.clientX ?? l.x) - q.x, from = Math.round(q.t);
      if (S.mode === 'line') {
        S.moveTo(Math.abs(dx) > 30 || Math.abs(vx) > 0.3 ? from + (dx > 0 ? -1 : 1) : from);
      } else {
        let i = Math.round(S.target - (vx * 160) / S.unit);
        if (i === from && Math.abs(vx) > 0.3) i = from + (vx > 0 ? -1 : 1);
        S.moveTo(clamp(i, from - 2, from + 2));
      }
    };
    const clickGuard = (e) => { if (performance.now() - suppress < 60) { e.stopPropagation(); e.preventDefault(); } };
    st.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    st.addEventListener('click', clickGuard, true);

    // ------------- trackpad + keys -------------
    let acc = 0, lockUntil = 0;
    const wheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() < lockUntil) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 45) { if (acc > 0) S.next(); else S.prev(); acc = 0; lockUntil = performance.now() + 520; }
    };
    st.addEventListener('wheel', wheel, { passive: false });
    const key = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); S.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); S.prev(); }
    };
    st.addEventListener('keydown', key);

    // ------------- custom cursor -------------
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cur = cursorRef.current;
    let cx = 0, cy = 0, tx = 0, ty = 0, craf = 0, on = false;
    const cloop = () => {
      craf = 0;
      const k = reduce ? 1 : 0.18;
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.hypot(tx - cx, ty - cy) > 0.2) craf = requestAnimationFrame(cloop);
    };
    const cmove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = st.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!on) { cx = tx; cy = ty; on = true; cur.classList.add('is-on'); }
      const front = e.target.closest?.('.rw-body.is-front');
      cur.classList.toggle('is-view', !!front && !S.drag);
      cur.classList.toggle('is-link', !front && !!e.target.closest?.('.rw-hit') && !S.drag);
      if (!craf) craf = requestAnimationFrame(cloop);
    };
    const cleave = () => { on = false; cur.classList.remove('is-on', 'is-view', 'is-link'); };
    if (fine) {
      sec.setAttribute('data-cursor', '');
      st.addEventListener('pointermove', cmove);
      st.addEventListener('pointerleave', cleave);
    }

    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(craf); clearTimeout(rt);
      ro.disconnect(); io.disconnect(); reveal.disconnect();
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      st.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      st.removeEventListener('click', clickGuard, true);
      st.removeEventListener('wheel', wheel);
      st.removeEventListener('keydown', key);
      st.removeEventListener('pointermove', cmove); st.removeEventListener('pointerleave', cleave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render positions when a cut-out arrives (its width changes)
  useEffect(() => { E.current.render?.(); }, [cuts]);

  // front body marker, sweep, live text
  const [live, setLive] = useState('');
  useEffect(() => {
    const S = E.current, st = stage.current;
    st.querySelectorAll('.rw-body').forEach((el, a) => {
      const k = S.rank ? S.rank(a) : (a === 0 ? 0 : 9);
      el.classList.toggle('is-front', k === 0);
      const hit = el.querySelector('.rw-hit');
      if (hit) hit.tabIndex = k !== 0 && Math.abs(k) <= 2 ? 0 : -1;
    });
    setHot(0);
    setMsg('');
    if (first.current) { first.current = false; return; }
    setLive(`Pack ${index + 1}: ${looks[index].n}`);
    if (!reduced() && sweep.current) {
      const el = sweep.current; el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on');
    }
    if (lb) closeLb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // autoplay: one look every 5 s while visible, idle and not engaged
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      const S = E.current;
      if (S.visible && !S.drag && !document.hidden && !S.panelHover && !S.zoom && !S.engaged) S.next();
      else setCycle((c) => c + 1);
    }, SPEED);
    return () => clearTimeout(t);
  }, [playing, index, cycle]);

  // ------------------------------------------------------------------ popup
  const openLb = () => {
    const S = E.current;
    const front = stage.current.querySelector('.rw-body.is-front .rw-fig');
    if (!front) return;
    engage();
    S.zoom = true;
    setLbClosing(false);
    setLb({ look: index, from: front.getBoundingClientRect() });
  };
  const closeLb = () => {
    if (!lb) return;
    const S = E.current;
    const fig = lbFig.current;
    const front = stage.current.querySelector('.rw-body.is-front .rw-fig');
    if (fig && front && !reduced()) {
      const a = front.getBoundingClientRect(), b = fig.getBoundingClientRect();
      fig.style.transform = `translate3d(${a.left - b.left}px, ${a.bottom - b.bottom}px, 0) scale(${a.height / b.height})`;
    }
    setLbClosing(true);
    setTimeout(() => { setLb(null); setLbClosing(false); S.zoom = false; }, reduced() ? 0 : 900);
  };
  useLayoutEffect(() => {
    if (!lb || lbClosing || reduced()) return;
    const fig = lbFig.current;
    if (!fig) return;
    const a = lb.from, b = fig.getBoundingClientRect();
    fig.style.transition = 'none';
    fig.style.transform = `translate3d(${a.left - b.left}px, ${a.bottom - b.bottom}px, 0) scale(${a.height / b.height})`;
    void fig.offsetWidth;
    fig.style.transition = '';
    fig.style.transform = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lb]);
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape' && lb) closeLb(); };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  });

  // ------------------------------------------------------------------ clicks on bodies
  const onBody = (a) => {
    const S = E.current;
    const k = S.rank(a);
    if (k === 0) openLb();
    else S.moveTo(Math.round(S.target) + k);
  };

  const sendAll = (e) => {
    engage();
    if (!qCount) { e.preventDefault(); setMsg('Tap + beside a battery to add it to your quote list first.'); }
  };

  const cutFor = (i) => cuts[i]?.url || `${looks[i].img[0]}-lg.webp`;
  const ar = (i) => (cuts[i] ? cuts[i].w / cuts[i].h : 1.3);

  return (
    <section className={`rw${playing ? ' is-playing' : ''}${lb ? ' rw--zoom' : ''}${lbClosing ? ' rw--unzoom' : ''}`} id="lineup" ref={root}
      style={{ '--rw-progress': ((index + 1) / n).toFixed(3) }}>
      <div className="rw-grid">
        <div className="rw-left">
          <div className="rw-head">
            <div className="rw-intro">
              <h2 className="rw-title">Find your <mark>power.</mark></h2>
              <p className="rw-sub">Six Litpax packs, built in Sirsa. Drag the ring, or tap the front pack to look closer.</p>
            </div>
            <span className="rw-sr" aria-live="polite" aria-atomic="true">{live}</span>
          </div>

          <div className="rw-stage" ref={stage} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Litpax batteries — use arrow keys or swipe to change pack">
            <div className="rw-floor" aria-hidden="true" />
            <div className="rw-actors">
              {Array.from({ length: N }, (_, a) => {
                const i = a % n, p = looks[i];
                return (
                  <div className="rw-body" key={a} data-i={a} aria-hidden="true">
                    <span className="rw-shadow" />
                    <div className="rw-fig" style={{ '--ar': ar(i) }}>
                      <img src={cutFor(i)} alt={p.n} draggable="false" decoding="async" loading={a < n ? 'eager' : 'lazy'} />
                      <button type="button" className="rw-hit" tabIndex={-1} aria-label={`Pack ${i + 1}: ${p.n}`} onClick={() => onBody(a)} />
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="rw-sweep" ref={sweep} aria-hidden="true" />
            <span className="rw-cursor" ref={cursorRef} aria-hidden="true">
              <span className="rw-cursor-in"><span className="rw-cl rw-cl-drag">Drag</span><span className="rw-cl rw-cl-view">View</span></span>
            </span>
            <span className="rw-walk" aria-hidden="true"><span className="rw-walk-line" /></span>
          </div>

          <div className="rw-controls">
            <button type="button" className="rw-icon rw-prev" aria-label="Previous pack" onClick={() => E.current.prev()}><ArrowL /></button>
            <div className="rw-ticks">
              {looks.map((p, i) => (
                <button type="button" key={p.n} className={`rw-tick${i < index ? ' is-past' : ''}${i === index && playing ? ' is-run' : ''}`} aria-current={i === index} aria-label={`Pack ${i + 1}: ${p.n}`} onClick={() => E.current.go(i)}>
                  <span className="rw-tick-bar" key={i === index ? `${index}-${cycle}-${playing}` : 'x'} />
                  <span className="rw-tick-label">{String(i + 1).padStart(2, '0')}<span className="rw-tick-name">&nbsp;&nbsp;{p.v}V · {p.cap}</span></span>
                </button>
              ))}
            </div>
            <button type="button" className="rw-icon rw-auto" aria-pressed={playing} aria-label="Autoplay" onClick={() => { if (!playing) E.current.engaged = false; setPlaying((v) => !v); }}>
              <svg className="i-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" /></svg>
              <svg className="i-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" /></svg>
            </button>
            <button type="button" className="rw-icon rw-next" aria-label="Next pack" onClick={() => E.current.next()}><ArrowR /></button>
          </div>

          {/* View pack popup */}
          <div className={`rw-lb${lb && !lbClosing ? ' is-open' : ''}`} role="region" aria-label="View pack" aria-hidden={!lb}
            onClick={(e) => { if (!e.target.closest('.rw-lb-fig, .rw-lb-close')) closeLb(); }}>
            {lb && (
              <>
                <div className="rw-lb-stage">
                  <div className="rw-lb-fig" ref={lbFig} style={{ '--ar': ar(lb.look) }}>
                    <img src={cutFor(lb.look)} alt={looks[lb.look].n} draggable="false" />
                    <div className="rw-pins">
                      {PINS.map((pin, k) => (
                        <button type="button" key={pin.t} className={`rw-pin${hot === k + 1 ? ' is-hot' : ''}`} data-tip={pin.t} style={{ left: `${pin.x}%`, top: `${pin.y}%`, '--pi': k + 1 }}
                          aria-label={`${k + 1}: ${pin.t}`} onClick={(e) => { e.stopPropagation(); setHot(hot === k + 1 ? 0 : k + 1); }}>
                          <span className="rw-pin-dot">{k + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rw-lb-top">
                  <p className="rw-lb-cap"><span className="rw-lb-kicker">Pack {String(lb.look + 1).padStart(2, '0')}</span><span className="rw-lb-name">{looks[lb.look].n}</span></p>
                  <button type="button" className="rw-lb-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); closeLb(); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
                  </button>
                </div>
                <p className="rw-lb-hint">Tap a dot to see the detail</p>
              </>
            )}
          </div>
        </div>

        <aside className="rw-panel" onPointerEnter={(e) => { if (e.pointerType === 'mouse') E.current.panelHover = true; }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { E.current.panelHover = false; setCycle((c) => c + 1); } }}
          onChange={engage}>
          <div className="rw-panel-head">
            <h3 className="rw-panel-title">In this range</h3>
            <span className="rw-label" key={`l${index}`}>{USE[active.c]}</span>
          </div>
          <div className="rw-mhead" key={`m${index}`}><span className="rw-mhead-title">{active.n}</span><span className="rw-label">{active.t}</span></div>
          <ul className="rw-items" key={`r${index}`} role="list">
            {rows.map((p, k) => (
              <Row key={p.n} p={p} n={k + 1} img={thumbs[p.n]} hot={hot === k + 1} onHot={setHot} onOpen={onOpen} inList={inList.has(p.n)} engage={engage} />
            ))}
          </ul>
          <div className="rw-bundle">
            {msg && <p className="rw-msg" role="status">{msg}</p>}
            <div className="rw-bundle-row">
              <div className="rw-bundle-copy">
                <span className="rw-bundle-title">Your quote list</span>
                <span className="rw-bundle-note">{qCount ? `${qCount} batter${qCount === 1 ? 'y' : 'ies'} added` : 'Add batteries with +, then send'}</span>
              </div>
              <button type="button" className="rw-view" onClick={() => quote.open()}>View list</button>
            </div>
            <a className={`rw-cta${qCount ? '' : ' is-empty'}`} href={qCount ? quote.whatsapp() : '#'} target={qCount ? '_blank' : undefined} rel="noopener" onClick={sendAll}>
              <span>Send quote request on WhatsApp</span>
              <svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6" /></svg>
            </a>
          </div>
        </aside>
      </div>
      <QuoteDialog />
    </section>
  );
}
