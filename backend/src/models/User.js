
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["donor", "recipient", "staff", "admin"],
      required: true,
      default: "recipient",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    lastDonation: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
