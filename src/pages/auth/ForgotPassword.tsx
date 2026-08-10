import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/api';
import { useToast } from '@/context/ToastContext';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState('');

  const onSubmit = async (v: Form) => {
    try {
      const res: any = await api.auth.forgot(v.email);
      if (res?.token) setDemoToken(res.token); // local mode returns a token for demo
      setSent(true);
      toast('success', 'If an account exists, a reset link has been sent.');
    } catch (e: any) { toast('error', e.message); }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-success-50 dark:bg-success-950/40 border border-success-200 dark:border-success-900">
            <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 shrink-0" />
            <p className="text-sm text-success-800 dark:text-success-200">If an account exists for your email, a reset link has been sent. Check your inbox.</p>
          </div>
          {demoToken && (
            <div className="p-3 rounded-xl bg-ink-100 dark:bg-ink-800 text-xs">
              <p className="text-ink-500 mb-1">Demo mode — no email server. Use this reset token:</p>
              <code className="break-all text-primary-600 dark:text-primary-400">{demoToken}</code>
              <Link to={`/reset-password?token=${demoToken}`} className="block mt-2 link">Open reset page</Link>
            </div>
          )}
          <Link to="/login" className="flex items-center gap-1.5 text-sm link"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="email" placeholder="you@example.com" {...register('email')} /></div>
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Send reset link</Button>
          <Link to="/login" className="flex items-center gap-1.5 text-sm link"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  );
}
