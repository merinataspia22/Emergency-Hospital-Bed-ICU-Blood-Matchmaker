import app from "./app.js";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { env, validateServerConfig } from "./config/env.js";

async function main() {
  validateServerConfig();
  await connectDB();
  const server = app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
main().catch(error => {
  // Do not print the full MongoDB URI; it may include secrets.
  console.error(`Backend startup failed: ${error.name || "Error"}`);
  process.exit(1);
});
