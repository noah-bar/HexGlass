import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { mergeClassName } from '../../lib/cn';

export const buttonVariants = cva(
  [
    'hx:inline-flex hx:shrink-0 hx:items-center hx:justify-center hx:gap-2 hx:whitespace-nowrap hx:select-none',
    'hx:rounded-md hx:font-medium hx:cursor-pointer',
    'hx:transition-[background-color,box-shadow,color,scale] hx:duration-150 hx:ease-out',
    'hx:active:scale-[0.98] hx:focus-ring',
    'hx:data-disabled:pointer-events-none hx:data-disabled:opacity-50',
    'hx:[&_svg]:size-4 hx:[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'hx:glass-stained',
        secondary: [
          'hx:glass hx:text-fg hx:[--hx-glass-edge:var(--hx-secondary-button-edge)]',
          'hx:hover:bg-glass-hover hx:active:bg-glass-active',
        ],
        ghost: 'hx:text-fg hx:hover:bg-tint-hover hx:active:bg-tint-active',
        outline: [
          'hx:glass-ring hx:border hx:border-accent/50 hx:text-accent',
          'hx:hover:border-accent hx:hover:bg-accent/8 hx:active:bg-accent/12',
        ],
        danger:
          'hx:glass-stained hx:[--hx-stain:var(--hx-danger-stain)] hx:[--hx-stain-text:var(--hx-danger-stain-text)] hx:[--hx-stain-extra:var(--hx-danger-stain-extra)]',
      },
      size: {
        sm: 'hx:h-8 hx:px-3 hx:text-sm',
        md: 'hx:h-9 hx:px-4 hx:text-sm',
        lg: 'hx:h-11 hx:px-5 hx:text-base',
        icon: 'hx:size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ComponentProps<typeof BaseButton> & VariantProps<typeof buttonVariants>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <BaseButton className={mergeClassName(buttonVariants({ variant, size }), className)} {...props} />;
}
