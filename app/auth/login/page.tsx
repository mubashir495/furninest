'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell, FormField, SubmitButton, ErrorBanner } from '@/components/AuthShell';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(form);

      login(data.user, data.accessToken, data.refreshToken);

      if (data.user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to FurniNest"
      subtitle="Enter your details to access your account."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-[#8B5E34] font-medium hover:underline hover:text-[#6B4525] transition-colors"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <ErrorBanner message={error} />

        <FormField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded border-[#D4C8BC] text-[#8B5E34] focus:ring-[#8B5E34] focus:ring-2 focus:ring-offset-2"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-[#5C5248]">
              Remember me
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#8B5E34] hover:text-[#6B4525] hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}