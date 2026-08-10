import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, HardDrive, FilePlus2, ArrowRight, Sparkles, Clock, Github, Linkedin, Mail } from 'lucide-react';
import { api } from '@/api';
import { useAuth } from '@/context/AuthContext';
import type { Analytics as A } from '@/types';
import { Card, Skeleton, Badge, EmptyState } from '@/components/ui/primitives';
import Button from '@/components/ui/Button';
import { bytes, relativeTime, cls } from '@/lib/utils';
import { templateById } from '@/lib/resumeDefaults';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<A | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.analytics.me().then(setData).finally(() => setLoading(false)); }, []);

  const stats = [
    { label: 'Resumes', value: data?.totalResumes ?? 0, icon: FileText, color: 'from-primary-500 to-primary-700' },
    { label: 'Downloads', value: data?.totalDownloads ?? 0, icon: Download, color: 'from-accent-500 to-accent-700' },
    { label: 'Avg. ATS score', value: data ? `${data.avgAtsScore}%` : '0%', icon: TrendingUp, color: 'from-success-500 to-success-700' },
    { label: 'Profile complete', value: data ? `${data.profileCompletion}%` : '0%', icon: Sparkles, color: 'from-ink-500 to-ink-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">Here's a snapshot of your resume activity.</p>
        </div>
        <Link to="/app/resumes/new"><Button><FilePlus2 className="h-4 w-4" /> New resume</Button></Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
         
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-ink-900/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{s.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white">{loading ? '—' : s.value}</p>
                </div>
                <div className={cls('h-10 w-10 rounded-xl bg-gradient-to-br grid place-items-center text-white', s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
          
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent resumes */}
        <Card className="lg:col-span-2 p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-ink-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent resumes</h2>
            <Link to="/app/resumes" className="text-sm link flex items-center gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : data && data.recentResumes.length > 0 ? (
            <div className="space-y-2">
              {data.recentResumes.map(r => {
                const t = templateById(r.templateId);
                return (
                  <Link key={r._id} to={`/app/resumes/${r._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition group">
                    <div className="h-12 w-12 rounded-xl grid place-items-center text-white font-display font-bold shrink-0" style={{ background: t.accent }}>
                      {r.title[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink-900 dark:text-ink-100 truncate">{r.title}</p>
                      <p className="text-xs text-ink-500">{t.name} template · Updated {relativeTime(r.updatedAt)}</p>
                    </div>
                    {typeof r.atsScore === 'number' && r.atsScore > 0 && <Badge color={r.atsScore >= 70 ? 'success' : 'warning'}>ATS {r.atsScore}</Badge>}
                    <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-primary-600 transition" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<FileText className="h-10 w-10" />} title="No resumes yet" description="Create your first resume to get started."
              action={<Link to="/app/resumes/new"><Button><FilePlus2 className="h-4 w-4" /> Create resume</Button></Link>} />
          )}
        </Card>

        {/* Side column: storage + quick actions */}
        <div className="space-y-6">
          <Card className="p-6 transform transition-all duration-300 hover:-translate-y-1.5  hover:shadow-xl dark:hover:shadow-ink-900/50">
            <div className="flex items-center gap-2 mb-3"><HardDrive className="h-5 w-5 text-ink-400" /><h2 className="section-title">Storage used</h2></div>
            <p className="font-display text-2xl font-bold">{loading ? '—' : bytes(data?.storageUsed || 0)}</p>
            <div className="mt-3 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (data?.storageUsed||0)/500000*100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-400">of 500 KB local quota</p>
          </Card>

          <Card className="p-6 transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-ink-900/50">
            <div className="flex items-center gap-2 mb-3"><Clock className="h-5 w-5 text-ink-400" /><h2 className="section-title">Quick actions</h2></div>
            <div className="space-y-2">
              <Link to="/app/resumes/new" className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                <span className="text-sm font-medium">Create a new resume</span><ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
              <Link to="/app/resumes" className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                <span className="text-sm font-medium">Browse all resumes</span><ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
              <Link to="/app/profile" className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                <span className="text-sm font-medium">Complete your profile</span><ArrowRight className="h-4 w-4 text-ink-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Developer Links Footer */}
      <div className="flex items-center gap-6 pt-4 text-ink-500 dark:text-ink-400 justify-start">
        
        {/* // my linkdin account */}
        <a 
          href="https://www.linkedin.com/in/saurav-bhandari-223ab0294?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <Linkedin className="h-4 w-4" />
          <span className="text-sm font-medium">LinkedIn</span>
        </a>
       
       {/* // my github account */}
        <a 
          href="https://github.com/SauravBhandariWeb" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <Github className="h-4 w-4" />
          <span className="text-sm font-medium">GitHub</span>
        </a>
        
        {/* // my gmail. id */}
        <a 
          href="mailto:skp72140@gmail.com" 
          className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <Mail className="h-4 w-4" />
          <span className="text-sm font-medium">Gmail</span>
        </a>
      </div>
    </div>
  );
}