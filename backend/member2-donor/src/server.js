import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5001;

await connectDB();
app.listen(PORT, () => console.log(`Member2 donor server running on port ${PORT}`));