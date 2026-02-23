"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearScreeningSession,
  mergeScreeningSession,
} from "@/lib/screeningSession";

const instructions = [
  "Find a quiet, well-lit room with soft, even lighting.",
  "Position your child 40–60 cm (arm’s length) from the screen.",
  "Make sure the entire face is visible to the webcam without obstructions.",
  "Remove glasses only if advised by your eye specialist.",
  "Keep the child’s head steady by resting on the back of a chair.",
];

export default function ScreeningInstructionsPage() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    clearScreeningSession();
  }, []);

  const handleStart = () => {
    if (!consentGiven) return;
    mergeScreeningSession({ consentGiven: true, savedScreeningId: undefined });
  };

  return (
    <div className="min-h-screen bg-gradient px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-white/60 bg-white/85 p-10 shadow-xl backdrop-blur">
        <header className="flex flex-col gap-3 text-center md:text-left">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--color-secondary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-secondary)]">
            Step 1 • Preparation
          </span>
          <h1 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            Get Ready for VisionAI Screening
          </h1>
          <p className="max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            Please follow these instructions carefully to ensure accurate results. The screening uses your webcam to track eye alignment and movement.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-[color:var(--color-primary)]/10 p-6">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              Setup Checklist
            </h2>
            <ul className="space-y-3 text-sm text-[color:var(--color-muted)] md:text-base">
              {instructions.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-xs font-bold text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
            <div className="space-y-3">
              <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                Screening Tips
              </h2>
              <ul className="space-y-2 text-sm text-[color:var(--color-muted)] md:text-base">
                <li>
                  Encourage your child to stay relaxed and look at the screen.
                </li>
                <li>Have a second adult nearby to assist if needed.</li>
                <li>Ensure the environment remains consistent throughout the tests.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10 p-5 text-sm text-[color:var(--color-muted)] md:text-base">
              <strong className="block text-[color:var(--color-emphasis)]">
                Medical Disclaimer
              </strong>
              This is a preliminary screening tool and not a medical diagnosis. For any concerns, please consult a qualified ophthalmologist.
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-[color:var(--color-emphasis)] px-6 py-6 text-white md:flex-row">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Ready to continue?
            </p>
            <h3 className="font-rounded text-2xl font-semibold">Start the screening setup</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Home
            </Link>
            <div className="flex flex-col items-center gap-4 md:items-end">
              <label className="flex items-start gap-3 text-left text-sm text-[color:var(--color-muted)]">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[color:var(--color-primary)]/50"
                  checked={consentGiven}
                  onChange={(event) => setConsentGiven(event.target.checked)}
                />
                <span>
                  I confirm that I am the child’s guardian and consent to using VisionAI for preliminary screening. I understand this is not a medical diagnosis.
                </span>
              </label>
              <Link
                href={consentGiven ? "/screening/webcam" : "#"}
                onClick={handleStart}
                aria-disabled={!consentGiven}
                className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition ${
                  consentGiven
                    ? "bg-[color:var(--color-secondary)] hover:bg-[color:var(--color-secondary)]/90"
                    : "pointer-events-none bg-[color:var(--color-muted)]/40"
                }`}
              >
                Start Screening
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
