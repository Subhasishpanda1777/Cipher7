'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  mergeScreeningSession,
  readScreeningSession,
} from "@/lib/screeningSession";

const TEST_SEQUENCE = [
  { eye: "left", contrast: 0.3, shape: "circle" },
  { eye: "right", contrast: 0.25, shape: "triangle" },
  { eye: "left", contrast: 0.2, shape: "square" },
  { eye: "right", contrast: 0.18, shape: "circle" },
  { eye: "left", contrast: 0.15, shape: "triangle" },
  { eye: "right", contrast: 0.12, shape: "square" },
];

const SHAPE_RENDERERS = {
  circle: (ctx, size) => {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2.4, 0, Math.PI * 2);
    ctx.fill();
  },
  square: (ctx, size) => {
    const margin = size * 0.2;
    ctx.fillRect(margin, margin, size - margin * 2, size - margin * 2);
  },
  triangle: (ctx, size) => {
    ctx.beginPath();
    ctx.moveTo(size / 2, size * 0.2);
    ctx.lineTo(size * 0.2, size * 0.8);
    ctx.lineTo(size * 0.8, size * 0.8);
    ctx.closePath();
    ctx.fill();
  },
};

export default function ContrastTestPage() {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [instruction, setInstruction] = useState(
    "Cover your child's right eye gently."
  );
  const [showShape, setShowShape] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    const session = readScreeningSession();
    if (
      !session.consentGiven ||
      session.alignmentDeviationScore === undefined ||
      session.trackingStabilityScore === undefined
    ) {
      setSessionValid(false);
      router.replace(
        !session.consentGiven
          ? "/screening/instructions"
          : session.alignmentDeviationScore === undefined
          ? "/screening/alignment"
          : "/screening/tracking"
      );
    }
  }, [router]);


  useEffect(() => {
    if (!showShape) return;
    const timeout = setTimeout(() => {
      setShowShape(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [showShape]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timeout = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countdown]);

  useEffect(() => {
    drawStimulus();
  }, [currentIndex, showShape]);

  const drawStimulus = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    if (!showShape) return;
    const item = TEST_SEQUENCE[currentIndex];
    const colorValue = Math.floor(item.contrast * 255);
    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    SHAPE_RENDERERS[item.shape]?.(ctx, size);
  };

  const startNextStimulus = () => {
    const item = TEST_SEQUENCE[currentIndex];
    setInstruction(
      item.eye === "left"
        ? "Cover your child's right eye gently."
        : "Cover your child's left eye gently."
    );
    setShowShape(true);
  };

  const handleResponse = (correct) => {
    const item = TEST_SEQUENCE[currentIndex];
    setResponses((prev) => [
      ...prev,
      {
        ...item,
        correct,
        reactionTime: 2000 - countdown * 1000,
      },
    ]);

    if (currentIndex === TEST_SEQUENCE.length - 1) {
      setIsComplete(true);
      computeScore([...responses, { ...item, correct }]);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCountdown(3);
      setTimeout(() => {
        setShowShape(true);
      }, 400);
    }
  };

  const computeScore = (allResponses) => {
    const leftResponses = allResponses.filter((r) => r.eye === "left");
    const rightResponses = allResponses.filter((r) => r.eye === "right");

    const leftAccuracy = leftResponses.filter((r) => r.correct).length / leftResponses.length;
    const rightAccuracy =
      rightResponses.filter((r) => r.correct).length / rightResponses.length;

    const leftAvgContrast = average(leftResponses.map((r) => r.contrast));
    const rightAvgContrast = average(rightResponses.map((r) => r.contrast));

    const contrastDifference = Math.abs(leftAvgContrast - rightAvgContrast);

    const leftReaction = average(leftResponses.map((r) => r.reactionTime));
    const rightReaction = average(rightResponses.map((r) => r.reactionTime));

    const accuracyScore = (leftAccuracy + rightAccuracy) / 2;
    const balanceScore = Math.max(0, 1 - contrastDifference * 5);
    const reactionScore = Math.max(0, 1 - Math.abs(leftReaction - rightReaction) / 2000);

    const contrastSensitivityScore = Number(
      (accuracyScore * 0.6 + balanceScore * 0.25 + reactionScore * 0.15).toFixed(2)
    );

    mergeScreeningSession({ contrastSensitivityScore });
  };

  const handleFinish = () => {
    router.push("/screening/results");
  };

  const summary = useMemo(() => {
    if (!isComplete) return null;
    const stored = readScreeningSession();
    return stored.contrastSensitivityScore ?? null;
  }, [isComplete]);

  useEffect(() => {
    setTimeout(() => setShowShape(true), 500);
  }, []);

  if (!sessionValid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
            Step 5 • Contrast Sensitivity Test
          </span>
          <h1 className="mt-4 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            Identify the Shape Before It Disappears
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            Alternate covering each eye as prompted. Encourage your child to name the shape or point to it quickly to capture both accuracy and reaction time.
          </p>
        </header>

        <section className="rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
            <div className="flex flex-col items-center gap-6">
              <div className="aspect-square w-56 overflow-hidden rounded-[24px] border border-[color:var(--color-primary)]/30 bg-[#f5fbff]">
                <canvas ref={canvasRef} width={224} height={224} />
              </div>
              <div className="text-center text-sm text-[color:var(--color-muted)]">
                {instruction}
                <p className="mt-2 text-xs text-[color:var(--color-emphasis)]/70">
                  {showShape ? "Identify the shape now" : `Next shape in ${countdown}s`}
                </p>
              </div>
              <div className="flex gap-3">
                {Object.keys(SHAPE_RENDERERS).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => handleResponse(TEST_SEQUENCE[currentIndex].shape === shape)}
                    disabled={isComplete || !showShape}
                    className="rounded-full border border-[color:var(--color-primary)]/40 px-4 py-2 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/20"
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6 rounded-[var(--radius-card)] bg-[color:var(--color-primary)]/8 p-6 text-sm text-[color:var(--color-muted)]">
              <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                How the Test Works
              </h2>
              <ul className="space-y-3">
                <li>Shapes appear briefly with varying contrast levels.</li>
                <li>The caregiver notes whether the child correctly identifies the shape.</li>
                <li>VisionAI balances accuracy and reaction time between both eyes.</li>
              </ul>

              <div className="rounded-2xl bg-white/70 p-4 text-xs text-[color:var(--color-muted)]">
                Tips: Keep one eye gently covered without pressure and encourage quick responses. If unsure, skip to the next prompt.
              </div>
            </div>
          </div>

          {isComplete && summary !== null && (
            <div className="mt-8 rounded-2xl border border-[color:var(--color-primary)]/30 bg-white/90 p-6 text-sm text-[color:var(--color-muted)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-emphasis)]/70">
                Summary
              </p>
              <h3 className="mt-2 font-rounded text-xl text-[color:var(--color-emphasis)]">
                Contrast Sensitivity Score: {summary.toFixed(2)}
              </h3>
              <p className="mt-2 text-sm">
                Higher scores indicate balanced contrast perception. VisionAI will combine this with previous tests to compute the final risk score.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <Link
              href="/screening/tracking"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
            >
              Back
            </Link>
            <button
              type="button"
              disabled={!isComplete}
              onClick={handleFinish}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
            >
              View Screening Results
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}
