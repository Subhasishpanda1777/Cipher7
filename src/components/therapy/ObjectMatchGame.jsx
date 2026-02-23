"use client";

import { useMemo, useState } from "react";
import { loadTherapyProgress, updateTherapyProgress } from "@/lib/therapyProgress";

const OBJECTS = [
  { id: "kite", label: "Kite", icon: "🪁" },
  { id: "star", label: "Star", icon: "⭐" },
  { id: "rocket", label: "Rocket", icon: "🚀" },
  { id: "puzzle", label: "Puzzle", icon: "🧩" },
];

function createDeck() {
  const duplicated = [...OBJECTS, ...OBJECTS];
  return duplicated
    .map((item, index) => ({
      key: `${item.id}-${index}`,
      object: item,
      flipped: false,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5);
}

export default function ObjectMatchGame() {
  const initialProgress = loadTherapyProgress().objectMatch;
  const [cards, setCards] = useState(createDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [message, setMessage] = useState("Flip two cards to find matching objects.");
  const [progress, setProgress] = useState(initialProgress);

  const allMatched = useMemo(() => matchedCount === OBJECTS.length, [matchedCount]);

  const handleFlip = (card) => {
    if (card.matched || selected.some((sel) => sel.key === card.key)) {
      return;
    }

    if (!startTime) {
      setStartTime(Date.now());
      setMessage("Great start! Try to remember each object’s position.");
    }

    const flippedCard = { ...card, flipped: true };
    setCards((prev) => prev.map((item) => (item.key === card.key ? flippedCard : item)));

    const newSelection = [...selected, flippedCard];
    setSelected(newSelection);

    if (newSelection.length === 2) {
      setTimeout(() => evaluateSelection(newSelection), 600);
    }
  };

  const evaluateSelection = (selection) => {
    setMoves((prev) => prev + 1);
    const [first, second] = selection;
    if (first.object.id === second.object.id) {
      setCards((prev) =>
        prev.map((card) =>
          card.object.id === first.object.id ? { ...card, matched: true, flipped: true } : card
        )
      );
      setMatchedCount((prev) => prev + 1);
      setMessage("Nice match! Keep going.");
    } else {
      setCards((prev) =>
        prev.map((card) =>
          card.key === first.key || card.key === second.key ? { ...card, flipped: false } : card
        )
      );
      setMessage("Not quite—try again!");
    }
    setSelected([]);
  };

  if (allMatched && startTime) {
    const elapsedMs = Date.now() - startTime;
    const bestTime = progress.bestTime ? Math.min(progress.bestTime, elapsedMs) : elapsedMs;
    const updated = updateTherapyProgress({
      objectMatch: {
        bestTime,
        totalSessions: (progress.totalSessions ?? 0) + 1,
      },
    });
    setProgress(updated.objectMatch);
    setStartTime(null);
    setMessage(
      `Amazing! You matched all pairs in ${(elapsedMs / 1000).toFixed(1)} seconds with ${moves} moves.`
    );
  }

  const handleReset = () => {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setMatchedCount(0);
    setStartTime(null);
    setMessage("Session reset. Flip two cards to begin.");
  };

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Object Matching Game
          </h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Strengthen visual memory by matching pairs as quickly as possible.
          </p>
        </div>
        <div className="text-sm text-[color:var(--color-muted)]">
          Best time: {progress.bestTime ? `${(progress.bestTime / 1000).toFixed(1)}s` : "--"}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleFlip(card)}
            disabled={card.matched || selected.length === 2}
            className={`flex h-24 items-center justify-center rounded-2xl border border-[color:var(--color-primary)]/30 text-3xl transition ${
              card.flipped || card.matched
                ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-emphasis)]"
                : "bg-white"
            }`}
          >
            {card.flipped || card.matched ? card.object.icon : "?"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-muted)]">
        <span>Moves: {moves}</span>
        <span>Pairs matched: {matchedCount}/{OBJECTS.length}</span>
        <span>Sessions completed: {progress.totalSessions ?? 0}</span>
      </div>

      {message && (
        <p className="rounded-2xl bg-[color:var(--color-primary)]/10 px-4 py-3 text-sm text-[color:var(--color-muted)]">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3 text-sm md:flex-row">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90"
        >
          {allMatched ? "Play again" : "Restart"}
        </button>
      </div>
    </section>
  );
}
