import { STATS } from '../data.js';

const TEXT = 'Litpax Technology builds lithium battery packs that move India forward — from e-rickshaws on busy streets to solar homes and hospital equipment. Every pack is engineered in-house, tested to';
const TAIL = 'standards and backed by service across the country.';

// Words light up one by one as you scroll (App.jsx animates .w opacity).
const words = (s) => s.split(' ').map((w, i) => <span key={i}><span className="w">{w}</span> </span>);

export default function Statement() {
  return (
    <section className="statement">
      <div className="wrap">
        <div className="label rv"><i />About Litpax</div>
        <p id="stmt">
          {words(TEXT)}
          <span className="w serif red">ISO&nbsp;9001:2015</span>{' '}
          {words(TAIL)}
        </p>
        <div className="stats">
          {STATS.map(([n, label]) => (
            <div className="stat rv" key={label}>
              <b><span data-count={n}>{n}</span><sup>+</sup></b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
