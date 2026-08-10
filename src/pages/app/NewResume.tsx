import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { TemplateId } from '@/types';
import { TEMPLATES, templateById } from '@/lib/resumeDefaults';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cls } from '@/lib/utils';
import TemplateThumbnail from '@/components/templates/TemplateThumbnail';

const schema = z.object({ title: z.string().min(1, 'Give your resume a title').max(80) });
type Form = z.infer<typeof schema>;

export default function NewResume() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<TemplateId>('modern');
  const [creating, setCreating] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { title: 'Untitled Resume' } });

  const onSubmit = async (v: Form) => {
    setCreating(true);
    try {
      const t = templateById(selected);
      const r = await api.resumes.create({ title: v.title, templateId: selected, theme: { primary: t.accent, accent: t.accent, layout: t.layout } });
      toast('success', 'Resume created. Start editing!');
      nav(`/app/resumes/${r._id}`);
    } catch (e: any) { toast('error', e.message); setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 mb-2"><ArrowLeft className="h-4 w-4" /> Back</button>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Create a new resume</h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">Pick a template — you can switch anytime without losing content.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Field label="Resume title" error={errors.title?.message}>
          <Input placeholder="e.g. Software Engineer — 2025" {...register('title')} />
        </Field>

        <div>
          <h2 className="section-title mb-3">Choose a template</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t, i) => (
              <motion.button
                type="button"
                key={t.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(t.id)}
                className={cls('relative text-left rounded-2xl border-2 overflow-hidden transition-all bg-white',
                  selected === t.id ? 'border-primary-500 shadow-glow' : 'border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700')}
              >
                <div className="aspect-[3/4] bg-ink-50 dark:bg-ink-900 overflow-hidden p-3">
                  <div className="scale-[1] origin-top h-full">
                    <TemplateThumbnail templateId={t.id} />
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between border-t border-ink-100 dark:border-ink-800">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-ink-100 text-sm">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.description}</p>
                  </div>
                  {selected === t.id && <div className="h-6 w-6 rounded-full bg-primary-600 text-white grid place-items-center shrink-0"><Check className="h-4 w-4" /></div>}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 sticky bottom-4">
          <div className="card shadow-soft-lg p-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={() => nav(-1)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create & edit <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </form>
    </div>
  );
}
