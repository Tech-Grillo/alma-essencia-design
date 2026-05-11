export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-11 w-11 rounded-full bg-gradient-warm shadow-soft flex items-center justify-center border border-border">
        <svg viewBox="0 0 40 40" className="h-7 w-7 text-caramel-deep" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M20 8 C12 14, 12 22, 20 32 C28 22, 28 14, 20 8 Z" />
          <path d="M20 14 C16 18, 16 24, 20 30" opacity="0.6" />
          <circle cx="20" cy="20" r="1.4" fill="currentColor" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-script text-xl text-caramel-deep">Alma</div>
        <div className="font-serif text-[11px] tracking-[0.3em] uppercase text-foreground/70 -mt-1">
          & Essência
        </div>
      </div>
    </div>
  );
}
