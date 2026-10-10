import { cn } from '../../lib/cn';
import { Button } from '../button/Button';

export type PaginationProps = {
  /** 1-based. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons, ellipses included. */
  maxVisible?: number;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
  className?: string;
};

export function getVisiblePages(current: number, totalPages: number, maxVisible = 5): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const side = Math.floor((maxVisible - 3) / 2);
  let start = Math.max(2, current - side);
  let end = Math.min(totalPages - 1, current + side);
  if (current <= side + 1) end = Math.min(totalPages - 1, maxVisible - 1);
  else if (current >= totalPages - side) start = Math.max(2, totalPages - maxVisible + 2);
  const pages: (number | 'ellipsis')[] = [1];
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  pageLabel = (p) => `Page ${p}`,
  className,
}: PaginationProps) {
  if (totalPages < 1) return null;

  return (
    <nav aria-label="Pagination" className={cn('hx:flex hx:items-center hx:justify-center hx:gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="hx:size-8 hx:rounded-full"
        aria-label={previousLabel}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Chevron direction="left" />
      </Button>
      {getVisiblePages(page, totalPages, maxVisible).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} aria-hidden="true" className="hx:px-1.5 hx:text-sm hx:text-fg-muted">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'secondary' : 'ghost'}
            size="sm"
            className="hx:min-w-8 hx:rounded-full hx:px-2 hx:tabular-nums"
            aria-label={pageLabel(p)}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="icon"
        className="hx:size-8 hx:rounded-full"
        aria-label={nextLabel}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <Chevron direction="right" />
      </Button>
    </nav>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'm10 4-4 4 4 4' : 'm6 4 4 4-4 4'} />
    </svg>
  );
}
