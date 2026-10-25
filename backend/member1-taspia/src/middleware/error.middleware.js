import ApiError from "../utils/ApiError.js";

export function notFound(req, _res, next) {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.path}`));
}

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Unexpected error";
  if (err.code === 11000) { status = 409; message = "Email is already registered"; }
  else if (err.name === "ValidationError" || err.name === "CastError") {
    status = 400; message = "Invalid data";
  } else if (err.type === "entity.too.large") {
    status = 413; message = "Request body is too large";
  } else if (err instanceof SyntaxError && err.status === 400) {
    status = 400; message = "Invalid JSON body";
  }
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  if (status >= 500) {
    if (process.env.NODE_ENV !== "production") console.error(err);
    message = "Internal server error";
  }
  res.status(status).json({ success: false, message });
}
