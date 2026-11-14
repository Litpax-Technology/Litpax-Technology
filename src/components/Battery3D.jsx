import { useEffect, useRef, useState } from 'react';

// A real-time 3D model of the Litpax 60V 32Ah EV pack.
// Front face = the real label (cut from the front-view photo); lid, sides,
// top, handle and lighting are modelled — so it can turn without looking flat.
// Three.js is loaded only when this component mounts (keeps the first load fast).
const BASE = import.meta.env.BASE_URL;
const FRONT = `${BASE}model/front-60v32ah.webp`;
const LID = '#f6c812';          // yellow lid (sampled from the photo)
const BODY = '#121a2c';         // dark navy body
const LID_RATIO = 0.243;        // yellow band height on the front texture

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
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, 0.55, 7.2);
        camera.lookAt(0, -0.05, 0);

        // ---------- lights: warm key, red rim, soft fill ----------
        const key = new THREE.DirectionalLight('#fff4e6', 2.5); key.position.set(-3, 4, 4); scene.add(key);
        const rim = new THREE.DirectionalLight('#ff9a6b', 1.4); rim.position.set(4, 1.5, -3); scene.add(rim);   // warm rim, matches the glow
        const fill = new THREE.DirectionalLight('#ffffff', 0.7); fill.position.set(4, 0.5, 2); scene.add(fill);
        scene.add(new THREE.AmbientLight('#ffffff', 0.25));

        // ---------- textures ----------
        const maxAniso = renderer.capabilities.getMaxAnisotropy();
        const front = await new THREE.TextureLoader().loadAsync(FRONT);
        front.colorSpace = THREE.SRGBColorSpace; front.anisotropy = maxAniso;
        const canvasTex = (w, h, draw) => {
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          draw(c.getContext('2d'), w, h);
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
        };
        const screw = (g, x, y) => {
          const r = g.createRadialGradient(x - 2, y - 2, 1, x, y, 9); r.addColorStop(0, '#e9e9e9'); r.addColorStop(1, '#5d5d5d');
          g.fillStyle = r; g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.moveTo(x, y - 5); g.lineTo(x, y + 5); g.stroke();
        };
        // side / back: yellow lid band + dark body
        const sideTex = canvasTex(512, 512, (g, w, h) => {
          const lid = h * LID_RATIO;
          const body = g.createLinearGradient(0, lid, 0, h); body.addColorStop(0, '#1b2233'); body.addColorStop(1, '#0d1119');
          g.fillStyle = body; g.fillRect(0, lid, w, h - lid);
          const y = g.createLinearGradient(0, 0, 0, lid); y.addColorStop(0, '#ffd83a'); y.addColorStop(1, '#e8b800');
          g.fillStyle = y; g.fillRect(0, 0, w, lid);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, lid - 3, w, 6);            // seam between lid and body
          g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, lid * 0.55, w, 3);        // lid step
          screw(g, w * 0.15, lid * 0.78); screw(g, w * 0.85, lid * 0.78);
          g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2;               // subtle panel lines
          for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(w * i / 4, lid + 30); g.lineTo(w * i / 4, h - 30); g.stroke(); }
        });
        const topTex = canvasTex(512, 512, (g, w, h) => {
          const y = g.createLinearGradient(0, 0, w, h); y.addColorStop(0, '#ffd83a'); y.addColorStop(1, '#e9b900');
          g.fillStyle = y; g.fillRect(0, 0, w, h);
          g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 8; g.strokeRect(34, 34, w - 68, h - 68);
          g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(40, 40, w - 80, 10);
          screw(g, 60, 60); screw(g, w - 60, 60); screw(g, 60, h - 60); screw(g, w - 60, h - 60);
        });
        const bottomTex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#0a0f1a'; g.fillRect(0, 0, w, h); });

        // ---------- the battery ----------
        const W = 2, H = W / 1.1545, D = 1.4;
        const body = new THREE.Mesh(
          new RoundedBoxGeometry(W, H, D, 5, 0.045),
          [
            new THREE.MeshPhysicalMaterial({ map: sideTex, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),   // right
            new THREE.MeshPhysicalMaterial({ map: sideTex, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),   // left
            new THREE.MeshPhysicalMaterial({ map: topTex, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25 }),   // top
            new THREE.MeshStandardMaterial({ map: bottomTex, roughness: 0.8 }),                                            // bottom
            new THREE.MeshPhysicalMaterial({ map: front, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.18 }),    // front (label)
            new THREE.MeshPhysicalMaterial({ map: sideTex, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),   // back
          ]
        );
        const group = new THREE.Group();
        group.add(body);
        // chrome carry handle on top
        const chrome = new THREE.MeshStandardMaterial({ color: '#d8dbe0', metalness: 1, roughness: 0.22 });
        const postGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
        const p1 = new THREE.Mesh(postGeo, chrome); p1.position.set(-0.55, H / 2 + 0.08, 0);
        const p2 = p1.clone(); p2.position.x = 0.55;
        const bar = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.06, 0.16, 3, 0.025), chrome); bar.position.set(0, H / 2 + 0.17, 0);
        group.add(p1, p2, bar);
        // terminal posts (red / black) on the lid
        const term = (color, x) => {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.09, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.35 }));
          m.position.set(x, H / 2 + 0.045, 0.42); return m;
        };
        group.add(term('#d62b2b', 0.62), term('#1b1b1b', 0.82));
        group.position.y = 0.1;
        scene.add(group);

        // soft contact shadow
        const shadowTex = canvasTex(256, 256, (g, w, h) => {
          const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          r.addColorStop(0, 'rgba(0,0,0,.65)'); r.addColorStop(0.55, 'rgba(0,0,0,.22)'); r.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = r; g.fillRect(0, 0, w, h);
        });
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2; shadow.position.y = group.position.y - H / 2 - 0.01;
        scene.add(shadow);

        // ---------- sizing ----------
        const size = () => {
          const w = el.clientWidth, h = el.clientHeight;
          renderer.setSize(w, h, false);
          renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
          camera.aspect = w / h;
          camera.position.z = w / h < 1 ? 8.8 : 8.2;
          camera.updateProjectionMatrix();
        };
        size();
        const ro = new ResizeObserver(size); ro.observe(el);

        // ---------- motion: idle sway + mouse + drag to turn ----------
        const base = -0.5;                 // shows the front and the right side
        let tx = 0, ty = 0, rx = 0, ry = base, drag = null, dragY = 0, visible = true, raf = 0;
        const onMove = (e) => { tx = (e.clientX / innerWidth - 0.5) * 0.6; ty = (e.clientY / innerHeight - 0.5) * 0.18; };
        const down = (e) => { drag = e.clientX; el.setPointerCapture?.(e.pointerId); el.classList.add('grabbing'); };
        const moveDrag = (e) => { if (drag === null) return; dragY += (e.clientX - drag) * 0.012; drag = e.clientX; };
        const up = () => { drag = null; el.classList.remove('grabbing'); };
        if (!reduce) {
          addEventListener('mousemove', onMove);
          el.addEventListener('pointerdown', down); addEventListener('pointermove', moveDrag); addEventListener('pointerup', up);
        }
        const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) loop(); }, { threshold: 0 });
        io.observe(el);
        const clock = new THREE.Clock();
        const loop = () => {
          raf = 0;
          if (!visible) return;
          const t = clock.getElapsedTime();
          if (drag === null) dragY *= 0.95;                         // after a drag, ease back to the hero angle
          const targetY = base + Math.sin(t * 0.45) * 0.22 + tx + dragY;
          ry += (targetY - ry) * 0.06;
          rx += (ty + 0.04 - rx) * 0.06;
          group.rotation.set(rx, ry, 0);
          group.position.y = 0.1 + Math.sin(t * 1.1) * 0.05;
          shadow.scale.setScalar(1 - Math.sin(t * 1.1) * 0.04);
          renderer.render(scene, camera);
          raf = requestAnimationFrame(loop);
        };
        if (reduce) { group.rotation.y = base; renderer.render(scene, camera); } else loop();
        setReady(true);

        dispose = () => {
          cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
          removeEventListener('mousemove', onMove); removeEventListener('pointermove', moveDrag); removeEventListener('pointerup', up);
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
