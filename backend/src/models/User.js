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
      required: false, // Made optional to prevent validation errors on older mock users
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: ["donor", "recipient", "staff", "admin", "Donor", "Admin", "Staff", "Patient"],
      default: "recipient",
    },
    type: {
      type: String,
      default: "Donor",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    loc: {
      type: String,
      default: "",
    },
    hospitalName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    hospitalLocation: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    lastDonation: {
      type: Date,
      default: null,
    },
    joined: {
      type: String,
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;