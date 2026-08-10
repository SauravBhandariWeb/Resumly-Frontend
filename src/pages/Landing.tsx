import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, Download, ShieldCheck, Zap, LayoutTemplate, BarChart3, Moon, Sun, Github, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';

const FEATURES = [
  { icon: Sparkles, title: 'AI-powered writing', desc: 'Generate summaries, bullet points, skills, and cover letters with Google Gemini — all server-side.' },
  { icon: LayoutTemplate, title: '10 ATS templates', desc: 'Modern, Classic, Harvard, Stanford, Executive and more. Switch instantly without losing content.' },
  { icon: FileText, title: 'Live preview editor', desc: 'Drag-and-drop section ordering with an always-accurate live preview and auto-save.' },
  { icon: Download, title: 'Pixel-perfect PDF', desc: 'A4 multi-page export that matches the preview — colors, fonts, and spacing preserved.' },
  { icon: BarChart3, title: 'Resume score', desc: 'Get an instant ATS score and keyword suggestions tailored to each job description.' },
  { icon: ShieldCheck, title: 'Secure by default', desc: 'JWT in HttpOnly cookies, bcrypt hashing, Helmet, rate limiting, and input validation.' },
];

const STATS = [
  { value: '10+', label: 'ATS templates' },
  { value: '12', label: 'AI features' },
  { value: 'A4', label: 'PDF export' },
  { value: '100%', label: 'Responsive' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const cta = user ? '/app/dashboard' : '/register';

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100 overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost h-10 w-10 p-0">{theme === 'dark' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}</button>
            {!user && <Link to="/login" className="btn-ghost h-10 px-4">Sign in</Link>}
            <Link to={cta}><Button>Get started <ArrowRight className="h-4 w-4"/></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
        <div className="absolute inset-0 bg-grid-light dark:hidden opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="chip bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-100 dark:border-primary-900">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Google Gemini
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance">
              Build a resume that <span className="text-primary-600 dark:text-primary-400">gets you hired</span>
            </h1>
            <p className="mt-5 text-lg text-ink-600 dark:text-ink-300 max-w-2xl mx-auto text-balance">
              Resumly combines AI writing assistance, ATS-friendly templates, and pixel-perfect PDF export — so you can craft a standout resume in minutes.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to={cta}><Button size="lg">Start building <ArrowRight className="h-4 w-4"/></Button></Link>
             
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="card p-5">
                <div className="font-display text-2xl font-bold text-primary-600 dark:text-primary-400">{s.value}</div>
                <div className="text-sm text-ink-500 dark:text-ink-400 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything you need, nothing you don't</h2>
          <p className="mt-3 text-ink-600 dark:text-ink-300">A complete toolkit for a professional, ATS-ready resume.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-6 hover:shadow-soft-lg transition-shadow group">
              <div className="h-11 w-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 grid place-items-center group-hover:scale-105 transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 cursor-pointer ">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 sm:p-16 text-center text-white shadow-soft-lg">
          <div className="absolute inset-0 bg-grid-light opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
          <Zap className="h-10 w-10 mx-auto mb-4" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Your next job is one resume away</h2>
          
          <p className="mt-3 text-primary-100 max-w-xl mx-auto"
         
          >Free to start. No credit card required. Build, export, and apply — today.</p>
          <Link to={cta} className="inline-block mt-7" >
            <Button size="lg" variant="secondary" className="bg-white   text-primary-700 hover:bg-primary-50  ">Get started — it's free <ArrowRight className="h-4 w-4 "
             
            />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200 dark:border-ink-800 py-8 text-center text-sm text-ink-500">
        <div className="flex items-center justify-center gap-2"><Logo showText={false} /> Resumly — AI Resume Builder</div>
        
        <div className='flex flex-col items-center justify-center mt-6'>
          <p className="mb-3 text-xs text-ink-400 font-medium tracking-wider uppercase"> Connect With Me </p>
         
          <div className="flex items-center gap-5">
            <a 
              href="https://www.linkedin.com/in/saurav-bhandari-223ab0294?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com/SauravBhandariWeb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="GitHub"
            >

            
              <Github className="h-5 w-5" />
            </a>
            <a
              href="skp72140@gmail.com" 
              className="text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}