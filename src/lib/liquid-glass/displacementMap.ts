export type DisplacementMapOptions = {
  /** Size of the surface, in pixels. */
  width: number;
  height: number;
  /** Corner radius of the surface, in pixels. */
  radius: number;
  /** Width of the refracting rim, in pixels. */
  bezel: number;
};

/* A larger map is drawn smaller and stretched by the filter: it is smooth, so nothing shows. */
const MAX_PIXELS = 160_000;
const CACHE_SIZE = 24;
const cache = new Map<string, string>();

/**
 * Displacement map of a rounded pane for `feDisplacementMap`, as a data URL: red is the horizontal shift, green
 * the vertical one, 128 none. The middle is flat; along the rim the shift points inward and grows toward the
 * edge following a circular arc. Returns `undefined` when no canvas is available.
 */
export function createDisplacementMap({ width, height, radius, bezel }: DisplacementMapOptions): string | undefined {
  const key = `${width}:${height}:${radius}:${bezel}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const density = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
  const w = Math.max(1, Math.round(width * density));
  const h = Math.max(1, Math.round(height * density));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d');
  if (!context) return undefined;

  const halfW = width / 2;
  const halfH = height / 2;
  const depth = Math.max(1, Math.min(bezel, halfW, halfH));
  // Corners at least as round as the rim is wide: sharper, its two sides would meet in a visible seam.
  const r = Math.min(Math.max(radius, depth), halfW, halfH);

  const image = context.createImageData(w, h);
  const data = image.data;
  // No shift anywhere (opaque 128, 128, 128), then only the rim is computed.
  new Uint32Array(data.buffer).fill(0xff808080);
  const reach = Math.max(depth, r);
  const rimX = Math.ceil((reach / width) * w) + 1;
  const rimY = Math.ceil((reach / height) * h) + 1;
  for (let y = 0; y < h; y++) {
    const flatRow = y >= rimY && y < h - rimY;
    for (let x = 0; x < w; x++) {
      // Jump over the flat middle of the row.
      if (flatRow && x === rimX && w - rimX > rimX) x = w - rimX;
      const px = ((x + 0.5) / w) * width - halfW;
      const py = ((y + 0.5) / h) * height - halfH;
      // Signed distance to the rounded rectangle (negative inside) and its outward normal.
      const qx = Math.abs(px) - halfW + r;
      const qy = Math.abs(py) - halfH + r;
      let distance: number;
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy);
        distance = length - r;
        nx = qx / length;
        ny = qy / length;
      } else if (qx > qy) {
        distance = qx - r;
        nx = 1;
      } else {
        distance = qy - r;
        ny = 1;
      }

      const t = Math.min(1, Math.max(0, -distance / depth));
      const bend = 1 - Math.sqrt(1 - (1 - t) ** 2);
      const i = (y * w + x) * 4;
      data[i] = 128 - Math.sign(px) * nx * bend * 127;
      data[i + 1] = 128 - Math.sign(py) * ny * bend * 127;
    }
  }
  context.putImageData(image, 0, 0);

  const url = canvas.toDataURL();
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value!);
  cache.set(key, url);
  return url;
}
