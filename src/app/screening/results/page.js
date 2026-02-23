'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { postScreening } from "@/lib/api";
import {
  mergeScreeningSession,
  readScreeningSession,
} from "@/lib/screeningSession";

ChartJS.register(ArcElement, Tooltip, Legend);

const classificationLabels = {
  low: {
    title: "Low Risk",
    message: "Continue monitoring vision at home and schedule annual eye check-ups.",
    accent: "#3AC6A8",
  },
  moderate: {
    title: "Moderate Risk",
    message:
      "Consider consulting a pediatric ophthalmologist for a comprehensive vision evaluation.",
    accent: "#FFC857",
  },
  high: {
    title: "High Risk",
    message:
      "Schedule an appointment with an eye specialist as soon as possible for a diagnostic assessment.",
    accent: "#FF6B6B",
  },
};

const DEMO_PARENT_ID = Number(process.env.NEXT_PUBLIC_DEMO_PARENT_ID ?? 1);
const DEMO_CHILD_ID = Number(process.env.NEXT_PUBLIC_DEMO_CHILD_ID ?? 1);

export default function ScreeningResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [scores, setScores] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    const sessionData = readScreeningSession();

    if (!sessionData.consentGiven) {
      router.replace("/screening/instructions");
      return;
    }
    if (sessionData.alignmentDeviationScore === undefined) {
      router.replace("/screening/alignment");
      return;
    }
    if (sessionData.trackingStabilityScore === undefined) {
      router.replace("/screening/tracking");
      return;
    }
    if (sessionData.contrastSensitivityScore === undefined) {
      router.replace("/screening/contrast");
      return;
    }

    const alignmentDeviationScore = Number(sessionData.alignmentDeviationScore ?? 0);
    const trackingStabilityScore = Number(sessionData.trackingStabilityScore ?? 0);
    const contrastSensitivityScore = Number(sessionData.contrastSensitivityScore ?? 0);

    const rawRisk =
      alignmentDeviationScore * 0.4 +
      trackingStabilityScore * 0.3 +
      contrastSensitivityScore * 0.3;
    const normalizedRisk = Math.min(1, Math.max(0, Number(rawRisk.toFixed(2))));
    const classification = classifyRisk(normalizedRisk);

    mergeScreeningSession({
      alignmentDeviationScore,
      trackingStabilityScore,
      contrastSensitivityScore,
      riskScore: normalizedRisk,
      classification,
    });

    setSession({
      ...sessionData,
      alignmentDeviationScore,
      trackingStabilityScore,
      contrastSensitivityScore,
      riskScore: normalizedRisk,
      classification,
    });
    setScores({
      alignmentDeviationScore,
      trackingStabilityScore,
      contrastSensitivityScore,
      riskScore: normalizedRisk,
      classification,
    });
    setInitialised(true);
  }, [router]);

  useEffect(() => {
    if (!session || !scores) return;
    if (session.savedScreeningId) return;

    let isCancelled = false;

    const persistScreening = async () => {
      try {
        setSaving(true);
        setSaveError("");
        const payload = {
          userId: DEMO_PARENT_ID,
          childId: DEMO_CHILD_ID,
          alignmentScore: scores.alignmentDeviationScore,
          trackingScore: scores.trackingStabilityScore,
          contrastScore: scores.contrastSensitivityScore,
          finalRiskScore: scores.riskScore,
          classification: scores.classification,
          consentGiven: Boolean(session.consentGiven),
          notes: null,
        };

        const response = await postScreening(payload);
        if (isCancelled) return;
        const savedId = response?.data?.id;
        mergeScreeningSession({ savedScreeningId: savedId });
        setSession((prev) => ({
          ...prev,
          savedScreeningId: savedId,
        }));
      } catch (error) {
        if (isCancelled) return;
        setSaveError(error.message || "Unable to save screening.");
      } finally {
        if (!isCancelled) {
          setSaving(false);
        }
      }
    };

    persistScreening();

    return () => {
      isCancelled = true;
    };
  }, [session, scores]);

  const handleRetrySave = () => {
    if (!session) return;
    setSession((prev) => (prev ? { ...prev, savedScreeningId: undefined } : prev));
  };

  const chartData = useMemo(() => {
    if (!scores) return null;
    return {
      labels: ["Alignment", "Tracking", "Contrast"],
      datasets: [
        {
          data: [
            Number((scores.alignmentDeviationScore * 100).toFixed(0)),
            Number((scores.trackingStabilityScore * 100).toFixed(0)),
            Number((scores.contrastSensitivityScore * 100).toFixed(0)),
          ],
          backgroundColor: ["#62B6F0", "#3AC6A8", "#FFC857"],
          borderWidth: 0,
        },
      ],
    };
  }, [scores]);

  if (!initialised || !scores) {
    return (
      <div className="min-h-screen bg-gradient px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-10 text-center shadow-lg backdrop-blur">
          <p className="font-rounded text-xl text-[color:var(--color-emphasis)]">
            Preparing your VisionAI results…
          </p>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="min-h-screen bg-gradient px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-10 text-center shadow-lg backdrop-blur">
          <h1 className="font-rounded text-2xl text-[color:var(--color-emphasis)]">
            Screening results unavailable
          </h1>
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            Please complete the alignment, tracking, and contrast tests to view results.
          </p>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
            <Link
              href="/screening/instructions"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90"
            >
              Start Screening
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const riskLabel = scores.classification;
  const classification = classificationLabels[riskLabel];

  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`,
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        },
      },
    },
    cutout: "65%",
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gradient px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
            Step 6 & 7 • Risk Scoring & Result Summary
          </span>
          <h1 className="mt-4 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            VisionAI Screening Summary
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            These results offer a preliminary amblyopia risk assessment based on the alignment, tracking, and contrast sensitivity tests. Consult an eye specialist for any medical diagnosis.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {saving && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-secondary)]/15 px-4 py-1 font-semibold text-[color:var(--color-secondary)]">
                Saving screening report…
              </span>
            )}
            {session?.savedScreeningId && !saving && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-secondary)]/15 px-4 py-1 font-semibold text-[color:var(--color-secondary)]">
                Report saved · ID #{session.savedScreeningId}
              </span>
            )}
            {saveError && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1 font-semibold text-red-700">
                {saveError}
              </span>
            )}
            {saveError && (
              <button
                type="button"
                onClick={handleRetrySave}
                className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Retry save
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-[max(280px,_40%)_1fr]">
          <div className="relative flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-8 shadow-xl backdrop-blur">
            <div className="relative h-64 w-64">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  Risk Score
                </p>
                <p
                  className="mt-2 font-rounded text-4xl font-semibold"
                  style={{ color: classification.accent }}
                >
                  {(scores.riskScore * 100).toFixed(0)}%
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--color-emphasis)]">
                  {classification.title}
                </p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
              VisionAI balances each metric using an evidence-informed weighting model. Higher scores indicate better symmetry, coordination, and contrast response.
            </p>
          </div>

          <div className="space-y-5 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-8 shadow-xl backdrop-blur">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              Detailed Scores
            </h2>
            <ScoreCard
              label="Eye alignment"
              value={scores.alignmentDeviationScore}
              description="Measures symmetry and head stability while focusing on the center dot."
            />
            <ScoreCard
              label="Tracking stability"
              value={scores.trackingStabilityScore}
              description="Evaluates reaction speed and smooth pursuit across moving targets."
            />
            <ScoreCard
              label="Contrast sensitivity"
              value={scores.contrastSensitivityScore}
              description="Assesses low-contrast recognition across alternating eyes."
            />

            <div className="rounded-2xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 p-5 text-sm text-[color:var(--color-muted)]">
              <p className="font-semibold text-[color:var(--color-emphasis)]">
                Recommendation
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {classification.message}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-8 shadow-xl backdrop-blur">
          <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Next Steps
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <ActionCard
              title="Save report"
              description="Download a PDF summary to share with your pediatric ophthalmologist."
              actionLabel="Coming soon"
              disabled
            />
            <ActionCard
              title="Start therapy exercises"
              description="Begin VisionAI's gamified therapy games to support visual development."
              actionLabel="Go to Therapy"
              href="/therapy"
            />
            <ActionCard
              title="Schedule follow-up"
              description="Track progress in the Parent Dashboard and set reminders for future screenings."
              actionLabel="Parent Dashboard"
              href="/parent"
            />
          </div>
          <p className="mt-6 text-xs text-[color:var(--color-muted)]">
            Disclaimer: VisionAI is a screening support tool and not a substitute for a professional diagnosis.
          </p>
        </section>

        <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link
            href="/screening/contrast"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
          >
            Re-run Contrast Test
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

function classifyRisk(score) {
  if (score <= 0.3) return "low";
  if (score <= 0.6) return "moderate";
  return "high";
}

function ScoreCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-primary)]/20 bg-white/70 p-5 text-sm text-[color:var(--color-muted)]">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[color:var(--color-emphasis)]">{label}</p>
        <span className="text-lg font-semibold text-[color:var(--color-emphasis)]">
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-muted)]/80">{description}</p>
    </div>
  );
}

function ActionCard({ title, description, actionLabel, href, disabled }) {
  const content = (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border border-[color:var(--color-primary)]/25 bg-white/80 p-5 text-sm text-[color:var(--color-muted)] ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div>
        <p className="text-base font-semibold text-[color:var(--color-emphasis)]">{title}</p>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]/80">{description}</p>
      </div>
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--color-primary)]/10 px-4 py-2 text-xs font-semibold text-[color:var(--color-primary)]">
        {actionLabel}
      </span>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
