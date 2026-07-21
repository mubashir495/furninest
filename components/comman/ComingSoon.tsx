import Link from 'next/link';
import { Construction } from 'lucide-react';

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8">
        <Construction size={32} className="text-muted-foreground" />
      </div>
      <h1 className="text-3xl md:text-4xl font-serif text-primary mb-4">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {description ?? "We're still building this page. Check back soon."}
      </p>
      <Link href="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
