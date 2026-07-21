import { Truck, ShieldCheck, CreditCard, Phone } from 'lucide-react';

const BADGES = [
  {
    icon: Truck,
    title: 'Free Delivery',
    // The backend applies no shipping fee on any order today, so this is
    // accurate without a fabricated minimum order threshold.
    subtitle: 'On all orders',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    subtitle: 'On all furniture',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    subtitle: 'Safe & encrypted checkout',
  },
  {
    icon: Phone,
    title: '24/7 Support',
    subtitle: 'Dedicated customer service',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {BADGES.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <badge.icon size={30} className="text-accent" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-1">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
