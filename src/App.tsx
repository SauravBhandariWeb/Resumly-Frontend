import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import Toaster from '@/components/ui/Toaster';
import { Spinner } from '@/components/ui/primitives';

import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import AppShell from '@/components/AppShell';

import Dashboard from '@/pages/app/Dashboard';
import MyResumes from '@/pages/app/MyResumes';
import Analytics from '@/pages/app/Analytics';
import Profile from '@/pages/app/Profile';
import NewResume from '@/pages/app/NewResume';
import ResumeBuilder from '@/pages/app/ResumeBuilder';
import AdminPanel from '@/pages/app/AdminPanel';

function AnimatedRoutes() {
  const loc = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname.split('/')[1] || 'root'}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={<Protected><AppShell><Outlet /></AppShell></Protected>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Page><Dashboard /></Page>} />
          <Route path="resumes" element={<Page><MyResumes /></Page>} />
          <Route path="resumes/new" element={<Page><NewResume /></Page>} />
          <Route path="resumes/:id" element={<ResumeBuilder />} />
          <Route path="analytics" element={<Page><Analytics /></Page>} />
          <Route path="profile" element={<Page><Profile /></Page>} />
        </Route>
        <Route path="/admin" element={<Protected admin><AppShell><AdminPanel /></AppShell></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

import { Outlet } from 'react-router-dom';

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

function Protected({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen grid place-items-center"><Spinner className="h-10 w-10" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
