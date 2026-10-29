import mongoose from "mongoose";

// Links one staff User to the hospital they work for.
// Kept in Member 5's own folder so the shared User model stays untouched.
// hospitalName + hospitalLocation must match BloodRequest.hospitalName/hospitalLocation exactly.
const staffProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    hospitalName: { type: String, required: true, trim: true, maxlength: 150 },
    hospitalLocation: { type: String, required: true, trim: true, maxlength: 150 },
  },
  { timestamps: true }
);

const StaffProfile =
  mongoose.models.Member5StaffProfile ||
  mongoose.model("Member5StaffProfile", staffProfileSchema);

export default StaffProfile;
