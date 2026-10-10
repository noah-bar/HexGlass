import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Backdrop } from '../backdrop/Backdrop';
import { Panel, type PanelProps } from './Panel';

const meta = {
  title: 'Components/Panel',
  component: Panel,
  tags: ['autodocs'],
  args: { variant: 'default' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['thin', 'default', 'strong', 'clear'] },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Panel {...args} className="hx:max-w-md hx:text-sm">
      A glass surface with no imposed layout: put whatever you want in it.
    </Panel>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="hx:grid hx:max-w-4xl hx:grid-cols-1 hx:gap-4 hx:sm:grid-cols-4">
      {(['thin', 'default', 'strong', 'clear'] as const).map((variant) => (
        <Panel key={variant} {...args} variant={variant} className="hx:text-sm">
          <p className="hx:font-semibold">{variant}</p>
          <p className="hx:mt-1 hx:text-fg-muted">
            {variant === 'thin' && 'Navigation, toolbars: little text.'}
            {variant === 'default' && 'Containers, tables, lists.'}
            {variant === 'strong' && 'Long content or content to read carefully.'}
            {variant === 'clear' && 'Over photos and video: white text.'}
          </p>
        </Panel>
      ))}
    </div>
  ),
};

const rows = [
  { name: 'Client portal', owner: 'Web team', progress: '82%', due: '15.10.2026' },
  { name: 'Mobile app', owner: 'Mobile team', progress: '46%', due: '30.11.2026' },
  { name: 'ERP migration', owner: 'Data team', progress: '23%', due: '20.01.2027' },
  { name: 'Billing redesign', owner: 'Finance team', progress: '100%', due: '01.09.2026' },
];

/** Tailwind padding utilities override the default `p-2`; here the table runs edge to edge. */
export const Table: Story = {
  render: (args) => (
    <Panel {...args} className="hx:max-w-2xl hx:p-0">
      <table className="hx:w-full hx:border-collapse hx:text-left hx:text-sm hx:tabular-nums">
        <thead className="hx:text-fg-muted">
          <tr>
            {['Project', 'Owner', 'Progress', 'Due date'].map((h) => (
              <th key={h} className="hx:px-4 hx:py-3 hx:font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="hx:border-t hx:border-glass-border hx:transition-colors hx:hover:bg-tint-hover"
            >
              <td className="hx:px-4 hx:py-3 hx:font-medium">{row.name}</td>
              <td className="hx:px-4 hx:py-3">{row.owner}</td>
              <td className="hx:px-4 hx:py-3">{row.progress}</td>
              <td className="hx:px-4 hx:py-3">{row.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  ),
};

/** `render` changes the element while keeping the styles, here a semantic `<aside>`. */
export const AsAside: Story = {
  args: { variant: 'thin' },
  render: (args) => (
    <Panel {...args} render={<aside aria-label="Navigation" />} className="hx:w-56 hx:p-3">
      <nav className="hx:flex hx:flex-col hx:gap-1 hx:text-sm">
        {['Dashboard', 'Projects', 'Clients', 'Billing', 'Settings'].map((item, i) => (
          <a
            key={item}
            href="#"
            aria-current={i === 0 ? 'page' : undefined}
            className="hx:rounded-md hx:px-3 hx:py-2 hx:text-fg-muted hx:no-underline hx:hover:bg-tint-hover hx:hover:text-fg hx:aria-[current=page]:bg-tint-active hx:aria-[current=page]:font-medium hx:aria-[current=page]:text-fg"
          >
            {item}
          </a>
        ))}
      </nav>
    </Panel>
  ),
};

type LiquidArgs = Pick<PanelProps, 'variant'> & {
  bezel: number;
  bend: number;
  fringe: number;
};

const scenery = {
  light: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80',
  dark: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
};

/**
 * Liquid glass (the `LiquidGlass` component, mounted for every story) needs something to bend:
 * scroll the page and watch the text slide under the rim of the panels. The `--hx-liquid-*` tokens tune it.
 * The refraction only shows in Chromium browsers; elsewhere the panels are a clearer frosted glass.
 */
export const Liquid: StoryObj<LiquidArgs> = {
  parameters: { backdrop: false, stage: 'bare' },
  args: { variant: 'default', bezel: 28, bend: 30, fringe: 0 },
  argTypes: {
    bezel: { control: { type: 'range', min: 4, max: 60, step: 1 } },
    bend: { control: { type: 'range', min: 0, max: 60, step: 1 } },
    fringe: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  render: ({ variant, bezel, bend, fringe }) => {
    const tokens = {
      '--hx-liquid-bezel': `${bezel}px`,
      '--hx-liquid-bend': `${bend}px`,
      '--hx-liquid-fringe': fringe,
    } as CSSProperties;
    return (
      <div className="hx:relative hx:isolate hx:min-h-[220dvh] hx:p-10" style={tokens}>
        <Backdrop position="absolute" image={scenery} />
        <Panel
          variant={variant}
          className="hx:sticky hx:top-6 hx:z-10 hx:mx-auto hx:flex hx:max-w-xl hx:items-center hx:gap-1 hx:rounded-full hx:px-3 hx:text-sm"
        >
          <span className="hx:px-3 hx:font-semibold">HexUI</span>
          {['Dashboard', 'Projects', 'Clients', 'Billing'].map((item) => (
            <a
              key={item}
              href="#"
              className="hx:rounded-full hx:px-3 hx:py-2 hx:text-fg-muted hx:no-underline hx:hover:bg-tint-hover hx:hover:text-fg"
            >
              {item}
            </a>
          ))}
        </Panel>

        <div className="hx:mx-auto hx:mt-16 hx:grid hx:max-w-3xl hx:gap-10">
          {['Refraction', 'bends what', 'is behind', 'the glass', 'along its', 'rounded rim'].map((line, i) => (
            <p
              key={line}
              className="hx:text-7xl hx:font-bold hx:tracking-tight hx:text-white hx:odd:text-right"
              style={{ color: ['#ffffff', '#a5b4fc', '#67e8f9', '#fde68a', '#f9a8d4', '#ffffff'][i] }}
            >
              {line}
            </p>
          ))}
        </div>

        <Panel
          variant={variant}
          className="hx:fixed hx:bottom-10 hx:left-1/2 hx:w-80 hx:-translate-x-1/2 hx:p-5 hx:text-sm"
        >
          <p className="hx:font-semibold">Liquid panel</p>
          <p className="hx:mt-1 hx:text-fg-muted">
            A clearer pane: the middle stays flat and readable, the rim bends the page like a thick piece of glass.
          </p>
        </Panel>
      </div>
    );
  },
};
