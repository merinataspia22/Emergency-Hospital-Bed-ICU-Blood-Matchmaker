
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

import User from "../../../src/models/User.js";
import SocialAccount from "../models/SocialAccount.model.js";
import ApiError from "../utils/ApiError.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";

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

function finishLogin(res, user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(
    {
      id: String(user._id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    success: true,
    message: "Google login successful",
    data: {
      user: publicUser(user),
      accessToken,
    },
  });
}

export async function googleSignIn(req, res) {
  // Verify Google account
  const { googleId, email, name } =
    await verifyGoogleToken(req.body?.credential);

  // Existing linked Google user
  const linked = await SocialAccount.findOne({
    provider: "google",
    providerUserId: googleId,
  });

  if (linked) {
    const user = await User.findById(linked.userId);

    if (!user) {
      throw new ApiError(
        401,
        "Linked account no longer exists"
      );
    }

    return finishLogin(res, user);
  }

  // Prevent unsafe automatic linking by email
  if (await User.exists({ email })) {
    throw new ApiError(
      409,
      "This email already has an account. Use its existing login."
    );
  }

  // First-time Google user
  // Automatically register as Donor
  let user;

  try {
    user = await User.create({
      name,
      email,

      // Clearly marked as missing, not a real phone number
      phone: "Not provided",

      passwordHash: await bcrypt.hash(
        randomBytes(32).toString("hex"),
        12
      ),

      role: "donor",
      bloodGroup: "",
      location: "",
      lastDonation: null,
    });

    // Keep an incomplete donor unavailable
    // until actual donor information is provided.
    await User.db.collection("donorprofiles").updateOne(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          isAvailable: false,
          donationHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Link verified Google account to MongoDB user
    await SocialAccount.create({
      provider: "google",
      providerUserId: googleId,
      userId: user._id,
    });

  } catch (error) {
    // Clean up partially created account
    if (user) {
      await Promise.allSettled([
        User.db.collection("donorprofiles").deleteOne({
          userId: user._id,
        }),
        User.deleteOne({ _id: user._id }),
      ]);
    }

    if (error.code === 11000) {
      throw new ApiError(
        409,
        "Account already exists. Please log in."
      );
    }

    throw error;
  }

  // Return JWT immediately - no extra signup form
  return finishLogin(res, user);
}
