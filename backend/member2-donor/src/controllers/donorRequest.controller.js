import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as logic from "../logic/donorRequest.logic.js";

// GET /api/donors/me/requests
export const getMyRequests = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Blood requests fetched", await logic.listRequestsForDonor(req.user.id));
});

// POST /api/donors/me/requests/:id/respond
export const respondToRequest = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Response saved", await logic.respondToRequest(req.user.id, req.params.id, req.body));
});
