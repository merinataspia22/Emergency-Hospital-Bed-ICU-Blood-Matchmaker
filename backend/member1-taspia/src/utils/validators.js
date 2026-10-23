import ApiError from "./ApiError.js";

const BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
export const normalizeEmail = value => String(value ?? "").trim().toLowerCase();

function ensureBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "A JSON object is required");
  }
}

function validateName(name) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    throw new ApiError(400, "Name must contain 2 to 100 characters");
  }
  return name.trim();
}

function validateEmail(email) {
  if (typeof email !== "string") throw new ApiError(400, "Valid email is required");
  const clean = normalizeEmail(email);
  if (clean.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new ApiError(400, "Valid email is required");
  }
  return clean;
}

function parseLastDonation(value) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, "lastDonation must be YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ||
      value > new Date().toISOString().slice(0, 10)) {
    throw new ApiError(400, "lastDonation must be a valid past date");
  }
  return date;
}

export function validateRegistration(body) {
  ensureBody(body);
  if (!["donor", "recipient"].includes(body.role)) {
    throw new ApiError(400, "Public registration is only for donors and recipients");
  }
  const name = validateName(body.name);
  const email = validateEmail(body.email);
  if (typeof body.password !== "string" || body.password.length < 8 ||
      Buffer.byteLength(body.password, "utf8") > 72 || !/[A-Za-z]/.test(body.password) || !/\d/.test(body.password)) {
    throw new ApiError(400, "Password needs 8+ characters (max 72 UTF-8 bytes), including letters and a number");
  }
  if (typeof body.phone !== "string") throw new ApiError(400, "Valid phone is required");
  const phone = body.phone.replace(/[\s-]/g, "");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
    throw new ApiError(400, "Valid Bangladesh mobile number is required");
  }
  if (!BLOOD_GROUPS.has(body.bloodGroup)) throw new ApiError(400, "Valid bloodGroup is required");
  if (typeof body.location !== "string" || body.location.trim().length < 2 ||
      body.location.trim().length > 100) {
    throw new ApiError(400, "Location must contain 2 to 100 characters");
  }
  if (body.terms !== true) throw new ApiError(400, "Accept the terms to register");

  return {
    name, email, password: body.password, phone, role: body.role,
    bloodGroup: body.bloodGroup, location: body.location.trim(),
    lastDonation: body.role === "donor" ? parseLastDonation(body.lastDonation) : null,
  };
}

export function validateLogin(body) {
  ensureBody(body);
  const email = validateEmail(body.email);
  if (typeof body.password !== "string" || !body.password) {
    throw new ApiError(400, "Password is required");
  }
  return { email, password: body.password };
}

export function validateContact(body) {
  ensureBody(body);
  const name = validateName(body.name);
  const email = validateEmail(body.email);
  if (typeof body.message !== "string" || body.message.trim().length < 12 ||
      body.message.trim().length > 2000) {
    throw new ApiError(400, "Message must contain 12 to 2000 characters");
  }
  return { name, email, message: body.message.trim() };
}

export function validatePagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  if (!Number.isInteger(page) || page < 1 || page > 10000 ||
      !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ApiError(400, "page must be 1-10000 and limit must be 1-50");
  }
  return { page, limit };
}
