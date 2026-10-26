import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { getEligibility } from "../src/utils/eligibility.js";
import { validateDonorSearch, validateProfileUpdate, validateDonationEntry } from "../src/utils/donorValidators.js";

async function withServer(fn) {
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise(resolve => server.once("listening", resolve));
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test("eligibility uses a 90 day gap", () => {
  assert.equal(getEligibility(null).isEligible, true);
  assert.equal(getEligibility(new Date(Date.now() - 10 * 864e5)).isEligible, false);
  assert.equal(getEligibility(new Date(Date.now() - 100 * 864e5)).isEligible, true);
});

test("donor search validation", () => {
  assert.equal(validateDonorSearch({ bloodGroup: "A " }).bloodGroup, "A+"); // URL e "+" space hoye jay
  assert.throws(() => validateDonorSearch({ bloodGroup: "Z" }), /bloodGroup/);
  assert.throws(() => validateDonorSearch({ available: "maybe" }), /available/);
  assert.throws(() => validateDonorSearch({ limit: "500" }), /limit/);
});

test("profile update validation", () => {
  const ok = validateProfileUpdate({ phone: "01712-345678", city: " Dhaka ", weightKg: "58", role: "admin" });
  assert.equal(ok.userFields.phone, "01712345678");
  assert.equal(ok.userFields.location, "Dhaka");
  assert.equal(ok.profileFields.weightKg, 58);
  assert.equal("role" in ok.userFields, false);
  assert.throws(() => validateProfileUpdate({}), /at least one/);
  assert.throws(() => validateProfileUpdate({ weightKg: 30 }), /weightKg/);
  assert.throws(() => validateProfileUpdate({ phone: "123" }), /mobile/);
  assert.throws(() => validateDonationEntry({ date: "2999-01-01", hospitalName: "City" }), /future/);
});

test("donor routes reject bad or unauthenticated requests before touching the DB", async () => withServer(async base => {
  assert.equal((await fetch(`${base}/api/donors/me`)).status, 401);
  assert.equal((await fetch(`${base}/api/donors/me/history`)).status, 401);
  assert.equal((await fetch(`${base}/api/donors/507f1f77bcf86cd799439011/contact`)).status, 401);
  assert.equal((await fetch(`${base}/api/donors?bloodGroup=Z`)).status, 400);
}));
