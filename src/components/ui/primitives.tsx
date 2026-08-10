import { cls } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cls('inline-flex items-center justify-center', className)}>
      <div className="h-6 w-6 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cls('skeleton', className)} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cls('card', className)}>{children}</div>;
}

export function Badge({ children, color = 'primary', className }: { children: ReactNode; color?: 'primary'|'success'|'warning'|'error'|'ink'|'accent'; className?: string }) {
  const map = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300',
    success: 'bg-success-50 text-success-700 dark:bg-success-950/50 dark:text-success-300',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300',
    error: 'bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300',
    accent: 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300',
    ink: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
  };
  return <span className={cls('chip', map[color], className)}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="mb-4 text-ink-300 dark:text-ink-600">{icon}</div>}
      <h3 className="text-lg font-display font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
