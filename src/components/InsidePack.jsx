import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// "Inside the pack" — a pinned, scroll-driven 3D exploded view.
// Scroll 1: the sealed pack.  2: lid lifts, the Smart BMS rises and lights up.
// 3: the case turns to glass and the matched cells spread out.  4: it all
// snaps back together — tested and ready.  Three.js loads only when needed.
const BASE = import.meta.env.BASE_URL;
const LABEL = `${BASE}model/label-60v32ah-hd.webp`;

const STEPS = [
  { k: 'The pack', h: 'Sealed. Rugged. Ready.', p: 'A tough, sealed body built for daily riding, Indian roads and summer heat.', chips: ['Made in Sirsa', 'ISO 9001:2015'] },
  { k: 'Smart BMS', h: 'A brain in every pack.', p: 'Our Smart BMS guards against over-charge, deep discharge and short circuit — every second, every ride.', chips: ['Over-charge', 'Deep discharge', 'Short circuit'] },
  { k: 'Grade-A cells', h: 'Matched, cell by cell.', p: 'Grade-A Li-ion & LFP cells are tested, matched and sorted before they are welded into a pack.', chips: ['Li-ion', 'LFP', 'Matched & sorted'] },
  { k: 'Tested', h: 'Tested before it ships.', p: 'Load, capacity and safety tests on our own line, under ISO 9001:2015 processes.', chips: ['Load test', 'Capacity test', 'Safety test'] },
];

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

