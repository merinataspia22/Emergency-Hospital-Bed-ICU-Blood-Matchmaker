
import User from "../../../src/models/User.js";

// Use the same MongoDB connection as the Main Backend.
const db = User.db;
const { Schema } = db.base;

const socialAccountSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["google"],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

socialAccountSchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true }
);

socialAccountSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

const SocialAccount =
  db.models.SocialAccount ||
  db.model("SocialAccount", socialAccountSchema);

export default SocialAccount;
