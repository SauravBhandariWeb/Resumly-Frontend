import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cls } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cls('input', className)} {...rest} />,
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => <textarea ref={ref} className={cls('input resize-y min-h-[90px]', className)} {...rest} />,
);
Textarea.displayName = 'Textarea';

export function Field({ label, error, hint, children }: { label?: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
}
