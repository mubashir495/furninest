'use server';

import { sendMail } from '@/lib/mailer';

export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  const honeypot = String(formData.get('company') ?? '').trim();
  if (honeypot) {
    return { status: 'success', message: "Thanks! We'll get back to you soon." };
  }

  if (!name || !email || !subject || !message) {
    return { status: 'error', message: 'Please fill in every field.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }
  if (message.length > 5000) {
    return { status: 'error', message: 'Message is too long.' };
  }

  const toAddress = process.env.CONTACT_TO_EMAIL ?? process.env.MAIL_USER!;

  try {
    await sendMail({
      to: toAddress,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    await sendMail({
      to: email,
      subject: 'We received your message — LUXA FURNITURE',
      html: `
        <h2>Thanks for reaching out, ${escapeHtml(name)}!</h2>
        <p>We've received your message and will get back to you within 1-2 business days.</p>
        <blockquote style="border-left:3px solid #C9A66B;padding-left:12px;color:#555;">
          ${escapeHtml(message).replace(/\n/g, '<br/>')}
        </blockquote>
        <p>— The LUXA FURNITURE Team</p>
      `,
    });

    return { status: 'success', message: "Thanks! We'll get back to you soon." };
  } catch (error) {
    console.error('Contact form email failed:', error);
    return { status: 'error', message: 'Something went wrong sending your message. Please try again.' };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}