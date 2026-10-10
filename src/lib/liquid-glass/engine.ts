import { createDisplacementMap } from './displacementMap';

const SURFACES = ['glass-thin', 'glass', 'glass-strong', 'glass-dialog', 'glass-stained', 'glass-ring']
  .map((name) => `[class~="hx:${name}"]`)
  .join(',');
const REFRACTION = '--hx-liquid-refraction';
const SVG_NS = 'http://www.w3.org/2000/svg';
/* Smaller surfaces (buttons, chips) stay flat: their rim is too thin to read, and dozens of them refracting
   while a form scrolls make it stutter. */
const MIN_SIZE = 48;
/* A resizing surface drops its refraction until its size has held this long: redrawing a map on every frame of
   an animation makes it stutter. */
const SETTLE_MS = 140;

type Shape = {
  id: string;
  width: number;
  height: number;
  radius: number;
  bezel: number;
  scale: number;
  fringe: number;
};
type Filter = { node: SVGFilterElement; ready: boolean; users: number };
type Surface = { width: number; height: number; settledAt: number; filter?: string };

/* Only Chromium runs SVG filters in backdrop-filter. Other engines accept the syntax and then drop the whole
   declaration, blur included. */
export function supportsRefraction() {
  return /Chrome\//.test(navigator.userAgent) && !window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
}

function svg<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function token(style: CSSStyleDeclaration, name: string) {
  return parseFloat(style.getPropertyValue(name)) || 0;
}

/** What a surface of this size refracts like, or `undefined` when it should stay flat. */
function shapeOf(element: HTMLElement, width: number, height: number): Shape | undefined {
  if (width < MIN_SIZE || height < MIN_SIZE) return undefined;
  const style = getComputedStyle(element);
  const bend = token(style, '--hx-liquid-bend');
  const bezel = token(style, '--hx-liquid-bezel');
  if (bend <= 0 || bezel <= 0) return undefined;

  const fringe = Math.min(1, Math.max(0, token(style, '--hx-liquid-fringe'))) * 0.2;
  const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2);
  // A surface narrower than two rims has a narrower rim, and bends as much less.
  const scale = (2 * bend * Math.min(bezel, width / 2, height / 2)) / bezel;
  const id = `hx-liquid-${[width, height, radius, bezel, scale, fringe].join('-').replaceAll('.', '_')}`;
  return { id, width, height, radius, bezel, scale, fringe };
}

