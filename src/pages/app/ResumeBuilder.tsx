import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Download, Sparkles, Eye, EyeOff, LayoutTemplate,
  Settings2, Check, Loader2, Palette, X,
} from 'lucide-react';
import type { Resume, TemplateId, ResumeTheme, SectionOrderItem, AIFeature } from '@/types';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';
import { TEMPLATES, templateById } from '@/lib/resumeDefaults';
import { cls, debounce } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, Skeleton } from '@/components/ui/primitives';
import Modal from '@/components/ui/Modal';
import ResumeEditor from '@/components/ResumeEditor';
import SectionOrder from '@/components/SectionOrder';
import ResumeDocument from '@/components/templates/ResumeDocument';
import TemplateThumbnail from '@/components/templates/TemplateThumbnail';
import AIPanel from '@/components/AIPanel';
import { exportResumeToPdf } from '@/lib/pdfExport';

type Tab = 'edit' | 'design' | 'order';

export default function ResumeBuilder() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('edit');
  const [showPreview, setShowPreview] = useState(true);
  const [tplOpen, setTplOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.resumes.get(id).then(r => { setResume(r); setSavedAt(r.updatedAt); }).catch(e => toast('error', e.message)).finally(() => setLoading(false));
  }, [id]);

  const save = useCallback(async (current: Resume) => {
    setSaving(true);
    try {
      const updated = await api.resumes.update(current._id, { title: current.title, templateId: current.templateId, theme: current.theme, sectionOrder: current.sectionOrder, data: current.data });
      setSavedAt(updated.updatedAt);
    } catch (e: any) { toast('error', 'Auto-save failed'); }
    finally { setSaving(false); }
  }, [toast]);

  const debouncedSave = useRef(debounce((r: Resume) => save(r), 1200));
  useEffect(() => { if (resume) debouncedSave.current(resume); /* eslint-disable-next-line */ }, [resume]);

  const patch = (p: Partial<Resume>) => setResume(prev => prev ? { ...prev, ...p } : prev);
  const patchData = (d: Partial<Resume['data']>) => setResume(prev => prev ? { ...prev, data: { ...prev.data, ...d } } : prev);
  const patchTheme = (t: Partial<ResumeTheme>) => setResume(prev => prev ? { ...prev, theme: { ...prev.theme, ...t } } : prev);

  const onTemplateChange = (tid: TemplateId) => {
    const t = templateById(tid);
    patch({ templateId: tid, theme: { ...resume!.theme, primary: t.accent, accent: t.accent, layout: t.layout } });
    setTplOpen(false);
  };

  const onExport = async () => {
    if (!resume) return;
    setExporting(true);
    try {
      await exportResumeToPdf(resume);
      await api.resumes.download(resume._id);
      toast('success', 'PDF downloaded.');
    } catch (e: any) { toast('error', e.message || 'Export failed'); }
    finally { setExporting(false); }
  };

  const onAIApplyText = (text: string, feature: AIFeature) => {
    if (!resume) return;
    if (feature === 'summary') patchData({ summary: { ...resume.data.summary, text } });
    else if (feature === 'coverLetter') { navigator.clipboard.writeText(text); toast('info', 'Cover letter copied to clipboard.'); }
    else if (['improveGrammar','rewrite','shorten','expand','projectDescription'].includes(feature)) { navigator.clipboard.writeText(text); toast('info', 'Result copied — paste where needed.'); }
  };
  const onAIApplyArray = (items: string[], feature: AIFeature) => {
    if (!resume) return;
    if (feature === 'bullets') {
      const firstExp = resume.data.experience[0];
      if (firstExp) patchData({ experience: resume.data.experience.map((e,i) => i===0 ? { ...e, bullets: items } : e) });
      else toast('info', 'Add an experience entry first.');
    } else if (feature === 'skills') {
      const existing = new Set(resume.data.skills.map(s => s.name.toLowerCase()));
      const merged = [...resume.data.skills, ...items.filter(s => !existing.has(s.toLowerCase())).map(s => ({ id: Math.random().toString(36).slice(2), name: s, level: 'Intermediate' as const }))];
      patchData({ skills: merged });
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><div className="grid lg:grid-cols-2 gap-4"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>;
  if (!resume) return <div className="text-center py-20 text-ink-500">Resume not found.</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-2.5 flex items-center justify-between gap-2 flex-wrap sticky top-16 z-30 no-print">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => nav('/app/resumes')} className="btn-ghost h-10 w-10 p-0 shrink-0"><ArrowLeft className="h-5 w-5" /></button>
          <input value={resume.title} onChange={e=>patch({title:e.target.value})} className="bg-transparent font-display font-semibold text-lg outline-none focus:bg-ink-100 dark:focus:bg-ink-800 rounded-lg px-2 py-1 min-w-0 max-w-[40vw]" />
          <span className="text-xs text-ink-400 hidden sm:flex items-center gap-1">
            {saving ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</> : <><Check className="h-3 w-3 text-success-600" /> Saved</>}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" variant="secondary" onClick={() => setTplOpen(true)}><LayoutTemplate className="h-4 w-4" /> Template</Button>
          <Button size="sm" variant="secondary" onClick={() => setAiOpen(true)}><Sparkles className="h-4 w-4 text-primary-600" /> AI</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowPreview(v=>!v)} className="hidden sm:inline-flex">{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Preview</Button>
          <Button size="sm" onClick={onExport} loading={exporting}><Download className="h-4 w-4" /> Export PDF</Button>
        </div>
      </div>

     <div
  className={cls(
    'grid min-w-0 gap-4',
    showPreview
      ? 'lg:grid-cols-[minmax(0,1fr)_minmax(320px,42%)]'
      : 'grid-cols-1'
  )}
>


        {/* Editor column */}
        <div className="space-y-4 no-print">
          <div className="card p-1.5 flex gap-1">
            {(['edit','design','order'] as Tab[]).map(t => (
              <button key={t} onClick={()=>setTab(t)} className={cls('flex-1 h-9 rounded-lg text-sm font-medium capitalize transition', tab===t ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800')}>
                {t==='edit' && 'Content'} {t==='design' && 'Design'} {t==='order' && 'Sections'}
              </button>
            ))}
          </div>

          {tab === 'edit' && <ResumeEditor data={resume.data} onChange={patchData} />}
          {tab === 'design' && <DesignPanel resume={resume} onTheme={patchTheme} />}
          {tab === 'order' && (
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-1">Section ordering</h3>
              <p className="text-sm text-ink-500 mb-4">Drag to reorder. Toggle visibility with the eye icon. (Personal Info is always first.)</p>
              <SectionOrder order={resume.sectionOrder} onChange={(order: SectionOrderItem[]) => patch({ sectionOrder: order })} />
            </Card>
          )}
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="card p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-medium text-ink-500">Live preview · {templateById(resume.templateId).name}</span>
                <span className="text-xs text-ink-400">A4</span>
              </div>
             
             <div className="w-full min-w-0 overflow-x-hidden overflow-y-auto bg-ink-100 dark:bg-ink-950 rounded-xl p-2 sm:p-4 max-h-[calc(100vh-220px)]">
  <div ref={previewRef} className="w-full min-w-0">
    <ResponsivePreview resume={resume} />
  </div>
</div>


            </div>
          </div>
        )}
      </div>

      {/* Template switcher modal */}
      <Modal open={tplOpen} onClose={()=>setTplOpen(false)} title="Choose a template" description="Switch anytime — your content is preserved." size="xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={()=>onTemplateChange(t.id)}
              className={cls('relative text-left rounded-2xl border-2 overflow-hidden transition bg-white',
                resume.templateId===t.id ? 'border-primary-500 shadow-glow' : 'border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700')}>
              <div className="aspect-[3/4] bg-ink-50 dark:bg-ink-900 overflow-hidden p-3"><TemplateThumbnail templateId={t.id} /></div>
              <div className="p-3 flex items-center justify-between border-t border-ink-100 dark:border-ink-800">
                <div><p className="font-medium text-sm">{t.name}</p><p className="text-xs text-ink-500">{t.description}</p></div>
                {resume.templateId===t.id && <div className="h-6 w-6 rounded-full bg-primary-600 text-white grid place-items-center"><Check className="h-4 w-4" /></div>}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <AIPanel open={aiOpen} onClose={()=>setAiOpen(false)} resumeData={resume.data} onApplyText={onAIApplyText} onApplyArray={onAIApplyArray} />
    </div>
  );
}

