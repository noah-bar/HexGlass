export const inputGroupClassName = [
  'hx:glass-field hx:flex hx:w-full hx:min-w-40 hx:items-center hx:rounded-md hx:text-sm hx:text-fg',
  'hx:transition-[border-color,box-shadow] hx:duration-150 hx:hover:border-field-border-hover',
  'hx:focus-within:border-accent hx:focus-within:ring-3 hx:focus-within:ring-ring',
  'hx:error:border-danger hx:error:ring-3 hx:error:ring-danger/15',
  'hx:has-[[aria-invalid=true]]:border-danger hx:has-[[aria-invalid=true]]:ring-3 hx:has-[[aria-invalid=true]]:ring-danger/15',
  'hx:error:focus-within:ring-danger/30 hx:has-[[aria-invalid=true]]:focus-within:ring-danger/30',
  'hx:data-disabled:cursor-not-allowed hx:data-disabled:opacity-50',
].join(' ');

export const inputGroupInputClassName =
  'hx:h-full hx:min-w-0 hx:flex-1 hx:bg-transparent hx:outline-none hx:placeholder:text-fg-subtle hx:disabled:cursor-not-allowed';

export const inputGroupButtonClassName = [
  'hx:flex hx:size-7 hx:shrink-0 hx:items-center hx:justify-center hx:rounded hx:cursor-pointer hx:text-fg-muted',
  'hx:transition-colors hx:duration-150 hx:hover:bg-tint-hover hx:hover:text-fg hx:active:bg-tint-active',
  'hx:outline-none hx:focus-visible:ring-2 hx:focus-visible:ring-ring',
  'hx:data-disabled:pointer-events-none hx:[&_svg]:size-4',
].join(' ');

// The glass panel itself must not scroll: its lit edge overhangs the box by 1px.
// Scrolling happens in the list inside (listClassName).
export const popupClassName = [
  'hx:glass-strong hx:flex hx:w-(--anchor-width) hx:min-w-56 hx:max-w-(--available-width) hx:flex-col hx:rounded-lg',
  'hx:max-h-[min(var(--available-height),24rem)] hx:text-sm hx:text-fg hx:outline-none',
  'hx:origin-(--transform-origin) hx:transition-[scale,opacity] hx:duration-150 hx:ease-out',
  'hx:data-starting-style:scale-95 hx:data-starting-style:opacity-0',
  'hx:data-ending-style:scale-95 hx:data-ending-style:opacity-0',
].join(' ');

export const listClassName =
  'hx:min-h-0 hx:overflow-y-auto hx:overscroll-contain hx:p-1 hx:scroll-py-1 hx:outline-none hx:data-empty:p-0';

export const itemClassName = [
  'hx:flex hx:items-center hx:gap-2 hx:rounded-md hx:py-1.5 hx:pr-2 hx:pl-2.5',
  'hx:cursor-default hx:outline-none hx:select-none',
  'hx:data-highlighted:bg-brand/12 hx:data-highlighted:text-fg',
  'hx:data-disabled:pointer-events-none hx:data-disabled:opacity-50',
  'hx:[&_svg]:size-4 hx:[&_svg]:shrink-0',
].join(' ');

export const groupLabelClassName = 'hx:px-2.5 hx:pt-2 hx:pb-1 hx:text-xs hx:font-medium hx:text-fg-muted';

export const separatorClassName = 'hx:mx-1 hx:my-1 hx:h-px hx:bg-glass-border';

// Empty and Status stay mounted (live regions): they only take room once they have content.
export const messageClassName =
  'hx:flex hx:items-center hx:justify-center hx:gap-2 hx:text-center hx:text-sm hx:text-fg-muted hx:not-empty:px-3 hx:not-empty:py-5';
