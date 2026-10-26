
import mongoose from "mongoose";

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-",
  "AB+", "AB-", "O+", "O-",
];

const bloodStockSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    hospitalLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: BLOOD_GROUPS,
    },
    unitsAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Units available must be a whole number",
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// একই hospital-এ একই blood group-এর duplicate stock ঠেকায়।
bloodStockSchema.index(
  { hospitalName: 1, hospitalLocation: 1, bloodGroup: 1 },
  { unique: true }
);

const BloodStock =
  mongoose.models.BloodStock ||
  mongoose.model("BloodStock", bloodStockSchema);

export default BloodStock;
