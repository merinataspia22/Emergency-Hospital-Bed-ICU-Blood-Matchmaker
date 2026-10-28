import "./loadEnv.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// PORT na, DONOR_PORT: backend/.env er PORT=5000 jeno ei server ke 5000 e na ney
const PORT = process.env.DONOR_PORT || 5001;

await connectDB();
app.listen(PORT, () => console.log(`Member2 donor server running on port ${PORT}`));
