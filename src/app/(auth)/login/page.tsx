'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { loginSchema, type LoginValues } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const DEMO_CREDENTIALS: LoginValues = {
  email: 'demo@doctortracker.com',
  password: 'Demo@123',
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const login = useMutation({
    mutationFn: (values: LoginValues) =>
      api('/auth/login', { method: 'POST', body: values }),
    onSuccess: () => {
      toast('Signed in', 'success');
      router.replace('/dashboard');
      router.refresh();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiRequestError ? err.message : "Couldn't sign in. Try again.";
      toast(message, 'error');
    },
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-[#0B3D3A] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #14b8a6 0%, transparent 42%), radial-gradient(circle at 80% 70%, #0ea5e9 0%, transparent 36%)',
          }}
        />
        <div className="relative">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="mt-8 max-w-sm text-[2rem] font-semibold leading-tight tracking-tight">
            Doctor Tracker
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-teal-50/85">
            Keep doctors, patients, and clinic trends in one calm admin workspace.
          </p>
        </div>
        <p className="relative text-sm text-teal-100/70">
          Built by <span className="font-medium text-white">Riazul Islam Rifat</span>
        </p>
      </aside>

      <div className="relative flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-[400px] page-enter">
          <div className="mb-8 lg:mb-10">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand lg:hidden">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-[1.75rem] font-semibold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="mt-2 text-[15px] text-slate-500">
              Use your admin email and password to continue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit((values) => login.mutate(values))}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="mt-2 w-full" loading={login.isPending}>
              Sign in
            </Button>
            {process.env.NODE_ENV !== 'production' ? (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  loading={login.isPending}
                  onClick={() => login.mutate(DEMO_CREDENTIALS)}
                >
                  Continue with demo account
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Demo: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
                </p>
              </div>
            ) : null}
          </form>

          <p className="mt-8 text-center text-xs text-slate-500 lg:hidden">
            Crafted by <span className="font-semibold text-slate-700">Riazul Islam Rifat</span>
          </p>
        </div>
      </div>
    </div>
  );
}
