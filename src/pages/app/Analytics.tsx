import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, HardDrive, Gauge, FilePlus2, ArrowRight } from 'lucide-react';
import { api } from '@/api';
import type { Analytics as A } from '@/types';
import { Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import Button from '@/components/ui/Button';
import { bytes, relativeTime, cls } from '@/lib/utils';
import { templateById } from '@/lib/resumeDefaults';

export default function Analytics() {
  const [data, setData] = useState<A | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.analytics.me().then(setData).finally(()=>setLoading(false)); }, []);

  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i=><Skeleton key={i} className="h-28" />)}</div>;

  const cards = [
    { label: 'Total resumes', value: data?.totalResumes ?? 0, icon: FileText, color: 'from-primary-500 to-primary-700' },
    { label: 'Total downloads', value: data?.totalDownloads ?? 0, icon: Download, color: 'from-accent-500 to-accent-700' },
    { label: 'Avg. ATS score', value: data ? `${data.avgAtsScore}%` : '—', icon: Gauge, color: 'from-success-500 to-success-700' },
    { label: 'Profile completion', value: data ? `${data.profileCompletion}%` : '—', icon: TrendingUp, color: 'from-ink-500 to-ink-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">Track your resume performance at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-sm text-ink-500">{c.label}</p><p className="mt-1 font-display text-2xl font-bold">{c.value}</p></div>
                <div className={cls('h-10 w-10 rounded-xl bg-gradient-to-br grid place-items-center text-white', c.color)}><c.icon className="h-5 w-5" /></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="section-title mb-4">Recent resumes</h2>
          {data && data.recentResumes.length > 0 ? (
            <div className="space-y-2">
              {data.recentResumes.map(r => {
                const t = templateById(r.templateId);
                return (
                  <Link key={r._id} to={`/app/resumes/${r._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/60 transition">
                    <div className="h-10 w-10 rounded-lg grid place-items-center text-white font-bold text-sm shrink-0" style={{ background: t.accent }}>{r.title[0]?.toUpperCase()}</div>
                    <div className="min-w-0 flex-1"><p className="font-medium truncate">{r.title}</p><p className="text-xs text-ink-500">{t.name} · {relativeTime(r.updatedAt)}</p></div>
                    <span className="text-xs text-ink-500">{r.downloads||0} downloads</span>
                    <ArrowRight className="h-4 w-4 text-ink-400" />
                  </Link>
                );
              })}
            </div>
          ) : <EmptyState icon={<FileText className="h-10 w-10" />} title="No resumes yet" action={<Link to="/app/resumes/new"><Button><FilePlus2 className="h-4 w-4" /> Create resume</Button></Link>} />}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><HardDrive className="h-5 w-5 text-ink-400" /><h2 className="section-title">Storage</h2></div>
          <p className="font-display text-2xl font-bold">{bytes(data?.storageUsed || 0)}</p>
          <div className="mt-3 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100,(data?.storageUsed||0)/500000*100)}%` }} /></div>
          <p className="mt-2 text-xs text-ink-400">of 500 KB local quota</p>
        </Card>
      </div>
    </div>
  );
}
