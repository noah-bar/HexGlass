export type DisplacementMapOptions = {
  /** Size of the surface, in pixels. */
  width: number;
  height: number;
  /** Corner radius of the surface, in pixels. */
  radius: number;
  /** Width of the refracting rim, in pixels. */
  bezel: number;
};

/* Above this the map is drawn smaller and stretched by the filter: it is smooth, so nothing shows. */
const MAX_PIXELS = 160_000;
const CACHE_SIZE = 24;
const cache = new Map<string, string>();

/**
 * Draws the displacement map of a rounded pane for `feDisplacementMap`: red holds the horizontal shift and green
 * the vertical one, 128 meaning none. The middle of the pane is flat; along the rim the shift points inward and
 * grows toward the edge following a circular arc, like the rounded side of a thick piece of glass.
 * Returns a data URL, or `undefined` when no canvas is available.
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
  // The rim follows corners at least as round as it is wide: with a sharper corner its two sides would meet
  // along the diagonal and leave a visible seam.
  const r = Math.min(Math.max(radius, depth), halfW, halfH);

  const image = context.createImageData(w, h);
  const data = image.data;
  // Opaque (128, 128, 128) everywhere: no shift. Only the rim is then computed.
  new Uint32Array(data.buffer).fill(0xff808080);
  // Round corners reach further in than the straight rim.
  const reach = Math.max(depth, r);
  const rimX = Math.ceil((reach / width) * w) + 1;
  const rimY = Math.ceil((reach / height) * h) + 1;
  for (let y = 0; y < h; y++) {
    const flatRow = y >= rimY && y < h - rimY;
    for (let x = 0; x < w; x++) {
      // Inside a row that only crosses the left and right rims, jump over the flat middle.
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
