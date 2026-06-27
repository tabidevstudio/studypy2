// Backend API Base URL
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const API_BASE = isLocal
  ? "http://localhost:3000/api/auth"
  : "/api/auth";

/**
 * Helper to wrap fetch calls with credentials (supporting HTTP-Only cookies)
 */
async function apiFetch(url, options = {}) {
  options.credentials = "include"; // Ensure cookies are sent and received
  
  if (options.body && typeof options.body === "object") {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers
    };
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch the authenticated user profile. Sends the user's current local date (YYYY-MM-DD)
 * to calculate and maintain the daily streak.
 */
export async function getProfile() {
  // Get date formatted as YYYY-MM-DD in local time
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const localDateStr = `${year}-${month}-${date}`;

  try {
    return await apiFetch(`${API_BASE}/me?date=${localDateStr}`);
  } catch (err) {
    return { authenticated: false };
  }
}

/**
 * Terminate the user session and clear cookies.
 */
export async function logoutUser() {
  return await apiFetch(`${API_BASE}/logout`, { method: "POST" });
}

/**
 * Toggle bookmark state for a given resource file path.
 */
export async function toggleBookmark(path) {
  return await apiFetch(`${API_BASE}/bookmark`, {
    method: "POST",
    body: { path }
  });
}

/**
 * Toggle watched video status.
 */
export async function toggleWatched(videoUrl) {
  return await apiFetch(`${API_BASE}/watched`, {
    method: "POST",
    body: { videoUrl }
  });
}

/**
 * Update the authenticated user's username.
 */
export async function updateProfile(username) {
  return await apiFetch(`${API_BASE}/profile`, {
    method: "PUT",
    body: { username }
  });
}

/**
 * Fetch the authenticated user's saved resume data.
 */
export async function getResume() {
  return await apiFetch(`${API_BASE}/resume`);
}

/**
 * Save / update the authenticated user's resume data.
 */
export async function saveResume(resumeData) {
  return await apiFetch(`${API_BASE}/resume/save`, {
    method: "POST",
    body: { resumeData }
  });
}

