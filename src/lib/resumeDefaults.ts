import type { ResumeData, SectionOrderItem, TemplateMeta, TemplateId } from '@/types';
import { uid } from '@/lib/utils';

export function emptyResumeData(): ResumeData {
  return {
    personal: {
      fullName: '', jobTitle: '', email: '', phone: '', location: '',
      website: '', linkedin: '', github: '', photoUrl: '',
    },
    summary: { id: uid(), title: 'Profile Summary', text: '' },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    achievements: [],
    interests: [],
    customSections: [],
  };
}

export function defaultSectionOrder(): SectionOrderItem[] {
  return [
    { kind: 'personal', id: 'personal', visible: true },
    { kind: 'summary', id: 'summary', visible: true },
    { kind: 'experience', id: 'experience', visible: true },
    { kind: 'education', id: 'education', visible: true },
    { kind: 'projects', id: 'projects', visible: true },
    { kind: 'skills', id: 'skills', visible: true },
    { kind: 'languages', id: 'languages', visible: true },
    { kind: 'certifications', id: 'certifications', visible: true },
    { kind: 'achievements', id: 'achievements', visible: true },
    { kind: 'interests', id: 'interests', visible: true },
    { kind: 'custom', id: 'custom', visible: true },
  ];
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'modern', name: 'Modern', description: 'Clean two-column with a vivid header band.', layout: 'single', accent: '#1f4af0', atsFriendly: true },
  { id: 'classic', name: 'Classic', description: 'Traditional single column, serif headings.', layout: 'single', accent: '#0f172a', atsFriendly: true },
  { id: 'minimal', name: 'Minimal', description: 'Whitespace-first, subtle dividers.', layout: 'single', accent: '#334155', atsFriendly: true },
  { id: 'executive', name: 'Executive', description: 'Bold name, centered, refined serif.', layout: 'single', accent: '#0b3d91', atsFriendly: true },
  { id: 'google', name: 'Google Style', description: 'Sans-serif, colored accents, flat.', layout: 'single', accent: '#1a73e8', atsFriendly: true },
  { id: 'harvard', name: 'Harvard', description: 'Formal serif, centered header, rules.', layout: 'single', accent: '#a41e22', atsFriendly: true },
  { id: 'stanford', name: 'Stanford', description: 'Cardinal accent, classic serif body.', layout: 'single', accent: '#8c1515', atsFriendly: true },
  { id: 'professional', name: 'Professional', description: 'Balanced two-column with sidebar.', layout: 'sidebar', accent: '#0f766e', atsFriendly: true },
  { id: 'creative', name: 'Creative', description: 'Asymmetric sidebar, expressive type.', layout: 'sidebar', accent: '#db2777', atsFriendly: true },
  { id: 'corporate', name: 'Corporate', description: 'Structured, navy header, grid feel.', layout: 'single', accent: '#1e3a8a', atsFriendly: true },
];

export function templateById(id: TemplateId): TemplateMeta {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

export const FONT_STACKS: Record<string, string> = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Source Serif 4', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
};

export const FONT_SIZE_PX: Record<string, number> = { sm: 13, md: 14, lg: 16 };
export const SPACING_PX: Record<string, number> = { compact: 14, normal: 18, comfortable: 24 };

export function monthYear(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(+d)) return value;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
