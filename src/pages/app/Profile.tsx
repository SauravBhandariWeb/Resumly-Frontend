import { useState } from 'react';
import { Camera, Save, User as UserIcon, Loader2, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';
import { Input, Field, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/primitives';
import { initials, cls } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(60),
  title: z.string().max(80).optional(),
  bio: z.string().max(400).optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(80).optional(),
  website: z.string().max(120).optional(),
  linkedin: z.string().max(120).optional(),
  github: z.string().max(120).optional(),
});
type Form = z.infer<typeof schema>;

export default function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: { name: user?.name||'', title: user?.title||'', bio: user?.bio||'', phone: user?.phone||'', location: user?.location||'', website: user?.website||'', linkedin: user?.linkedin||'', github: user?.github||'' },
  });

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await api.upload.image(file);
      const updated = await api.auth.updateProfile({ avatarUrl: url });
      setUser(updated);
      toast('success', 'Profile photo updated.');
    } catch (e: any) { toast('error', e.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const onSubmit = async (v: Form) => {
    setSaving(true);
    try { const updated = await api.auth.updateProfile(v); setUser(updated); toast('success', 'Profile saved.'); }
    catch (e: any) { toast('error', e.message); }
    finally { setSaving(false); }
  };

  if (!user) return null;
  const completion = user.profileCompleted ? 100 : Math.round(['name','title','phone','location','avatarUrl'].filter(f => (user as any)[f]).length / 5 * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">Manage your personal information and photo.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 text-center">
          <div className="relative inline-block">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-28 w-28 rounded-2xl object-cover" />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-primary-600 text-white grid place-items-center text-3xl font-bold">{initials(user.name)}</div>
            )}
            <label className={cls('absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 shadow-soft grid place-items-center cursor-pointer hover:bg-primary-50 transition', uploading && 'pointer-events-none')}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary-600" /> : <Camera className="h-4 w-4 text-primary-600" />}
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value=''; }} />
            </label>
          </div>
          <h3 className="mt-4 font-display font-semibold text-lg">{user.name}</h3>
          <p className="text-sm text-ink-500">{user.email}</p>
          {user.role === 'admin' && <div className="mt-2"><Badge color="accent">Admin</Badge></div>}
          <div className="mt-5 text-left">
            <div className="flex items-center justify-between text-sm mb-1.5"><span className="text-ink-500">Profile completion</span><span className="font-medium">{completion}%</span></div>
            <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${completion}%` }} /></div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name" error={errors.name?.message}><Input {...register('name')} /></Field>
              <Field label="Professional title" error={errors.title?.message}><Input {...register('title')} placeholder="Software Engineer" /></Field>
              <Field label="Phone" error={errors.phone?.message}><Input {...register('phone')} /></Field>
              <Field label="Location" error={errors.location?.message}><Input {...register('location')} /></Field>
              <Field label="Website" error={errors.website?.message}><Input {...register('website')} placeholder="yoursite.com" /></Field>
              <Field label="LinkedIn" error={errors.linkedin?.message}><Input {...register('linkedin')} /></Field>
              <Field label="GitHub" error={errors.github?.message}><Input {...register('github')} /></Field>
            </div>
            <Field label="Bio" error={errors.bio?.message}><Textarea {...register('bio')} placeholder="A short professional bio…" /></Field>
            <div className="flex justify-end"><Button type="submit" loading={saving} disabled={!isDirty}><Save className="h-4 w-4" /> Save changes</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
