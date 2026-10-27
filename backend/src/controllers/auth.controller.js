
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  bloodGroup: user.bloodGroup,
  location: user.location,
  lastDonation: user.lastDonation,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    bloodGroup,
    location,
    lastDonation,
  } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }

  if (!["donor", "recipient"].includes(role)) {
    throw new ApiError(400, "Choose Donor or Recipient");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "This email is already registered. Please log in.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordHash,
    role,
    bloodGroup: bloodGroup || "",
    location: location || "",
    lastDonation: role === "donor" && lastDonation ? lastDonation : null,
  });

  return sendSuccess(res, 201, "Account created successfully", {
    user: publicUser(user),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  const accessToken = createToken(user);

  return sendSuccess(res, 200, "Login successful", {
    user: publicUser(user),
    accessToken,
  });
});

// GET /api/auth/me — restore the logged-in user after refreshing the frontend.
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(401, "Account unavailable");
  return sendSuccess(res, 200, "Profile fetched", { user: publicUser(user) });
});
