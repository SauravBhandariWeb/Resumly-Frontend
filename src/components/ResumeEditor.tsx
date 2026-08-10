import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, SkillItem, LanguageItem, CertificationItem, AchievementItem, InterestItem, CustomSection } from '@/types';
import { uid, cls } from '@/lib/utils';
import { Input, Field, Textarea } from './ui/Input';
import Button from './ui/Button';

interface Props {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
}

export default function ResumeEditor({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <PersonalEditor data={data} onChange={onChange} />
      <SummaryEditor data={data} onChange={onChange} />
      <ExperienceEditor data={data} onChange={onChange} />
      <EducationEditor data={data} onChange={onChange} />
      <ProjectsEditor data={data} onChange={onChange} />
      <SkillsEditor data={data} onChange={onChange} />
      <LanguagesEditor data={data} onChange={onChange} />
      <CertificationsEditor data={data} onChange={onChange} />
      <AchievementsEditor data={data} onChange={onChange} />
      <InterestsEditor data={data} onChange={onChange} />
      <CustomSectionsEditor data={data} onChange={onChange} />
    </div>
  );
}

function Section({ title, children, count, onAdd, addLabel }: { title: string; children: React.ReactNode; count?: number; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100">{title}{typeof count === 'number' && <span className="ml-2 text-xs text-ink-400">({count})</span>}</h3>
        {onAdd && <Button size="sm" variant="secondary" onClick={onAdd}><Plus className="h-3.5 w-3.5" /> {addLabel || 'Add'}</Button>}
      </div>
      {children}
    </div>
  );
}

function ItemCard({ children, onDelete, index, onMoveUp, onMoveDown, isFirst, isLast }: { children: React.ReactNode; onDelete: () => void; index: number; onMoveUp?: ()=>void; onMoveDown?: ()=>void; isFirst?: boolean; isLast?: boolean }) {
  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-700 p-4 mb-3 bg-ink-50/40 dark:bg-ink-800/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-ink-400">
          <GripVertical className="h-4 w-4" />
          <span className="text-xs font-medium">#{index+1}</span>
        </div>
        <div className="flex items-center gap-1">
          {onMoveUp && !isFirst && <button onClick={onMoveUp} className="btn-ghost h-7 w-7 p-0"><ChevronUp className="h-4 w-4" /></button>}
          {onMoveDown && !isLast && <button onClick={onMoveDown} className="btn-ghost h-7 w-7 p-0"><ChevronDown className="h-4 w-4" /></button>}
          <button onClick={onDelete} className="btn-ghost h-7 w-7 p-0 text-error-600 hover:bg-error-50 dark:hover:bg-error-950/40"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {children}
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] { const c=[...arr]; const [it]=c.splice(from,1); c.splice(to,0,it); return c; }

function PersonalEditor({ data, onChange }: Props) {
  const p = data.personal;
  const set = (patch: Partial<typeof p>) => onChange({ personal: { ...p, ...patch } });
  return (
    <Section title="Personal Information">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full name"><Input value={p.fullName} onChange={e=>set({fullName:e.target.value})} placeholder="Jane Doe" /></Field>
        <Field label="Job title"><Input value={p.jobTitle} onChange={e=>set({jobTitle:e.target.value})} placeholder="Senior Software Engineer" /></Field>
        <Field label="Email"><Input value={p.email} onChange={e=>set({email:e.target.value})} placeholder="jane@example.com" /></Field>
        <Field label="Phone"><Input value={p.phone} onChange={e=>set({phone:e.target.value})} placeholder="+1 555 0100" /></Field>
        <Field label="Location"><Input value={p.location} onChange={e=>set({location:e.target.value})} placeholder="San Francisco, CA" /></Field>
        <Field label="Website"><Input value={p.website} onChange={e=>set({website:e.target.value})} placeholder="janedoe.com" /></Field>
        <Field label="LinkedIn"><Input value={p.linkedin} onChange={e=>set({linkedin:e.target.value})} placeholder="linkedin.com/in/jane" /></Field>
        <Field label="GitHub"><Input value={p.github} onChange={e=>set({github:e.target.value})} placeholder="github.com/jane" /></Field>
        <Field label="Photo URL"><Input value={p.photoUrl} onChange={e=>set({photoUrl:e.target.value})} placeholder="https://…" /></Field>
      </div>
    </Section>
  );
}

