import { loginAccount, registerAccount } from "../logic/auth.logic.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function register(req, res) {
  const user = await registerAccount(req.body);
  return sendSuccess(res, 201, "Registration successful", { user });
}
export async function login(req, res) {
  const data = await loginAccount(req.body);
  return sendSuccess(res, 200, "Login successful", data);
}
export function me(req, res) {
  return sendSuccess(res, 200, "Profile fetched", { user: req.user.toSafeProfile() });
}
