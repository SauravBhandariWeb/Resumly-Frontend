import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, FilePlus2, Files, BarChart3, Shield, User as UserIcon,
  LogOut, Moon, Sun, Menu, X, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import Logo from './Logo';
import { cls, initials, relativeTime } from '@/lib/utils';

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/resumes/new', label: 'Create Resume', icon: FilePlus2 },
  { to: '/app/resumes', label: 'My Resumes', icon: Files },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => { await logout(); toast('info', 'You have been logged out.'); nav('/login'); };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60 dark:border-ink-800/60 no-print">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden btn-ghost h-10 w-10 p-0" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/app/dashboard"><Logo /></Link>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost h-10 w-10 p-0" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 rounded-xl pl-1.5 pr-2 py-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary-600 text-white grid place-items-center text-xs font-semibold">{initials(user?.name)}</div>
                )}
                <span className="hidden sm:block text-sm font-medium text-ink-700 dark:text-ink-200 max-w-[120px] truncate">{user?.name}</span>
                <ChevronDown className="h-4 w-4 text-ink-400" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 card shadow-soft-lg p-1.5 z-20"
                    >
                      <div className="px-3 py-2.5 border-b border-ink-100 dark:border-ink-800 mb-1">
                        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{user?.name}</p>
                        <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                        <p className="text-[11px] text-ink-400 mt-1">Joined {relativeTime(user?.createdAt)}</p>
                      </div>
                      <MenuItem to="/app/profile" icon={UserIcon} label="Profile" onClick={() => setMenuOpen(false)} />
                      {isAdmin && <MenuItem to="/admin" icon={Shield} label="Admin Panel" onClick={() => setMenuOpen(false)} />}
                      <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40 transition">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 no-print">
          <nav className="card p-2 sticky top-24">
            {NAV.map(item => <NavButton key={item.to} {...item} active={loc.pathname.startsWith(item.to)} />)}
            {isAdmin && <NavButton to="/admin" label="Admin Panel" icon={Shield} active={loc.pathname.startsWith('/admin')} />}
          </nav>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="lg:hidden fixed inset-0 z-40 no-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-ink-900 p-3 flex flex-col gap-1"
              >
                <div className="px-2 py-3"><Logo /></div>
                {NAV.map(item => <NavButton key={item.to} {...item} active={loc.pathname.startsWith(item.to)} onClick={() => setMobileOpen(false)} />)}
                {isAdmin && <NavButton to="/admin" label="Admin Panel" icon={Shield} active={loc.pathname.startsWith('/admin')} onClick={() => setMobileOpen(false)} />}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function NavButton({ to, label, icon: Icon, active, onClick }: { to: string; label: string; icon: any; active: boolean; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick}
      className={cls('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
        active ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800')}>
      <Icon className="h-[18px] w-[18px]" /> {label}
    </Link>
  );
}

function MenuItem({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition">
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
