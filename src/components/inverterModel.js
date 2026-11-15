// 3D model of the Litpax LTPX-1212/1500W solar inverter (white cabinet).
// Front = real photo texture; sides are redrawn in HD on canvases from the product photos.
export function buildInverter(THREE, RoundedBoxGeometry, canvasTex, frontTex) {
  const W = 1.75, H = W / 0.929, D = 0.86;            // front ratio from the photo, depth from the 3/4 views
  const group = new THREE.Group();

  // ---------- side textures ----------
  const SW = 600, SH = Math.round(SW * H / D);
  const white = (g, w, h) => {
    const b = g.createLinearGradient(0, 0, 0, h); b.addColorStop(0, '#f5f6f7'); b.addColorStop(1, '#e3e5e8');
    g.fillStyle = b; g.fillRect(0, 0, w, h);
  };
  const screw = (g, x, y, r = 13) => {
    const s = g.createRadialGradient(x - 3, y - 3, 1, x, y, r); s.addColorStop(0, '#fafafa'); s.addColorStop(1, '#8b8f96');
    g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#4a4d52'; g.lineWidth = 3; g.beginPath();
    g.moveTo(x - r * .55, y); g.lineTo(x + r * .55, y); g.moveTo(x, y - r * .55); g.lineTo(x, y + r * .55); g.stroke();
  };
  const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const font = (px, wt = 600) => `${wt} ${px}px "Segoe UI", Arial, sans-serif`;

  // left side (-x): warning sticker, solar connector, hex fan grille, spec sticker
  const fanSide = canvasTex(SW, SH, (g, w, h) => {
    white(g, w, h);
    // warning sticker
    g.fillStyle = '#ffffff'; rrect(g, 36, 50, 270, 270, 6); g.fill(); g.strokeStyle = '#c9ccd1'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#1e88d6'; g.fillRect(36, 50, 270, 42);
    g.fillStyle = '#fff'; g.font = font(17, 700); g.fillText('LITPAX TECHNOLOGY PVT. LTD.', 48, 78);
    g.fillStyle = '#3a3d42'; g.font = font(14, 500);
    ['• Please read the manual carefully', '  before installation.', '• For indoor use only.', '• Ensure proper earth connection.', '• Hazardous voltage at AC input', '  and output terminals.']
      .forEach((t, i) => g.fillText(t, 50, 122 + i * 26));
    g.strokeStyle = '#3a3d42'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { rrect(g, 56 + i * 40, 282, 24, 24, 4); g.stroke(); }
    // solar connector
    g.strokeStyle = '#2b2e33'; g.lineWidth = 3; rrect(g, 340, 70, 220, 170, 12); g.stroke();
    g.fillStyle = '#2b2e33'; g.font = font(26); g.textAlign = 'center'; g.fillText('Solar', 450, 108); g.fillText('Solar', 450, 222);
    const y = g.createLinearGradient(0, 132, 0, 182); y.addColorStop(0, '#f6c544'); y.addColorStop(1, '#c98a10');
    g.fillStyle = y; rrect(g, 395, 132, 110, 50, 10); g.fill();
    g.fillStyle = '#5b3c06'; rrect(g, 420, 146, 22, 22, 4); g.fill(); rrect(g, 458, 146, 22, 22, 4); g.fill();
    g.font = font(40, 700); g.fillText('–', 380, 290); g.fillText('+', 520, 290); g.textAlign = 'left';
    // hex fan grille
    const fx = 40, fy = 370, fw = 520, fh = 560;
    g.fillStyle = '#ffffff'; g.fillRect(fx, fy, fw, fh);
    g.save(); g.beginPath(); g.rect(fx + 30, fy + 30, fw - 60, fh - 60); g.clip();
    const r = 21, dx = r * 1.78, dy = r * 1.55;
    for (let row = 0; row * dy < fh; row++) for (let col = -1; col * dx < fw; col++) {
      const cx = fx + 30 + col * dx + (row % 2 ? dx / 2 : 0), cy = fy + 30 + row * dy;
      g.fillStyle = '#16181b'; g.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86); }
      g.fill();
    }
    // fan hub seen through the grille
    const hub = g.createRadialGradient(fx + fw / 2, fy + fh / 2, 4, fx + fw / 2, fy + fh / 2, 70);
    hub.addColorStop(0, 'rgba(200,205,210,.9)'); hub.addColorStop(1, 'rgba(120,125,130,0)');
    g.fillStyle = hub; g.beginPath(); g.arc(fx + fw / 2, fy + fh / 2, 70, 0, Math.PI * 2); g.fill();
    g.restore();
    [[fx + 2, fy + 2], [fx + fw - 2, fy + 2], [fx + 2, fy + fh - 2], [fx + fw - 2, fy + fh - 2]].forEach(([x, yy]) => screw(g, x, yy));
    // spec sticker
    const sy = 975;
    g.fillStyle = '#d9dbde'; g.fillRect(40, sy, 400, h - sy - 50);
    g.fillStyle = '#26282c'; g.font = font(19, 600);
    ['Model: LTPX-1212/1500W', 'Rated Power: 1500W', 'Capacity: 12V/120Ah', 'MPPT: 18V | 50A (Max) | 800W', 'AC Input: 220V~50Hz, 6.8A', 'AC Output: 220V~50Hz', '(±10%) | 1500W (Max)']
      .forEach((t, i) => g.fillText(t, 58, sy + 42 + i * 40));
    for (let i = 0, x = 60; x < 330; i++) { const bw = [2, 4, 3, 6, 2, 3][i % 6]; g.fillRect(x, sy + 330, bw, 70); x += bw + [3, 2, 4, 3][i % 4]; }
    g.font = font(15, 500); g.fillText('LTPX121500W240001', 64, sy + 424);
  });

  // right side (+x): AC output + AC input sockets, vent panel
  const acSide = canvasTex(SW, SH, (g, w, h) => {
    white(g, w, h);
    g.fillStyle = '#2b2e33'; g.font = font(24); g.textAlign = 'center';
    g.fillText('AC Output', 175, 80); g.fillText('AC Input', 440, 112); g.textAlign = 'left';
    // universal socket
    const sg = g.createLinearGradient(0, 100, 0, 320); sg.addColorStop(0, '#34373c'); sg.addColorStop(1, '#16181b');
    g.fillStyle = sg; rrect(g, 70, 100, 210, 220, 12); g.fill();
    g.fillStyle = '#060708'; rrect(g, 160, 140, 30, 44, 8); g.fill(); rrect(g, 105, 220, 46, 22, 6); g.fill(); rrect(g, 200, 220, 46, 22, 6); g.fill();
    g.beginPath(); g.arc(175, 262, 14, 0, Math.PI * 2); g.fill();
    // IEC input + fuse
    g.fillStyle = sg; rrect(g, 360, 130, 160, 180, 10); g.fill();
    g.fillStyle = '#060708'; rrect(g, 392, 152, 96, 70, 10); g.fill();
    g.fillStyle = '#4a4e54'; [410, 440, 470].forEach((x) => g.fillRect(x - 5, 172, 10, 30));
    g.fillStyle = '#5c6067'; rrect(g, 385, 245, 110, 44, 6); g.fill();
    g.fillStyle = '#2b2e33'; g.font = font(17, 500); g.fillText('Use only with a 250V fuse', 330, 345);
    // vent panel
    const vx = 50, vy = 400, vw = 500, vh = 720;
    g.fillStyle = '#e9ebee'; rrect(g, vx, vy, vw, vh, 14); g.fill(); g.strokeStyle = '#c3c7cc'; g.lineWidth = 3; g.stroke();
    screw(g, vx + vw / 2, vy + 30, 12); screw(g, vx + vw / 2, vy + vh - 30, 12);
    g.fillStyle = '#121416';
    [0, 1, 2].forEach((c) => { for (let i = 0; i < 24; i++) rrect(g, vx + 70 + c * 130, vy + 80 + i * 24.5, 100, 13, 6), g.fill(); });
    screw(g, w - 26, 360, 12); screw(g, w - 26, h - 120, 12);
  });

  const plain = canvasTex(256, 256, (g, w, h) => white(g, w, h));
  const top = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#f1f2f4'; g.fillRect(0, 0, w, h); });

  const paint = (map, rough = 0.32) => new THREE.MeshPhysicalMaterial({ map, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.18, color: '#e6e7ea' });   // slightly off-white so it stands out on the light page
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 10, 0.05),
    [paint(acSide), paint(fanSide), paint(top), paint(plain), paint(frontTex, 0.3), paint(plain)]);
  group.add(body);

  // front lid seam (the front cover is a separate plate, like in the photos)
  const seam = new THREE.Mesh(new THREE.BoxGeometry(W + 0.004, H - 0.08, 0.008), new THREE.MeshStandardMaterial({ color: '#c9ccd1', roughness: 0.6 }));
  seam.position.z = D / 2 - 0.09; seam.scale.set(1, 1, 1); group.add(seam);

  // wall-mount hooks on top, rubber feet below
  const darkGrey = new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.5, metalness: 0.3 });
  const steel = new THREE.MeshStandardMaterial({ color: '#c9cdd3', roughness: 0.25, metalness: 1 });
  [-0.215, 0.23].forEach((fx) => {
    const hook = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.09, 0.07, 3, 0.015), steel);
    hook.position.set(fx * W, H / 2 + 0.04, -D * 0.3);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.075), darkGrey);
    slot.position.copy(hook.position);
    group.add(hook, slot);
  });
  const foot = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24), footMat = new THREE.MeshStandardMaterial({ color: '#b8bcc2', roughness: 0.5 });
  [[-0.38, 0.3], [0.38, 0.3], [-0.38, -0.3], [0.38, -0.3]].forEach(([x, z]) => {
    const f = new THREE.Mesh(foot, footMat); f.position.set(x * W, -H / 2 - 0.025, z * D); group.add(f);
  });

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group, H: H + 0.05 };   // total height incl. feet
}
