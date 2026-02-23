const earlySigns = [
  "One eye that consistently wanders inwards or outwards",
  "Squinting or closing one eye while focusing",
  "Frequent head tilting or turning to use a stronger eye",
  "Complaints of headaches or eye strain during reading",
  "Difficulty judging depth or catching objects",
];

const treatments = [
  {
    title: "Corrective lenses",
    description:
      "Glass prescriptions can balance vision between eyes and address refractive errors that contribute to amblyopia.",
  },
  {
    title: "Patching therapy",
    description:
      "Covering the stronger eye encourages the brain to strengthen neural connections with the weaker eye.",
  },
  {
    title: "Atropine drops",
    description:
      "Alternative to patches for some children; blurs vision in the stronger eye to stimulate the weaker eye.",
  },
  {
    title: "Vision therapy",
    description:
      "Supervised exercises improve eye coordination, focusing, and depth perception through repeated practice.",
  },
];

const faqs = [
  {
    question: "Is VisionAI a diagnostic tool?",
    answer:
      "No. VisionAI provides preliminary screening and therapy engagement support. Schedule comprehensive exams with qualified eye specialists for diagnosis.",
  },
  {
    question: "At what age should screening begin?",
    answer:
      "Experts recommend screening as early as age 3, and certainly before a child starts school. Early intervention yields better outcomes.",
  },
  {
    question: "How often should therapy exercises be completed?",
    answer:
      "Follow your doctor’s instructions. Many programs suggest daily or near-daily exercises over several weeks to reinforce neural pathways.",
  },
  {
    question: "Does VisionAI store webcam footage?",
    answer:
      "No. Only derived numerical scores are saved. Families control whether to share data with clinicians.",
  },
  {
    question: "Can doctors access the data?",
    answer:
      "Yes. With parental consent, doctors can view screening history, therapy adherence, and add clinical recommendations in VisionAI dashboards.",
  },
];

export const metadata = {
  title: "VisionAI Knowledge Hub",
  description:
    "Learn how to recognise amblyopia signs, explore treatment options, and get answers to common VisionAI questions.",
};

export default function KnowledgeHubPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-6 py-16">
      <section className="space-y-6">
        <span className="glass-badge glass-badge--primary">
          <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--color-primary)]" />
          Knowledge hub
        </span>
        <h1 className="font-rounded text-4xl font-semibold text-[color:var(--color-emphasis)]">
          Understanding Amblyopia
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[color:var(--color-muted)]">
          Use these resources to learn about warning signs, available treatments, and how VisionAI can support your child’s therapy journey.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel p-6">
          <h2 className="font-rounded text-2xl font-semibold text-[color:var(--color-emphasis)]">
            Signs of amblyopia
          </h2>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            Watch for these indicators and consult an eye-care professional if they persist:
          </p>
          <ul className="mt-5 space-y-3 text-sm text-[color:var(--color-muted)]">
            {earlySigns.map((sign) => (
              <li key={sign} className="flex gap-3">
                <span className="mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-secondary)]"></span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="glass-card glass-card--subtle space-y-4 p-6">
          <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Screening tip
          </h3>
          <p className="text-sm text-[color:var(--color-muted)]">
            Set up a calm environment with consistent lighting. Encourage your child through positive reinforcement, and pause if they become tired. Consistency builds better results than long, infrequent sessions.
          </p>
        </aside>
      </section>

      <section className="space-y-6">
        <h2 className="font-rounded text-2xl font-semibold text-[color:var(--color-emphasis)]">
          Treatment methods
        </h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          Treatment plans are individualised by your ophthalmologist. Here’s what they may involve:
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {treatments.map((treatment) => (
            <div key={treatment.title} className="glass-card glass-card--subtle p-6">
              <h3 className="font-rounded text-lg font-semibold text-[color:var(--color-emphasis)]">
                {treatment.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {treatment.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-rounded text-2xl font-semibold text-[color:var(--color-emphasis)]">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group glass-card glass-card--subtle p-5">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[color:var(--color-emphasis)]">
                {faq.question}
                <span className="text-[color:var(--color-primary)] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="glass-panel p-6 text-sm text-[color:var(--color-muted)]">
        <p>
          <strong className="text-[color:var(--color-emphasis)]">Disclaimer:</strong> VisionAI is a preliminary screening and therapy-support platform. It does not replace professional medical examinations. Always seek licensed medical advice for diagnosis and treatment decisions.
        </p>
      </section>
    </div>
  );
}
