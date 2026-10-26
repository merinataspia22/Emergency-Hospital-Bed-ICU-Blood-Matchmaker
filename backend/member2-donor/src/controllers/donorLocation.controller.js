import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { setMyLocation as setLocation } from "../logic/donorLocation.logic.js";

// PATCH /api/donors/me/location
export const setMyLocation = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Location updated", await setLocation(req.user.id, req.body));
});
