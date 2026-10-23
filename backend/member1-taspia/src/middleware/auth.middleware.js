import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, _res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return next(new ApiError(401, "Login required"));
  let payload;
  try {
    payload = verifyAccessToken(match[1]);
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
  if (!payload?.sub) return next(new ApiError(401, "Invalid token"));
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) return next(new ApiError(401, "Account unavailable"));
  req.user = user;
  return next();
}
