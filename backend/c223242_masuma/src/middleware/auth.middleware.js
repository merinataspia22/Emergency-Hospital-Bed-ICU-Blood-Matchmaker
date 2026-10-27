import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

// Login kora user kina check kore, req.user set kore
export const protect = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, "Not authorized, token missing"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id || decoded.userId || decoded._id, role: decoded.role };
    next();
  } catch {
    next(new ApiError(401, "Not authorized, token invalid or expired"));
  }
};

// Role check: authorizeRoles("recipient")
export const authorizeRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to do this"));
    }
    next();
  };
