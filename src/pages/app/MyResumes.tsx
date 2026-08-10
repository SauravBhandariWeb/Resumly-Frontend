import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FilePlus2, MoreVertical, Copy, Trash2, Pencil, Eye, Download, FileText } from 'lucide-react';
import type { Resume, ResumeListResponse } from '@/types';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';
import { templateById } from '@/lib/resumeDefaults';
import { relativeTime, cls } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Skeleton, EmptyState, Badge } from '@/components/ui/primitives';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { exportResumeToPdf } from '@/lib/pdfExport';

export default function MyResumes() {
  const { toast } = useToast();
  const nav = useNavigate();
  const [data, setData] = useState<ResumeListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.resumes.list({ page, limit: 6, q }).then(setData).finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const onSearch = (v: string) => { setQ(v); setPage(1); };

  const onDuplicate = async (r: Resume) => {
    try { await api.resumes.duplicate(r._id); toast('success', 'Resume duplicated.'); load(); }
    catch (e: any) { toast('error', e.message); }
  };

  const onDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try { await api.resumes.remove(confirm._id); toast('success', 'Resume deleted.'); setConfirm(null); load(); }
    catch (e: any) { toast('error', e.message); }
    finally { setDeleting(false); }
  };

  const onExport = async (r: Resume) => {
    setExporting(r._id);
    try {
      const full = await api.resumes.get(r._id);
      await exportResumeToPdf(full);
      await api.resumes.download(r._id);
      toast('success', 'PDF downloaded.');
      load();
    } catch (e: any) { toast('error', e.message || 'Export failed'); }
    finally { setExporting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">My resumes</h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">{data ? `${data.total} resume${data.total!==1?'s':''}` : 'Loading…'}</p>
        </div>
        <Link to="/app/resumes/new"><Button><FilePlus2 className="h-4 w-4" /> New resume</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
        <Input className="pl-9" placeholder="Search by title or name…" value={q} onChange={e => onSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((r, i) => {
              const t = templateById(r.templateId);
              const isExporting = exporting === r._id;
              const hasDownloaded = (r.downloads || 0) > 0;

              return (
                <motion.div key={r._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card 
                    className={cls(
                      "overflow-hidden group transform-gpu transition-all duration-300",
                      isExporting 
                        ? "ring-2 ring-primary-500 scale-[1.02] shadow-xl" // Active downloading state
                        : "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-ink-900/50", // Default 3D hover
                      hasDownloaded && !isExporting ? "border-success-200 dark:border-success-900/50" : "" // Tint border if downloaded
                    )}
                  >
                    <div className="aspect-[3/4] bg-ink-100 dark:bg-ink-900 relative overflow-hidden">
                      <div className="absolute inset-0 grid place-items-center text-white transition-transform duration-500 group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${t.accent}cc, ${t.accent})` }}>
                        <FileText className="h-12 w-12 opacity-50" />
                      </div>

                      {/* Downloading Overlay */}
                      {isExporting && (
                        <div className="absolute inset-0 z-10 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] grid place-items-center">
                           <Badge color="primary" className="animate-pulse shadow-lg bg-white dark:bg-ink-900">Downloading...</Badge>
                        </div>
                      )}

                      <div className="absolute top-3 left-3"><Badge color="ink" className="bg-white/90 text-ink-800">{t.name}</Badge></div>
                      {typeof r.atsScore === 'number' && r.atsScore > 0 && (
                        <div className="absolute top-3 right-3"><Badge color={r.atsScore >= 70 ? 'success' : 'warning'} className="bg-white/90">ATS {r.atsScore}</Badge></div>
                      )}
                    </div>
                    
                    {/* Alter background slightly if already downloaded */}
                    <div className={cls(
                      "p-4 transition-colors duration-300",
                      hasDownloaded ? "bg-success-50/40 dark:bg-success-900/10" : ""
                    )}>
                      <p className="font-medium text-ink-900 dark:text-ink-100 truncate">{r.title}</p>
                      <p className="text-xs text-ink-500 mt-1">Updated {relativeTime(r.updatedAt)} · {r.downloads||0} downloads</p>
                      <div className="mt-3 flex items-center justify-between">
                        <Link to={`/app/resumes/${r._id}`}><Button size="sm" variant="secondary">
                          <Pencil className="h-3.5 w-3.5" /> Edit</Button>
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setMenuId(menuId === r._id ? null : r._id)}
                            className="btn-ghost h-9 w-9 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {menuId === r._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setMenuId(null)}
                              />

                              <div
                                className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl p-1.5 z-[9999]"
                              >
                                <MenuItem
                                  icon={Eye}
                                  label="Preview"
                                  onClick={() => nav(`/app/resumes/${r._id}`)}
                                />

                                <MenuItem
                                  icon={Copy}
                                  label="Duplicate"
                                  onClick={() => {
                                    onDuplicate(r);
                                    setMenuId(null);
                                  }}
                                />

                                <MenuItem
                                  icon={Download}
                                  label={isExporting ? "Exporting..." : "Download PDF"}
                                  disabled={isExporting}
                                  onClick={() => {
                                    onExport(r);
                                    setMenuId(null);
                                  }}
                                />

                                <MenuItem
                                  icon={Trash2}
                                  label="Delete"
                                  danger
                                  onClick={() => {
                                    setConfirm(r);
                                    setMenuId(null);
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page<=1} onClick={() => setPage(p=>p-1)}>Previous</Button>
              <span className="text-sm text-ink-500 px-2">Page {data.page} of {data.pages}</span>
              <Button variant="outline" size="sm" disabled={page>=data.pages} onClick={() => setPage(p=>p+1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <EmptyState icon={<FileText className="h-10 w-10" />} title="No resumes found" description={q ? 'Try a different search.' : 'Create your first resume to get started.'}
            action={<Link to="/app/resumes/new"><Button><FilePlus2 className="h-4 w-4" /> Create resume</Button></Link>} />
        </Card>
      )}

      <ConfirmDialog open={!!confirm} danger title="Delete resume?" message={`"${confirm?.title}" will be permanently deleted.`}
        confirmText="Delete" loading={deleting} onConfirm={onDelete} onClose={() => setConfirm(null)} />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger, disabled }: { icon: any; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} className={cls('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition disabled:opacity-50',
      danger ? 'text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800')}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}