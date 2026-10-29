
import { OAuth2Client } from "google-auth-library";
import ApiError from "./ApiError.js";

const googleClient = new OAuth2Client();

export const verifyGoogleToken = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  if (typeof credential !== "string" || !credential.trim()) {
    throw new ApiError(400, "Google credential is required");
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, "Invalid or expired Google token");
  }

  if (
    !payload?.sub ||
    !payload?.email ||
    payload.email_verified !== true
  ) {
    throw new ApiError(401, "Google account verification failed");
  }

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: payload.name || payload.email.split("@")[0],
  };
};
  