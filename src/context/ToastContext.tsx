import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Toast } from '@/types';
import { uid } from '@/lib/utils';

interface ToastCtx {
  toasts: Toast[];
  toast: (type: Toast['type'], message: string) => void;
  dismiss: (id: string) => void;
}
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = uid(6);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  return <Ctx.Provider value={{ toasts, toast, dismiss }}>{children}</Ctx.Provider>;
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
