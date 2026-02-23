import Link from "next/link";

export default function TherapyHero() {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/40 bg-white/90 p-8 shadow-xl backdrop-blur">
      <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-[color:var(--color-primary)]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-12 translate-y-12 rounded-full bg-[color:var(--color-secondary)]/15 blur-3xl" />
      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-secondary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-secondary)]">
          Vision therapy hub
        </span>
        <h1 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
          Daily exercises that strengthen visual pathways
        </h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-muted)] md:text-base">
          VisionAI delivers playful, adaptive therapy sessions so kids stay excited about practicing while guardians track progress in real time.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="#games"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-2 font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90"
          >
            Explore therapy games
          </Link>
          <Link
            href="#progress"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-2 font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
          >
            View progress tools
          </Link>
        </div>
      </div>
    </section>
  );
}
