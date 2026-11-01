export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="flex flex-col items-center text-center px-6 max-w-sm">
        {/* Monogram emblem */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg border border-accent/30 animate-pulse">
          <span className="font-serif text-3xl font-bold text-accent">L</span>
        </div>

        {/* Brand Name */}
        <h2 className="font-serif text-2xl font-bold tracking-[0.25em] uppercase text-primary mb-2">
          LUXA FURNITURE
        </h2>

        {/* Subtitle */}
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-light mb-8">
          Luxury Living • United Kingdom
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-36 h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
      </div>
    </div>
  );
}
