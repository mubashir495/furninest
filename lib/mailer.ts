import 'server-only';
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS } = process.env;
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error('Mail is not configured. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env.local');
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: MAIL_SECURE === 'true',
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  return transporter;
}

export async function sendMail(options: { to: string; replyTo?: string; subject: string; html: string }) {
  const transport = getTransporter();
  await transport.sendMail({
    from: `"LUXA FURNITURE" <${process.env.MAIL_USER}>`,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
  });
}