export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  // Handle absolute URL or http:// to relative path to avoid Mixed Content errors in Codespaces
  let fixedUrl = url;
  if (url && url.startsWith("http")) {
    try {
      const urlObj = new URL(url);
      fixedUrl = urlObj.pathname + urlObj.search;
    } catch (e) {
      // fallback if URL parsing fails
    }
  }

  const response = await fetch(fixedUrl, {
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