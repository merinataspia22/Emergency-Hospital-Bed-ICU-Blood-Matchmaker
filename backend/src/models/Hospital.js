import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  general: { type: Number, default: 0 },
  icu: { type: Number, default: 0 },
  dist: { type: Number, default: 0 },
  blood: { type: String, default: "Available" },
  phone: { type: String },
  type: { type: String },
  address: { type: String },
  depts: [{ type: String }],
  img: { type: String }
}, { timestamps: true });

export default mongoose.model("Hospital", hospitalSchema);