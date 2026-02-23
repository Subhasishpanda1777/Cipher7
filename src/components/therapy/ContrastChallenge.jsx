"use client";

import { useMemo, useState } from "react";
import { loadTherapyProgress, updateTherapyProgress } from "@/lib/therapyProgress";

const SHAPES = ["circle", "triangle", "square"];
const CONTRAST_LEVELS = [0.6, 0.45, 0.3, 0.2];
const SESSION_ROUNDS = 8;

function generateRound(level) {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    contrast: CONTRAST_LEVELS[level],
    id: crypto.randomUUID(),
  };
}

export default function ContrastChallenge() {
  const initialProgress = loadTherapyProgress().contrastChallenge;
  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState(() => Array.from({ length: SESSION_ROUNDS }, () => generateRound(0)));
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(initialProgress);
  const [sessionActive, setSessionActive] = useState(false);
  const [message, setMessage] = useState("Tap the shape the child identifies. Encourage quick responses!");

  const currentRound = useMemo(() => rounds[roundIndex], [roundIndex, rounds]);

  const handleStart = () => {
    setRounds(Array.from({ length: SESSION_ROUNDS }, (_, index) => generateRound(Math.min(index, CONTRAST_LEVELS.length - 1))));
    setAnswers([]);
    setRoundIndex(0);
    setSessionActive(true);
    setMessage("Session started. Show the child each card and log their response.");
  };

  const handleAnswer = (choice) => {
    if (!sessionActive || !currentRound) return;
    const isCorrect = currentRound.shape === choice;
    const newAnswers = [...answers, { round: currentRound, isCorrect }];
    setAnswers(newAnswers);

    if (roundIndex >= SESSION_ROUNDS - 1) {
      finishSession(newAnswers);
      return;
    }

    setRoundIndex((prev) => prev + 1);
  };

  const finishSession = (finalAnswers) => {
    setSessionActive(false);
    const score = finalAnswers.filter((answer) => answer.isCorrect).length;
    const bestStreak = Math.max(progress.bestStreak ?? 0, score);
    const updated = updateTherapyProgress({
      contrastChallenge: {
        bestStreak,
        totalSessions: (progress.totalSessions ?? 0) + 1,
      },
    });
    setProgress(updated.contrastChallenge);
    setMessage(`Nice work! ${score}/${SESSION_ROUNDS} correct.`);
  };

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Contrast Challenge
          </h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Present low-contrast shapes and track accuracy to train contrast sensitivity.
          </p>
        </div>
        <div className="rounded-2xl bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm text-[color:var(--color-emphasis)]">
          Best streak: {progress.bestStreak ?? 0}
        </div>
      </div>

      {currentRound && (
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-[#f5fbff] p-6">
          <div
            className="h-40 w-40 rounded-3xl border border-[color:var(--color-primary)]/30 bg-white"
            style={{
              filter: `contrast(${currentRound.contrast})`,
            }}
          >
            <div className="flex h-full items-center justify-center">
              <ShapeRenderer shape={currentRound.shape} contrast={currentRound.contrast} />
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            {SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => handleAnswer(shape)}
                disabled={!sessionActive}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-5 py-2 font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10 disabled:cursor-not-allowed disabled:text-[color:var(--color-muted)]"
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-muted)]">
        <span>Round: {sessionActive ? roundIndex + 1 : "--"}/{SESSION_ROUNDS}</span>
        <span>Sessions completed: {progress.totalSessions ?? 0}</span>
        <span>Correct so far: {answers.filter((answer) => answer.isCorrect).length}</span>
      </div>

      {message && (
        <p className="rounded-2xl bg-[color:var(--color-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-muted)]">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3 text-sm md:flex-row">
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90"
        >
          {sessionActive ? "Restart session" : "Start session"}
        </button>
        {!sessionActive && answers.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMessage("Session cleared. Ready when you are!");
              setAnswers([]);
            }}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
          >
            Clear results
          </button>
        )}
      </div>
    </section>
  );
}

function ShapeRenderer({ shape }) {
  switch (shape) {
    case "triangle":
      return (
        <div
          className="h-20 w-20"
          style={{
            clipPath: "polygon(50% 15%, 15% 85%, 85% 85%)",
            background: "var(--color-emphasis)",
          }}
        />
      );
    case "square":
      return <div className="h-16 w-16 rounded-xl bg-[color:var(--color-emphasis)]" />;
    default:
      return <div className="h-16 w-16 rounded-full bg-[color:var(--color-emphasis)]" />;
  }
}
