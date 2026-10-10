import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps, ReactNode } from 'react';
import { cn, mergeClassName } from '../../lib/cn';

export type SliderProps = ComponentProps<typeof BaseSlider.Root> & {
  label?: ReactNode;
  showValue?: boolean;
  thumbLabels?: string[];
};

export function Slider({
  className,
  value,
  defaultValue,
  label,
  showValue = false,
  thumbLabels,
  orientation = 'horizontal',
  ...props
}: SliderProps) {
  const current = value ?? defaultValue;
  const count = Array.isArray(current) ? current.length : 1;
  const vertical = orientation === 'vertical';

  return (
    <BaseSlider.Root
      value={value}
      defaultValue={defaultValue}
      orientation={orientation}
      className={mergeClassName(
        cn(
          'hx:flex hx:flex-col hx:gap-2 hx:data-disabled:cursor-not-allowed hx:data-disabled:opacity-50',
          vertical ? 'hx:h-40 hx:w-fit hx:items-center' : 'hx:w-full',
        ),
        className,
      )}
      {...props}
    >
      {(label != null || showValue) && (
        <div className="hx:flex hx:items-baseline hx:justify-between hx:gap-3">
          {label != null && (
            <BaseSlider.Label className="hx:text-sm hx:font-medium hx:text-fg">{label}</BaseSlider.Label>
          )}
          {showValue && (
            <BaseSlider.Value className="hx:ml-auto hx:text-sm hx:tabular-nums hx:text-fg-muted">
              {(formatted) => formatted.join(' – ')}
            </BaseSlider.Value>
          )}
        </div>
      )}
      <BaseSlider.Control
        className={cn(
          'hx:flex hx:touch-none hx:items-center hx:select-none hx:cursor-pointer hx:data-disabled:cursor-not-allowed',
          vertical ? 'hx:min-h-0 hx:w-5 hx:flex-1 hx:flex-col hx:justify-center' : 'hx:h-5 hx:w-full',
        )}
      >
        <BaseSlider.Track
          className={cn(
            // Inset ring rather than a border: Base UI sizes the indicator with `inherit`, which would overflow a border.
            'hx:relative hx:rounded-full hx:bg-switch-track hx:shadow-[inset_0_0_0_1px_var(--hx-glass-border)]',
            vertical ? 'hx:h-full hx:w-1.5' : 'hx:h-1.5 hx:w-full',
          )}
        >
          {/* Same tinted glass as a checked switch; the lit edge is left out on a bar this thin. */}
          <BaseSlider.Indicator className="hx:glass-tint hx:rounded-full hx:before:hidden" />
          {Array.from({ length: count }, (_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={count > 1 ? index : undefined}
              aria-label={thumbLabels?.[index]}
              className={[
                'hx:glass-bead hx:size-4.5 hx:rounded-full hx:outline-none',
                'hx:transition-[scale,box-shadow] hx:duration-150 hx:ease-out hx:motion-reduce:transition-none',
                'hx:hover:scale-110 hx:data-dragging:scale-110',
                'hx:has-[:focus-visible]:ring-3 hx:has-[:focus-visible]:ring-ring',
              ].join(' ')}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
