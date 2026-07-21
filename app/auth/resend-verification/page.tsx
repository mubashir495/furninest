'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell, FormField, SubmitButton, ErrorBanner, SuccessBanner } from '@/components/AuthShell';
import { authService } from '@/services/authService';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await authService.resendVerification(email);
      setSuccess(data.message ?? 'A new verification link has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Resend verification email"
      subtitle="Enter your email and we'll send a fresh verification link."
      footer={
        <Link href="/auth/login" className="text-[#8B5E34] font-medium hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <FormField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <SubmitButton loading={loading}>Resend verification link</SubmitButton>
      </form>
    </AuthShell>
  );
}
