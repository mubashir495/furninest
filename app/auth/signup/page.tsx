'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell, FormField, SubmitButton, ErrorBanner, SuccessBanner } from '@/components/AuthShell';
import { authService } from '@/services/authService';

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Email validation
  const [emailValid, setEmailValid] = useState(false);

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
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

  const isFormValid = () => {
    return (
      form.fullName.trim().length >= 2 &&
      emailValid &&
      getStrengthPercentage() >= 60 &&
      form.password === form.confirmPassword &&
      form.confirmPassword.length > 0
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isFormValid()) {
      setError('Please fill all fields correctly.');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(data.message || 'Account created successfully! Please check your email to verify your account.');
      setForm({ fullName: '', email: '', password: '', confirmPassword: '' });
      setPasswordStrength({
        length: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Join FurniNest"
      title="Create your account"
      subtitle="Start furnishing your space with pieces built to last."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#8B5E34] font-medium hover:text-[#6B4525] hover:underline transition-colors">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        {/* Full Name & Email - Side by side on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FormField
              id="fullName"
              label="Full name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => {
                setForm({ ...form, fullName: e.target.value });
                setTouched({ ...touched, fullName: true });
              }}
              onBlur={() => setTouched({ ...touched, fullName: true })}
              className="py-2.5 px-3 text-sm"
            />
            {touched.fullName && form.fullName && form.fullName.length < 2 && (
              <p className="text-xs text-red-500 mt-0.5">Min 2 characters</p>
            )}
          </div>

          <div className="relative">
            <FormField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                validateEmail(e.target.value);
                setTouched({ ...touched, email: true });
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              className="py-2.5 px-3 text-sm"
            />
            {touched.email && form.email && (
              <div className="absolute right-3 top-[38px]">
                {emailValid ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password & Confirm Password - Side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="relative">
              <FormField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Create password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  validatePassword(e.target.value);
                  setTouched({ ...touched, password: true });
                }}
                onBlur={() => setTouched({ ...touched, password: true })}
                className="py-2.5 px-3 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[38px] text-[#8B7B6F] hover:text-[#3D2B1F] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength - Compact */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#E8E0D8] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full`}
                      style={{ width: `${getStrengthPercentage()}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#5C5248] min-w-[50px] text-right">
                    {getStrengthText()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px] text-[#5C5248]">
                  <span className={`${passwordStrength.length ? 'text-green-600' : ''}`}>
                    {passwordStrength.length ? '✅' : '⬜'} 8+
                  </span>
                  <span className={`${passwordStrength.hasUpperCase ? 'text-green-600' : ''}`}>
                    {passwordStrength.hasUpperCase ? '✅' : '⬜'} A-Z
                  </span>
                  <span className={`${passwordStrength.hasLowerCase ? 'text-green-600' : ''}`}>
                    {passwordStrength.hasLowerCase ? '✅' : '⬜'} a-z
                  </span>
                  <span className={`${passwordStrength.hasNumber ? 'text-green-600' : ''}`}>
                    {passwordStrength.hasNumber ? '✅' : '⬜'} 0-9
                  </span>
                  <span className={`${passwordStrength.hasSpecial ? 'text-green-600' : ''}`}>
                    {passwordStrength.hasSpecial ? '✅' : '⬜'} !@#
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <FormField
              id="confirmPassword"
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                setTouched({ ...touched, confirmPassword: true });
              }}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              className="py-2.5 px-3 text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-[38px] text-[#8B7B6F] hover:text-[#3D2B1F] transition-colors"
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
            {touched.confirmPassword && form.confirmPassword && (
              <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {form.password === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
              </div>
            )}
          </div>
        </div>

        {/* Terms - Compact */}
        <div className="flex items-start gap-2 py-1">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-3.5 h-3.5 mt-0.5 rounded border-[#D4C8BC] text-[#8B5E34] focus:ring-[#8B5E34] focus:ring-2 focus:ring-offset-2 flex-shrink-0"
          />
          <label htmlFor="terms" className="text-[10px] text-[#5C5248]">
            I agree to the{' '}
            <Link href="/terms" className="text-[#8B5E34] hover:underline">
              Terms
            </Link>
            {' & '}
            <Link href="/privacy" className="text-[#8B5E34] hover:underline">
              Privacy
            </Link>
          </label>
        </div>

        <SubmitButton loading={loading} className="py-2.5 text-sm">
          {loading ? 'Creating account...' : 'Create account'}
        </SubmitButton>

        <p className="text-center text-[10px] text-[#8B7B6F]">
          🔒 Secure & encrypted
        </p>
      </form>
    </AuthShell>
  );
}