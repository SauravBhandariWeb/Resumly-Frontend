import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string().min(8, 'Please confirm your password'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type Form = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { toast } = useToast();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    if (!token) { toast('error', 'Missing reset token.'); return; }
    try { await api.auth.reset(token, v.password); toast('success', 'Password reset. You can sign in now.'); nav('/login'); }
    catch (e: any) { toast('error', e.message); }
  };

  return (
  
  
    
    
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="New password" error={errors.password?.message}>
          <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="password" placeholder="Min. 8 characters" {...register('password')} /></div>
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="password" placeholder="Re-enter password" {...register('confirm')} /></div>
        </Field>
        {!token && <p className="text-xs text-error-600">No reset token found in the link.</p>}
        <Button type="submit" className="w-full" loading={isSubmitting}>Reset password</Button>
        <Link to="/login" className="block text-center text-sm link">Back to sign in</Link>
      </form>
    </AuthLayout>
  );
}