function ResponsivePreview({ resume }: { resume: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    const updatePreview = () => {
      const container = containerRef.current;
      const page = pageRef.current;

      if (!container || !page) return;

      const A4_WIDTH = 794;

      const availableWidth = container.clientWidth;

      const newScale = Math.min(
        1,
        availableWidth / A4_WIDTH
      );

      setScale(newScale);

      const actualHeight = page.scrollHeight;

      setHeight(actualHeight * newScale);
    };

    updatePreview();

    const resizeObserver = new ResizeObserver(() => {
      updatePreview();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (pageRef.current) {
      resizeObserver.observe(pageRef.current);
    }

    window.addEventListener('resize', updatePreview);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePreview);
    };
  }, [resume]);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0 overflow-hidden"
      style={{
        height: `${height}px`,
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: `${794 * scale}px`,
          height: `${height}px`,
        }}
      >
        <div
          ref={pageRef}
          className="absolute left-0 top-0"
          style={{
            width: '794px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <ResumeDocument
            resume={resume}
            scale={1}
          />
        </div>
      </div>
    </div>
  );
}

function DesignPanel({ resume, onTheme }: { resume: Resume; onTheme: (t: Partial<ResumeTheme>) => void }) {
  const t = resume.theme;
  const COLORS = ['#1f4af0','#0f172a','#0b3d91','#1a73e8','#a41e22','#8c1515','#0f766e','#db2777','#1e3a8a','#334155','#0d9488','#b45309'];
  return (
    <Card className="p-5 space-y-5">
      <div>
        <h3 className="font-display font-semibold mb-1 flex items-center gap-2"><Palette className="h-4 w-4 text-primary-600" /> Colors</h3>
        <p className="text-sm text-ink-500 mb-3">Primary color used for headers and accents.</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={()=>onTheme({ primary: c, accent: c })} className={cls('h-9 w-9 rounded-xl border-2 transition', t.primary===c ? 'border-ink-900 dark:border-white scale-110' : 'border-transparent')} style={{ background: c }} />
          ))}
          <label className="h-9 w-9 rounded-xl border-2 border-dashed border-ink-300 grid place-items-center cursor-pointer relative overflow-hidden">
            <input type="color" value={t.primary} onChange={e=>onTheme({ primary: e.target.value, accent: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Settings2 className="h-4 w-4 text-ink-400" />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3">Font family</h3>
        <div className="grid grid-cols-3 gap-2">
          {[{id:'sans',label:'Sans'},{id:'serif',label:'Serif'},{id:'mono',label:'Mono'}].map(f => (
            <button key={f.id} onClick={()=>onTheme({ font: f.id as any })} className={cls('h-10 rounded-xl border text-sm transition', t.font===f.id ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/50' : 'border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800')}>{f.label}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3">Font size</h3>
        <div className="grid grid-cols-3 gap-2">
          {[{id:'sm',label:'Small'},{id:'md',label:'Medium'},{id:'lg',label:'Large'}].map(f => (
            <button key={f.id} onClick={()=>onTheme({ fontSize: f.id as any })} className={cls('h-10 rounded-xl border text-sm transition', t.fontSize===f.id ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/50' : 'border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800')}>{f.label}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold mb-3">Spacing</h3>
        <div className="grid grid-cols-3 gap-2">
          {[{id:'compact',label:'Compact'},{id:'normal',label:'Normal'},{id:'comfortable',label:'Roomy'}].map(f => (
            <button key={f.id} onClick={()=>onTheme({ spacing: f.id as any })} className={cls('h-10 rounded-xl border text-sm transition', t.spacing===f.id ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/50' : 'border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800')}>{f.label}</button>
          ))}
        </div>
      </div>
    </Card>
  );
}
