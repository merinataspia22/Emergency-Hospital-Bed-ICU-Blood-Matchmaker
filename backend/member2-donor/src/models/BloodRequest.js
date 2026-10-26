import mongoose from "mongoose";

// Member 3 er collection "bloodrequests" ei donor server pore (read-only). Ekhane kichu likha hobe na.
const schema = new mongoose.Schema(
  {
    requestedBy: mongoose.Schema.Types.ObjectId,
    patientName: String,
    bloodGroup: String,
    units: Number,
    urgency: String,
    hospitalName: String,
    hospitalLocation: String,
    contact: String,
    dateNeeded: Date,
    details: String,
    status: String,
  },
  { timestamps: true }
);

export default mongoose.models.BloodRequest || mongoose.model("BloodRequest", schema, "bloodrequests");
