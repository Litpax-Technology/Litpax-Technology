import { PHOTOS, STEPS } from '../data.js';

// Pinned section: the battery charges 0 → 100% and steps light up as you scroll (App.jsx).
export default function Process() {
  return (
    <section className="proc" id="process">
      <div className="proc-photo" style={{ backgroundImage: `url("${PHOTOS.process}")` }} />
      <div className="proc-inner" id="procPin">
        <div className="wrap">
          <div>
            <div className="label rv"><i />How we build</div>
            <h2 className="rv">From cell to <span className="serif red">full power</span></h2>
            <p className="lead rv" style={{ marginTop: 22 }}>Every Litpax pack passes through our in-house production and testing line before it reaches you.</p>
            <div className="psteps">
              {STEPS.map(([h, p], i) => (
                <div className="pstep" key={h}>
                  <span className="n">0{i + 1}</span>
                  <div><h4>{h}</h4><p>{p}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="cell-big">
            <div className="fill" id="fill" />
            <div className="pct"><span id="pct">0%</span><small>CHARGING</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
