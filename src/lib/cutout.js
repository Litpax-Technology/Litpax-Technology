// Cuts a product photo out of its white studio background, in the browser,
// and returns an object URL of a transparent PNG. Results are cached per src.
// The floor shadow is kept as a soft, semi-transparent shadow.
const cache = new Map();

export function cutout(src) {
  if (cache.has(src)) return cache.get(src);
  const job = (async () => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight, N = W * H;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, W, H), d = id.data;

    // flood-fill the light background from the edges (light parts inside the pack stay opaque)
    const seen = new Uint8Array(N), stack = new Int32Array(N);
    let sp = 0;
    const light = (p) => Math.min(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]) >= 200;
    const push = (p) => { if (!seen[p] && light(p)) { seen[p] = 1; stack[sp++] = p; } };
    for (let i = 0; i < W; i++) { push(i); push((H - 1) * W + i); }
    for (let j = 0; j < H; j++) { push(j * W); push(j * W + W - 1); }
    while (sp) {
      const p = stack[--sp], px = p % W;
      if (px > 0) push(p - 1);
      if (px < W - 1) push(p + 1);
      if (p >= W) push(p - W);
      if (p < N - W) push(p + W);
    }
    // soft alpha + colour un-mixing for the background pixels
    for (let p = 0; p < N; p++) {
      if (!seen[p]) continue;
      const i = p * 4;
      const m = Math.min(d[i], d[i + 1], d[i + 2]);
      const a = Math.max(0, Math.min(1, (248 - m) / 70));
      if (a <= 0) { d[i + 3] = 0; continue; }
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - 255 * (1 - a)) / a));
      d[i + 3] = Math.round(a * 255);
    }
    x.putImageData(id, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    return URL.createObjectURL(blob);
  })();
  cache.set(src, job);
  return job;
}
