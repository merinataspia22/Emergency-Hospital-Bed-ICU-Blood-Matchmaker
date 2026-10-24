
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.model.js";
import { normalizeEmail } from "../utils/validators.js";

async function createAccount({ name, email, password, role }) {
  if (!["admin", "staff"].includes(role)) {
    throw new Error("Only admin and staff can be seeded.");
  }

  const cleanEmail = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error(`Invalid ${role} email.`);
  }

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new Error(
      `${role} password needs 12+ characters, letters and numbers.`
    );
  }

  const existing = await User.findOne({
    email: cleanEmail,
  });

  if (existing) {
    if (existing.role !== role) {
      throw new Error(
        `${role} email belongs to a different account role.`
      );
    }

    console.log(`${role}: Account already exists.`);
    return;
  }

  const account = new User({
    name,
    email: cleanEmail,
    role,
    isActive: true,
  });

  await account.setPassword(password);
  await account.save();

  console.log(`${role}: Account created successfully.`);
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Development seed script cannot run in production."
    );
  }

  const accounts = [
    {
      name: "BloodConnect Administrator",
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: "admin",
    },
    {
      name: "BloodConnect Hospital Staff",
      email: process.env.SEED_STAFF_EMAIL,
      password: process.env.SEED_STAFF_PASSWORD,
      role: "staff",
    },
  ];

  if (accounts.some(a => !a.email || !a.password)) {
    throw new Error(
      "Set all four SEED values in backend .env first."
    );
  }

  try {
    await connectDB();

    for (const account of accounts) {
      await createAccount(account);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error("Setup failed:", error.message);
  process.exitCode = 1;
});
