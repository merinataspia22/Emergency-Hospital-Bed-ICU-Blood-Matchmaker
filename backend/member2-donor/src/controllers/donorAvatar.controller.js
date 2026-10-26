import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { setMyAvatar as setAvatar } from "../logic/donorAvatar.logic.js";

// PATCH /api/donors/me/avatar
export const setMyAvatar = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Profile photo updated", await setAvatar(req.user.id, req.body));
});
