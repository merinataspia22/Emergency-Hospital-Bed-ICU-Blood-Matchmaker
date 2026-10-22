import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, validateLogin, validateRegistration } from "../src/utils/validators.js";

const registration = {
  name: "Test Donor", email: "Donor@Example.COM", password: "Example123!", role: "donor",
  phone: "01712345678", bloodGroup: "A+", location: "Chattogram", lastDonation: "2025-01-10", terms: true,
};
test("valid registration fields match the existing React form", () => {
  const result = validateRegistration(registration);
  assert.equal(result.email, "donor@example.com");
  assert.equal(result.role, "donor");
  assert.equal(result.bloodGroup, "A+");
});
test("only donor and recipient can self-register", () => {
  for (const role of ["staff", "admin"]) {
    assert.throws(() => validateRegistration({ ...registration, role }), /only for donors and recipients/i);
  }
});
test("incorrect and future donation dates are rejected", () => {
  assert.throws(() => validateRegistration({ ...registration, lastDonation: "2025-02-30" }), /valid past date/i);
  assert.throws(() => validateRegistration({ ...registration, lastDonation: "2099-01-01" }), /valid past date/i);
});
test("recipient need not submit donation date", () => {
  const result = validateRegistration({ ...registration, role: "recipient", lastDonation: "" });
  assert.equal(result.lastDonation, null);
});
test("validation rejects missing consent and weak passwords", () => {
  assert.throws(() => validateRegistration({ ...registration, terms: false }), /accept/i);
  assert.throws(() => validateRegistration({ ...registration, password: "short" }), /password/i);
});
test("login validates email and password", () => {
  assert.deepEqual(validateLogin({ email: "TEST@example.COM", password: "x" }), { email: "test@example.com", password: "x" });
  assert.throws(() => validateLogin({ email: "nope", password: "x" }), /email/i);
});
test("contact form matches Home fields", () => {
  const clean = validateContact({ name: "  Visitor ", email: "TEST@example.com", message: "I need information about donating blood." });
  assert.equal(clean.name, "Visitor");
  assert.equal(clean.email, "test@example.com");
  assert.throws(() => validateContact({ name: "Visitor", email: "test@example.com", message: "too short" }), /12 to 2000/i);
});

test("bcrypt input is not silently truncated after 72 UTF-8 bytes", () => {
  assert.throws(() => validateRegistration({ ...registration, password: "Aa1" + "x".repeat(70) }), /72 UTF-8 bytes/i);
});
