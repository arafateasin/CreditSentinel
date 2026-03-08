// Shared API client for Credit Sentinel
// All API calls go through these functions so endpoints are centralised.

// Backend URL - in production (Vercel), frontend and backend are on same domain
// In development, backend runs on port 8000
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:8000");

// Helper to construct full API URL
function getApiUrl(path: string): string {
  // If path is already absolute, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // If path starts with /api, use it directly with base URL
  if (path.startsWith("/api")) {
    return `${API_BASE_URL}${path}`;
  }
  // Otherwise append /api prefix
  return `${API_BASE_URL}/api${path.startsWith("/") ? path : "/" + path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    headers: { Authorization: "Bearer credit-officer-token" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer credit-officer-token",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer credit-officer-token" },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
