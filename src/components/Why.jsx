import { PRODUCTS, WHY, waLink } from '../data.js';

// "Why Litpax" as a bento grid — different-sized tiles, real product photos.
const img = (name) => PRODUCTS.find((p) => p.n === name)?.img?.[0];
const ic = {
  shield: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  tool: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" /></svg>,
  badge: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></svg>,
};

export default function Why() {
  const [mfg, bms, custom, service, warranty, dealer] = WHY;
  return (
    <section className="why bento-why" id="why">
      <div className="wrap">
        <div className="bw-head">
          <div>
            <div className="label rv"><i />Why Litpax</div>
            <h2 className="rv">Built in-house. <span className="serif red">Backed</span> nationwide.</h2>
          </div>
          <p className="lead rv">We design, assemble and test every battery pack in our own facility — consistent quality at a competitive price.</p>
        </div>

        <div className="bento">
          {/* big: manufacturing, with a real pack */}
          <article className="bt bt-a dark rv">
            <span className="bt-k">01 · Manufacturing</span>
            <h3>{mfg[0]}</h3>
            <p>{mfg[1]}</p>
            <img className="bt-photo" src={`${img('60V 27Ah Lithium Battery')}-lg.webp`} alt="Litpax 60V lithium-ion battery pack" loading="lazy" width="1200" height="900" />
            <span className="bt-badge"><span className="tri" />Make in India</span>
          </article>

          <article className="bt bt-b rv">
            <span className="bt-ic">{ic.shield}</span>
            <h3>{bms[0]}</h3>
            <p>{bms[1]}</p>
          </article>

          <article className="bt bt-c red rv">
            <span className="bt-ic">{ic.badge}</span>
            <b className="bt-iso">ISO<br />9001:2015</b>
            <p>Certified quality management</p>
          </article>

          <article className="bt bt-d rv">
            <span className="bt-k">04 · Service</span>
            <div className="bt-stats">
              <div><b>20<em>+</em></b><span>Distributors</span></div>
              <div><b>20<em>+</em></b><span>Service centers</span></div>
              <div><b>200<em>+</em></b><span>Happy clients</span></div>
            </div>
            <p>{service[1]}</p>
          </article>

          <article className="bt bt-e rv">
            <span className="bt-k">03 · Custom</span>
            <h3>{custom[0]}</h3>
            <div className="bt-trio">
              {['12.8V 200Ah Power Pack', '48V 27Ah Lithium Battery', '25.6V 100Ah Power Pack'].map((n) => (
                <img key={n} src={`${img(n)}-sm.webp`} alt={n} loading="lazy" width="640" height="480" />
              ))}
            </div>
          </article>

          <article className="bt bt-f rv">
            <span className="bt-ic">{ic.tool}</span>
            <h3>{warranty[0]}</h3>
            <p>{warranty[1]}</p>
          </article>

          <a className="bt bt-g dark rv" href={waLink('Hi Litpax, I am interested in dealership.')} target="_blank" rel="noopener" data-cursor="Apply">
            <span className="bt-k">06 · Partners</span>
            <h3>{dealer[0]}</h3>
            <p>{dealer[1]}</p>
            <span className="bt-go">Become a dealer <span>→</span></span>
          </a>
        </div>
      </div>
    </section>
  );
}
