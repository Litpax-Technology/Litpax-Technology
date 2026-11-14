import { PHOTOS } from '../data.js';

// Full-width photo that opens up from a rounded frame as you scroll,
// with slow parallax zoom (App.jsx).
export default function ImageBand() {
  return (
    <section className="band" id="band">
      <div className="band-frame" id="bandFrame">
        <div className="band-img" id="bandImg" style={{ backgroundImage: `url("${PHOTOS.band}")` }} />
        <div className="band-shade" />
        <div className="band-text">
          <div className="label" style={{ color: 'rgba(255,255,255,.75)' }}><i />Clean energy</div>
          <h2>Powering homes,<br />roads &amp; <span className="serif">tomorrow.</span></h2>
        </div>
      </div>
    </section>
  );
}
