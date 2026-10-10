import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { mergeClassName } from '../../lib/cn';

export const panelVariants = cva(
  // overflow-clip keeps content inside the rounded corners (tables, lists, images);
  // the 1px clip margin leaves room for the lit edge drawn over the border.
  'hx:rounded-xl hx:p-2 hx:text-fg hx:overflow-clip hx:[overflow-clip-margin:1px]',
  {
    variants: {
      variant: {
        thin: 'hx:glass-thin',
        default: 'hx:glass',
        strong: 'hx:glass-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type PanelProps = useRender.ComponentProps<'div'> & VariantProps<typeof panelVariants>;

export function Panel({ variant, className, render, ...props }: PanelProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: { ...props, className: mergeClassName(panelVariants({ variant }), className) },
  });
}
