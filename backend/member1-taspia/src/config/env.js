import "dotenv/config";

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  frontendOrigins: (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
    .split(",").map(value => value.trim()).filter(Boolean),
  trustProxy: Number(process.env.TRUST_PROXY || 0),
});

export function validateServerConfig() {
  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  if (!env.mongoUri) throw new Error("MONGO_URI is required in backend/.env");
  if (env.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must have at least 32 random characters");
  }
  if (![0, 1].includes(env.trustProxy)) {
    throw new Error("TRUST_PROXY must be 0 or 1");
  }
}
