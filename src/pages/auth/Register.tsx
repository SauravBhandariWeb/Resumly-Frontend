import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name').max(60),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const { register: doRegister } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    try { await doRegister(v.name, v.email, v.password); toast('success', 'Welcome to Resumly!'); nav('/app/dashboard'); }
    catch (e: any) { toast('error', e.message || 'Could not create account'); }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start building standout resumes in minutes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <div className="relative"><UserIcon className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" placeholder="Jane Doe" {...register('name')} /></div>
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="email" placeholder="you@example.com" {...register('email')} /></div>
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="password" placeholder="Min. 8 characters" {...register('password')} /></div>
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
      <p className="mt-6 text-sm text-center text-ink-500 dark:text-ink-400">
        Already have an account? <Link to="/login" className="link font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
