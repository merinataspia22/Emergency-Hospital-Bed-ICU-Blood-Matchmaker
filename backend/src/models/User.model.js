import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Shared user model. Coordinate changes with teammates; avoid creating another User model.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["donor", "recipient", "staff", "admin"], required: true },
  phone: { type: String, trim: true },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null], default: null },
  location: { type: String, trim: true },
  lastDonation: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  // Staff ownership can be connected by Member 4/5 later; do not trust client input for this.
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
}, { timestamps: true });

// Model encapsulates password behavior (Fat Model, Thin Controller).
userSchema.methods.setPassword = async function (plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, 12);
};
userSchema.methods.checkPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};
userSchema.methods.toSafeProfile = function () {
  return {
    id: String(this._id), name: this.name, email: this.email, role: this.role,
    phone: this.phone ?? "", bloodGroup: this.bloodGroup ?? null,
    location: this.location ?? "", lastDonation: this.lastDonation ?? null,
    hospitalId: this.hospitalId ? String(this.hospitalId) : null,
  };
};
userSchema.statics.findByEmailForLogin = function (email) {
  return this.findOne({ email }).select("+passwordHash");
};

export default mongoose.models.User || mongoose.model("User", userSchema);
