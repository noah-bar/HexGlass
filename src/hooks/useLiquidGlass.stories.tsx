import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../components/badge/Badge';
import { Button } from '../components/button/Button';
import { Panel } from '../components/panel/Panel';
import { Slider } from '../components/slider/Slider';
import { Switch } from '../components/switch/Switch';
import { useLiquidGlass } from './useLiquidGlass';

const meta = {
  title: 'Hooks/useLiquidGlass',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** An example settings control: build yours with the components you like. */
function GlassSettings() {
  const { blur, refraction, refractionSupported, customized, setBlur, setRefraction, reset } = useLiquidGlass();

  return (
    <div className="hx:flex hx:flex-col hx:gap-4 hx:text-sm">
      <Slider
        label="Glass blur"
        showValue
        min={0}
        max={24}
        value={Math.min(blur, 24)}
        onValueChange={(value) => setBlur(Array.isArray(value) ? value[0] : value)}
      />
      {refractionSupported && (
        <label className="hx:flex hx:items-center hx:justify-between hx:gap-4 hx:font-medium">
          Refraction
          <Switch checked={refraction} onCheckedChange={setRefraction} />
        </label>
      )}
      <Button variant="ghost" size="sm" className="hx:self-end" disabled={!customized} onClick={reset}>
        Reset
      </Button>
    </div>
  );
}

const invoices = Array.from({ length: 36 }, (_, i) => ({
  id: `F-2026-${1042 + i}`,
  color: ['hx:bg-indigo-500', 'hx:bg-cyan-400', 'hx:bg-amber-400', 'hx:bg-pink-500', 'hx:bg-emerald-500'][i % 5],
}));

/**
 * `useLiquidGlass` holds the user's own glass settings: how much the glass blurs what is behind it, and whether
 * its rim bends it. They apply to the whole page and are remembered in this browser. The control on the left
 * is an example built with it (see the story's source); `refractionSupported` hides the switch in browsers
 * that cannot render the refraction.
 *
 * Blur only shows over something sharp: here the panels float over a grid of cards.
 */
export const Default: Story = {
  render: () => (
    <div className="hx:relative hx:max-w-3xl">
      <div aria-hidden="true" className="hx:grid hx:grid-cols-6 hx:gap-3">
        {invoices.map(({ id, color }) => (
          <div
            key={id}
            className={`hx:flex hx:h-16 hx:items-center hx:justify-center hx:rounded-lg hx:text-xs hx:font-bold hx:text-white ${color}`}
          >
            {id}
          </div>
        ))}
      </div>
      {/* Inset so the panels' edges fall inside the cards, not along their edges. */}
      <div className="hx:absolute hx:inset-x-16 hx:inset-y-6 hx:grid hx:content-center hx:gap-10 hx:sm:grid-cols-2">
        <Panel className="hx:p-5">
          <GlassSettings />
        </Panel>
        <Panel className="hx:flex hx:flex-col hx:gap-3 hx:p-5 hx:text-sm">
          <p className="hx:font-semibold">Invoice F-2026-1045</p>
          <p className="hx:text-fg-muted">Romandie Santé · due on 18 October 2026</p>
          <Badge variant="info">Sent</Badge>
          <div className="hx:mt-auto hx:flex hx:justify-end hx:gap-2">
            <Button variant="secondary">Download</Button>
            <Button>Send</Button>
          </div>
        </Panel>
      </div>
    </div>
  ),
};
