import { APPLICATIONS } from '../data.js';

// Desktop: section pins and the photo cards slide sideways as you scroll (App.jsx).
// Mobile: cards stack vertically.
export default function Applications({ onPick }) {
  const total = String(APPLICATIONS.length).padStart(2, '0');
  return (
    <section className="hsec" id="applications">
      <div className="hsec-inner" id="hsec">
        <div className="wrap">
          <div className="hsec-head">
            <div>
              <div className="label rv"><i />Applications</div>
              <h2 className="rv">What we <span className="serif red">power</span></h2>
            </div>
            <p className="lead rv">One battery partner for every application — keep scrolling to explore.</p>
          </div>
        </div>
        <div className="htrack" id="htrack">
          {APPLICATIONS.map((a, i) => (
            <a
              key={a.title}
              href={a.go ? '#products' : '#contact'}
              className="app photo"
              data-cursor={a.go ? 'Explore' : 'Enquire'}
              onClick={() => a.go && onPick(a.go)}
            >
              <div className="app-img" style={{ backgroundImage: `url("${a.img}")` }} />
              <span className="num">{String(i + 1).padStart(2, '0')} / {total}</span>
              <div className="ic">↗</div>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <div className="chips">{a.chips.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
            </a>
          ))}
          <a href="#contact" className="app end" data-cursor="Let's talk">
            <span className="num" style={{ color: 'rgba(255,255,255,.7)' }}>CUSTOM</span>
            <h3>Need a custom pack?</h3>
            <div>
              <p>Tell us your voltage, capacity and size — we'll engineer it.</p>
              <span className="btn btn-w">Start a project <span className="ar">→</span></span>
            </div>
          </a>
          <div style={{ flex: 'none', width: 8 }} />
        </div>
      </div>
    </section>
  );
}
