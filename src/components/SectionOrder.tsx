import { useState } from 'react';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import type { SectionOrderItem, SectionKind } from '@/types';
import { cls } from '@/lib/utils';

const LABELS: Record<SectionKind, string> = {
  personal: 'Personal Info', summary: 'Summary', experience: 'Experience', education: 'Education',
  projects: 'Projects', skills: 'Skills', languages: 'Languages', certifications: 'Certifications',
  achievements: 'Achievements', interests: 'Interests', custom: 'Custom Sections',
};

interface Props { order: SectionOrderItem[]; onChange: (order: SectionOrderItem[]) => void; }

export default function SectionOrder({ order, onChange }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); if (id === dragId) return; reorder(dragId!, id); };
  const reorder = (fromId: string, toId: string) => {
    const from = order.findIndex(o => o.id === fromId);
    const to = order.findIndex(o => o.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...order];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };
  const toggle = (id: string) => onChange(order.map(o => o.id === id ? { ...o, visible: !o.visible } : o));

  return (
    <div className="space-y-1.5">
      {order.map(o => (
        <div key={o.id}
          draggable={o.kind !== 'personal'}
          onDragStart={() => onDragStart(o.id)}
          onDragOver={(e) => onDragOver(e, o.id)}
          className={cls('flex items-center gap-2 rounded-xl border px-3 py-2.5 transition',
            o.kind === 'personal' ? 'border-ink-200 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-800/40' : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 cursor-grab hover:border-primary-400 hover:shadow-soft',
            dragId === o.id && 'opacity-50 border-primary-500')}
        >
          {o.kind !== 'personal' ? <GripVertical className="h-4 w-4 text-ink-400" /> : <div className="w-4" />}
          <span className={cls('text-sm flex-1', !o.visible && 'text-ink-400 line-through')}>{LABELS[o.kind]}</span>
          <button onClick={() => toggle(o.id)} className="text-ink-400 hover:text-primary-600 p-1 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800">
            {o.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </div>
  );
}
