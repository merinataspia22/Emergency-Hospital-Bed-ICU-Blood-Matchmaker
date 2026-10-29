import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createRequest, getMyRequests, updateRequest } from "../logic/bloodRequest.logic.js";

// POST /api/blood-requests
export const createBloodRequest = asyncHandler(async (req, res) => {
  const request = await createRequest(req.user.id, req.body);
  sendSuccess(res, 201, "Blood request submitted successfully", request);
});

// GET /api/blood-requests/me
export const getMyBloodRequests = asyncHandler(async (req, res) => {
  const { requests, summary, page, limit, total, pages } = await getMyRequests(
    req.user.id,
    req.query
  );
  sendSuccess(res, 200, "Your blood requests", { requests, summary }, { page, limit, total, pages });
});

// PATCH /api/blood-requests/:id
export const updateBloodRequest = asyncHandler(async (req, res) => {
  const request = await updateRequest(req.user.id, req.params.id, req.body);
  sendSuccess(res, 200, "Blood request updated successfully", request);
});
