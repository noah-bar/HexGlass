import { useEffect } from 'react';
import { startLiquidGlass } from '../../lib/liquid-glass/engine';

export type LiquidGlassProps = {
  /**
   * Clear glass everywhere: nearly transparent panes that darken what is behind them, with white text in both
   * themes. Made for pages over photos or video.
   */
  clear?: boolean;
};

/**
 * Turns every glass surface of the page into liquid glass: clearer panes whose rim bends what is behind them.
 * Render it once, anywhere. Tune it with the `--hx-liquid-*` tokens, on the root or on any subtree
 * (`--hx-liquid-bend: 0` keeps a surface flat). The refraction only shows in Chromium browsers; elsewhere the
 * surfaces are simply a clearer frosted glass.
 */
export function LiquidGlass({ clear = false }: LiquidGlassProps) {
  useEffect(() => startLiquidGlass({ clear }), [clear]);
  return null;
}
