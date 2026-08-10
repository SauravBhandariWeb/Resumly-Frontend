import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { api } from '@/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try { const u = await api.auth.me(); setUser(u); }
    catch { setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (email: string, password: string) => { const u = await api.auth.login(email, password); setUser(u); };
  const register = async (name: string, email: string, password: string) => { const u = await api.auth.register(name, email, password); setUser(u); };
  const logout = async () => { await api.auth.logout(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
