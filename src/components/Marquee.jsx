// Big scrolling words. Speed, direction and skew react to scroll velocity (App.jsx).
const Item = () => (
  <div className="mq-item">
    <span>Lithium-ion</span><i className="dot" />
    <span className="o">LFP Power</span><i className="dot y" />
    <span>Made in India</span><i className="dot" />
    <span className="o">Smart BMS</span><i className="dot y" />
  </div>
);

export default function Marquee() {
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track" id="mq"><Item /><Item /></div>
    </div>
  );
}
