import mongoose from "mongoose";
import User from "../models/User.js";
import DonorProfile from "../models/DonorProfile.js";
import ApiError from "../utils/ApiError.js";
import { DONATION_GAP_DAYS, getEligibility } from "../utils/eligibility.js";
import {
  escapeRegex, validateAvailability, validateDonationEntry, validateDonorSearch, validateProfileUpdate,
} from "../utils/donorValidators.js";

// protect middleware shudhu { id, role } dey, tai puro user ekhane load kori
async function loadUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

// ---------- Find Donor (public) ----------
export async function listDonors(query) {
  const { bloodGroup, city, available, eligible, page, limit } = validateDonorSearch(query);

  const filter = { role: "donor" };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (city) filter.location = new RegExp(escapeRegex(city), "i");
  if (eligible) {
    const cutoff = new Date(Date.now() - DONATION_GAP_DAYS * 864e5);
    filter.$or = [{ lastDonation: null }, { lastDonation: { $lte: cutoff } }];
  }
  if (available !== "all") {
    // profile nai mane donor default e available
    const unavailableIds = await DonorProfile.find({ isAvailable: false }).distinct("userId");
    filter._id = available === "true" ? { $nin: unavailableIds } : { $in: unavailableIds };
  }

  const [users, total] = await Promise.all([
    User.find(filter).select("name bloodGroup location lastDonation")
      .sort({ lastDonation: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  // availability + profile photo ekshathe
  const profiles = await DonorProfile.find({ userId: { $in: users.map((u) => u._id) } })
    .select("userId isAvailable avatar lat lng").lean();
  const unavailable = new Set(profiles.filter((p) => p.isAvailable === false).map((p) => String(p.userId)));
  const avatars = new Map(profiles.map((p) => [String(p.userId), p.avatar || ""]));
  const spots = new Map(profiles.filter((p) => p.lat != null && p.lng != null).map((p) => [String(p.userId), p]));
  const round = (n) => Math.round(n * 1000) / 1000; // public e ~100 m accuracy

  return {
    donors: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      bloodGroup: u.bloodGroup,
      city: u.location ?? "",
      avatar: avatars.get(String(u._id)) || "",
      lat: spots.has(String(u._id)) ? round(spots.get(String(u._id)).lat) : null,
      lng: spots.has(String(u._id)) ? round(spots.get(String(u._id)).lng) : null,
      isAvailable: !unavailable.has(String(u._id)),
      lastDonationDate: u.lastDonation ?? null,
      isEligible: getEligibility(u.lastDonation).isEligible,
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

// Phone number shudhu login kora recipient/staff/admin dekhte pabe
export async function getDonorContact(donorId) {
  if (!mongoose.isValidObjectId(donorId)) throw new ApiError(400, "Invalid donor id");
  const user = await User.findOne({ _id: donorId, role: "donor" }).select("name phone location");
  if (!user) throw new ApiError(404, "Donor not found");
  if (await DonorProfile.exists({ userId: user._id, isAvailable: false })) {
    throw new ApiError(403, "This donor is not available right now");
  }
  return { contact: { id: String(user._id), name: user.name, phone: user.phone ?? "", city: user.location ?? "" } };
}

// ---------- Donor Dashboard (donor role) ----------
export async function getMyProfile(userId) {
  const user = await loadUser(userId);
  const profile = await DonorProfile.forUser(user._id);
  return { donor: profile.toDashboard(user) };
}

export async function updateMyProfile(userId, body) {
  const user = await loadUser(userId);
  const { userFields, profileFields } = validateProfileUpdate(body);
  if (userFields.bloodGroup && user.bloodGroup && user.bloodGroup !== userFields.bloodGroup) {
    throw new ApiError(400, "Blood group cannot be changed after registration");
  }
  if (Object.keys(userFields).length) {
    user.set(userFields);
    await user.save();
  }
  const profile = await DonorProfile.forUser(user._id);
  if (Object.keys(profileFields).length) {
    profile.set(profileFields);
    await profile.save();
  }
  return { donor: profile.toDashboard(user) };
}

export async function setMyAvailability(userId, body) {
  const isAvailable = validateAvailability(body);
  const profile = await DonorProfile.forUser(userId);
  profile.isAvailable = isAvailable;
  await profile.save();
  return { availability: { isAvailable } };
}

export async function getMyHistory(userId) {
  const profile = await DonorProfile.forUser(userId);
  return { history: profile.toHistory() };
}

export async function addMyDonation(userId, body) {
  const user = await loadUser(userId);
  const { date, hospitalName } = validateDonationEntry(body);
  const profile = await DonorProfile.forUser(user._id);
  profile.donationHistory.push({ date, hospitalName, bloodGroup: user.bloodGroup || undefined });
  await profile.save();
  // Find Donor ar eligibility User.lastDonation theke pay, tai oita-o update hobe
  if (!user.lastDonation || date > user.lastDonation) {
    user.lastDonation = date;
    await user.save();
  }
  return { history: profile.toHistory(), stats: profile.getStats(user.lastDonation) };
}
