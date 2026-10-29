import ApiError from "./ApiError.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["male", "female", "other"];
const isEmpty = value => value === "" || value === null || value === undefined;

// "?bloodGroup=A+" URL e "+" space hoye jay ("A "), tai ekhane "A+" kore nei
export const normalizeBloodGroup = value => String(value).replace(/ $/, "+").trim().toUpperCase();
export const escapeRegex = text => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function ensureBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "A JSON object is required");
}

// Member 1 er validators.js theke same logic (main e oi file nei, tai ekhane rakha hoyeche)
function validatePagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  if (!Number.isInteger(page) || page < 1 || page > 10000 ||
      !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ApiError(400, "page must be 1-10000 and limit must be 1-50");
  }
  return { page, limit };
}

function parseDate(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `${label} must be YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, `${label} must be a valid date`);
  }
  return date;
}

function ageOn(date, now = new Date()) {
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function validateDonorSearch(query) {
  const { page, limit } = validatePagination({ ...query, limit: query.limit ?? 12 });
  const result = { page, limit, available: query.available ?? "true", eligible: query.eligible === "true" };

  if (!["true", "false", "all"].includes(result.available)) {
    throw new ApiError(400, "available must be true, false or all");
  }
  if (!isEmpty(query.bloodGroup)) {
    const group = normalizeBloodGroup(query.bloodGroup);
    if (!BLOOD_GROUPS.includes(group)) throw new ApiError(400, `bloodGroup must be one of: ${BLOOD_GROUPS.join(", ")}`);
    result.bloodGroup = group;
  }
  if (!isEmpty(query.city)) {
    const city = String(query.city).trim();
    if (city.length < 2 || city.length > 100) throw new ApiError(400, "city must contain 2 to 100 characters");
    result.city = city;
  }
  return result;
}

// Return: { userFields, profileFields }. userFields User model e, profileFields DonorProfile e jabe.
export function validateProfileUpdate(body) {
  ensureBody(body);
  const userFields = {};
  const profileFields = {};

  if (body.phone !== undefined) {
    const phone = String(body.phone).replace(/[\s-]/g, "");
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) throw new ApiError(400, "Valid Bangladesh mobile number is required");
    userFields.phone = phone;
  }
  const city = body.city ?? body.location;
  if (city !== undefined) {
    if (typeof city !== "string" || city.trim().length < 2 || city.trim().length > 100) {
      throw new ApiError(400, "City must contain 2 to 100 characters");
    }
    userFields.location = city.trim();
  }
  if (body.bloodGroup !== undefined) {
    if (!BLOOD_GROUPS.includes(body.bloodGroup)) throw new ApiError(400, "Valid bloodGroup is required");
    userFields.bloodGroup = body.bloodGroup;
  }
  if (body.address !== undefined) {
    if (body.address !== null && (typeof body.address !== "string" || body.address.trim().length > 200)) {
      throw new ApiError(400, "Address can have at most 200 characters");
    }
    profileFields.address = (body.address ?? "").trim();
  }
  if (body.dateOfBirth !== undefined) {
    if (isEmpty(body.dateOfBirth)) profileFields.dateOfBirth = null;
    else {
      const dob = parseDate(body.dateOfBirth, "dateOfBirth");
      const age = ageOn(dob);
      if (age < 18 || age > 65) throw new ApiError(400, "Donor age must be between 18 and 65");
      profileFields.dateOfBirth = dob;
    }
  }
  if (body.gender !== undefined) {
    if (isEmpty(body.gender)) profileFields.gender = null;
    else if (GENDERS.includes(body.gender)) profileFields.gender = body.gender;
    else throw new ApiError(400, "gender must be male, female or other");
  }
  if (body.weightKg !== undefined) {
    if (isEmpty(body.weightKg)) profileFields.weightKg = null;
    else {
      const weight = Number(body.weightKg);
      if (!Number.isFinite(weight) || weight < 45 || weight > 200) throw new ApiError(400, "weightKg must be between 45 and 200");
      profileFields.weightKg = weight;
    }
  }
  if (!Object.keys(userFields).length && !Object.keys(profileFields).length) {
    throw new ApiError(400, "Send at least one of: phone, city, bloodGroup, address, dateOfBirth, gender, weightKg");
  }
  return { userFields, profileFields };
}

export function validateAvailability(body) {
  ensureBody(body);
  if (typeof body.isAvailable !== "boolean") throw new ApiError(400, "isAvailable must be true or false");
  return body.isAvailable;
}

export function validateDonationEntry(body) {
  ensureBody(body);
  const date = parseDate(body.date, "date");
  if (date > new Date()) throw new ApiError(400, "date cannot be in the future");
  if (typeof body.hospitalName !== "string" || body.hospitalName.trim().length < 2 || body.hospitalName.trim().length > 120) {
    throw new ApiError(400, "hospitalName must contain 2 to 120 characters");
  }
  return { date, hospitalName: body.hospitalName.trim() };
}