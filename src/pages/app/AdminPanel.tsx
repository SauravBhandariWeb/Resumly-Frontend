import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, Download, Trash2, Shield, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { api } from '@/api';
import type { AdminStats, User, Resume } from '@/types';
import { Card, Skeleton, Badge, EmptyState } from '@/components/ui/primitives';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { initials, relativeTime, cls, formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

type DeleteTarget = { type: 'user' | 'resume'; id: string; label: string };

export default function AdminPanel() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview'|'users'|'resumes'>('overview');
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.analytics.admin(), api.admin.users()]).then(([s, u]) => {
      setStats(s); setUsers(u); setResumes(s.recentResumes);
    }).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const onDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      if (target.type === 'user') await api.admin.deleteUser(target.id);
      else await api.admin.deleteResume(target.id);
      toast('success', `${target.type === 'user' ? 'User' : 'Resume'} deleted.`);
      setTarget(null); load();
    } catch (e: any) { toast('error', e.message); }
    finally { setDeleting(false); }
  };

  const cards = [
    { label: 'Total users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-primary-500 to-primary-700' },
    { label: 'Total resumes', value: stats?.totalResumes ?? 0, icon: FileText, color: 'from-accent-500 to-accent-700' },
    { label: 'Total downloads', value: stats?.totalDownloads ?? 0, icon: Download, color: 'from-success-500 to-success-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ink-700 to-ink-900 grid place-items-center text-white"><Shield className="h-5 w-5" /></div>
        <div><h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Panel</h1><p className="text-ink-500 dark:text-ink-400 text-sm">Platform-wide overview and moderation.</p></div>
      </div>

      <div className="card p-1.5 flex gap-1 w-fit">
        {(['overview','users','resumes'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={cls('h-9 px-4 rounded-lg text-sm font-medium capitalize transition', tab===t ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800')}>{t}</button>
        ))}
      </div>

      {loading ? <div className="grid sm:grid-cols-3 gap-4">{[0,1,2].map(i=><Skeleton key={i} className="h-28" />)}</div> : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {cards.map((c,i) => (
                  <motion.div key={c.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                    <Card className="p-5">
                      <div className="flex items-start justify-between"><div><p className="text-sm text-ink-500">{c.label}</p><p className="mt-1 font-display text-2xl font-bold">{c.value}</p></div><div className={cls('h-10 w-10 rounded-xl bg-gradient-to-br grid place-items-center text-white', c.color)}><c.icon className="h-5 w-5" /></div></div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-ink-400" /><h2 className="section-title">7-day growth</h2></div>
                <div className="flex items-end justify-between gap-2 h-40">
                  {stats?.growth.map((g,i) => {
                    const max = Math.max(1, ...stats.growth.map(x=>Math.max(x.users,x.resumes)));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center gap-1 h-32">
                          <div className="w-3 rounded-t bg-primary-500" style={{ height: `${(g.users/max)*100}%`, minHeight: 2 }} title={`${g.users} users`} />
                          <div className="w-3 rounded-t bg-accent-500" style={{ height: `${(g.resumes/max)*100}%`, minHeight: 2 }} title={`${g.resumes} resumes`} />
                        </div>
                        <span className="text-[10px] text-ink-400">{g.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-ink-500"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-primary-500" /> Users</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-accent-500" /> Resumes</span></div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="section-title mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-ink-400" /> Recent users</h2>
                  <div className="space-y-2">{stats?.recentUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="h-8 w-8 rounded-lg object-cover" /> : <div className="h-8 w-8 rounded-lg bg-primary-600 text-white grid place-items-center text-xs font-semibold">{initials(u.name)}</div>}
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{u.name}</p><p className="text-xs text-ink-500 truncate">{u.email}</p></div>
                      <span className="text-xs text-ink-400">{relativeTime(u.createdAt)}</span>
                    </div>
                  ))}</div>
                </Card>
                <Card className="p-6">
                  <h2 className="section-title mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-ink-400" /> Recent resumes</h2>
                  <div className="space-y-2">{stats?.recentResumes.map(r => (
                    <Link key={r._id} to={`/app/resumes/${r._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800/60">
                      <div className="h-8 w-8 rounded-lg bg-ink-200 dark:bg-ink-700 grid place-items-center text-xs font-bold text-ink-600">{r.title[0]?.toUpperCase()}</div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{r.title}</p><p className="text-xs text-ink-500">{relativeTime(r.updatedAt)}</p></div>
                      <ArrowRight className="h-4 w-4 text-ink-400" />
                    </Link>
                  ))}</div>
                </Card>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 dark:bg-ink-800/50 text-ink-500 text-left">
                    <tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                        <td className="px-4 py-3"><div className="flex items-center gap-3">{u.avatarUrl ? <img src={u.avatarUrl} className="h-8 w-8 rounded-lg object-cover" /> : <div className="h-8 w-8 rounded-lg bg-primary-600 text-white grid place-items-center text-xs font-semibold">{initials(u.name)}</div>}<div><p className="font-medium">{u.name}</p><p className="text-xs text-ink-500">{u.email}</p></div></div></td>
                        <td className="px-4 py-3"><Badge color={u.role==='admin'?'accent':'ink'}>{u.role}</Badge></td>
                        <td className="px-4 py-3 text-ink-500">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-right">{u.role !== 'admin' && <button onClick={()=>setTarget({type:'user',id:u._id,label:u.name})} className="btn-ghost h-9 w-9 p-0 text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40 inline-flex"><Trash2 className="h-4 w-4" /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length===0 && <EmptyState title="No users" />}
            </Card>
          )}

          {tab === 'resumes' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 dark:bg-ink-800/50 text-ink-500 text-left">
                    <tr><th className="px-4 py-3 font-medium">Resume</th><th className="px-4 py-3 font-medium">Downloads</th><th className="px-4 py-3 font-medium">Updated</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                    {resumes.map(r => (
                      <tr key={r._id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                        <td className="px-4 py-3"><Link to={`/app/resumes/${r._id}`} className="font-medium hover:text-primary-600">{r.title}</Link></td>
                        <td className="px-4 py-3 text-ink-500">{r.downloads||0}</td>
                        <td className="px-4 py-3 text-ink-500">{relativeTime(r.updatedAt)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={()=>setTarget({type:'resume',id:r._id,label:r.title})} className="btn-ghost h-9 w-9 p-0 text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40 inline-flex"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resumes.length===0 && <EmptyState title="No resumes" />}
            </Card>
          )}
        </>
      )}

      <ConfirmDialog open={!!target} danger title={`Delete ${target?.type}?`} message={`"${target?.label}" will be permanently deleted.`} confirmText="Delete" loading={deleting} onConfirm={onDelete} onClose={()=>setTarget(null)} />
    </div>
  );
}
