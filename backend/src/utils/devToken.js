// Member 1 er login ready na thakle Postman test er jonno fake token banao:
//   node src/utils/devToken.js recipient
import "dotenv/config";
import jwt from "jsonwebtoken";

const role = process.argv[2] || "recipient";
const id = process.argv[3] || "64b000000000000000000001";

const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

console.log("\nuser id :", id);
console.log("role    :", role);
console.log("\nTOKEN (Postman e Bearer Token e paste koro):\n");
console.log(token, "\n");
