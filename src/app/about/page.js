import Link from "next/link";

const pillars = [
  {
    title: "Clinical alignment",
    description:
      "Built with input from pediatric ophthalmologists to mirror established screening techniques while staying non-diagnostic.",
  },
  {
    title: "Child-first design",
    description:
      "Interfaces use playful prompts, calming colours, and clear voiceovers (coming soon) to keep young children engaged.",
  },
  {
    title: "Privacy by default",
    description:
      "Only derived eye-tracking metrics are stored. No raw webcam footage leaves the family’s device without explicit consent.",
  },
];

const aiStack = [
  {
    name: "MediaPipe FaceMesh",
    copy:
      "Detects over 400 facial landmarks locally in the browser to evaluate gaze symmetry and eye openness.",
  },
  {
    name: "TensorFlow.js",
    copy:
      "Runs lightweight neural models that score head pose, tracking stability, and contrast responses in real time.",
  },
  {
    name: "Explainable metrics",
    copy:
      "Outputs are translated into simple insights for families and detailed charts for clinicians.",
  },
];

const values = [
  {
    title: "Equitable access",
    text: "Partnering with schools and NGOs ensures early vision support extends beyond major cities.",
  },
  {
    title: "Evidence informed",
    text: "Every feature references peer-reviewed amblyopia research and is evaluated with advisory clinicians.",
  },
  {
    title: "Continuous learning",
    text: "Aggregate, anonymised feedback from therapy sessions improves our recommendation engine while respecting individual privacy.",
  },
];

export const metadata = {
  title: "About VisionAI",
  description:
    "Learn how VisionAI combines AI screening with compassionate therapy support for pediatric amblyopia.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="space-y-6">
        <span className="glass-badge">
          <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
          Our mission
        </span>
        <h1 className="font-rounded text-4xl font-semibold text-[color:var(--color-emphasis)]">
          Helping every child see their future clearly
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[color:var(--color-muted)]">
          VisionAI was created by pediatric specialists, designers, and engineers after witnessing families wait months for diagnosis appointments. Our goal is to give caregivers a trusted, friendly starting point backed by clinicians and rooted in safety.
        </p>
        <div className="glass-panel grid gap-6 p-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="glass-card glass-card--subtle space-y-3 p-5">
              <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <h2 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
            How our AI layer works
          </h2>
          <p className="text-base text-[color:var(--color-muted)]">
            VisionAI combines computer vision with pediatric optometry heuristics. Models are continually validated on de-identified datasets and undergo regular bias audits. Families can opt-in to share anonymised metrics to improve recommendations—never raw footage.
          </p>
          <div className="glass-card glass-card--subtle p-6">
            <ul className="space-y-4 text-sm text-[color:var(--color-muted)]">
              {aiStack.map((item) => (
                <li key={item.name}>
                  <strong className="block text-[color:var(--color-emphasis)]">{item.name}</strong>
                  <span>{item.copy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="glass-panel space-y-4 p-6">
          <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Medical disclaimer
          </h3>
          <p className="text-sm text-[color:var(--color-muted)]">
            VisionAI provides preliminary screening support and therapy engagement tools. It is not a diagnostic device. Always consult licensed eye-care professionals before making treatment decisions. In emergencies such as sudden vision loss, visit urgent care immediately.
          </p>
          <div className="glass-chip text-xs text-[color:var(--color-muted)]">
            We’re committed to regulatory compliance and are pursuing Class II medical device clearance in selected regions.
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <h2 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
          Our values
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="glass-card glass-card--subtle p-5">
              <h3 className="font-rounded text-lg font-semibold text-[color:var(--color-emphasis)]">
                {value.title}
              </h3>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="font-rounded text-2xl font-semibold text-[color:var(--color-emphasis)]">
          Join our mission
        </h2>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          We partner with hospitals, schools, and public-health organisations to run community screenings and therapy programs. Reach out if you’d like to collaborate.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row">
          <Link
            href="mailto:partnerships@visionai.health"
            className="cta-button"
          >
            Become a partner
          </Link>
          <Link
            href="mailto:careers@visionai.health"
            className="outline-button"
          >
            Careers & volunteering
          </Link>
        </div>
      </section>
    </div>
  );
}
