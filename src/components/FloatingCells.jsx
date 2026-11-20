import { useEffect, useRef } from 'react';

// Real-time 3D background: lithium cells (18650-style) float, spin and drift
// with scroll + mouse. Three.js loads lazily and only renders while visible.
// tone: 'light' (on light sections) or 'red' (on the red CTA).
export default function FloatingCells({ count = 14, tone = 'light', className = '' }) {
  const host = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let dispose = () => {};
    let cancelled = false;
    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (cancelled || !host.current) return;
      const el = host.current;
      const small = innerWidth < 760;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 14);
      const key = new THREE.DirectionalLight('#fff1e0', 1.6); key.position.set(-4, 6, 8); scene.add(key);

      // One cell = wrapped body + metal caps + positive nub
      const body = new THREE.CylinderGeometry(0.5, 0.5, 2.2, 40, 1, true);
      const cap = new THREE.CylinderGeometry(0.47, 0.47, 0.12, 40);
      const nub = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24);
      const ring = new THREE.TorusGeometry(0.5, 0.035, 10, 40);
      const metal = new THREE.MeshStandardMaterial({ color: '#d9dbe0', metalness: 1, roughness: 0.22 });
      const wraps = (tone === 'red'
        ? ['#ffffff', '#F3D04A', '#0E1116', '#ffd9da']
        : ['#E5484D', '#F3D04A', '#0E1116', '#2f6fe4', '#E5484D'])
        .map((c) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.15, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 }));

      const cells = [];
      const n = small ? Math.ceil(count * 0.55) : count;
      for (let i = 0; i < n; i++) {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(body, wraps[i % wraps.length]));
        const top = new THREE.Mesh(cap, metal); top.position.y = 1.1; g.add(top);
        const bot = new THREE.Mesh(cap, metal); bot.position.y = -1.1; g.add(bot);
        const p = new THREE.Mesh(nub, metal); p.position.y = 1.2; g.add(p);
        const r1 = new THREE.Mesh(ring, metal); r1.rotation.x = Math.PI / 2; r1.position.y = 1.08; g.add(r1);
        const s = 0.38 + Math.random() * 0.5;
        g.scale.setScalar(s);
        // cells live along the left/right edges so the text in the middle stays readable
        const side = i % 2 ? 1 : -1;
        g.position.set(0, (Math.random() - 0.5) * 9, -Math.random() * 7 - 1);
        g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        g.userData = { base: g.position.clone(), spin: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3), ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 0.5, side, edge: 0.62 + Math.random() * 0.38 };
        scene.add(g);
        cells.push(g);
      }

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(el);

      let mx = 0, my = 0, tx = 0, ty = 0;
      const onMove = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
      addEventListener('mousemove', onMove);

      let visible = false, raf = 0, last = performance.now();
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
      }, { rootMargin: '100px' });
      io.observe(el);

      function loop(now) {
        if (!visible) { raf = 0; return; }
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const t = now / 1000;
        const r = el.getBoundingClientRect();
        const scroll = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;   // -1..1 as the section passes
        mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
        cells.forEach((g) => {
          const u = g.userData;
          g.rotation.x += u.spin.x * dt; g.rotation.y += u.spin.y * dt; g.rotation.z += u.spin.z * dt;
          const depth = 1 + (-g.position.z) * 0.12;
          // visible half-width at this depth, so cells hug the edges at any screen size
          const halfW = Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - u.base.z) * camera.aspect;
          g.position.x = u.side * halfW * u.edge + mx * 1.6 / depth;
          g.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * 0.35 + scroll * 3.5 / depth - my * 1.2 / depth;
        });
        camera.rotation.y = -mx * 0.08; camera.rotation.x = -my * 0.05;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      }

      dispose = () => {
        cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
        removeEventListener('mousemove', onMove);
        [body, cap, nub, ring].forEach((g) => g.dispose());
        [metal, ...wraps].forEach((m) => m.dispose());
        scene.environment?.dispose(); pmrem.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => { cancelled = true; dispose(); };
  }, [count, tone]);

  return <div className={`cells3d ${className}`} ref={host} aria-hidden="true" />;
}
