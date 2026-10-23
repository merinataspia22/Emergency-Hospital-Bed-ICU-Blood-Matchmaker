import { rateLimit } from "express-rate-limit";
import ApiError from "./ApiError.js";

// DRY: all API modules use the same JSON response when a rate limit is reached.
export function createRateLimiter({ windowMs, limit }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, "Too many requests. Please try again later.")),
  });
}
