'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell, FormField, SubmitButton, ErrorBanner, SuccessBanner } from '@/components/AuthShell';
import { authService } from '@/services/authService';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const getStrengthPercentage = () => {
    const checks = Object.values(passwordStrength);
    const passed = checks.filter(Boolean).length;
    return (passed / checks.length) * 100;
  };

  const getStrengthColor = () => {
    const percentage = getStrengthPercentage();
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-orange-500';
    if (percentage <= 60) return 'bg-yellow-500';
    if (percentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    const percentage = getStrengthPercentage();
    if (percentage <= 20) return 'Weak';
    if (percentage <= 40) return 'Fair';
    if (percentage <= 60) return 'Good';
    if (percentage <= 80) return 'Strong';
    return 'Very Strong';
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (getStrengthPercentage() < 40) {
      setError('Please choose a stronger password.');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.resetPassword(token, newPassword);
      setSuccess(data.message || 'Password reset successfully!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Make it something you haven't used before."
      footer={
        <Link href="/auth/login" className="text-[#8B5E34] font-medium hover:text-[#6B4525] hover:underline transition-colors">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        {/* New Password Field */}
        <div className="space-y-2">
          <div className="relative">
            <FormField
              id="newPassword"
              label="New password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                validatePassword(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-[#8B7B6F] hover:text-[#3D2B1F] transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 h-2 bg-[#E8E0D8] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full`}
                    style={{ width: `${getStrengthPercentage()}%` }}
                  />
                </div>
                <span className="ml-3 text-xs font-medium text-[#5C5248] min-w-[70px] text-right">
                  {getStrengthText()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs text-[#5C5248]">
                <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : ''}`}>
                  {passwordStrength.length ? '✅' : '⬜'} 8+ characters
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasUpperCase ? 'text-green-600' : ''}`}>
                  {passwordStrength.hasUpperCase ? '✅' : '⬜'} Uppercase
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasLowerCase ? 'text-green-600' : ''}`}>
                  {passwordStrength.hasLowerCase ? '✅' : '⬜'} Lowercase
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : ''}`}>
                  {passwordStrength.hasNumber ? '✅' : '⬜'} Number
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${passwordStrength.hasSpecial ? 'text-green-600' : ''}`}>
                  {passwordStrength.hasSpecial ? '✅' : '⬜'} Special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Password Match Indicator */}
        {confirmPassword && (
          <div className={`text-sm flex items-center gap-2 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
            {newPassword === confirmPassword ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Passwords match
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                Passwords do not match
              </>
            )}
          </div>
        )}

        {/* Password Requirements Hint */}
        <div className="mt-4 p-4 rounded-xl bg-[#FBF7F2] border border-[#E8E0D8]">
          <p className="text-xs text-[#5C5248]">
            <span className="font-medium">Password requirements:</span>
            <br />
            • Minimum 8 characters
            <br />
            • At least one uppercase and one lowercase letter
            <br />
            • At least one number
            <br />
            • At least one special character (!@#$%^&*)
          </p>
        </div>

        <SubmitButton loading={loading}>
          {loading ? 'Resetting password...' : 'Reset password'}
        </SubmitButton>

        {/* Additional Info */}
        <p className="text-center text-xs text-[#8B7B6F] mt-4">
          🔒 Your password will be encrypted and securely stored.
        </p>
      </form>
    </AuthShell>
  );
}