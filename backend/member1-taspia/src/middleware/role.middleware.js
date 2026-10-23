import ApiError from "../utils/ApiError.js";

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Login required"));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, "Access denied"));
  return next();
};
