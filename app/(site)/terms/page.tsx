import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Luxa Furniture',
  description:
    'Review the terms and conditions for ordering luxury handcrafted furniture, delivery, returns, and warranties at Luxa Furniture.',
  alternates: { canonical: '/terms' },
  openGraph: {
    type: 'website',
    url: 'https://luxafurniture.com/terms',
    siteName: 'Luxa Furniture',
    title: 'Terms & Conditions | Luxa Furniture',
    description:
      'Review terms of sale, bespoke order terms, delivery policies, and warranties for Luxa Furniture.',
    locale: 'en_GB',
  },
};

export default function TermsPage() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-4">
            Customer Agreement
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Last Updated: November 2026. Please read these terms carefully before using our website or placing an order.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-4xl text-foreground/90 space-y-10 leading-relaxed">
        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">1. Agreement to Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using <span className="text-primary font-medium">luxafurniture.com</span>, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please refrain from using our website or ordering services.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">2. Products & Specifications</h2>
          <p className="text-muted-foreground">
            We make every effort to display the colors, finishes, and dimensions of our handcrafted furniture as accurately as possible. However, because natural solid wood, marble, and genuine leather possess unique natural variations in grain, tone, and texture, slight organic variations between items may occur and are celebrated characteristics of bespoke craft.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">3. Pricing & Payments</h2>
          <p className="text-muted-foreground">
            All prices are stated in GBP (£) and inclusive of applicable taxes. We reserve the right to correct pricing errors prior to dispatching your order. Payment is collected securely at checkout using verified payment gateways.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">4. Shipping & Delivery</h2>
          <p className="text-muted-foreground">
            Delivery timelines are estimates. Standard pieces typically arrive within 5–10 working days, while bespoke pieces require 2–4 weeks for production. Customers are responsible for ensuring that furniture dimensions allow safe transit through doors, stairwells, and hallways into the designated room.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">5. Returns, Refunds & Cancellations</h2>
          <p className="text-muted-foreground">
            Standard products may be returned within 30 days of receipt in pristine original condition. Bespoke or customized furniture items manufactured to individual client specifications cannot be canceled or returned once manufacturing has commenced, unless found defective.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">6. 5-Year Structural Warranty</h2>
          <p className="text-muted-foreground">
            Our furniture frames and internal joinery are protected by a 5-year structural warranty against manufacturing defects under standard residential use. The warranty excludes damage resulting from improper cleaning, misuse, commercial use, or normal surface wear and tear.
          </p>
        </section>

        <section className="bg-card rounded-3xl p-8 border border-border/60 soft-shadow space-y-4">
          <h2 className="text-2xl font-serif font-bold text-primary">7. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising shall be subject to the exclusive jurisdiction of the English courts.
          </p>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
