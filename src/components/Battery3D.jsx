import { useEffect, useRef, useState } from 'react';

// Real-time 3D model of the Litpax 60V 32Ah EV pack — full 360°.
// Front = the real label (from the clean front photo). Lid, body, screws,
// chrome handle, cables and the grey connector are modelled from the product
// photos, so the pack looks right from every side.
// Three.js loads only when this component mounts.
const BASE = import.meta.env.BASE_URL;
const FRONT = `${BASE}model/label-60v32ah-hd.webp`;     // 2048px label: photo artwork + crisp vector text
const LID_RATIO = 0.243;          // yellow lid share of the front photo's height

export default function Battery3D({ fallback, alt }) {
  const host = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    (async () => {
      try {
        const THREE = await import('three');
        const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        if (cancelled || !host.current) return;
        const el = host.current;
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---------- renderer / scene / camera ----------
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        // HD: render at least at 2x (supersampling on normal screens), capped at 2.5 for performance
        renderer.setPixelRatio(Math.min(2.5, Math.max(2, devicePixelRatio)));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);

        // ---------- lights: warm key, warm rim, soft fill ----------
        const key = new THREE.DirectionalLight('#fff4e6', 2.5); key.position.set(-3, 4, 4); scene.add(key);
        key.castShadow = true;                                   // real shadows (handle & cables on the lid, pack on the floor)
        key.shadow.mapSize.set(2048, 2048);
        Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 15 });
        key.shadow.radius = 6; key.shadow.bias = -0.0004;
        const rim = new THREE.DirectionalLight('#ff9a6b', 1.5); rim.position.set(4, 1.5, -3); scene.add(rim);
        const back = new THREE.DirectionalLight('#ffd9c2', 1.0); back.position.set(-3, 2, -4); scene.add(back);
        const fill = new THREE.DirectionalLight('#ffffff', 0.7); fill.position.set(4, 0.5, 2); scene.add(fill);
        scene.add(new THREE.AmbientLight('#ffffff', 0.25));

        // ---------- textures ----------
        const aniso = renderer.capabilities.getMaxAnisotropy();
        const frontSrc = await new THREE.TextureLoader().loadAsync(FRONT);
        frontSrc.colorSpace = THREE.SRGBColorSpace; frontSrc.anisotropy = aniso;
        // body front = the HD label. The label covers the lower 92.5% of the body face; the strip
        // above it repeats the label's dark top edge (ClampToEdge), exactly like the real pack.
        const bodyFront = frontSrc;
        frontSrc.generateMipmaps = true; frontSrc.minFilter = THREE.LinearMipmapLinearFilter; frontSrc.magFilter = THREE.LinearFilter;
        frontSrc.wrapS = frontSrc.wrapT = THREE.ClampToEdgeWrapping;
        frontSrc.repeat.set(1, 1 / 0.925);
        const canvasTex = (w, h, draw) => {
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          draw(c.getContext('2d'), w, h);
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t;
        };
        const screw = (g, x, y, r = 9) => {
          const s = g.createRadialGradient(x - 2, y - 2, 1, x, y, r + 1); s.addColorStop(0, '#f2f2f2'); s.addColorStop(1, '#5a5a5a');
          g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#2d2d2d'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - r * .55, y); g.lineTo(x + r * .55, y); g.moveTo(x, y - r * .55); g.lineTo(x, y + r * .55); g.stroke();
        };
        const yellow = (g, w, h) => { const y = g.createLinearGradient(0, 0, 0, h); y.addColorStop(0, '#ffdc3c'); y.addColorStop(1, '#e9b900'); g.fillStyle = y; g.fillRect(0, 0, w, h); };
        const lidSide = canvasTex(512, 128, (g, w, h) => {                       // lid sides: yellow + a row of screws
          yellow(g, w, h); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, h * 0.42, w, 3);
          [0.12, 0.37, 0.63, 0.88].forEach((x) => screw(g, w * x, h * 0.72, 8));
        });
        const lidFront = canvasTex(1024, 220, (g, w, h) => {                     // lid front: yellow, step line, 3 screws
          yellow(g, w, h); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, h * 0.5, w, 4);
          g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 6, w, 6);
          [0.13, 0.49, 0.85].forEach((x) => screw(g, w * x, h * 0.75, 12));
        });
        const lidTop = canvasTex(512, 512, (g, w, h) => {
          yellow(g, w, h);
          g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52);
          g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(30, 30, w - 60, 8);
        });
        const bodySide = canvasTex(512, 512, (g, w, h) => {                      // plain dark navy, soft vertical sheen
          const b = g.createLinearGradient(0, 0, w, 0); b.addColorStop(0, '#1a2234'); b.addColorStop(0.5, '#222b40'); b.addColorStop(1, '#161d2c');
          g.fillStyle = b; g.fillRect(0, 0, w, h);
          const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(255,255,255,.04)'); v.addColorStop(1, 'rgba(0,0,0,.25)');
          g.fillStyle = v; g.fillRect(0, 0, w, h);
        });
        const dark = canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#0a0e17'; g.fillRect(0, 0, w, h); });

        // ---------- geometry (sizes from the product photos) ----------
        const W = 2, H = W / 1.1545, D = 1.45;
        const lidH = H * LID_RATIO, bodyH = H - lidH;
        const paint = (map, rough = 0.4, coat = 0.5) => new THREE.MeshPhysicalMaterial({ map, roughness: rough, clearcoat: coat, clearcoatRoughness: 0.3 });
        const group = new THREE.Group();

        const body = new THREE.Mesh(new RoundedBoxGeometry(W, bodyH, D, 10, 0.035),
          [paint(bodySide), paint(bodySide), paint(dark), paint(dark, 0.8, 0), paint(bodyFront, 0.3, 0.9), paint(bodySide)]);
        body.position.y = -H / 2 + bodyH / 2;
        const lid = new THREE.Mesh(new RoundedBoxGeometry(W * 1.03, lidH, D * 1.04, 10, 0.035),
          [paint(lidSide, 0.38, 0.6), paint(lidSide, 0.38, 0.6), paint(lidTop, 0.36, 0.6), paint(dark, 0.8, 0), paint(lidFront, 0.36, 0.6), paint(lidSide, 0.38, 0.6)]);
        lid.position.y = H / 2 - lidH / 2;
        group.add(body, lid);

        // chrome handle bracket on top (towards the back)
        const chrome = new THREE.MeshStandardMaterial({ color: '#d9dce1', metalness: 1, roughness: 0.2 });
        const plate = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.03, 0.42, 3, 0.012), chrome); plate.position.set(-0.05, H / 2 + 0.015, -0.2);
        const loopGeo = new THREE.TorusGeometry(0.42, 0.03, 12, 40, Math.PI);
        const handleBar = new THREE.Mesh(loopGeo, chrome); handleBar.scale.set(1.25, 0.32, 1); handleBar.position.set(-0.05, H / 2 + 0.03, -0.2);
        group.add(plate, handleBar);

        // cable glands + red/black wires + grey connector (front-right of the lid)
        const gland = (x) => {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.07, 24), new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 }));
          m.position.set(x, H / 2 + 0.035, D * 0.36); return m;
        };
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.45 }));
        cap.position.set(0.18, H / 2 + 0.03, D * 0.36);
        group.add(gland(0.5), gland(0.72), cap);
        const plug = new THREE.Group();
        const grey = new THREE.MeshStandardMaterial({ color: '#b9bec6', roughness: 0.55 });
        const housing = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.3, 0.24, 3, 0.03), grey);
        const ridge = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.22, 0.26, 2, 0.02), new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.6 }));
        plug.add(housing, ridge);
        plug.position.set(0.66, H / 2 + 0.78, D * 0.36); plug.rotation.z = -0.25;
        group.add(plug);
        const wire = (x, color) => {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, H / 2 + 0.06, D * 0.36),
            new THREE.Vector3(x - 0.02, H / 2 + 0.3, D * 0.38),
            new THREE.Vector3(x - 0.06, H / 2 + 0.55, D * 0.37),
            new THREE.Vector3(0.6 + (x - 0.61) * 0.5, H / 2 + 0.64, D * 0.36),
          ]);
          return new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.028, 10), new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
        };
        group.add(wire(0.5, '#d22b2b'), wire(0.72, '#141414'));
        group.position.y = -0.15;
        group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(group);

        // floor that only shows the real shadow
        const floor = new THREE.Mesh(new THREE.CircleGeometry(2.3, 64), new THREE.ShadowMaterial({ opacity: 0.1 }));
        floor.rotation.x = -Math.PI / 2; floor.position.y = group.position.y - H / 2 - 0.005; floor.receiveShadow = true;
        scene.add(floor);

        // ---------- energy: glowing ring on the floor + floating sparks ----------
        const glowTex = canvasTex(512, 512, (g, w, h) => {
          const r = g.createRadialGradient(w / 2, h / 2, w * 0.36, w / 2, h / 2, w / 2);
          r.addColorStop(0, 'rgba(255,120,80,0)'); r.addColorStop(0.55, 'rgba(255,120,80,.9)'); r.addColorStop(0.75, 'rgba(255,190,90,.35)'); r.addColorStop(1, 'rgba(255,120,80,0)');
          g.fillStyle = r; g.fillRect(0, 0, w, h);
        });
        const ring = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = floor.position.y + 0.01;
        scene.add(ring);
        const ring2 = ring.clone(); ring2.material = ring.material.clone(); scene.add(ring2);
        const sparkTex = canvasTex(64, 64, (g, w, h) => {
          const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          r.addColorStop(0, 'rgba(255,240,210,1)'); r.addColorStop(0.3, 'rgba(255,170,90,.7)'); r.addColorStop(1, 'rgba(255,120,80,0)');
          g.fillStyle = r; g.fillRect(0, 0, w, h);
        });
        const N = 90, pos = new Float32Array(N * 3), seeds = [];
        for (let i = 0; i < N; i++) {
          const a = Math.random() * Math.PI * 2, rad = 1.5 + Math.random() * 1.3;
          seeds.push({ a, rad, y: Math.random() * 3, s: 0.15 + Math.random() * 0.35, w: (Math.random() - 0.5) * 0.4 });
        }
        const sparksGeo = new THREE.BufferGeometry(); sparksGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const sparks = new THREE.Points(sparksGeo, new THREE.PointsMaterial({ size: 0.09, map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
        scene.add(sparks);
        const floorY = floor.position.y;
        const updateSparks = (dt) => {
          for (let i = 0; i < N; i++) {
            const s = seeds[i];
            s.y += s.s * dt; s.a += s.w * dt * 0.3;
            if (s.y > 3.2) { s.y = 0; s.a = Math.random() * Math.PI * 2; }
            pos[i * 3] = Math.cos(s.a) * s.rad; pos[i * 3 + 1] = floorY + s.y; pos[i * 3 + 2] = Math.sin(s.a) * s.rad;
          }
          sparksGeo.attributes.position.needsUpdate = true;
        };
        updateSparks(0);

        // soft contact shadow
        const shadowTex = canvasTex(256, 256, (g, w, h) => {
          const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(0.55, 'rgba(0,0,0,.2)'); r.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = r; g.fillRect(0, 0, w, h);
        });
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.0), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2; shadow.position.y = group.position.y - H / 2 - 0.01;
        scene.add(shadow);

        // ---------- sizing ----------
        const size = () => {
          const w = el.clientWidth, h = el.clientHeight;
          renderer.setSize(w, h, false);
          renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
          camera.aspect = w / h;
          camera.position.set(0, 1.25, w / h < 1 ? 9.2 : 8.6);
          camera.lookAt(0, 0.2, 0);
          camera.updateProjectionMatrix();
        };
        size();
        const ro = new ResizeObserver(size); ro.observe(el);

        // ---------- motion: continuous 360° turn, drag to spin (with inertia) ----------
        let ry = -0.6, vel = 0, tilt = 0, tiltT = 0, drag = null, lastX = 0, raf = 0, visible = true;
        const AUTO = 0.0045;                                   // radians per frame (~1 turn / 23 s)
        const onMove = (e) => { tiltT = (e.clientY / innerHeight - 0.5) * 0.16; };
        const down = (e) => { drag = e.pointerId; lastX = e.clientX; vel = 0; el.setPointerCapture?.(e.pointerId); el.classList.add('grabbing'); };
        const move = (e) => { if (drag === null) return; const dx = e.clientX - lastX; lastX = e.clientX; ry += dx * 0.012; vel = dx * 0.012; };
        const up = () => { if (drag === null) return; drag = null; el.classList.remove('grabbing'); };
        if (!reduce) {
          addEventListener('mousemove', onMove);
          el.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf && !reduce) loop(); }, { threshold: 0 });
        io.observe(el);
        const clock = new THREE.Clock();
        const loop = () => {
          raf = 0;
          if (!visible) return;
          const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
          if (drag === null) { ry += AUTO + vel; vel *= 0.94; }    // after a flick it keeps spinning, then settles into the slow turn
          tilt += (tiltT - tilt) * 0.05;
          group.rotation.set(tilt, ry, 0);
          group.position.y = -0.15 + Math.sin(t * 1.1) * 0.05;
          shadow.scale.setScalar(1 - Math.sin(t * 1.1) * 0.04);
          // two energy rings pulse outwards one after the other
          [ring, ring2].forEach((r, i) => { const p = ((t * 0.35) + i * 0.5) % 1; r.scale.setScalar(0.6 + p * 0.9); r.material.opacity = 0.6 * (1 - p); });
          updateSparks(dt);
          renderer.render(scene, camera);
          raf = requestAnimationFrame(loop);
        };
        if (reduce) { group.rotation.y = -0.6; renderer.render(scene, camera); } else loop();
        setReady(true);

        dispose = () => {
          cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
          removeEventListener('mousemove', onMove); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
          scene.traverse((o) => { o.geometry?.dispose?.(); [].concat(o.material || []).forEach((m) => { m.map?.dispose?.(); m.dispose?.(); }); });
          pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
        };
      } catch (e) {
        console.warn('3D battery unavailable, showing photo instead:', e);
        setFailed(true);
      }
    })();
    return () => { cancelled = true; dispose(); };
  }, []);

  return (
    <div className={`battery3d${ready ? ' ready' : ''}`} ref={host} aria-label={alt} role="img">
      {(failed || !ready) && fallback && <img className="battery3d-fallback" src={fallback} alt={alt} width="1200" height="900" />}
    </div>
  );
}