function SummaryEditor({ data, onChange }: Props) {
  return (
    <Section title={data.summary.title || 'Profile Summary'}>
      <Field label="Section title"><Input value={data.summary.title} onChange={e=>onChange({ summary: { ...data.summary, title: e.target.value } })} /></Field>
      <div className="mt-3"><Field label="Summary"><Textarea className="min-h-[100px]" value={data.summary.text} onChange={e=>onChange({ summary: { ...data.summary, text: e.target.value } })} placeholder="3–4 lines describing your experience and strengths…" /></Field></div>
    </Section>
  );
}

function ExperienceEditor({ data, onChange }: Props) {
  const list = data.experience;
  const update = (i: number, patch: Partial<ExperienceItem>) => onChange({ experience: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const add = () => onChange({ experience: [...list, { id: uid(), company:'',position:'',location:'',startDate:'',endDate:'',current:false,bullets:[''] }] });
  const remove = (i: number) => onChange({ experience: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Experience" count={list.length} onAdd={add} addLabel="Add role">
      {list.map((e, i) => (
        <ItemCard key={e.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({experience:move(list,i,i-1)})} onMoveDown={()=>onChange({experience:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Position"><Input value={e.position} onChange={ev=>update(i,{position:ev.target.value})} /></Field>
            <Field label="Company"><Input value={e.company} onChange={ev=>update(i,{company:ev.target.value})} /></Field>
            <Field label="Location"><Input value={e.location||''} onChange={ev=>update(i,{location:ev.target.value})} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start"><Input type="month" value={e.startDate} onChange={ev=>update(i,{startDate:ev.target.value})} /></Field>
              <Field label="End">{e.current ? <Input disabled value="Present" /> : <Input type="month" value={e.endDate} onChange={ev=>update(i,{endDate:ev.target.value})} />}</Field>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 mt-2"><input type="checkbox" checked={!!e.current} onChange={ev=>update(i,{current:ev.target.checked})} /> I currently work here</label>
          <div className="mt-3">
            <label className="label">Bullet points</label>
            <div className="space-y-2">
              {e.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2">
                  <Textarea className="min-h-[44px] flex-1" value={b} onChange={ev=>update(i,{bullets:e.bullets.map((x,idx)=>idx===bi?ev.target.value:x)})} placeholder="Led… achieving…" />
                  <button onClick={()=>update(i,{bullets:e.bullets.filter((_,idx)=>idx!==bi)})} className="btn-ghost h-9 w-9 p-0 text-error-600 shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={()=>update(i,{bullets:[...e.bullets,'']})}><Plus className="h-3.5 w-3.5" /> Add bullet</Button>
            </div>
          </div>
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="No experience added yet." />}
    </Section>
  );
}

function EducationEditor({ data, onChange }: Props) {
  const list = data.education;
  const update = (i: number, patch: Partial<EducationItem>) => onChange({ education: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const add = () => onChange({ education: [...list, { id: uid(), school:'',degree:'',field:'',startDate:'',endDate:'',current:false,gpa:'',description:'' }] });
  const remove = (i: number) => onChange({ education: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Education" count={list.length} onAdd={add} addLabel="Add education">
      {list.map((e, i) => (
        <ItemCard key={e.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({education:move(list,i,i-1)})} onMoveDown={()=>onChange({education:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="School"><Input value={e.school} onChange={ev=>update(i,{school:ev.target.value})} /></Field>
            <Field label="Degree"><Input value={e.degree} onChange={ev=>update(i,{degree:ev.target.value})} placeholder="B.S." /></Field>
            <Field label="Field of study"><Input value={e.field} onChange={ev=>update(i,{field:ev.target.value})} placeholder="Computer Science" /></Field>
            <Field label="GPA"><Input value={e.gpa||''} onChange={ev=>update(i,{gpa:ev.target.value})} placeholder="3.9" /></Field>
            <Field label="Start"><Input type="month" value={e.startDate} onChange={ev=>update(i,{startDate:ev.target.value})} /></Field>
            <Field label="End">{e.current ? <Input disabled value="Present" /> : <Input type="month" value={e.endDate} onChange={ev=>update(i,{endDate:ev.target.value})} />}</Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300 mt-2"><input type="checkbox" checked={!!e.current} onChange={ev=>update(i,{current:ev.target.checked})} /> Currently studying</label>
          {e.description && <div className="mt-3"><Field label="Description"><Textarea value={e.description} onChange={ev=>update(i,{description:ev.target.value})} /></Field></div>}
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="No education added yet." />}
    </Section>
  );
}

function ProjectsEditor({ data, onChange }: Props) {
  const list = data.projects;
  const update = (i: number, patch: Partial<ProjectItem>) => onChange({ projects: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const add = () => onChange({ projects: [...list, { id: uid(), name:'',link:'',description:'',tech:[] }] });
  const remove = (i: number) => onChange({ projects: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Projects" count={list.length} onAdd={add} addLabel="Add project">
      {list.map((p, i) => (
        <ItemCard key={p.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({projects:move(list,i,i-1)})} onMoveDown={()=>onChange({projects:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><Input value={p.name} onChange={ev=>update(i,{name:ev.target.value})} /></Field>
            <Field label="Link"><Input value={p.link||''} onChange={ev=>update(i,{link:ev.target.value})} placeholder="github.com/…" /></Field>
          </div>
          <div className="mt-3"><Field label="Description"><Textarea value={p.description} onChange={ev=>update(i,{description:ev.target.value})} /></Field></div>
          <div className="mt-3"><Field label="Technologies (comma separated)"><Input value={p.tech.join(', ')} onChange={ev=>update(i,{tech: ev.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="React, Node.js, MongoDB" /></Field></div>
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="No projects added yet." />}
    </Section>
  );
}

function SkillsEditor({ data, onChange }: Props) {
  const list = data.skills;
  const add = () => onChange({ skills: [...list, { id: uid(), name:'', level:'Intermediate' }] });
  const update = (i: number, patch: Partial<SkillItem>) => onChange({ skills: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ skills: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Skills" count={list.length} onAdd={add} addLabel="Add skill">
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((s, i) => (
          <div key={s.id} className="flex gap-2">
            <Input value={s.name} onChange={ev=>update(i,{name:ev.target.value})} placeholder="Skill name" />
            <select className="input w-36" value={s.level} onChange={ev=>update(i,{level:ev.target.value as any})}>
              {['Beginner','Intermediate','Advanced','Expert'].map(o=><option key={o} value={o}>{o}</option>)}
            </select>
            <button onClick={()=>remove(i)} className="btn-ghost h-10 w-10 p-0 text-error-600 shrink-0"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {list.length===0 && <EmptyHint text="No skills added yet." />}
    </Section>
  );
}

function LanguagesEditor({ data, onChange }: Props) {
  const list = data.languages;
  const add = () => onChange({ languages: [...list, { id: uid(), name:'', proficiency:'Fluent' }] });
  const update = (i: number, patch: Partial<LanguageItem>) => onChange({ languages: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ languages: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Languages" count={list.length} onAdd={add} addLabel="Add language">
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((l, i) => (
          <div key={l.id} className="flex gap-2">
            <Input value={l.name} onChange={ev=>update(i,{name:ev.target.value})} placeholder="Language" />
            <select className="input w-36" value={l.proficiency} onChange={ev=>update(i,{proficiency:ev.target.value as any})}>
              {['Basic','Conversational','Fluent','Native'].map(o=><option key={o} value={o}>{o}</option>)}
            </select>
            <button onClick={()=>remove(i)} className="btn-ghost h-10 w-10 p-0 text-error-600 shrink-0"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {list.length===0 && <EmptyHint text="No languages added yet." />}
    </Section>
  );
}

function CertificationsEditor({ data, onChange }: Props) {
  const list = data.certifications;
  const add = () => onChange({ certifications: [...list, { id: uid(), name:'',issuer:'',date:'',link:'' }] });
  const update = (i: number, patch: Partial<CertificationItem>) => onChange({ certifications: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ certifications: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Certifications" count={list.length} onAdd={add} addLabel="Add certification">
      {list.map((c, i) => (
        <ItemCard key={c.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({certifications:move(list,i,i-1)})} onMoveDown={()=>onChange({certifications:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><Input value={c.name} onChange={ev=>update(i,{name:ev.target.value})} /></Field>
            <Field label="Issuer"><Input value={c.issuer} onChange={ev=>update(i,{issuer:ev.target.value})} /></Field>
            <Field label="Date"><Input type="month" value={c.date} onChange={ev=>update(i,{date:ev.target.value})} /></Field>
            <Field label="Link"><Input value={c.link||''} onChange={ev=>update(i,{link:ev.target.value})} /></Field>
          </div>
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="No certifications added yet." />}
    </Section>
  );
}

function AchievementsEditor({ data, onChange }: Props) {
  const list = data.achievements;
  const add = () => onChange({ achievements: [...list, { id: uid(), title:'',description:'',date:'' }] });
  const update = (i: number, patch: Partial<AchievementItem>) => onChange({ achievements: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ achievements: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Achievements" count={list.length} onAdd={add} addLabel="Add achievement">
      {list.map((a, i) => (
        <ItemCard key={a.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({achievements:move(list,i,i-1)})} onMoveDown={()=>onChange({achievements:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><Input value={a.title} onChange={ev=>update(i,{title:ev.target.value})} /></Field>
            <Field label="Date"><Input type="month" value={a.date||''} onChange={ev=>update(i,{date:ev.target.value})} /></Field>
          </div>
          <div className="mt-3"><Field label="Description"><Textarea value={a.description} onChange={ev=>update(i,{description:ev.target.value})} /></Field></div>
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="No achievements added yet." />}
    </Section>
  );
}

function InterestsEditor({ data, onChange }: Props) {
  const list = data.interests;
  const add = () => onChange({ interests: [...list, { id: uid(), name:'' }] });
  const update = (i: number, patch: Partial<InterestItem>) => onChange({ interests: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ interests: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Interests" count={list.length} onAdd={add} addLabel="Add interest">
      <div className="flex flex-wrap gap-2">
        {list.map((it, i) => (
          <div key={it.id} className="flex items-center gap-1.5 rounded-full bg-ink-100 dark:bg-ink-800 pl-3 pr-1.5 py-1.5">
            <input className="bg-transparent text-sm outline-none w-24" value={it.name} onChange={ev=>update(i,{name:ev.target.value})} placeholder="Interest" />
            <button onClick={()=>remove(i)} className="text-ink-400 hover:text-error-600"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      {list.length===0 && <EmptyHint text="No interests added yet." />}
    </Section>
  );
}

function CustomSectionsEditor({ data, onChange }: Props) {
  const list = data.customSections;
  const add = () => onChange({ customSections: [...list, { id: uid(), title:'Custom Section', items: [] }] });
  const update = (i: number, patch: Partial<CustomSection>) => onChange({ customSections: list.map((x,idx)=>idx===i?{...x,...patch}:x) });
  const remove = (i: number) => onChange({ customSections: list.filter((_,idx)=>idx!==i) });
  return (
    <Section title="Custom Sections" count={list.length} onAdd={add} addLabel="Add section">
      {list.map((cs, i) => (
        <ItemCard key={cs.id} index={i} onDelete={()=>remove(i)} onMoveUp={()=>onChange({customSections:move(list,i,i-1)})} onMoveDown={()=>onChange({customSections:move(list,i,i+1)})} isFirst={i===0} isLast={i===list.length-1}>
          <Field label="Section title"><Input value={cs.title} onChange={ev=>update(i,{title:ev.target.value})} /></Field>
          <div className="mt-3 space-y-2">
            <label className="label">Items</label>
            {cs.items.map((it, ii) => (
              <div key={it.id} className="flex gap-2">
                <Input value={it.title} placeholder="Label" onChange={ev=>update(i,{items:cs.items.map((x,idx)=>idx===ii?{...x,title:ev.target.value}:x)})} />
                <Input value={it.value} placeholder="Value" onChange={ev=>update(i,{items:cs.items.map((x,idx)=>idx===ii?{...x,value:ev.target.value}:x)})} />
                <button onClick={()=>update(i,{items:cs.items.filter((_,idx)=>idx!==ii)})} className="btn-ghost h-10 w-10 p-0 text-error-600 shrink-0"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={()=>update(i,{items:[...cs.items,{id:uid(),title:'',value:''}]})}><Plus className="h-3.5 w-3.5" /> Add item</Button>
          </div>
        </ItemCard>
      ))}
      {list.length===0 && <EmptyHint text="Add a custom section for anything else." />}
    </Section>
  );
}

function EmptyHint({ text }: { text: string }) { return <p className="text-sm text-ink-400 text-center py-4">{text}</p>; }
