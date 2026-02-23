const STORAGE_KEY = "visionai-therapy-progress";

function readProgress() {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch (error) {
    console.warn("Failed to load therapy progress", error);
    return defaultProgress();
  }
}

function defaultProgress() {
  return {
    movingDot: { highScore: 0, totalSessions: 0 },
    contrastChallenge: { bestStreak: 0, totalSessions: 0 },
    objectMatch: { bestTime: null, totalSessions: 0 },
    lastUpdated: null,
  };
}

export function loadTherapyProgress() {
  return readProgress();
}

export function updateTherapyProgress(patch) {
  if (typeof window === "undefined") return;
  const current = readProgress();
  const next = {
    ...current,
    ...patch,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
