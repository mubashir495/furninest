import Link from 'next/link';
import React, { InputHTMLAttributes, ReactNode } from 'react';

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF7F2] via-[#F5EFE3] to-[#EDE5D8] px-6 py-16">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-8 text-2xl font-semibold text-[#3D2B1F] hover:text-[#8B5E34] transition-colors"
        >
          <span className="text-3xl">🪑</span>
          <span>FurniNest</span>
        </Link>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(61,43,31,0.12)] p-8 border border-[#E8E0D8]/50">
          <p className="text-xs tracking-[0.2em] text-[#8B5E34] uppercase mb-2 font-medium">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold text-[#2B2420] mb-2">{title}</h1>
          <p className="text-sm text-[#5C5248] mb-8">{subtitle}</p>

          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-8 text-center text-sm text-[#5C5248]">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}

export function FormField({
  label,
  id,
  className = '',
  ...props
}: { 
  label: string; 
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-[#2B2420] mb-1.5">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-3 rounded-xl border border-[#D4C8BC] bg-white text-[#2B2420] placeholder:text-[#8B7B6F]/60 focus:outline-none focus:border-[#8B5E34] focus:ring-2 focus:ring-[#8B5E34]/20 transition-all duration-200 ${className}`}
      />
    </div>
  );
}

export function SubmitButton({ 
  loading, 
  children,
  className = '',
  onClick,
}: { 
  loading: boolean; 
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3D2B1F] to-[#6B4525] text-[#F5EFE3] font-medium hover:from-[#2B2018] hover:to-[#4A2F1A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span>{message}</span>
    </div>
  );
}

// Additional component: InfoBanner
export function InfoBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
      </svg>
      <span>{message}</span>
    </div>
  );
}

// Additional component: SocialLoginButton
export function SocialLoginButton({ 
  provider, 
  icon, 
  onClick 
}: { 
  provider: string; 
  icon: ReactNode; 
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center px-4 py-2.5 border border-[#E8E0D8] rounded-xl hover:bg-[#F5EFE3] transition-all duration-200 text-sm font-medium text-[#3D2B1F] hover:border-[#8B5E34] hover:shadow-md"
    >
      {icon}
      <span className="ml-2">Continue with {provider}</span>
    </button>
  );
}

// Additional component: Divider
export function Divider({ text = "Or continue with" }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E8E0D8]"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-[#FBF7F2] text-[#8B7B6F]">{text}</span>
      </div>
    </div>
  );
}