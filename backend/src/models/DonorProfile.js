import mongoose from "mongoose";
import { getEligibility, livesImpacted } from "../utils/eligibility.js";

// Member 2: donor-specific extra data. User model (Member 1) alada, tai ekhane duplicate kora hoy ni:
// bloodGroup, phone, location(city), lastDonation User e-i thake.
const donationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hospitalName: { type: String, required: true, trim: true, maxlength: 120 },
  bloodGroup: { type: String },
  status: { type: String, enum: ["completed"], default: "completed" },
});

const donorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  isAvailable: { type: Boolean, default: true },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ["male", "female", "other", null], default: null },
  weightKg: { type: Number, min: 45, max: 200, default: null },
  address: { type: String, trim: true, maxlength: 200, default: "" },
  avatar: { type: String, default: "" },
  lat: { type: Number, min: -90, max: 90, default: null },
  lng: { type: Number, min: -180, max: 180, default: null },
  donationHistory: [donationSchema],
}, { timestamps: true });

// Fat model, thin controller: profile er shob hisab ekhane.
donorProfileSchema.statics.forUser = async function forUser(userId) {
  const options = { upsert: true, returnDocument: "after", setDefaultsOnInsert: true };
  try {
    return await this.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, options);
  } catch (error) {
    if (error.code === 11000) return this.findOne({ userId }); // duita request ekshathe hole
    throw error;
  }
};

donorProfileSchema.methods.getStats = function getStats(lastDonation) {
  const totalDonations = this.donationHistory.length;
  return {
    totalDonations,
    lastDonationDate: lastDonation || null,
    ...getEligibility(lastDonation),
    livesImpacted: livesImpacted(totalDonations),
  };
};

donorProfileSchema.methods.toDashboard = function toDashboard(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    bloodGroup: user.bloodGroup ?? null,
    phone: user.phone ?? "",
    city: user.location ?? "",
    address: this.address ?? "",
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    weightKg: this.weightKg,
    isAvailable: this.isAvailable,
    avatar: this.avatar || "",
    location: this.lat != null && this.lng != null ? { lat: this.lat, lng: this.lng } : null,
    stats: this.getStats(user.lastDonation),
  };
};

donorProfileSchema.methods.toHistory = function toHistory() {
  return [...this.donationHistory]
    .sort((a, b) => b.date - a.date)
    .map(entry => ({
      id: String(entry._id),
      date: entry.date,
      hospitalName: entry.hospitalName,
      bloodGroup: entry.bloodGroup ?? null,
      status: entry.status,
    }));
};

export default mongoose.models.DonorProfile || mongoose.model("DonorProfile", donorProfileSchema);
