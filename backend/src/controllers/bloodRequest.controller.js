import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import BloodRequest from "../models/BloodRequest.js";
import { createRequest, getMyRequests, updateRequest } from "../logic/bloodRequest.logic.js";

// POST /api/bloodrequests
export const createBloodRequest = asyncHandler(async (req, res) => {
  const request = await createRequest(req.user ? req.user.id : req.body.requestedBy, req.body);
  sendSuccess(res, 201, "Blood request submitted successfully", request);
});

// GET /api/bloodrequests (Get All for Admin/Dashboard)
export const getBloodRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

// GET /api/bloodrequests/me
export const getMyBloodRequests = asyncHandler(async (req, res) => {
  const { requests, summary, page, limit, total, pages } = await getMyRequests(
    req.user.id,
    req.query
  );
  sendSuccess(res, 200, "Your blood requests", { requests, summary }, { page, limit, total, pages });
});

// PATCH / PUT /api/bloodrequests/:id
export const updateBloodRequest = asyncHandler(async (req, res) => {
  const updatedRequest = await BloodRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedRequest) {
    return res.status(404).json({ message: "Blood request not found" });
  }
  sendSuccess(res, 200, "Blood request updated successfully", updatedRequest);
});

// DELETE /api/bloodrequests/:id
export const deleteBloodRequest = async (req, res) => {
  try {
    const deletedRequest = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: "Blood request not found" });
    res.json({ message: "Blood request deleted successfully", deletedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};