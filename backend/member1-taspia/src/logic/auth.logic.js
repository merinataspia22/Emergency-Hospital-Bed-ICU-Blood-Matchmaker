import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { validateLogin, validateRegistration } from "../utils/validators.js";
import { createAccessToken } from "../utils/jwt.js";

export async function registerAccount(payload) {
  const { password, ...values } = validateRegistration(payload);
  if (await User.exists({ email: values.email })) {
    throw new ApiError(409, "Email is already registered");
  }
  const user = new User(values);
  await user.setPassword(password);
  await user.save();
  return user.toSafeProfile();
}

export async function loginAccount(payload) {
  const { email, password } = validateLogin(payload);
  const user = await User.findByEmailForLogin(email);
  if (!user || !(await user.checkPassword(password))) {
    throw new ApiError(401, "Incorrect email or password");
  }
  if (!user.isActive) throw new ApiError(403, "Account is disabled");
  return { user: user.toSafeProfile(), token: createAccessToken(user) };
}
