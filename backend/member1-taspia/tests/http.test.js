import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

async function withServer(fn) {
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise(resolve => server.once("listening", resolve));
    const { port } = server.address();
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test("health endpoint and unauthenticated access", async () => withServer(async base => {
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).success, true);
  const me = await fetch(`${base}/api/auth/me`);
  assert.equal(me.status, 401);
  const inbox = await fetch(`${base}/api/contact/messages`);
  assert.equal(inbox.status, 401);
}));

test("invalid public requests are rejected without DB writes", async () => withServer(async base => {
  const headers = { "Content-Type": "application/json" };
  const register = await fetch(`${base}/api/auth/register`, {
    method: "POST", headers, body: JSON.stringify({ role: "admin" }),
  });
  assert.equal(register.status, 400);
  const contact = await fetch(`${base}/api/contact`, {
    method: "POST", headers, body: JSON.stringify({ name: "Test", email: "test@example.com", message: "hi" }),
  });
  assert.equal(contact.status, 400);
}));
