import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Truck, RefreshCw, ShieldCheck, Hammer, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Luxa Furniture',
  description:
    'Find answers to common questions about orders, bespoke customization, delivery, returns, materials, and care at Luxa Furniture.',
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    url: 'https://luxafurniture.com/faq',
    siteName: 'Luxa Furniture',
    title: 'Frequently Asked Questions (FAQ) | Luxa Furniture',
    description:
      'Find answers to common questions about orders, bespoke customization, delivery, returns, materials, and care at Luxa Furniture.',
    locale: 'en_GB',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Luxa Furniture Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Frequently Asked Questions (FAQ) | Luxa Furniture',
    description:
      'Find answers to common questions about orders, bespoke customization, delivery, returns, and care at Luxa Furniture.',
    images: ['/logo.png'],
  },
};

const FAQ_SECTIONS = [
  {
    icon: Truck,
    category: 'Ordering & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'Standard delivery across mainland UK typically takes 5–10 business days for in-stock pieces. For handcrafted or bespoke custom orders, production and delivery usually take 2–4 weeks. You will receive a tracking link as soon as your order leaves our workshop.',
      },
      {
        question: 'Do you offer white-glove room-of-choice delivery and assembly?',
        answer:
          'Yes. Our two-person delivery team can carry your furniture directly into your room of choice, unwrap it, assemble it, and remove all packaging materials upon request at checkout.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your furniture has been dispatched, you will receive an email and SMS with your live tracking number. You can also view real-time delivery status under your Luxa Furniture Account dashboard.',
      },
    ],
  },
  {
    icon: Hammer,
    category: 'Materials & Customization',
    items: [
      {
        question: 'What materials do you use in your furniture?',
        answer:
          'We use sustainably sourced hardwoods (oak, walnut, ash), premium reinforced steel frames, high-resilience foam cushioning, and luxury stain-resistant fabrics including velvet, bouclé, and full-grain aniline leather.',
      },
      {
        question: 'Can I customize dimensions, fabric, or color?',
        answer:
          'Yes, we offer bespoke sizing and bespoke fabric selections for most of our bed frames, sofas, and dining sets. Please contact our design concierge via our Contact page or WhatsApp to discuss your bespoke requirements.',
      },
      {
        question: 'How do I care for my Luxa furniture?',
        answer:
          'We recommend dusting solid wood surfaces with a dry microfiber cloth and wiping spills immediately. For upholstery, gentle vacuuming with a soft brush attachment and using water-based or fabric-safe foam cleaners is recommended.',
      },
    ],
  },
  {
    icon: RefreshCw,
    category: 'Returns & Cancellations',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day hassle-free return window on all standard catalogue items from the date of delivery. Items must be in their original condition and packaging. Custom-made bespoke items may have specific return conditions explained at checkout.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          'To start a return, simply contact support@luxafurniture.com or reach out via our Contact Us page with your order number. Our team will arrange a convenient courier collection from your address.',
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Once our warehouse inspects the returned item, your refund will be processed back to your original payment method within 3–5 business days.',
      },
    ],
  },
  {
    icon: ShieldCheck,
    category: 'Warranty & Quality Guarantee',
    items: [
      {
        question: 'Does Luxa furniture come with a warranty?',
        answer:
          'All our furniture is backed by a comprehensive 5-year structural warranty covering frame integrity, manufacturing defects, and joinery under normal residential use.',
      },
      {
        question: 'Are your furniture materials fire-retardant and certified?',
        answer:
          'Yes, all our foam and upholstered fabrics strictly comply with UK and international fire safety regulations (BS 5852 certified) for complete peace of mind.',
      },
    ],
  },
];

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    ),
  };

  return (
    <div className="pb-24">
      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-4">
            Help & Guidance
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about purchasing, shipping, custom crafting, and caring for your Luxa Furniture.
          </p>
        </div>
      </div>

      {/* Main FAQ Content */}
      <div className="container mx-auto px-6 max-w-5xl space-y-14">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.category} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <section.icon size={20} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-primary">
                {section.category}
              </h2>
            </div>

            <div className="grid gap-4">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-2xl border border-border/60 p-6 soft-shadow hover:border-accent/40 transition-colors"
                >
                  <h3 className="text-lg font-medium text-foreground mb-2 flex items-start gap-2">
                    <span className="text-accent font-serif font-bold">Q:</span>
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed pl-6">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Still Have Questions CTA */}
        <div className="bg-muted/40 rounded-3xl p-8 sm:p-12 text-center border border-border/60">
          <div className="w-14 h-14 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center mb-4">
            <HelpCircle size={28} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Our furniture specialists are here to assist you with fabric samples, bespoke dimensions, or delivery queries.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageSquare size={18} />
              Contact Our Concierge
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-2xl font-medium hover:border-primary transition-colors"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
