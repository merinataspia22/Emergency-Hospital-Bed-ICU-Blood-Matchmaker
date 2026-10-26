import DonorProfile from "../models/DonorProfile.js";
import ApiError from "../utils/ApiError.js";

// Donor nijer ichchhay location share kore. lat/lng null dile location muche jay.
export async function setMyLocation(userId, body) {
  const { lat, lng } = body || {};
  const profile = await DonorProfile.forUser(userId);
  if (lat === null && lng === null) {
    profile.lat = null;
    profile.lng = null;
  } else {
    if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ApiError(400, "Valid lat and lng are required");
    }
    profile.lat = lat;
    profile.lng = lng;
  }
  await profile.save();
  return { location: profile.lat != null ? { lat: profile.lat, lng: profile.lng } : null };
}
