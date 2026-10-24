
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("bc_logged_in");
    localStorage.removeItem("bc_auth_user_v1");

    window.location.replace("/login");

    throw new Error("Session expired. Please log in again.");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}
