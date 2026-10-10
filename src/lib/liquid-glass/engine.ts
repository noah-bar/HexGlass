import { createDisplacementMap } from './displacementMap';

/* Surfaces whose blur layer can refract: the stylesheet reads --hx-liquid-refraction on each of them. */
const SURFACES = ['glass-thin', 'glass', 'glass-strong', 'glass-dialog', 'glass-clear', 'glass-stained', 'glass-ring']
  .map((name) => `[class~="hx:${name}"]`)
  .join(',');
const REFRACTION = '--hx-liquid-refraction';
const SVG = 'http://www.w3.org/2000/svg';
/* Below this a surface is all rim: bending it only smears it. */
const MIN_SIZE = 24;

/* A surface that changes size (a sidebar collapsing, a toast growing) drops its refraction and gets it back
   once it has kept the same size for this long: redrawing a map on every frame of an animation is what
   makes it stutter, and the plain blur left in the meantime is cheap. */
const SETTLE = 140;

type Filter = { node: SVGFilterElement; ready: boolean; users: number; waiting: Set<HTMLElement> };
type Surface = { width: number; height: number; seen: boolean; settle: number; filter?: string };

/* Only Chromium runs SVG filters in backdrop-filter. Other engines accept the syntax and then drop the whole
   declaration, blur included, so the filter is never handed to them. */
function supportsRefraction() {
  return /Chrome\//.test(navigator.userAgent);
}

function svg<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string | number>) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

