'use client';

export function NewsletterForm() {
  return (
    <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,106,0.15)_0%,transparent_70%)]" />
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">Join the Inner Circle</h2>
        <p className="text-white/70 text-lg mb-10">Subscribe to receive updates on new collections and offers.</p>
        <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
            className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 px-6 py-4 rounded-2xl w-full sm:w-96 focus:outline-none focus:border-accent transition-colors"
            required
          />
          <button type="submit" className="bg-accent text-accent-foreground font-bold px-8 py-4 rounded-2xl hover:bg-white transition-colors uppercase tracking-wider text-sm">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}