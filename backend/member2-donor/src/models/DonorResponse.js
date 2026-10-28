import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["accepted", "declined"], required: true },
  },
  { timestamps: true }
);
schema.index({ requestId: 1, donorId: 1 }, { unique: true });

export default mongoose.models.DonorResponse || mongoose.model("DonorResponse", schema);
