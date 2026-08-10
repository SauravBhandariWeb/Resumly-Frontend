import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const QUOTES = [
  { t: 'Resumly saved me hours.', a: '— A happy user' },
];

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50 dark:bg-ink-950">
      {/* Form side */}
      <div className="flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <button onClick={toggle} className="btn-ghost h-10 w-10 p-0">{theme === 'dark' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm">
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </motion.div>
        </div>
      </div>
      
      {/* Visual side */}
      
     
       <div className="hidden lg:flex relative
       bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950
      
      overflow-hidden">


        <div className="absolute inset-0 bg-grid-light opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
       
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="space-y-4 max-w-md">
            <h2 className="font-display text-3xl font-bold leading-tight">Craft a resume that recruiters notice.</h2>
            <p className="text-primary-100">AI writing assistance, 10 ATS-friendly templates, and pixel-perfect PDF export — all in one place.</p>
          </div>
         
          <div className="space-y-4">
            {QUOTES.map(q => (
              <div key={q.t} className="glass rounded-2xl p-5 border-white/20 bg-white/10">
                <p className="text-lg font-medium">"{q.t}"</p>
                <p className="text-primary-100 text-sm mt-2">{q.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div> 
    </div>
  );
}
