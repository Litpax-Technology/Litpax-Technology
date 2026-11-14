// Preloader: the X mark draws itself while the counter runs to 100%.
// The animation itself is driven from App.jsx (GSAP timeline).
export default function Loader() {
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <svg viewBox="0 0 120 92" id="ldX">
        <path d="M116 18 C 96 2, 78 6, 62 34 C 48 60, 30 92, 4 74" fill="none" stroke="#E5484D" strokeWidth="11" strokeLinecap="round" />
        <path d="M4 18 C 24 2, 42 8, 54 32" fill="none" stroke="#E5484D" strokeWidth="11" strokeLinecap="round" />
        <path d="M68 58 C 80 80, 96 90, 116 74" fill="none" stroke="#F3D04A" strokeWidth="11" strokeLinecap="round" />
      </svg>
      <div className="ld-bar"><span id="ldBar" /></div>
      <div className="ld-count"><span id="ldNum">0</span>%</div>
    </div>
  );
}
