import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Github } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// speak


const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

type Form = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    try { await login(v.email, v.password); toast('success', 'Welcome back!'); nav('/app/dashboard'); }
    catch (e: any) { toast('error', e.message || 'Could not sign in'); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue building your resumes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="email" placeholder="you@example.com" {...register('email')} /></div>
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-ink-400" /><Input className="pl-9" type="password" placeholder="Your password" {...register('password')} /></div>
        </Field>
        <div className="flex justify-end"><Link to="/forgot-password" className="text-sm link">Forgot password?</Link></div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
      </form>
      <p className="mt-6 text-sm text-center text-ink-500 dark:text-ink-400">
        New here? <Link to="/register" className="link font-medium">Create an account</Link>
      </p>
     
  
<div className="mt-6 w-full flex justify-center">
  <div className="flex items-center gap-3 text-sm text-ink-500 dark:text-ink-400">
    <span className="font-medium">
      Connect With Me
    </span>

          
    <a
      href="https://github.com/SauravBhandariWeb"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-9 h-9 rounded-full border border-ink-300 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 transition-all duration-300 hover:scale-110"
    >
      <Github size={18} />
      </a>      
  </div>
</div>
       
  </AuthLayout>
  );
}






