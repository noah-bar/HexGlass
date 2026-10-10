import { createContext, use, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Pagination } from '../pagination/Pagination';
import { Skeleton } from '../skeleton/Skeleton';
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableClassName,
  type SortDirection,
  type TableHeadProps,
} from '../table/Table';

export {
  TableCaption as DataTableCaption,
  TableCell as DataTableCell,
  TableEmpty as DataTableEmpty,
  TableFooter as DataTableFooter,
  TableHead as DataTableHead,
  TableRow as DataTableRow,
  type TableCellProps as DataTableCellProps,
  type TableEmptyProps as DataTableEmptyProps,
  type TableHeadProps as DataTableHeadProps,
  type TableRowProps as DataTableRowProps,
} from '../table/Table';

export type DataTablePage = { total: number; skip: number; limit: number };

type DataTableContextValue = {
  ordering: string;
  onOrderingChange?: (ordering: string) => void;
};

const DataTableContext = createContext<DataTableContextValue>({ ordering: '' });

export type DataTableProps = {
  children: ReactNode;
  /** Current sort, Django style: `"field"` ascending, `"-field"` descending, `""` none. */
  ordering?: string;
  onOrderingChange?: (ordering: string) => void;
  pagination?: DataTablePage;
  onSkipChange?: (skip: number) => void;
  density?: 'comfortable' | 'compact';
  className?: string;
};

/** Fills its parent's height and scrolls inside: give the parent a height. */
export function DataTable({
  children,
  ordering = '',
  onOrderingChange,
  pagination,
  onSkipChange,
  density = 'comfortable',
  className,
}: DataTableProps) {
  return (
    <DataTableContext value={{ ordering, onOrderingChange }}>
      {/* Clips the sticky header inside the rounded border, so it never paints over the lit edge. */}
      <div
        className={cn('hx:flex hx:size-full hx:min-h-0 hx:flex-col hx:overflow-hidden hx:rounded-[inherit]', className)}
      >
        <div className="hx:min-h-0 hx:flex-1 hx:overflow-auto hx:overscroll-contain hx:rounded-t-[inherit]">
          <table data-density={density} className={cn(tableClassName, 'hx:rounded-t-[inherit] hx:whitespace-nowrap')}>
            {children}
          </table>
        </div>
        {pagination && onSkipChange && <DataTablePagination {...pagination} onSkipChange={onSkipChange} />}
      </div>
    </DataTableContext>
  );
}

export function DataTableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <TableHeader
      className={cn(
        // Sticky on the whole thead, not each th, so the blur is one surface without seams.
        'hx:sticky hx:top-0 hx:z-10 hx:bg-glass hx:backdrop-blur-xl hx:backdrop-saturate-150',
        // The wrapper's overflow clips the fill but not the blur, which would keep square corners: the header
        // takes the top radius itself, handed down from the wrapper.
        'hx:rounded-t-[inherit]',
        // Collapsed table borders don't stick: draw the separator as an inset shadow instead.
        'hx:shadow-[inset_0_-1px_0_var(--hx-glass-border)]',
        className,
      )}
      {...props}
    />
  );
}

/** Cycles a Django-style ordering for `field`: ascending → descending → none. */
export function nextOrdering(ordering: string, field: string): string {
  if (ordering === field) return `-${field}`;
  if (ordering === `-${field}`) return '';
  return field;
}

export type DataTableSortableHeadProps = Omit<TableHeadProps, 'sortDirection' | 'onSort'> & {
  field: string;
};

export function DataTableSortableHead({ field, ...props }: DataTableSortableHeadProps) {
  const { ordering, onOrderingChange } = use(DataTableContext);
  const direction: SortDirection = ordering === field ? 'ascending' : ordering === `-${field}` ? 'descending' : 'none';
  return (
    <TableHead {...props} sortDirection={direction} onSort={() => onOrderingChange?.(nextOrdering(ordering, field))} />
  );
}

export type DataTableBodyProps = Omit<ComponentProps<'tbody'>, 'children'> & {
  colSpan: number;
  isPending?: boolean;
  isEmpty?: boolean;
  emptyText?: ReactNode;
  pendingRows?: number;
  children?: ReactNode;
};

export function DataTableBody({
  colSpan,
  isPending,
  isEmpty,
  emptyText = 'No results.',
  pendingRows = 5,
  children,
  ...props
}: DataTableBodyProps) {
  let content = children;
  if (isPending) {
    content = Array.from({ length: pendingRows }, (_, i) => (
      <TableRow key={i} aria-hidden="true">
        {Array.from({ length: colSpan }, (_, j) => (
          <TableCell key={j}>
            <Skeleton className="hx:w-full hx:max-w-40" />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (isEmpty) {
    content = (
      <tr className="hx:border-t hx:border-glass-border hx:first:border-t-0">
        <td colSpan={colSpan} className="hx:h-24 hx:px-4 hx:text-center hx:text-sm hx:text-fg-muted">
          {emptyText}
        </td>
      </tr>
    );
  }
  return (
    <tbody aria-busy={isPending || undefined} {...props}>
      {content}
    </tbody>
  );
}

type DataTablePaginationProps = DataTablePage & { onSkipChange: (skip: number) => void };

function DataTablePagination({ total, skip, limit, onSkipChange }: DataTablePaginationProps) {
  if (total === 0 || limit <= 0) return null;
  return (
    <Pagination
      page={Math.floor(skip / limit) + 1}
      totalPages={Math.ceil(total / limit)}
      onPageChange={(page) => onSkipChange((page - 1) * limit)}
      className="hx:border-t hx:border-glass-border hx:px-2 hx:py-1.5"
    />
  );
}
