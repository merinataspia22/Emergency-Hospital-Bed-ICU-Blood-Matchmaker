import mongoose from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const URGENCY_LEVELS = ["Normal", "Urgent", "Emergency"];
export const STATUSES = ["Pending", "Matched", "Completed", "Cancelled"];

// Kon status theke kon status e jaowa jabe
const TRANSITIONS = {
  Pending: ["Cancelled"],
  Matched: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const bloodRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Patient name is too long"],
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: { values: BLOOD_GROUPS, message: "Invalid blood group" },
    },
    units: {
      type: Number,
      required: [true, "Units needed is required"],
      min: [1, "Minimum 1 unit"],
      max: [6, "Maximum 6 units"],
      validate: { validator: Number.isInteger, message: "Units must be a whole number" },
    },
    urgency: {
      type: String,
      enum: { values: URGENCY_LEVELS, message: "Invalid urgency level" },
      default: "Normal",
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [150, "Hospital name is too long"],
    },
    hospitalLocation: {
      type: String,
      required: [true, "Hospital location is required"],
      trim: true,
      maxlength: [150, "Hospital location is too long"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Invalid contact number"],
    },
    dateNeeded: {
      type: Date,
      required: [true, "Date needed is required"],
      validate: {
        validator: (v) => v >= startOfToday(),
        message: "Date needed cannot be in the past",
      },
    },
    details: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Details cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: "Invalid status" },
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Dashboard e dekhanor jonno: #BR1A2B3
bloodRequestSchema.virtual("code").get(function () {
  return `#BR${this._id.toString().slice(-5).toUpperCase()}`;
});

// User ja ja edit korte parbe
bloodRequestSchema.statics.EDITABLE_FIELDS = [
  "patientName",
  "bloodGroup",
  "units",
  "urgency",
  "hospitalName",
  "hospitalLocation",
  "contact",
  "dateNeeded",
  "details",
];

// ---- business rules model er bhitore ----
bloodRequestSchema.methods.isOwnedBy = function (userId) {
  return this.requestedBy.toString() === String(userId);
};

bloodRequestSchema.methods.isEditable = function () {
  return this.status === "Pending";
};

bloodRequestSchema.methods.canMoveTo = function (nextStatus) {
  return (TRANSITIONS[this.status] || []).includes(nextStatus);
};

// Dashboard stats: { active, fulfilled, total }
bloodRequestSchema.statics.summaryFor = async function (userId) {
  const rows = await this.aggregate([
    { $match: { requestedBy: new mongoose.Types.ObjectId(String(userId)) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const by = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return {
    active: (by.Pending || 0) + (by.Matched || 0),
    fulfilled: by.Completed || 0,
    total: rows.reduce((sum, r) => sum + r.count, 0),
  };
};

export default mongoose.model("BloodRequest", bloodRequestSchema);
