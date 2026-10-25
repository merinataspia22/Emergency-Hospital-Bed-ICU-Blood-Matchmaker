const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "accessToken"; // tomar code ja naam e token localStorage e rakhe, seta likho

// Backend er error message ke Error e convert kore
const request = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(body.errors) && body.errors.length ? body.errors.join(", ") : "";
    throw new Error(detail || body.message || `Request failed (${res.status})`);
  }
  return body;
};

// PATCH /api/blood-requests/:id
export const updateBloodRequest = async (id, changes) => {
  const body = await request(`/api/blood-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return body.data; // updated request
};