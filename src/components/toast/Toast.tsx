import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps, ReactNode } from 'react';
import { buttonVariants } from '../button/Button';
import { Spinner } from '../spinner/Spinner';

export const useToast = BaseToast.useToastManager;

export const createToastManager = BaseToast.createToastManager;

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastProviderProps = ComponentProps<typeof BaseToast.Provider> & {
  closeLabel?: string;
};

export function ToastProvider({ children, closeLabel = 'Close', ...props }: ToastProviderProps) {
  return (
    <BaseToast.Provider {...props}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="hx-toast-viewport">
          <ToastList closeLabel={closeLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = useToast();
  return toasts.map((toast) => (
    <BaseToast.Root key={toast.id} toast={toast} className="hx-toast hx:glass-strong hx:rounded-lg hx:text-fg">
      <BaseToast.Content className="hx-toast-content hx:flex hx:items-start hx:gap-3 hx:overflow-hidden hx:p-3.5">
        {toast.type && toastIcons[toast.type as ToastType]}
        <div className="hx:flex hx:min-w-0 hx:flex-1 hx:flex-col hx:gap-0.5">
          <BaseToast.Title className="hx:text-sm hx:font-medium hx:text-fg" />
          <BaseToast.Description className="hx:text-sm hx:text-fg-muted" />
          <BaseToast.Action
            className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'hx:mt-2 hx:w-fit' })}
          />
        </div>
        <BaseToast.Close
          aria-label={closeLabel}
          className="hx:-m-1 hx:flex hx:size-7 hx:shrink-0 hx:items-center hx:justify-center hx:rounded-md hx:text-fg-muted hx:cursor-pointer hx:hover:bg-tint-hover hx:hover:text-fg hx:focus-ring"
        >
          <Icon>
            <path d="m4.5 4.5 7 7m0-7-7 7" />
          </Icon>
        </BaseToast.Close>
      </BaseToast.Content>
    </BaseToast.Root>
  ));
}

function Icon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'hx:size-4'}
    >
      {children}
    </svg>
  );
}

const statusIconClassName = 'hx:mt-0.5 hx:size-4.5 hx:shrink-0';

const toastIcons: Record<ToastType, ReactNode> = {
  success: (
    <Icon className={`${statusIconClassName} hx:text-success-text`}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="m5.5 8.25 1.75 1.75 3.25-3.75" />
    </Icon>
  ),
  error: (
    <Icon className={`${statusIconClassName} hx:text-danger-text`}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="m6 6 4 4m0-4-4 4" />
    </Icon>
  ),
  warning: (
    <Icon className={`${statusIconClassName} hx:text-warning-text`}>
      <path d="M7.13 2.5a1 1 0 0 1 1.74 0l5.2 9a1 1 0 0 1-.87 1.5H2.8a1 1 0 0 1-.87-1.5z" />
      <path d="M8 6.5v2.75M8 11.25v.01" />
    </Icon>
  ),
  info: (
    <Icon className={`${statusIconClassName} hx:text-info-text`}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5M8 5.25v.01" />
    </Icon>
  ),
  loading: <Spinner tone="muted" className={statusIconClassName} />,
};
