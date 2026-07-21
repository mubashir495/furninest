'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell, SubmitButton, ErrorBanner, SuccessBanner } from '@/components/AuthShell';
import { authService } from '@/services/authService';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function verify() {
      try {
        // Animate progress bar
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const data = await authService.verifyEmail(token);

        clearInterval(interval);
        setProgress(100);
        setMessage(data.message || 'Email verified successfully! \ud83c\udf89');
        setStatus('success');

        // auto-redirect to login after a short pause
        setTimeout(() => router.push('/auth/login'), 3000);
      } catch (err) {
        setProgress(100);
        setMessage(err instanceof Error ? err.message : 'Verification link is invalid or has expired.');
        setStatus('error');
      }
    }

    if (token) verify();
  }, [token, router]);

  return (
    <AuthShell
      eyebrow="Email verification"
      title={
        status === 'loading' 
          ? 'Verifying your email' 
          : status === 'success' 
          ? 'Email verified! 🎉' 
          : 'Verification failed'
      }
      subtitle={
        status === 'loading'
          ? 'Hang tight while we confirm your account.'
          : status === 'success'
          ? 'Your account is now active. Redirecting you to login...'
          : 'The link may have expired or already been used.'
      }
    >
      <div className="space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#E8E0D8] border-t-[#8B5E34] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8B5E34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (Loading State) */}
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-[#E8E0D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B5E34] to-[#A67B4E] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-[#8B7B6F]">
              {progress < 100 ? 'Verifying...' : 'Almost done!'}
            </p>
          </div>
        )}

        {/* Success/Error Messages */}
        {status === 'success' && (
          <div className="space-y-4">
            <SuccessBanner message={message} />
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 text-center">
                ✅ You can now log in to your account and start shopping!
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <ErrorBanner message={message} />
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 text-center">
                💡 Didn't receive a verification email?{' '}
                <Link href="/auth/resend-verification" className="text-[#8B5E34] font-medium hover:underline">
                  Request a new one
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/login" className="block">
            <SubmitButton loading={false}>
              {status === 'success' ? 'Go to Login →' : 'Go to Login'}
            </SubmitButton>
          </Link>

          {status === 'error' && (
            <Link 
              href="/auth/signup" 
              className="block text-center text-sm text-[#5C5248] hover:text-[#3D2B1F] transition-colors"
            >
              ← Back to Sign Up
            </Link>
          )}
        </div>

        {/* Additional Info */}
        {status === 'success' && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#8B7B6F] mt-4">
            <span>⏱️ Redirecting in 3 seconds...</span>
          </div>
        )}
      </div>
    </AuthShell>
  );
}