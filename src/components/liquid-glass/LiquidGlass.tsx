import { useEffect } from 'react';
import { type LiquidGlassMode, startLiquidGlass } from '../../lib/liquid-glass/engine';

export type LiquidGlassProps = LiquidGlassMode;

/**
 * Turns every glass surface of the page into liquid glass: clearer panes whose rim bends what is behind them.
 * Render it once, anywhere. Tune it with the `--hx-liquid-*` tokens, on the root or on any subtree
 * (`--hx-liquid-bend: 0` keeps a surface flat). The refraction only shows in Chromium browsers; elsewhere the
 * surfaces are simply a clearer frosted glass. On a server-rendered page, add `liquidGlassScript` to `<head>`.
 */
export function LiquidGlass({ clear = false }: LiquidGlassProps) {
  useEffect(() => startLiquidGlass({ clear }), [clear]);
  return null;
}
