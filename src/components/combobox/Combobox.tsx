import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn, mergeClassName } from '../../lib/cn';
import { fieldControlClassName } from '../field/fieldStyles';
import { Spinner } from '../spinner/Spinner';
import {
  groupLabelClassName,
  inputGroupButtonClassName,
  inputGroupClassName,
  inputGroupInputClassName,
  itemClassName,
  listClassName,
  messageClassName,
  popupClassName,
  separatorClassName,
} from './comboboxStyles';

export const Combobox = BaseCombobox.Root;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxGroup = BaseCombobox.Group;
export const ComboboxCollection = BaseCombobox.Collection;
export const useComboboxFilter = BaseCombobox.useFilter;
export const createComboboxItems = BaseCombobox.createItems;

type InputGroupButtonsProps = {
  clearable?: boolean;
  clearLabel?: string;
  triggerLabel?: string;
};

export type ComboboxInputProps = Omit<ComponentProps<typeof BaseCombobox.Input>, 'className'> &
  InputGroupButtonsProps & {
    className?: string;
  };

export function ComboboxInput({
  className,
  clearable = true,
  clearLabel = 'Clear',
  triggerLabel = 'Show options',
  ...props
}: ComboboxInputProps) {
  return (
    <BaseCombobox.InputGroup className={cn(inputGroupClassName, 'hx:h-9 hx:pr-1', className)}>
      <BaseCombobox.Input className={cn(inputGroupInputClassName, 'hx:pl-3')} {...props} />
      <InputGroupButtons clearable={clearable} clearLabel={clearLabel} triggerLabel={triggerLabel} />
    </BaseCombobox.InputGroup>
  );
}

export type ComboboxChipsProps<Item> = ComboboxInputProps & {
  /** Defaults to the item's `label` (or `value`) property. */
  chipLabel?: (item: Item) => string;
  removeLabel?: (label: string) => string;
};

export function ComboboxChips<Item>({
  className,
  placeholder,
  clearable = true,
  clearLabel = 'Clear all',
  triggerLabel = 'Show options',
  chipLabel = defaultLabel,
  removeLabel = (label) => `Remove ${label}`,
  ...props
}: ComboboxChipsProps<Item>) {
  return (
    <BaseCombobox.InputGroup className={cn(inputGroupClassName, 'hx:min-h-9 hx:py-1 hx:pr-1 hx:pl-1', className)}>
      <BaseCombobox.Value>
        {(value: Item[]) => (
          <BaseCombobox.Chips className="hx:flex hx:min-w-0 hx:flex-1 hx:flex-wrap hx:items-center hx:gap-1">
            {value.map((item, index) => {
              const label = chipLabel(item);
              return (
                <BaseCombobox.Chip
                  key={`${index}-${label}`}
                  className={[
                    'hx:inline-flex hx:h-6 hx:max-w-full hx:items-center hx:gap-0.5 hx:rounded hx:pr-0.5 hx:pl-2',
                    'hx:border hx:border-glass-border hx:bg-tint-active hx:text-xs hx:font-medium hx:text-fg',
                    'hx:outline-none hx:cursor-default hx:focus-within:bg-brand/20 hx:data-highlighted:bg-brand/20',
                  ].join(' ')}
                >
                  <span className="hx:truncate">{label}</span>
                  <BaseCombobox.ChipRemove
                    aria-label={removeLabel(label)}
                    className={[
                      'hx:flex hx:size-5 hx:shrink-0 hx:items-center hx:justify-center hx:rounded-sm hx:cursor-pointer',
                      'hx:text-fg-muted hx:hover:bg-tint-active hx:hover:text-fg hx:[&_svg]:size-3',
                    ].join(' ')}
                  >
                    <XIcon />
                  </BaseCombobox.ChipRemove>
                </BaseCombobox.Chip>
              );
            })}
            <BaseCombobox.Input
              placeholder={value.length > 0 ? undefined : placeholder}
              className={cn(inputGroupInputClassName, 'hx:h-7 hx:min-w-16 hx:px-1.5')}
              {...props}
            />
          </BaseCombobox.Chips>
        )}
      </BaseCombobox.Value>
      <InputGroupButtons clearable={clearable} clearLabel={clearLabel} triggerLabel={triggerLabel} />
    </BaseCombobox.InputGroup>
  );
}

