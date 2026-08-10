import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { cls } from '@/lib/utils';

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

const STYLES = {
  success:
    "bg-emerald-600 text-white border-emerald-500",
  error:
    "bg-red-600 text-white border-red-500",
  warning:
    "bg-amber-500 text-black border-amber-400",
  info:
    "bg-gradient-to-r from-indigo-600 to-violet-700 text-white border-indigo-500",
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto no-print">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cls('flex items-start gap-3 rounded-xl border px-4 py-3 shadow-soft-lg', STYLES[t.type])}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100 flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
