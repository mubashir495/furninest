import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
      <h1 className="text-8xl font-serif text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page doesn&apos;t exist.</p>
      <Link href="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
