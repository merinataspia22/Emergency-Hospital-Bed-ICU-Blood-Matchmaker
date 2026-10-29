import mongoose from "mongoose";

export const MEMBER5_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodStockSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, required: true, trim: true, maxlength: 150 },
    hospitalLocation: { type: String, required: true, trim: true, maxlength: 150 },
    bloodGroup: { type: String, required: true, enum: MEMBER5_BLOOD_GROUPS },
    unitsAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: "Units available must be a whole number" },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

bloodStockSchema.index(
  { hospitalName: 1, hospitalLocation: 1, bloodGroup: 1 },
  { unique: true, name: "member5_hospital_bloodgroup_unique" }
);

// Prefix model name to avoid collision with other members' models.
const BloodStock = mongoose.models.Member5BloodStock || mongoose.model("Member5BloodStock", bloodStockSchema);
export default BloodStock;