function InputGroupButtons({ clearable, clearLabel, triggerLabel }: InputGroupButtonsProps) {
  return (
    <div className="hx:flex hx:shrink-0 hx:items-center hx:self-center">
      {clearable && (
        <BaseCombobox.Clear aria-label={clearLabel} className={inputGroupButtonClassName}>
          <XIcon />
        </BaseCombobox.Clear>
      )}
      <BaseCombobox.Trigger aria-label={triggerLabel} className={inputGroupButtonClassName}>
        <ChevronUpDownIcon />
      </BaseCombobox.Trigger>
    </div>
  );
}

export function ComboboxTrigger({ className, children, ...props }: ComponentProps<typeof BaseCombobox.Trigger>) {
  return (
    <BaseCombobox.Trigger
      className={mergeClassName(
        [
          fieldControlClassName,
          'hx:flex hx:h-9 hx:w-full hx:min-w-40 hx:items-center hx:justify-between hx:gap-2 hx:pr-2 hx:pl-3',
          'hx:cursor-pointer hx:select-none hx:text-left hx:data-popup-open:border-accent hx:data-placeholder:text-fg-subtle',
        ].join(' '),
        className,
      )}
      {...props}
    >
      <span className="hx:truncate">{children}</span>
      <BaseCombobox.Icon className="hx:flex hx:text-fg-muted">
        <ChevronUpDownIcon />
      </BaseCombobox.Icon>
    </BaseCombobox.Trigger>
  );
}

export function ComboboxSearch({
  className,
  ...props
}: Omit<ComponentProps<typeof BaseCombobox.Input>, 'className'> & { className?: string }) {
  return (
    <div
      className={cn(
        'hx:flex hx:shrink-0 hx:items-center hx:gap-2 hx:border-b hx:border-glass-border hx:px-3',
        className,
      )}
    >
      <SearchIcon className="hx:text-fg-muted" />
      <BaseCombobox.Input className={cn(inputGroupInputClassName, 'hx:h-10')} {...props} />
    </div>
  );
}

type PositionerProps = ComponentProps<typeof BaseCombobox.Positioner>;

export type ComboboxContentProps = ComponentProps<typeof BaseCombobox.Popup> &
  Pick<PositionerProps, 'side' | 'sideOffset' | 'align' | 'alignOffset'>;

export function ComboboxContent({
  className,
  side,
  sideOffset = 6,
  align = 'start',
  alignOffset,
  ...props
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        className="hx:z-50 hx:outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <BaseCombobox.Popup className={mergeClassName(popupClassName, className)} {...props} />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function ComboboxList({ className, ...props }: ComponentProps<typeof BaseCombobox.List>) {
  return <BaseCombobox.List className={mergeClassName(listClassName, className)} {...props} />;
}

export function ComboboxItem({ className, children, ...props }: ComponentProps<typeof BaseCombobox.Item>) {
  return (
    <BaseCombobox.Item className={mergeClassName(itemClassName, className)} {...props}>
      <span className="hx:flex hx:min-w-0 hx:flex-1 hx:items-center hx:gap-2">{children}</span>
      <BaseCombobox.ItemIndicator className="hx:flex hx:text-accent">
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

export function ComboboxEmpty({ className, ...props }: ComponentProps<typeof BaseCombobox.Empty>) {
  return <BaseCombobox.Empty className={mergeClassName(messageClassName, className)} {...props} />;
}

export type ComboboxStatusProps = ComponentProps<typeof BaseCombobox.Status> & {
  loading?: boolean;
};

/** Stays mounted so screen readers announce changes: pass `children` conditionally, not the component. */
export function ComboboxStatus({ className, loading = false, children, ...props }: ComboboxStatusProps) {
  return (
    <BaseCombobox.Status className={mergeClassName(messageClassName, className)} {...props}>
      {children != null && children !== false && (
        <>
          {loading && <Spinner />}
          {children}
        </>
      )}
    </BaseCombobox.Status>
  );
}

export function ComboboxGroupLabel({ className, ...props }: ComponentProps<typeof BaseCombobox.GroupLabel>) {
  return <BaseCombobox.GroupLabel className={mergeClassName(groupLabelClassName, className)} {...props} />;
}

export function ComboboxSeparator({ className, ...props }: ComponentProps<typeof BaseCombobox.Separator>) {
  return <BaseCombobox.Separator className={mergeClassName(separatorClassName, className)} {...props} />;
}

function defaultLabel(item: unknown): string {
  if (item && typeof item === 'object') {
    if ('label' in item && item.label != null) return String(item.label);
    if ('value' in item && item.value != null) return String(item.value);
  }
  return String(item ?? '');
}

function ChevronUpDownIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="hx:size-4"
    >
      <path d="m5 6 3-3 3 3M5 10l3 3 3-3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="hx:size-4"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('hx:size-4 hx:shrink-0', className)}
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}
