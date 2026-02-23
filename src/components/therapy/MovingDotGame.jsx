"use client";

import { useEffect, useRef, useState } from "react";
import { loadTherapyProgress, updateTherapyProgress } from "@/lib/therapyProgress";

const SESSION_DURATION_MS = 20000;
const PATH_POINTS = [
  { x: 10, y: 20 },
  { x: 80, y: 25 },
  { x: 60, y: 60 },
  { x: 30, y: 75 },
  { x: 50, y: 40 },
];

export default function MovingDotGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_MS / 1000);
  const [progress, setProgress] = useState(loadTherapyProgress().movingDot);
  const [message, setMessage] = useState("");
  const animationRef = useRef();
  const startTimestampRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return undefined;

    setMessage("Tap the glowing dot whenever it gets close to the centre!");
    setHits(0);
    setTimeLeft(SESSION_DURATION_MS / 1000);
    startTimestampRef.current = performance.now();
    let frameId;

    const animate = (timestamp) => {
      const elapsed = timestamp - startTimestampRef.current;
      const progressRatio = elapsed / SESSION_DURATION_MS;
      if (progressRatio >= 1) {
        finishSession();
        return;
      }

      const pointIndex = Math.floor(progressRatio * (PATH_POINTS.length - 1));
      const nextIndex = Math.min(pointIndex + 1, PATH_POINTS.length - 1);
      const intra = (progressRatio * (PATH_POINTS.length - 1)) % 1;
      const current = PATH_POINTS[pointIndex];
      const target = PATH_POINTS[nextIndex];
      const x = current.x + (target.x - current.x) * intra;
      const y = current.y + (target.y - current.y) * intra;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}%, ${y}%)`;
      }

      setTimeLeft(Math.max(0, Math.ceil((SESSION_DURATION_MS - elapsed) / 1000)));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const finishSession = () => {
    setIsRunning(false);
    const score = hits;
    const previous = loadTherapyProgress().movingDot;
    const highScore = Math.max(previous.highScore ?? 0, score);
    const nextProgress = updateTherapyProgress({
      movingDot: {
        highScore,
        totalSessions: (previous.totalSessions ?? 0) + 1,
      },
    });
    setProgress(nextProgress.movingDot);
    setMessage(`Great job! You tagged the dot ${score} times.`);
  };

  const handleHit = () => {
    if (!isRunning) return;
    setHits((prev) => prev + 1);
  };

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Moving Dot Tracking Game
          </h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Follow the glowing dot and tap it as it moves. This trains smooth pursuit eye movements.
          </p>
        </div>
        <div className="rounded-2xl bg-[color:var(--color-primary)]/10 px-4 py-2 text-sm text-[color:var(--color-emphasis)]">
          High score: {progress.highScore ?? 0} hits
        </div>
      </div>

      <div className="relative h-56 overflow-hidden rounded-3xl border border-[color:var(--color-primary)]/30 bg-gradient-to-br from-white via-[#e9f6ff] to-[#f6fff8]">
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[color:var(--color-primary)]/40" />
        <button
          ref={dotRef}
          type="button"
          onClick={handleHit}
          className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg shadow-[color:var(--color-accent)]/40 transition ${
            isRunning ? "bg-[color:var(--color-accent)]" : "bg-[color:var(--color-muted)]/30"
          }`}
          aria-label="Moving dot"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-muted)]">
        <span>Hits: {hits}</span>
        <span>Time left: {isRunning ? `${timeLeft}s` : "--"}</span>
        <span>Total sessions: {progress.totalSessions ?? 0}</span>
      </div>

      {message && (
        <p className="rounded-2xl bg-[color:var(--color-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-muted)]">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3 text-sm md:flex-row">
        <button
          type="button"
          onClick={() => setIsRunning(true)}
          disabled={isRunning}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
        >
          {isRunning ? "Session running" : "Start 20 second session"}
        </button>
        {!isRunning && (
          <button
            type="button"
            onClick={() => {
              setHits(0);
              setMessage("Session reset. Press start when ready!");
            }}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}
