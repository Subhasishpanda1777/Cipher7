const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({ message: "Unknown error" }));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function postScreening(payload) {
  return request("/screenings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchUserScreenings(userId) {
  return request(`/screenings/user/${userId}`);
}

export function fetchAllScreenings() {
  return request(`/screenings`);
}

export function fetchMyChildren() {
  return request(`/child/me`);
}

export function fetchAllChildren() {
  return request(`/child`);
}

export function createTherapySession(payload) {
  return request(`/therapy`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyTherapySessions() {
  return request(`/therapy/me`);
}

export function fetchChildTherapySessions(childId) {
  return request(`/therapy/child/${childId}`);
}

export async function downloadParentReport() {
  const response = await fetch(`${API_BASE_URL}/reports/parent-summary`, {
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unable to download report" }));
    throw new Error(error.message || "Unable to download report");
  }
  return response.blob();
}
