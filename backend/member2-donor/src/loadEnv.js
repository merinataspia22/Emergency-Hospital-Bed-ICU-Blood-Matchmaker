import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Pehle member2-donor/.env, na thakle (ba kono variable na thakle) backend/.env theke nei.
// Tai main backend er .env thakleii donor server chole, alada .env banate hoy na.
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, "../.env") });
dotenv.config({ path: path.join(here, "../../.env") });