export default function InsidePack() {
  const sec = useRef(null);
  const host = useRef(null);
  const prog = useRef(0);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  // ---------- scroll: pin the section and map progress 0..1 ----------
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const st = ScrollTrigger.create({
      trigger: sec.current,
      start: 'top top',
      end: () => '+=' + innerHeight * 3.2,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        prog.current = self.progress;
        setStep(Math.min(3, Math.floor(self.progress * 4 + 0.02)));
      },
    });
    // this pin is created after the page's other triggers — re-order them by position
    ScrollTrigger.sort();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => st.kill();
  }, []);

  // ---------- 3D scene ----------
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    (async () => {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (cancelled || !host.current) return;
      const el = host.current;
      const mobile = innerWidth < 900;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

      const key = new THREE.DirectionalLight('#fff3e6', 2.2); key.position.set(-4, 6, 5); scene.add(key);
      const rim = new THREE.DirectionalLight('#8B5CF6', 2.6); rim.position.set(5, 2, -4); scene.add(rim);
      const fill = new THREE.DirectionalLight('#9fb7ff', 0.6); fill.position.set(3, -1, 4); scene.add(fill);

      // ----- dimensions -----
      const W = 2.4, BH = 1.7, D = 1.6, LH = 0.42;
      const COLS = 7, ROWS = 5, R = 0.145, CH = 1.3, GAP = 0.315;

      const pack = new THREE.Group();
      scene.add(pack);

      // ----- body: glossy black, turns to glass -----
      const bodyMat = new THREE.MeshPhysicalMaterial({ color: '#0b0d12', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true });
      const body = new THREE.Mesh(new RoundedBoxGeometry(W, BH, D, 8, 0.05), bodyMat);
      body.position.y = BH / 2;
      body.renderOrder = 2;
      pack.add(body);

      const labelTex = await new THREE.TextureLoader().loadAsync(LABEL).catch(() => null);
      if (cancelled) { renderer.dispose(); return; }
      let labelMat = null;
      if (labelTex) {
        labelTex.colorSpace = THREE.SRGBColorSpace;
        labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.35, transparent: true });
        const label = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.96, BH * 0.9), labelMat);
        label.position.set(0, BH / 2 - 0.02, D / 2 + 0.003);
        label.renderOrder = 3;
        pack.add(label);
      }

      // glowing outline that appears in x-ray mode
      const edgeMat = new THREE.LineBasicMaterial({ color: '#A5B4FC', transparent: true, opacity: 0 });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, BH, D)), edgeMat);
      edges.position.y = BH / 2;
      pack.add(edges);

      // ----- lid -----
      const lid = new THREE.Group();
      const lidMat = new THREE.MeshPhysicalMaterial({ color: '#f5c518', roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.2 });
      lid.add(new THREE.Mesh(new RoundedBoxGeometry(W * 1.03, LH, D * 1.04, 8, 0.05), lidMat));
      const chrome = new THREE.MeshStandardMaterial({ color: '#d9dce1', metalness: 1, roughness: 0.18 });
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 12, 40, Math.PI), chrome);
      handle.scale.set(1.2, 0.35, 1); handle.position.set(0, LH / 2, -0.25);
      lid.add(handle);
      const term = (x, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 24), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })); m.position.set(x, LH / 2 + 0.04, D * 0.32); lid.add(m); };
      term(0.6, '#c62828'); term(0.85, '#15171c');
      lid.position.y = BH + LH / 2;
      pack.add(lid);

      // ----- Smart BMS board -----
      const bms = new THREE.Group();
      const pcbMat = new THREE.MeshStandardMaterial({ color: '#0f3d2c', roughness: 0.55, metalness: 0.1 });
      bms.add(new THREE.Mesh(new RoundedBoxGeometry(W * 0.82, 0.05, D * 0.7, 2, 0.015), pcbMat));
      const chipMat = new THREE.MeshStandardMaterial({ color: '#121418', roughness: 0.4 });
      const goldMat = new THREE.MeshStandardMaterial({ color: '#d4a64a', metalness: 1, roughness: 0.3 });
      [[-0.55, -0.2, 0.34, 0.26], [0.1, 0.15, 0.42, 0.3], [0.62, -0.18, 0.22, 0.22], [-0.2, 0.3, 0.16, 0.16], [0.55, 0.3, 0.16, 0.16]].forEach(([x, z, w, d]) => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), chipMat); c.position.set(x, 0.05, z); bms.add(c);
      });
      for (let i = 0; i < 9; i++) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.18), goldMat); g.position.set(-0.85 + i * 0.07, 0.03, 0.42); bms.add(g); }
      const ledMat = new THREE.MeshStandardMaterial({ color: '#3dff9a', emissive: '#3dff9a', emissiveIntensity: 0 });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), ledMat); led.position.set(0.9, 0.05, 0.38); bms.add(led);
      const traceMat = new THREE.MeshBasicMaterial({ color: '#4dffb0', transparent: true, opacity: 0 });
      for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(1.4 - i * 0.12, 0.004, 0.012), traceMat); t.position.set(-0.05, 0.028, -0.32 + i * 0.1); bms.add(t); }
      const bmsBaseY = 0.12 + CH + 0.09;
      bms.position.y = bmsBaseY;
      pack.add(bms);

      // ----- cells (instanced) -----
      const n = COLS * ROWS;
      const cellGeo = new THREE.CylinderGeometry(R, R, CH, 32);
      const capGeo = new THREE.CylinderGeometry(R * 0.92, R * 0.92, 0.04, 32);
      const cellMat = new THREE.MeshPhysicalMaterial({ color: '#1a4fb8', roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: '#6f9bff' });
      const capMat = new THREE.MeshStandardMaterial({ color: '#e3e5ea', metalness: 1, roughness: 0.22 });
      const cells = new THREE.InstancedMesh(cellGeo, cellMat, n);
      const capsT = new THREE.InstancedMesh(capGeo, capMat, n);
      const capsB = new THREE.InstancedMesh(capGeo, capMat, n);
      pack.add(cells, capsT, capsB);
      const home = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const x = (c - (COLS - 1) / 2) * GAP, z = (r - (ROWS - 1) / 2) * GAP;
        home.push({ x, z, d: Math.hypot(x, z * 1.3), rnd: Math.random() });
      }
      // nickel strips across each row
      const nickelMat = new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: 1, roughness: 0.3, transparent: true });
      const strips = [];
      for (let r = 0; r < ROWS; r++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(COLS * GAP, 0.012, 0.09), nickelMat);
        s.position.set(0, 0.12 + CH + 0.03, (r - (ROWS - 1) / 2) * GAP); pack.add(s); strips.push(s);
      }

      // the pack sits centred on its own middle
      pack.position.y = -(BH + LH) / 2;
      const rig = new THREE.Group(); scene.remove(pack); rig.add(pack); scene.add(rig);

      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(el);

      let mx = 0, my = 0, tx = 0, ty = 0;
      const onMove = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
      addEventListener('mousemove', onMove, { passive: true });

      let visible = false, raf = 0, sm = 0;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); });
      io.observe(el);

      function loop(now) {
        if (!visible) { raf = 0; return; }
        const t = now / 1000;
        sm += (prog.current - sm) * 0.09;          // smooth the scroll value
        const p = sm;
        mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;

        const lift = seg(p, 0.2, 0.42) * (1 - seg(p, 0.8, 0.95));
        const xray = seg(p, 0.46, 0.6) * (1 - seg(p, 0.78, 0.9));
        const spread = seg(p, 0.5, 0.72) * (1 - seg(p, 0.78, 0.94));
        const glow = seg(p, 0.25, 0.4) * (1 - seg(p, 0.55, 0.65)) + seg(p, 0.9, 1) * 0.6;

        // lid floats up and tips back
        lid.position.y = BH + LH / 2 + lift * 1.9 + spread * 0.6;
        lid.rotation.x = -lift * 0.28;
        lid.rotation.z = lift * 0.06;
        // BMS rises between lid and cells, traces light up
        bms.position.y = bmsBaseY + lift * 0.95 + spread * 0.55;
        bms.rotation.x = -lift * 0.12;
        traceMat.opacity = glow * 0.9;
        ledMat.emissiveIntensity = glow * (2 + Math.sin(t * 6) * 1.2);
        pcbMat.emissive = pcbMat.emissive || new THREE.Color(); pcbMat.emissive.set('#0c6a44'); pcbMat.emissiveIntensity = glow * 0.35;
        // case becomes glass with a glowing outline
        bodyMat.opacity = 1 - xray * 0.9;
        bodyMat.depthWrite = xray < 0.5;
        if (labelMat) labelMat.opacity = 1 - xray;
        edgeMat.opacity = xray * 0.9;
        nickelMat.opacity = 1 - spread;
        // cells spread out in a wave from the centre
        for (let i = 0; i < n; i++) {
          const h = home[i];
          const s = clamp(spread * 1.35 - h.d * 0.12);
          const k = ease(s);
          const x = h.x * (1 + k * 0.85);
          const z = h.z * (1 + k * 1.1) + k * 0.4;
          const y = 0.12 + CH / 2 + k * (0.35 + h.rnd * 0.5) + Math.sin(t * 1.3 + h.rnd * 6) * 0.03 * k;
          q.setFromAxisAngle(v.set(1, 0, 0.4).normalize(), k * (h.rnd - 0.5) * 0.6);
          m4.compose(v.set(x, y, z), q, one); cells.setMatrixAt(i, m4);
          const top = new THREE.Vector3(0, CH / 2 + 0.02, 0).applyQuaternion(q);
          m4.compose(v.set(x + top.x, y + top.y, z + top.z), q, one); capsT.setMatrixAt(i, m4);
          m4.compose(v.set(x - top.x, y - top.y, z - top.z), q, one); capsB.setMatrixAt(i, m4);
        }
        cells.instanceMatrix.needsUpdate = capsT.instanceMatrix.needsUpdate = capsB.instanceMatrix.needsUpdate = true;

        // whole rig: slow turn with scroll, a touch of mouse, faces front at the end
        rig.rotation.y = -0.75 + p * 0.95 + Math.sin(t * 0.4) * 0.04 + mx * 0.25;
        rig.rotation.x = 0.06 + my * 0.08;
        rig.position.y = Math.sin(t * 0.8) * 0.04;
        const dist = (mobile ? 15 : 12.5) + spread * 2.2 + lift * 1.4;
        const ox = mobile ? 0 : -1.5 - spread * 0.15;      // keep the pack in the right half, clear of the text
        camera.position.set(ox, 3.2 + lift * 0.6, dist);
        camera.lookAt(ox, 0.55 + lift * 0.75 + spread * 0.2, 0);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      }
      setReady(true);

      dispose = () => {
        cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
        removeEventListener('mousemove', onMove);
        scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => m.dispose()); });
        labelTex?.dispose(); scene.environment?.dispose(); pmrem.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => { cancelled = true; dispose(); };
  }, []);

  const s = STEPS[step];
  return (
    <section className="xp" id="inside" data-theme="dark" ref={sec} aria-label="Inside a Litpax battery pack">
      <div className="xp-bg" aria-hidden="true" />
      <div className={`xp-canvas${ready ? ' on' : ''}`} ref={host} aria-hidden="true" />
      <div className="xp-ui wrap">
        <div className="xp-copy">
          <div className="sx-meta"><span className="sx-n">02</span><span className="sx-l">Inside the pack</span></div>
          <div className="xp-step" key={step}>
            <span className="xp-k">0{step + 1} — {s.k}</span>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
            <ul className="xp-chips">{s.chips.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
        <ol className="xp-rail" aria-hidden="true">
          {STEPS.map((x, i) => (
            <li key={x.k} className={i === step ? 'on' : i < step ? 'done' : ''}><span>0{i + 1}</span>{x.k}</li>
          ))}
        </ol>
      </div>
      <div className="xp-hint" aria-hidden="true">Scroll to look inside</div>
    </section>
  );
}
