// Cuts a product photo out of its white studio background, in the browser,
// and returns an object URL of a transparent PNG. Results are cached per src.
// The floor shadow is kept as a soft, semi-transparent shadow.
const cache = new Map();
const cropCache = new Map();

// Same cut-out, cropped tight to the product (the soft floor shadow is left out),
// so the bottom-centre of the image is the bottom-centre of the product.
// Resolves to { url, w, h }.
export function cutoutCropped(src) {
  if (cropCache.has(src)) return cropCache.get(src);
  const job = cutout(src).then(async (url) => {
    const img = new Image();
    img.src = url;
    await loaded(img);
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      if (d[(y * W + i) * 4 + 3] > 200) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 <= x0 || y1 <= y0) return { url, w: W, h: H };
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement('canvas');
    o.width = w; o.height = h;
    o.getContext('2d').drawImage(img, x0, y0, w, h, 0, 0, w, h);
    const blob = await new Promise((r) => o.toBlob(r, 'image/png'));
    return { url: URL.createObjectURL(blob), w, h };
  });
  cropCache.set(src, job);
  return job;
}

export function cutout(src) {
  if (cache.has(src)) return cache.get(src);
  const job = (async () => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    await loaded(img);
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

// Waits for an image to load. img.decode() can stall in background or
// throttled tabs, so this uses the load event and only decodes as a bonus.
function loaded(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
  });
}
