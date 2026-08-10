import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cls } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, description, children, size = 'md', footer }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={cls('relative w-full card shadow-soft-lg max-h-[90vh] overflow-hidden flex flex-col', SIZES[size])}
          >
            {(title || description) && (
              <div className="px-6 pt-5 pb-4 border-b border-ink-100 dark:border-ink-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {title && <h3 className="text-lg font-display font-semibold text-ink-900 dark:text-ink-100">{title}</h3>}
                    {description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
                  </div>
                  <button onClick={onClose} className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 rounded-lg p-1 hover:bg-ink-100 dark:hover:bg-ink-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            <div className="px-6 py-5 overflow-y-auto">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-ink-100 dark:border-ink-800 flex justify-end gap-2 bg-ink-50/50 dark:bg-ink-950/30">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
