export const fieldControlClassName = [
  'hx:glass-field hx:rounded-md hx:text-sm hx:text-fg',
  'hx:transition-[border-color,box-shadow] hx:duration-150 hx:hover:border-field-border-hover',
  'hx:outline-none hx:focus-visible:border-accent hx:focus-visible:ring-3 hx:focus-visible:ring-ring',
  'hx:error:border-danger hx:error:ring-3 hx:error:ring-danger/15',
  'hx:error:focus-visible:border-danger hx:error:focus-visible:ring-danger/30',
  'hx:data-disabled:cursor-not-allowed hx:data-disabled:opacity-50',
].join(' ');

export const checkControlClassName = [
  'hx:group hx:inline-flex hx:size-4.5 hx:shrink-0 hx:items-center hx:justify-center hx:align-middle hx:cursor-pointer',
  'hx:glass-field hx:hover:border-field-border-hover hx:text-primary-fg',
  'hx:transition-[background-color,border-color] hx:duration-150 hx:focus-ring',
  'hx:error:border-danger',
  'hx:data-disabled:cursor-not-allowed hx:data-disabled:opacity-50',
].join(' ');
