export function readScreeningSession() {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem("visionai-screening");
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch (error) {
    console.warn("Failed to parse screening session", error);
    return {};
  }
}

export function writeScreeningSession(data) {
  if (typeof window === "undefined") return data;
  sessionStorage.setItem("visionai-screening", JSON.stringify(data));
  return data;
}

export function mergeScreeningSession(patch) {
  const current = readScreeningSession();
  const next = { ...current, ...patch };
  return writeScreeningSession(next);
}

export function clearScreeningSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("visionai-screening");
}
