// Creates a demo blood bank staff account + its hospital link + starter stock.
// Run from the backend folder:
//   cd backend
//   node member5-blood-bank/src/scripts/seedStaff.js
// Optional env: STAFF_EMAIL, STAFF_PASSWORD, STAFF_NAME, HOSPITAL_NAME, HOSPITAL_LOCATION
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../src/config/db.js";
import User from "../../../src/models/User.js";
import StaffProfile from "../models/StaffProfile.model.js";
import BloodStock, { MEMBER5_BLOOD_GROUPS } from "../models/BloodStock.model.js";

const email = (process.env.STAFF_EMAIL || "staff@bloodconnect.test").trim().toLowerCase();
const password = process.env.STAFF_PASSWORD || "Staff@12345678";
const name = process.env.STAFF_NAME || "Dr. Ayesha Rahman";
const hospitalName = process.env.HOSPITAL_NAME || "Chattogram Medical College Hospital";
const hospitalLocation = process.env.HOSPITAL_LOCATION || "Chattogram";

// Starter stock matching the dashboard design.
const START_UNITS = { "A+": 12, "A-": 0, "B+": 8, "B-": 0, "O+": 5, "O-": 9, "AB+": 0, "AB-": 0 };

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.STAFF_PASSWORD) {
    throw new Error("Set STAFF_PASSWORD when seeding in production.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing. Run this from the backend folder (where .env is).");
  }

  await connectDB();

  let user = await User.findOne({ email });
  if (user && user.role !== "staff") {
    throw new Error(`${email} already exists with role "${user.role}". Use another STAFF_EMAIL.`);
  }

  if (!user) {
    user = await User.create({
      name,
      email,
      phone: "01700000000",
      passwordHash: await bcrypt.hash(password, 12),
      role: "staff",
    });
    console.log(`Staff user created: ${email}`);
  } else {
    console.log(`Staff user already exists: ${email}`);
  }

  await StaffProfile.findOneAndUpdate(
    { userId: user._id },
    { $set: { hospitalName, hospitalLocation } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Linked to hospital: ${hospitalName}, ${hospitalLocation}`);

  // Only insert missing groups, never overwrite existing stock.
  for (const bloodGroup of MEMBER5_BLOOD_GROUPS) {
    await BloodStock.updateOne(
      { hospitalName, hospitalLocation, bloodGroup },
      { $setOnInsert: { unitsAvailable: START_UNITS[bloodGroup] ?? 0, updatedBy: user._id } },
      { upsert: true }
    );
  }
  console.log("Starter blood stock ready.");
  console.log(`\nLogin -> email: ${email}  password: ${process.env.STAFF_PASSWORD ? "(from STAFF_PASSWORD)" : password}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
