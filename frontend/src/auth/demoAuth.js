
/*
  BloodConnect Frontend Demo Authentication
  This is only for classroom demonstration.
  Real security requires backend authentication.
*/

const ACCOUNT_KEY = "bc_demo_accounts_v1";
const SESSION_KEY = "bc_demo_session_v1";

export const DEMO_USERS = [
  {
    email: "admin@bloodconnect.demo",
    password: "Admin123!",
    name: "Demo Administrator",
    role: "admin",
  },
  {
    email: "hospital@bloodconnect.demo",
    password: "Staff123!",
    name: "Demo Hospital Staff",
    role: "staff",
  },
  {
    email: "donor@bloodconnect.demo",
    password: "Donor123!",
    name: "Demo Donor",
    role: "donor",
  },
  {
    email: "recipient@bloodconnect.demo",
    password: "Recipient123!",
    name: "Demo Recipient",
    role: "recipient",
  },
];

export const ROLE_ROUTES = Object.freeze({
  donor: "/donor-dashboard",
  recipient: "/recipient-dashboard",
  staff: "/bloodbank-dashboard",
  admin: "/admin-dashboard",
});

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const publicUser = (account) => ({
  email: account.email,
  name: account.name,
  role: account.role,
});

function readStorage(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function getRegisteredUsers() {
  const accounts = readStorage(
    window.localStorage,
    ACCOUNT_KEY,
    []
  );

  return Array.isArray(accounts) ? accounts : [];
}

export function readDemoSession() {
  const session = readStorage(
    window.sessionStorage,
    SESSION_KEY,
    null
  );

  if (
    !session ||
    !session.email ||
    !ROLE_ROUTES[session.role]
  ) {
    return null;
  }

  return {
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

export function saveDemoSession(account) {
  const user = publicUser(account);

  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );

  return user;
}

export function clearDemoSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const pairs = hex.match(/.{2}/g) || [];

  return new Uint8Array(
    pairs.map((pair) => parseInt(pair, 16))
  );
}

async function hashPassword(password, saltHex) {
  const key = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex),
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return toHex(new Uint8Array(bits));
}

export async function registerDemoAccount(form) {
  const email = normalizeEmail(form.email);

  if (!["donor", "recipient"].includes(form.role)) {
    throw new Error("Choose Donor or Recipient.");
  }

  if (
    DEMO_USERS.some((user) => user.email === email) ||
    getRegisteredUsers().some((user) => user.email === email)
  ) {
    throw new Error(
      "This email is already registered. Please log in."
    );
  }

  if (!window.crypto?.subtle) {
    throw new Error(
      "Demo registration requires HTTPS or localhost."
    );
  }

  const salt = toHex(
    window.crypto.getRandomValues(new Uint8Array(16))
  );

  const passwordHash = await hashPassword(
    form.password,
    salt
  );

  const account = {
    name: form.name.trim(),
    email,
    role: form.role,
    salt,
    passwordHash,
  };

  window.localStorage.setItem(
    ACCOUNT_KEY,
    JSON.stringify([...getRegisteredUsers(), account])
  );

  return publicUser(account);
}

export async function loginDemoAccount(email, password) {
  const normalized = normalizeEmail(email);

  const demoUser = DEMO_USERS.find(
    (user) => user.email === normalized
  );

  if (demoUser) {
    if (demoUser.password !== password) {
      throw new Error("Incorrect email or password.");
    }

    return publicUser(demoUser);
  }

  const registeredUser = getRegisteredUsers().find(
    (user) => user.email === normalized
  );

  if (
    !registeredUser ||
    !registeredUser.salt ||
    !registeredUser.passwordHash ||
    !window.crypto?.subtle
  ) {
    throw new Error("Incorrect email or password.");
  }

  const attemptedHash = await hashPassword(
    password,
    registeredUser.salt
  );

  if (attemptedHash !== registeredUser.passwordHash) {
    throw new Error("Incorrect email or password.");
  }

  return publicUser(registeredUser);
}
