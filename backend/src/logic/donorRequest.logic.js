import mongoose from "mongoose";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import DonorResponse from "../models/DonorResponse.js";
import ApiError from "../utils/ApiError.js";

// Donor kon kon patient group ke dite pare
const CAN_GIVE_TO = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export async function listRequestsForDonor(userId) {
  const user = await User.findById(userId).select("bloodGroup");
  if (!user) throw new ApiError(404, "User not found");
  const groups = CAN_GIVE_TO[user.bloodGroup] || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const requests = await BloodRequest.find({
    status: "Pending",
    bloodGroup: { $in: groups },
    dateNeeded: { $gte: today },
    requestedBy: { $ne: user._id },
  }).sort({ createdAt: -1 }).limit(50).lean();

  const responses = await DonorResponse.find({
    donorId: user._id,
    requestId: { $in: requests.map((r) => r._id) },
  }).lean();
  const mine = new Map(responses.map((r) => [String(r.requestId), r.status]));

  return {
    requests: requests.map((r) => ({
      id: String(r._id),
      bloodGroup: r.bloodGroup,
      units: r.units,
      urgency: r.urgency,
      hospitalName: r.hospitalName,
      hospitalLocation: r.hospitalLocation,
      contact: r.contact,
      dateNeeded: r.dateNeeded,
      details: r.details || "",
      createdAt: r.createdAt,
      myResponse: mine.get(String(r._id)) || null,
    })),
  };
}

export async function respondToRequest(userId, requestId, body) {
  const status = body?.status;
  if (!["accepted", "declined"].includes(status)) {
    throw new ApiError(400, "status must be accepted or declined");
  }
  if (!mongoose.isValidObjectId(requestId)) throw new ApiError(400, "Invalid request id");

  const request = await BloodRequest.findById(requestId).select("status");
  if (!request) throw new ApiError(404, "Blood request not found");
  if (request.status !== "Pending") throw new ApiError(400, "This request is no longer open");

  await DonorResponse.findOneAndUpdate(
    { requestId, donorId: userId },
    { status },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return { response: { requestId, status } };
}
