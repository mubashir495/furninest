import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';
import { BsWhatsapp } from 'react-icons/bs';

export const metadata: Metadata = {
  title: 'Contact Us | FurniNest',
  description: 'Have a question about an order, a product, or anything else? Get in touch with the FurniNest team.',
  alternates: { canonical: '/contact' },
};

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'support@furninest.com' },
  { icon: BsWhatsapp, label: `what'sapp`, value: '+447398178902' },
  { icon: MapPin, label: 'Address', value: '85 Great Portland Street, London, W1W 7LT, United Kingdom' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9am–7pm' },
];

export default function ContactPage() {
  return (
    <div className="pb-24">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24 rounded-b-[3rem] mb-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-semibold mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6">We'd Love to Hear From You</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Questions about an order, a product, or anything else — send us a message and we'll reply as soon as we can.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {CONTACT_INFO.map((item) => (
            <div key={item.label} className="flex items-start gap-4 bg-card rounded-3xl soft-shadow p-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                <item.icon size={20} className="text-accent" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="font-medium text-primary">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}