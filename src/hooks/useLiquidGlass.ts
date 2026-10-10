import { useCallback, useSyncExternalStore } from 'react';
import { supportsRefraction } from '../lib/liquid-glass/engine';

export type LiquidGlassPreferences = {
  blur?: number;
  refraction?: boolean;
};

export type UseLiquidGlassResult = {
  blur: number;
  refraction: boolean;
  refractionSupported: boolean;
  customized: boolean;
  setBlur: (blur: number) => void;
  setRefraction: (refraction: boolean) => void;
  reset: () => void;
};

const STORAGE_KEY = 'hx-liquid-glass';
const CHANGE_EVENT = 'hx-liquid-glass-change';
const BLUR = '--hx-liquid-blur';
const BEND = '--hx-liquid-bend';

// Used when localStorage is unavailable (private browsing, blocked storage).
let memory: string | null = null;

function read(): LiquidGlassPreferences {
  let stored = memory;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: memory is used instead.
  }
  try {
    const parsed: unknown = JSON.parse(stored ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};
    const { blur, refraction } = parsed as Record<string, unknown>;
    return {
      blur: typeof blur === 'number' && Number.isFinite(blur) ? Math.max(0, blur) : undefined,
      refraction: refraction === false ? false : undefined,
    };
  } catch {
    return {};
  }
}

function apply({ blur, refraction }: LiquidGlassPreferences) {
  const { style } = document.documentElement;
  if (blur === undefined) style.removeProperty(BLUR);
  else style.setProperty(BLUR, `${blur}px`);
  if (refraction === false) style.setProperty(BEND, '0px');
  else style.removeProperty(BEND);
}

function update(preferences: LiquidGlassPreferences) {
  memory = JSON.stringify(preferences);
  try {
    window.localStorage.setItem(STORAGE_KEY, memory);
  } catch {
    // Storage unavailable: memory is used instead.
  }
  apply(preferences);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

type Snapshot = `${number}:${boolean}:${boolean}:${boolean}`;
const SERVER_SNAPSHOT: Snapshot = '8:true:false:false';

function getSnapshot(): Snapshot {
  const { blur, refraction } = read();
  const effective = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(BLUR)) || 0;
  return `${blur ?? effective}:${refraction !== false}:${supportsRefraction()}:${blur !== undefined || refraction === false}`;
}

function subscribe(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    apply(read());
    onChange();
  };
  apply(read());
  window.addEventListener('storage', handleStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  // The theme's blur differs between light and dark.
  const theme = new MutationObserver(onChange);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
    theme.disconnect();
  };
}

/** Applies the saved glass preferences before the first paint. Render it in `<head>`, like `themeScript`. */
export const liquidGlassScript = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||'{}'),s=document.documentElement.style;if(typeof p.blur==='number')s.setProperty(${JSON.stringify(BLUR)},p.blur+'px');if(p.refraction===false)s.setProperty(${JSON.stringify(BEND)},'0px')}catch(e){}})()`;

/** The user's own glass settings, remembered in `localStorage` and applied to the whole page. */
export function useLiquidGlass(): UseLiquidGlassResult {
  const [blur, refraction, refractionSupported, customized] = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT,
  ).split(':');

  const setBlur = useCallback((value: number) => update({ ...read(), blur: Math.max(0, value) }), []);
  const setRefraction = useCallback(
    (value: boolean) => update({ ...read(), refraction: value ? undefined : false }),
    [],
  );
  const reset = useCallback(() => update({}), []);

  return {
    blur: Number(blur),
    refraction: refraction === 'true',
    refractionSupported: refractionSupported === 'true',
    customized: customized === 'true',
    setBlur,
    setRefraction,
    reset,
  };
}
