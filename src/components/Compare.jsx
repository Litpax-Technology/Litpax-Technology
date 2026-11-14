import { COMPARE } from '../data.js';

export default function Compare() {
  return (
    <section>
      <div className="wrap">
        <div className="label rv"><i />Lithium vs Lead-acid</div>
        <h2 className="rv">Why <span className="serif red">switch</span> to lithium</h2>
        <div className="cmp-grid">
          <div className="cmp a rv">
            <h3>Litpax Lithium</h3>
            <div className="s">LFP &amp; Li-ion with Smart BMS</div>
            <ul>{COMPARE.map(([k, a]) => <li key={k}><span>{k}</span><b>{a}</b></li>)}</ul>
          </div>
          <div className="cmp b rv">
            <h3>Lead-acid</h3>
            <div className="s">Conventional batteries</div>
            <ul>{COMPARE.map(([k, , b]) => <li key={k}><span>{k}</span><b>{b}</b></li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
