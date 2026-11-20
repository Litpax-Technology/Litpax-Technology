import { PHOTOS, waLink } from '../data.js';
import FloatingCells from './FloatingCells.jsx';

// Red circle expands to fill the screen as you scroll into view (App.jsx).
export default function Cta() {
  return (
    <section className="cta">
      <div className="cta-inner" id="cta">
        <div className="cta-bg" id="ctaBg" style={{ '--photo': `url("${PHOTOS.cta}")` }}>
          <FloatingCells count={16} tone="red" />
        </div>
        <div className="cta-c">
          <div className="label" style={{ color: 'rgba(255,255,255,.8)' }}>
            <i style={{ background: '#fff', boxShadow: '0 0 0 4px rgba(255,255,255,.2)' }} />Dealership open
          </div>
          <h2>Become a<br /><span className="serif">Litpax</span> dealer</h2>
          <a className="btn btn-w magnetic" href={waLink('Hi Litpax, I am interested in dealership.')} target="_blank" rel="noopener" data-cursor="Apply">
            Apply for dealership <span className="ar">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