/** `scale` is the `feDisplacementMap` scale, twice the largest shift; `fringe` spreads it across the colors. */
function createFilter(id: string, href: string, width: number, height: number, scale: number, fringe: number) {
  const filter = svg('filter', {
    id,
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
    'color-interpolation-filters': 'sRGB',
  });
  filter.append(svg('feImage', { href, x: 0, y: 0, width, height, preserveAspectRatio: 'none', result: 'map' }));
  const bend = (amount: number, result: string) =>
    svg('feDisplacementMap', {
      in: 'SourceGraphic',
      in2: 'map',
      scale: amount,
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result,
    });

  if (fringe <= 0) {
    filter.append(bend(scale, 'bent'));
    return filter;
  }
  // Each color bends a little differently: red the most, blue the least.
  const channels = [
    { name: 'red', scale: scale * (1 + fringe), values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { name: 'green', scale, values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { name: 'blue', scale: scale * (1 - fringe), values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
  ];
  for (const channel of channels) {
    filter.append(
      bend(channel.scale, `${channel.name}-bent`),
      svg('feColorMatrix', {
        in: `${channel.name}-bent`,
        type: 'matrix',
        values: channel.values,
        result: channel.name,
      }),
    );
  }
  filter.append(
    svg('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'red-green' }),
    svg('feBlend', { in: 'red-green', in2: 'blue', mode: 'screen' }),
  );
  return filter;
}

function run(mode: string) {
  const root = document.documentElement;
  // The stylesheet falls back to opaque surfaces here: keep them as they are.
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return () => {};
  root.setAttribute('data-liquid', mode);
  if (!supportsRefraction()) return () => root.removeAttribute('data-liquid');

  const defs = svg('svg', { 'aria-hidden': 'true', width: 0, height: 0 });
  defs.style.cssText = 'position:fixed;pointer-events:none';
  document.body.append(defs);

  const filters = new Map<string, Filter>();
  const surfaces = new Map<HTMLElement, Surface>();
  // Surfaces to look at again on the next frame, and the ones whose style this engine has just written.
  const dirty = new Set<HTMLElement>();
  const settling = new Set<HTMLElement>();
  const written = new Set<HTMLElement>();
  let rescan = true;
  let frame = 0;
  let timer = 0;
  const schedule = () => {
    frame ||= requestAnimationFrame(scan);
  };
  const resizes = new ResizeObserver((entries) => {
    for (const entry of entries) dirty.add(entry.target as HTMLElement);
    schedule();
  });

  function assign(element: HTMLElement, surface: Surface, id: string | undefined) {
    if (surface.filter === id) return;
    const previous = surface.filter && filters.get(surface.filter);
    if (previous) previous.users--;
    surface.filter = id;
    written.add(element);
    if (id) {
      filters.get(id)!.users++;
      element.style.setProperty(REFRACTION, `url(#${id})`);
    } else {
      element.style.removeProperty(REFRACTION);
    }
  }

  /** The filter a surface of this size should use, created on first need; surfaces of one shape share it. */
  function filterFor(element: HTMLElement, width: number, height: number) {
    if (width < MIN_SIZE || height < MIN_SIZE) return undefined;
    const style = getComputedStyle(element);
    const bend = parseFloat(style.getPropertyValue('--hx-liquid-bend')) || 0;
    const bezel = parseFloat(style.getPropertyValue('--hx-liquid-bezel')) || 0;
    if (bend <= 0 || bezel <= 0) return undefined;
    const fringe = Math.min(1, Math.max(0, parseFloat(style.getPropertyValue('--hx-liquid-fringe')) || 0)) * 0.2;
    const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, width / 2, height / 2);

    const id = `hx-liquid-${[width, height, radius, bezel, bend, fringe].join('-').replaceAll('.', '_')}`;
    if (filters.has(id)) return id;
    const href = createDisplacementMap({ width, height, radius, bezel });
    if (!href) return undefined;
    // A small surface has a narrower rim, and bends as much less.
    const depth = Math.min(bezel, width / 2, height / 2);
    const filter: Filter = {
      node: createFilter(id, href, width, height, (2 * bend * depth) / bezel, fringe),
      ready: false,
      users: 0,
      waiting: new Set(),
    };
    filters.set(id, filter);
    defs.append(filter.node);
    // Until the map is decoded the filter would shift the whole backdrop: wait for it.
    const image = new Image();
    image.src = href;
    void image
      .decode()
      .catch(() => {})
      .then(() => {
        filter.ready = true;
        for (const waiting of filter.waiting) dirty.add(waiting);
        filter.waiting.clear();
        schedule();
      });
    return id;
  }

  function update(element: HTMLElement, surface: Surface, now: number) {
    // The blur layer covers the padding box.
    const { clientWidth: width, clientHeight: height } = element;
    if (surface.seen && (surface.width !== width || surface.height !== height)) {
      surface.settle = now + SETTLE;
      assign(element, surface, undefined);
    }
    surface.width = width;
    surface.height = height;
    surface.seen = true;
    if (now < surface.settle) {
      settling.add(element);
      return;
    }

    const id = filterFor(element, width, height);
    const filter = id && filters.get(id);
    if (filter && !filter.ready) filter.waiting.add(element);
    else assign(element, surface, id);
  }

  function scan() {
    frame = 0;
    const now = performance.now();

    if (rescan) {
      rescan = false;
      const found = new Set(document.querySelectorAll<HTMLElement>(SURFACES));
      for (const element of found) {
        if (surfaces.has(element)) continue;
        surfaces.set(element, { width: 0, height: 0, seen: false, settle: 0 });
        resizes.observe(element);
        dirty.add(element);
      }
      for (const [element, surface] of surfaces) {
        if (found.has(element)) continue;
        assign(element, surface, undefined);
        resizes.unobserve(element);
        surfaces.delete(element);
      }
    }

    for (const element of settling) dirty.add(element);
    settling.clear();
    const batch = [...dirty];
    dirty.clear();
    for (const element of batch) {
      const surface = surfaces.get(element);
      if (surface) update(element, surface, now);
    }

    for (const [id, filter] of filters) {
      if (filter.users > 0 || !filter.ready || filter.waiting.size > 0) continue;
      filter.node.remove();
      filters.delete(id);
    }
    if (settling.size > 0) {
      clearTimeout(timer);
      timer = window.setTimeout(schedule, SETTLE);
    }
  }

  // Surfaces come and go (menus, dialogs, toasts), and a class or style on any ancestor can change their shape
  // or their tokens. Only the surfaces a change can reach are looked at again.
  const mutations = new MutationObserver((records) => {
    const targets = new Set<Node>();
    for (const { type, target, attributeName } of records) {
      if (defs.contains(target)) continue;
      if (type === 'childList' || attributeName === 'class') rescan = true;
      if (type === 'attributes' && !(attributeName === 'style' && written.has(target as HTMLElement))) {
        targets.add(target);
      }
    }
    written.clear();
    for (const target of targets) {
      for (const element of surfaces.keys()) if (target.contains(element)) dirty.add(element);
    }
    if (rescan || dirty.size > 0) schedule();
  });
  mutations.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    mutations.disconnect();
    resizes.disconnect();
    for (const element of surfaces.keys()) element.style.removeProperty(REFRACTION);
    defs.remove();
    root.removeAttribute('data-liquid');
  };
}

let users = 0;
let stop: (() => void) | undefined;

/**
 * Turns every glass surface of the document into liquid glass and keeps doing so as surfaces appear, move
 * and resize; `clear` also makes them all clear panes with white text. Returns a function that undoes it;
 * nested calls share the engine of the first one.
 */
export function startLiquidGlass({ clear = false }: { clear?: boolean } = {}): () => void {
  if (users++ === 0) stop = run(clear ? 'clear' : '');
  return () => {
    if (--users === 0) stop?.();
  };
}
