import { useEffect, useState } from 'react';
import { XMark } from './Logo.jsx';

// Short intro: a battery charges 0 → 100%, then the curtain lifts.
export default function Loader() {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [state, setState] = useState(reduce ? 'gone' : 'on');
  useEffect(() => {
    if (reduce) return;
    const a = setTimeout(() => setState('out'), 1500);
    const b = setTimeout(() => setState('gone'), 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [reduce]);
  if (state === 'gone') return null;
  return (
    <div className={`ld${state === 'out' ? ' out' : ''}`} aria-hidden="true">
      <div className="ld-in">
        <div className="ld-logo">Litpa<XMark size={30} /></div>
        <div className="ld-bat"><i /></div>
        <div className="ld-txt">Charging<span>.</span><span>.</span><span>.</span></div>
      </div>
    </div>
  );
}
