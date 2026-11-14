import { REVIEWS } from '../data.js';

const Card = ({ r }) => (
  <div className="t">
    <div className="q">“</div>
    <p>{r[2]}</p>
    <div className="who">
      <div className="av">{r[0][0]}</div>
      <div><b>{r[0]}</b><span>{r[1]}</span></div>
      <span className="st">★★★★★</span>
    </div>
  </div>
);

// Endless sliding row (pauses on hover). The list is repeated for a seamless loop.
export default function Testimonials() {
  const loop = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];
  return (
    <section className="testi" id="reviews">
      <div className="wrap">
        <div className="label rv"><i />Reviews</div>
        <h2 className="rv">Trusted on the <span className="serif red">road</span></h2>
      </div>
      <div className="t-track">{loop.map((r, i) => <Card r={r} key={i} />)}</div>
    </section>
  );
}
