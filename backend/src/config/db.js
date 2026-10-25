import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);

    // Asol karon (server prottek ta ki bolche)
    const servers = err.reason?.servers;
    if (servers) {
      for (const [host, info] of servers) {
        console.error(" -", host, "=>", info.error?.message || info.type);
      }
    } else if (err.cause) {
      console.error(" cause:", err.cause.message);
    }

    process.exit(1);
  }
};