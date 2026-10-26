// Member 2 live check: Postman charao-i donor API test kore (real MongoDB e).
//   node scripts/member2-live-check.mjs               -> test chalay, shesh e test data muche dey
//   node scripts/member2-live-check.mjs --keep        -> test data rekhe dey (browser e login kore dekhar jonno)
//   node scripts/member2-live-check.mjs --cleanup-only -> shudhu test data muche dey
// Shudhu "test.member2.*" email er account chhoy/mushe. Onno kono data chhoy na.
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.model.js";
import DonorProfile from "../src/models/DonorProfile.model.js";

const KEEP = process.argv.includes("--keep");
const CLEANUP_ONLY = process.argv.includes("--cleanup-only");
const EMAIL_PATTERN = /^test\.member2\./;
const PASSWORD = "Passw0rdOK";
const DONOR = "test.member2.donor@example.com";
const RECIPIENT = "test.member2.recipient@example.com";

let failures = 0;
const check = (name, condition, detail = "") => {
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${condition ? "" : `   -> ${detail}`}`);
  if (!condition) failures += 1;
};

async function cleanup() {
  const users = await User.find({ email: EMAIL_PATTERN }).select("_id");
  const ids = users.map(u => u._id);
  const profiles = await DonorProfile.deleteMany({ userId: { $in: ids } });
  const removed = await User.deleteMany({ _id: { $in: ids } });
  console.log(`Cleanup: ${removed.deletedCount} test user, ${profiles.deletedCount} donor profile muchha hoyeche.`);
}

async function run(base) {
  const call = async (method, path, { body, token } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  };
  const register = (name, email, role, bloodGroup, phone) => call("POST", "/auth/register", {
    body: { name, email, password: PASSWORD, phone, role, bloodGroup, location: "Chattogram", lastDonation: "", terms: true },
  });
  const login = async email => (await call("POST", "/auth/login", { body: { email, password: PASSWORD } })).json.data?.token;

  console.log("\n-- Accounts --");
  let r = await register("Test Member2 Donor", DONOR, "donor", "A+", "01712345678");
  check("register donor (201 ba 409)", [201, 409].includes(r.status), JSON.stringify(r.json));
  r = await register("Test Member2 Recipient", RECIPIENT, "recipient", "B+", "01512345678");
  check("register recipient (201 ba 409)", [201, 409].includes(r.status), JSON.stringify(r.json));
  const donorToken = await login(DONOR);
  const recipientToken = await login(RECIPIENT);
  check("both logins give a token", Boolean(donorToken && recipientToken), "login fail (429 hole 15 minute opekkha koro)");
  if (!donorToken || !recipientToken) return;

  console.log("\n-- Donor Dashboard --");
  r = await call("GET", "/donors/me");
  check("no token -> 401", r.status === 401);
  r = await call("GET", "/donors/me", { token: recipientToken });
  check("recipient on /donors/me -> 403", r.status === 403);
  r = await call("GET", "/donors/me", { token: donorToken });
  check("get my profile", r.status === 200 && r.json.data?.donor?.bloodGroup === "A+", JSON.stringify(r.json));
  const donorId = r.json.data?.donor?.id;
  r = await call("PATCH", "/donors/me", { token: donorToken, body: { phone: "01712-000111", city: "Hathazari", address: "Ward 3", weightKg: 58, dateOfBirth: "1999-03-14", gender: "female" } });
  check("update profile", r.status === 200 && r.json.data?.donor?.city === "Hathazari" && r.json.data?.donor?.weightKg === 58, JSON.stringify(r.json));
  r = await call("PATCH", "/donors/me", { token: donorToken, body: { weightKg: 30 } });
  check("weight 30 -> 400", r.status === 400);
  r = await call("PATCH", "/donors/me", { token: donorToken, body: { bloodGroup: "B+" } });
  check("blood group change -> 400", r.status === 400);
  r = await call("PATCH", "/donors/me/availability", { token: donorToken, body: { isAvailable: false } });
  check("availability OFF", r.status === 200 && r.json.data?.availability?.isAvailable === false, JSON.stringify(r.json));
  r = await call("POST", "/donors/me/history", { token: donorToken, body: { date: "2026-06-12", hospitalName: "City Hospital, Chattogram" } });
  check("add past donation (201)", r.status === 201 && r.json.data?.history?.length === 1, JSON.stringify(r.json));
  r = await call("GET", "/donors/me", { token: donorToken });
  check("stats updated (1 donation, 3 lives)", r.json.data?.donor?.stats?.totalDonations === 1 && r.json.data?.donor?.stats?.livesImpacted === 3, JSON.stringify(r.json.data?.donor?.stats));

  console.log("\n-- Find Donor --");
  r = await call("GET", "/donors?bloodGroup=A%2B&city=Hathazari");
  check("unavailable donor hidden from search", r.status === 200 && !r.json.data.donors.some(d => d.id === donorId), JSON.stringify(r.json));
  await call("PATCH", "/donors/me/availability", { token: donorToken, body: { isAvailable: true } });
  r = await call("GET", "/donors?bloodGroup=A%2B&city=Hathazari");
  check("available donor shows in search", r.json.data?.donors?.some(d => d.id === donorId), JSON.stringify(r.json));
  check("search does not leak phone/email", !JSON.stringify(r.json).includes("01712") && !JSON.stringify(r.json).includes("@"));
  r = await call("GET", "/donors?bloodGroup=Z");
  check("bad blood group -> 400", r.status === 400);

  console.log("\n-- Contact permission --");
  r = await call("GET", `/donors/${donorId}/contact`);
  check("contact without login -> 401", r.status === 401);
  r = await call("GET", `/donors/${donorId}/contact`, { token: donorToken });
  check("contact as donor -> 403", r.status === 403);
  r = await call("GET", `/donors/${donorId}/contact`, { token: recipientToken });
  check("contact as recipient -> phone", r.status === 200 && r.json.data?.contact?.phone === "01712000111", JSON.stringify(r.json));
}

await connectDB();
let server;
try {
  if (!CLEANUP_ONLY) {
    await cleanup(); // ager bar er bachha test data thakle age muche nei
    server = app.listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    await run(`http://127.0.0.1:${server.address().port}/api`);
  }
  if (!KEEP) await cleanup();
  else console.log(`\nTest data rakha holo. Browser e login: ${DONOR} / ${PASSWORD}\nShesh hole: node scripts/member2-live-check.mjs --cleanup-only`);
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
}
console.log(failures ? `\n${failures} ta check FAIL` : "\nALL PASSED");
process.exit(failures ? 1 : 0);