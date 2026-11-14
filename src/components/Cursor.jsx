import { useEffect, useRef } from 'react';

// Custom cursor (desktop only): a trailing ring that grows and shows a label
// over any element with a data-cursor="Label" attribute.
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);

  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, raf;
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.current.style.transform = `translate(${mx}px,${my}px)`;
    };
    const over = (e) => {
      const t = e.target.closest('[data-cursor]');
      const r = ring.current;
      if (t) { r.classList.add('big'); r.textContent = t.dataset.cursor; }
      else { r.classList.remove('big'); r.textContent = ''; }
    };
    const loop = () => {
      cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
      ring.current.style.transform = `translate(${cx}px,${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('mousemove', move);
    addEventListener('mouseover', over);
    loop();
    return () => { removeEventListener('mousemove', move); removeEventListener('mouseover', over); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className="cursor" ref={ring} />
      <div className="cursor-dot" ref={dot} />
    </>
  );
}
