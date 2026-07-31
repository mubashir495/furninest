'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/app/(site)/contact/actions';

const initialState: ContactFormState = { status: 'idle', message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 uppercase tracking-wider text-sm"
    >
      {pending ? 'Sending…' : 'Send Message'}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} className="bg-card rounded-3xl soft-shadow p-8 md:p-10 flex flex-col gap-6">
      {/* Honeypot field — hidden from real users via CSS, not display:none (some bots skip those) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="w-full border border-border rounded-2xl px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      {state.status !== 'idle' && (
        <p
          role="status"
          className={`text-sm font-medium ${state.status === 'success' ? 'text-green-600' : 'text-destructive'}`}
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}