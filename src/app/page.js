import Link from "next/link";
import HeroLazyEye from "@/components/HeroLazyEye";

const stats = [
  { label: "Children helped in pilots", value: "1,200+" },
  { label: "Therapy completion rate", value: "87%" },
  { label: "Clinician partners", value: "45" },
];

const workflowSteps = [
  {
    title: "1. Guided Setup",
    description: "Parents receive friendly instructions and consent reminders before every session.",
  },
  {
    title: "2. AI-Powered Screening",
    description: "VisionAI analyses eye alignment, tracking and contrast response in real time.",
  },
  {
    title: "3. Gamified Therapy",
    description: "Kids engage with playful exercises that reinforce visual development.",
  },
  {
    title: "4. Doctor Insights",
    description: "Specialists monitor progress dashboards and personalise care plans.",
  },
];

const benefits = [
  {
    title: "Early detection for every family",
    copy: "Only 1 in 3 children with amblyopia is diagnosed before age 7. VisionAI lowers barriers with an at-home preliminary assessment any caregiver can run.",
  },
  {
    title: "Therapy kids love",
    copy: "Gamified exercises, streaks, and visual rewards keep children motivated to complete prescribed routines consistently.",
  },
  {
    title: "Clinically-aligned insights",
    copy: "Doctors can review AI metrics, adherence data, and session notes in one secure workspace—streamlining follow-up decisions.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative isolate flex min-h-[80vh] flex-col justify-center gap-12 px-6 pb-24 pt-28">
        <div className="glow-orb glow-orb--primary left-[10%] top-10 h-72 w-72" aria-hidden="true" />
        <div className="glow-orb glow-orb--mint right-[12%] top-1/3 h-80 w-80" aria-hidden="true" />
        <div className="absolute inset-0 -z-[1] rounded-[var(--radius-card)] border border-white/40 bg-white/20 shadow-[0_45px_120px_-45px_rgba(79,70,229,0.45)] backdrop-blur-2xl" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 text-center md:grid-cols-[1.1fr_0.9fr] md:text-left">
          <div className="space-y-7">
            <span className="glass-badge">
              <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--color-secondary)]" />
              AI for pediatric eye care
            </span>
            <div className="glass-hero relative w-full max-w-3xl px-6 py-10 text-center md:text-left">
              <div className="absolute inset-0 -z-[1] rounded-[var(--radius-card)] border border-white/40" aria-hidden="true" />
              <h1 className="font-rounded text-4xl font-semibold leading-tight text-[color:var(--color-emphasis)] md:text-5xl">
                AI-Powered Early Detection & Therapy for Amblyopia
              </h1>
              <p className="mt-5 text-lg text-[color:var(--color-muted)] md:text-xl">
                VisionAI helps families screen for amblyopia risk at home and delivers gamified therapy support—while clinicians monitor progress remotely.
              </p>
              <div className="mt-8 flex flex-col gap-4 md:flex-row">
                <Link href="/screening/instructions" className="cta-button">
                  Start Screening
                </Link>
                <Link href="#how-it-works" className="outline-button">
                  Learn How VisionAI Works
                </Link>
              </div>
            </div>
            <p className="text-sm text-[color:var(--color-muted)] md:max-w-[85%]">
              Interactive eye model: the right pupil is intentionally misaligned to represent lazy-eye behavior.
            </p>
          </div>
          <HeroLazyEye />
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel glass-panel--layered p-6 text-center md:text-left">
              <p className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="what-is-amblyopia" className="mx-auto max-w-6xl space-y-12 px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
              What is Amblyopia?
            </h2>
            <p className="text-base leading-relaxed text-[color:var(--color-muted)]">
              Amblyopia, or lazy eye, affects 1–3% of children worldwide. When the brain favours one eye, visual pathways can weaken—impacting depth perception, reading, and confidence. Early intervention during neuroplastic developmental windows is proven to improve outcomes.
            </p>
            <p className="text-base leading-relaxed text-[color:var(--color-muted)]">
              VisionAI equips caregivers with an evidence-aligned screening workflow and therapeutic toolkit, empowering them to act before permanent vision loss occurs.
            </p>
          </div>
          <div className="glass-panel relative overflow-hidden p-8">
            <div className="glow-orb glow-orb--primary -right-10 -top-10 h-32 w-32" aria-hidden="true" />
            <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              Why early detection matters
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-[color:var(--color-muted)]">
              <li>• 50% of amblyopia is missed in school screenings.</li>
              <li>• Early therapy can restore up to 2 lines on a Snellen chart.</li>
              <li>• Untreated cases increase risks of vision impairment in adulthood.</li>
            </ul>
            <div className="mt-6 glass-chip text-xs text-[color:var(--color-muted)]">
              VisionAI is a screening support tool. Always follow up with a licensed ophthalmologist for diagnosis.
            </div>
          </div>
        </div>

        <div id="problem" className="grid gap-8 rounded-[var(--radius-card)] border border-white/50 bg-white/30 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur-2xl md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="space-y-4">
              <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                {benefit.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative py-20">
        <div className="glow-orb glow-orb--primary left-[12%] top-[15%] h-64 w-64" aria-hidden="true" />
        <div className="glow-orb glow-orb--mint right-[10%] bottom-[18%] h-72 w-72" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
          <div className="text-center md:text-left">
            <h2 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
              How VisionAI Works
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[color:var(--color-muted)]">
              A transparent flow keeps caregivers informed and clinicians confident in the captured data.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {workflowSteps.map((step) => (
              <div key={step.title} className="glass-card glass-card--subtle p-6">
                <h3 className="font-rounded text-lg font-semibold text-[color:var(--color-emphasis)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-6xl px-6 py-20">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h2 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
                Impact & Social Benefit
              </h2>
              <p className="max-w-2xl text-sm text-[color:var(--color-muted)]">
                Accessible screening tools reduce inequities in pediatric eye care. VisionAI supports NGOs, schools, and public health organisations with bulk screening dashboards and anonymised analytics.
              </p>
            </div>
            <div className="glass-chip text-sm text-[color:var(--color-emphasis)]">
              <p className="font-semibold">Key Programs</p>
              <ul className="mt-3 space-y-2 text-[color:var(--color-muted)]">
                <li>• School partnerships in three countries</li>
                <li>• Rural tele-ophthalmology pilots with NGOs</li>
                <li>• Public awareness campaigns during World Sight Day</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
