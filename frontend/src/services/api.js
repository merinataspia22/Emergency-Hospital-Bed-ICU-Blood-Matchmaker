
const TOKEN_KEY = "bc_access_token_v1";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

// Read shared authentication token
export function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Save shared authentication token
export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

// Clear shared authentication token
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// Make API requests using the shared token
export async function apiRequest(
  path,
  { method = "GET", body, token } = {}
) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const authToken = token || readToken();

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const requestUrl = `${API_BASE_URL}${normalizedPath}`;

  let response;

  try {
    response = await fetch(requestUrl, {
      method,
      headers,
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw new Error(
      "Backend connection failed. Check both servers."
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || `Request failed (${response.status})`
    );
  }

  return result.data;
}
