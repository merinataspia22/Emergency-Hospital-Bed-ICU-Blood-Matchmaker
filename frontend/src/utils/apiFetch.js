
import { readToken, clearToken } from "../services/api.js";

export async function apiFetch(url, options = {}) {
  const token = readToken();

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.replace("/login");

    throw new Error("Session expired. Please log in again.");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}
