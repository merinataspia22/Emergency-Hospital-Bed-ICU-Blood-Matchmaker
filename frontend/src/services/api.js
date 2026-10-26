
const TOKEN_KEY = "bc_access_token_v1";

export function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

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

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`http://localhost:5000/api${path}`, {
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
      result?.message ||
      `Request failed (${response.status})`
    );
  }

  return result.data;
}
