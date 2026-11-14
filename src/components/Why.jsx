import { WHY } from '../data.js';

export default function Why() {
  return (
    <section className="why" id="why">
      <div className="wrap">
        <div className="why-left">
          <div className="label rv"><i />Why Litpax</div>
          <h2 className="rv">Built in-house.<br /><span className="serif red">Backed</span> nationwide.</h2>
          <p className="lead rv" style={{ marginTop: 24 }}>We design, assemble and test every battery pack in our own facility — so you get consistent quality at a competitive price.</p>
          <div className="certs rv">
            <div>★ ISO 9001:2015</div>
            <div><span className="tri" />Make in India</div>
          </div>
        </div>
        <div className="why-list">
          {WHY.map(([h, p], i) => (
            <div className="wi rv" key={h}>
              <span className="n">0{i + 1}</span>
              <div><h4>{h}</h4><p>{p}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
