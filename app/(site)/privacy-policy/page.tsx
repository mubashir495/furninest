import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Luxa Furniture',
  description:
    'Read the Privacy Policy of Luxa Furniture. Learn how we collect, protect, and use your personal information and cookie preferences.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    type: 'website',
    url: 'https://luxafurniture.com/privacy-policy',
    siteName: 'Luxa Furniture',
    title: 'Privacy Policy | Luxa Furniture',
    description:
      'Learn how Luxa Furniture collects, uses, and safeguards your personal data when you visit our site or purchase our handcrafted furniture.',
    locale: 'en_GB',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-4">
            Legal & Security
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Last Updated: November 2026. Your privacy and personal data security are of the highest importance to us.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-4xl text-foreground/90 space-y-10 leading-relaxed">
        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">1. Overview</h2>
          <p className="text-muted-foreground">
            Luxa Furniture (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting and respecting your privacy in compliance with applicable data protection legislation, including the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018. This policy describes how we collect, process, and protect your information when you visit{' '}
            <span className="text-primary font-medium">luxafurniture.com</span> or place orders with us.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">2. Information We Collect</h2>
          <p className="text-muted-foreground">We may collect and process the following categories of personal information:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Contact & Identity:</strong> Name, billing address, shipping address, email address, phone number.
            </li>
            <li>
              <strong className="text-foreground">Transactional Data:</strong> Items purchased, payment confirmation (we do not store full credit card details directly; transactions are tokenized via secure payment gateways).
            </li>
            <li>
              <strong className="text-foreground">Technical & Usage:</strong> IP address, browser type, device information, operating system, and interaction with our website pages.
            </li>
            <li>
              <strong className="text-foreground">Communications:</strong> Inquiries submitted via our contact form, live chat, email, or telephone.
            </li>
          </ul>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">3. How We Use Your Information</h2>
          <p className="text-muted-foreground">Your data is used strictly for legitimate business purposes:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To process, fulfill, and deliver your furniture orders and bespoke requests.</li>
            <li>To communicate updates regarding your delivery schedule and order tracking.</li>
            <li>To provide responsive customer support and manage warranty requests.</li>
            <li>To improve website performance, security, and prevent fraudulent activity.</li>
            <li>To send promotional updates only when you have explicitly opted in (you may unsubscribe anytime).</li>
          </ul>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">4. Sharing and Disclosure</h2>
          <p className="text-muted-foreground">
            We never sell, rent, or trade your personal information. We only share necessary data with trusted third parties who assist us in operating our business:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Logistics & White-Glove Couriers:</strong> Delivery partners who transport and assemble furniture in your home.
            </li>
            <li>
              <strong className="text-foreground">Payment Processors:</strong> PCI-DSS compliant payment gateways that securely process debit/credit card payments.
            </li>
            <li>
              <strong className="text-foreground">Hosting & Infrastructure:</strong> Secure cloud servers and database providers ensuring website uptime and encryption.
            </li>
          </ul>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">5. Cookies & Tracking Technologies</h2>
          <p className="text-muted-foreground">
            Our website uses essential cookies to enable shopping cart functionality, remember login sessions, and optimize performance. You may modify your cookie preferences through your browser settings at any time.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">6. Your Rights</h2>
          <p className="text-muted-foreground">
            Under data protection laws, you have the right to request access to your personal data, request correction of inaccurate data, request erasure, object to direct marketing, or request data portability. To exercise any of these rights, please contact us at{' '}
            <a href="mailto:support@luxafurniture.com" className="text-accent underline font-medium">
              support@luxafurniture.com
            </a>
            .
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">7. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions or concerns regarding our privacy practices, please contact us:
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Luxa Furniture</strong></p>
            <p>85 Great Portland Street, London, W1W 7LT, United Kingdom</p>
            <p>Email: <a href="mailto:support@luxafurniture.com" className="text-accent hover:underline">support@luxafurniture.com</a></p>
            <p>Phone / WhatsApp: +44 7398 178902</p>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
