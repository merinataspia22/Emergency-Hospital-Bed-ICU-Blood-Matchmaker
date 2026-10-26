// Member 2: Donor API calls (Find Donor + Donor Dashboard + Messages)
// Donor server alada (port 5001), tai nijer base URL. Token member 1 er readToken theke.
import { readToken } from "./api.js";

const BASE = import.meta.env.VITE_DONOR_API_URL || "http://localhost:5001/api";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = readToken();
    if (!token) throw new Error("Please log in first");
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Something went wrong.");
  }
  return json.data;
}

const toQuery = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null && v !== false)
  );
  const qs = new URLSearchParams(clean).toString(); // "A+" ke "A%2B" kore dey
  return qs ? `?${qs}` : "";
};

// ---- Find Donor page ----
export const searchDonors = (params) => request(`/donors${toQuery(params)}`, { auth: false });
export const getDonorContact = async (donorId) => (await request(`/donors/${donorId}/contact`)).contact;

// ---- Donor Dashboard (donor login lagbe) ----
export const getMyDonor = async () => (await request("/donors/me")).donor;
export const updateMyDonor = async (payload) =>
  (await request("/donors/me", { method: "PATCH", body: payload })).donor;
export const setMyAvailability = async (isAvailable) =>
  (await request("/donors/me/availability", { method: "PATCH", body: { isAvailable } })).availability;
export const getMyHistory = async () => (await request("/donors/me/history")).history;
export const addMyDonation = (payload) =>
  request("/donors/me/history", { method: "POST", body: payload });

// ---- Blood requests (donor dashboard) ----
export const getMyRequests = async () => (await request("/donors/me/requests")).requests;
export const respondToRequest = (id, status) =>
  request(`/donors/me/requests/${id}/respond`, { method: "POST", body: { status } });

// ---- Profile photo + Messages ----
export const setMyAvatar = async (avatar) =>
  (await request("/donors/me/avatar", { method: "PATCH", body: { avatar } })).avatar;
export const getConversations = async () => (await request("/messages")).conversations;
export const getThread = async (userId) => (await request(`/messages/${userId}`)).messages;
export const sendMessage = (userId, text) =>
  request(`/messages/${userId}`, { method: "POST", body: { text } });

// ---- Donor map location (donor nijer ichchhay share kore) ----
export const setMyLocation = async (lat, lng) =>
  (await request("/donors/me/location", { method: "PATCH", body: { lat, lng } })).location;