function createFilterNode({ id, width, height, scale, fringe }: Shape, href: string) {
  const filter = svg('filter', {
    id,
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
    'color-interpolation-filters': 'sRGB',
  });
  const displace = (amount: number, result: string) =>
    svg('feDisplacementMap', {
      in: 'SourceGraphic',
      in2: 'map',
      scale: amount,
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result,
    });

  filter.append(svg('feImage', { href, x: 0, y: 0, width, height, preserveAspectRatio: 'none', result: 'map' }));
  if (fringe <= 0) {
    filter.append(displace(scale, 'bent'));
    return filter;
  }

  // Each color bends a little differently: red the most, blue the least.
  const channels = [
    { name: 'red', scale: scale * (1 + fringe), keep: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { name: 'green', scale, keep: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { name: 'blue', scale: scale * (1 - fringe), keep: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
  ];
  for (const channel of channels) {
    filter.append(
      displace(channel.scale, `${channel.name}-bent`),
      svg('feColorMatrix', { in: `${channel.name}-bent`, type: 'matrix', values: channel.keep, result: channel.name }),
    );
  }
  filter.append(
    svg('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'red-green' }),
    svg('feBlend', { in: 'red-green', in2: 'blue', mode: 'screen' }),
  );
  return filter;
}

function run(): () => void {
  if (!supportsRefraction()) return () => {};

  const defs = svg('svg', { 'aria-hidden': 'true', width: 0, height: 0 });
  defs.style.cssText = 'position:fixed;pointer-events:none';
  document.body.append(defs);

  const filters = new Map<string, Filter>();
  const surfaces = new Map<HTMLElement, Surface>();
  const dirty = new Set<HTMLElement>();
  // Elements whose style the engine has just written, so its own writes are not taken for a change.
  const written = new Set<HTMLElement>();
  let removed = false;
  let frame = 0;
  let timer = 0;

  const schedule = () => {
    frame ||= requestAnimationFrame(flush);
  };

  function assign(element: HTMLElement, surface: Surface, id: string | undefined) {
    if (surface.filter === id) return;
    const previous = surface.filter && filters.get(surface.filter);
    if (previous) previous.users--;
    const next = id && filters.get(id);
    if (next) next.users++;

    surface.filter = id;
    written.add(element);
    if (id) element.style.setProperty(REFRACTION, `url(#${id})`);
    else element.style.removeProperty(REFRACTION);
  }

  function filterFor(shape: Shape) {
    const existing = filters.get(shape.id);
    if (existing) return existing;
    const href = createDisplacementMap(shape);
    if (!href) return undefined;

    const filter: Filter = { node: createFilterNode(shape, href), ready: false, users: 0 };
    filters.set(shape.id, filter);
    defs.append(filter.node);

    // Until its map is decoded a filter shifts the whole backdrop: surfaces only get it once it is ready.
    const image = new Image();
    image.src = href;
    image.decode().then(
      () => {
        filter.ready = true;
        for (const [element, surface] of surfaces) if (!surface.filter) dirty.add(element);
        schedule();
      },
      () => {
        filter.node.remove();
        filters.delete(shape.id);
      },
    );
    return filter;
  }

  function update(element: HTMLElement, surface: Surface, now: number) {
    // The blur layer covers the border box.
    const { offsetWidth: width, offsetHeight: height } = element;
    const resized = surface.width !== width || surface.height !== height;
    if (resized && surface.settledAt > 0) surface.settledAt = now + SETTLE_MS;
    surface.width = width;
    surface.height = height;

    if (now < surface.settledAt) {
      assign(element, surface, undefined);
      return true;
    }
    surface.settledAt ||= now;
    const shape = shapeOf(element, width, height);
    const filter = shape && filterFor(shape);
    if (!filter?.ready) assign(element, surface, undefined);
    else assign(element, surface, shape!.id);
    return false;
  }

  function track(element: HTMLElement) {
    if (surfaces.has(element)) return;
    surfaces.set(element, { width: 0, height: 0, settledAt: 0 });
    resizes.observe(element);
    dirty.add(element);
  }

  function untrack(element: HTMLElement, surface: Surface) {
    assign(element, surface, undefined);
    resizes.unobserve(element);
    surfaces.delete(element);
  }

  function trackWithin(root: ParentNode) {
    if (root instanceof HTMLElement && root.matches(SURFACES)) track(root);
    for (const element of root.querySelectorAll<HTMLElement>(SURFACES)) track(element);
  }

  function flush() {
    frame = 0;
    if (removed) {
      for (const [element, surface] of surfaces) if (!element.isConnected) untrack(element, surface);
      removed = false;
    }

    const now = performance.now();
    const batch = [...dirty];
    dirty.clear();
    for (const element of batch) {
      const surface = surfaces.get(element);
      if (surface && update(element, surface, now)) dirty.add(element);
    }

    for (const [id, filter] of filters) {
      if (filter.users > 0 || !filter.ready) continue;
      filter.node.remove();
      filters.delete(id);
    }
    clearTimeout(timer);
    if (dirty.size > 0) timer = window.setTimeout(schedule, SETTLE_MS);
  }

  const resizes = new ResizeObserver((entries) => {
    for (const entry of entries) dirty.add(entry.target as HTMLElement);
    schedule();
  });

  // Only what a change can reach is looked at again: the nodes it added or removed, and, since a class or
  // style on any ancestor can change the shape or the tokens of the surfaces under it, those surfaces.
  const mutations = new MutationObserver((records) => {
    for (const { type, target, attributeName, addedNodes, removedNodes } of records) {
      if (defs.contains(target)) continue;
      if (type === 'childList') {
        for (const node of addedNodes) if (node instanceof Element) trackWithin(node);
        removed ||= removedNodes.length > 0;
        continue;
      }

      const element = target as HTMLElement;
      const surface = surfaces.get(element);
      if (attributeName === 'class') {
        const matches = element.matches(SURFACES);
        if (matches && !surface) track(element);
        else if (!matches && surface) {
          untrack(element, surface);
          // A flush drops the filter it no longer uses.
          removed = true;
        }
      } else if (written.has(element)) {
        continue;
      }
      if (surfaces.has(element)) dirty.add(element);
      if (!element.firstElementChild) continue;
      for (const other of surfaces.keys()) if (element.contains(other)) dirty.add(other);
    }
    written.clear();
    if (removed || dirty.size > 0) schedule();
  });
  mutations.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  trackWithin(document);
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    mutations.disconnect();
    resizes.disconnect();
    for (const element of surfaces.keys()) element.style.removeProperty(REFRACTION);
    defs.remove();
  };
}

let users = 0;
let stop: (() => void) | undefined;

/**
 * Draws the refraction of every glass surface of the document and keeps it up to date. The library starts it
 * on import; call it yourself only for another document. Returns a function that stops it.
 */
export function startLiquidGlass(): () => void {
  if (users++ === 0) stop = run();
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    if (--users === 0) stop?.();
  };
}

/** Starts the engine once the document has a body. Does nothing on a server. */
export function startLiquidGlassWhenReady() {
  if (typeof document === 'undefined') return;
  if (document.body) startLiquidGlass();
  else document.addEventListener('DOMContentLoaded', () => startLiquidGlass(), { once: true });
}
