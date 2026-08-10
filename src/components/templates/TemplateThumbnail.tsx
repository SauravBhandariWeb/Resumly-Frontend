import type { TemplateId, Resume } from '@/types';
import { emptyResumeData, defaultSectionOrder, templateById } from '@/lib/resumeDefaults';
import ResumeDocument from './ResumeDocument';
import { useMemo } from 'react';

/** Mini preview used in the template picker and dashboard cards. */

export default function TemplateThumbnail({ templateId }: { templateId: TemplateId }) {
  const resume = useMemo<Resume>(() => {
    const t = templateById(templateId);
    const data = emptyResumeData();
    data.personal = { fullName: 'Alex Morgan', jobTitle: 'Product Engineer', email: 'alex@mail.com', phone: '+1 555 0100', location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alex', photoUrl: '' };
    data.summary.text = 'Engineer with 6+ years building reliable products end-to-end.';
    data.experience = [{ id: '1', company: 'Acme Corp', position: 'Senior Engineer', location: 'SF', startDate: '2022-02', endDate: '', current: true, bullets: ['Led platform re-architecture.', 'Shipped features used by 10k+ users.'] }];
    data.education = [{ id: '1', school: 'Stanford University', degree: 'B.S.', field: 'Computer Science', startDate: '2014', endDate: '2018', gpa: '3.9' }];
    data.skills = [{id:'1',name:'React'},{id:'2',name:'Node.js'},{id:'3',name:'TypeScript'},{id:'4',name:'AWS'}];
    data.languages = [{ id:'1', name:'English', proficiency:'Native' }];
    return {
      _id: 'preview', userId: 'preview', title: 'Preview', templateId,
      theme: { primary: t.accent, accent: t.accent, text: '#1e293b', muted: '#64748b', font: t.id==='harvard'||t.id==='stanford'||t.id==='classic'||t.id==='executive' ? 'serif' : 'sans', fontSize: 'sm', spacing: 'compact', layout: t.layout },
      sectionOrder: defaultSectionOrder(),
      data, createdAt: '', updatedAt: '', downloads: 0, atsScore: 0,
    };
  }, [templateId]);

  return (
    <div style={{ pointerEvents: 'none' }}>
      <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: 794 }}>
        <ResumeDocument resume={resume} scale={1} />
      </div>
    </div>
  );
}
