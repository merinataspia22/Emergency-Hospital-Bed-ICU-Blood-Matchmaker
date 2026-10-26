import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as donorLogic from "../logic/donor.logic.js";

// GET /api/donors  (public)
export const searchDonors = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Donors fetched", await donorLogic.listDonors(req.query));
});

// GET /api/donors/:id/contact
export const getDonorContact = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Donor contact fetched", await donorLogic.getDonorContact(req.params.id));
});

// GET /api/donors/me
export const getMyProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Donor profile fetched", await donorLogic.getMyProfile(req.user.id));
});

// PATCH /api/donors/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Donor profile updated", await donorLogic.updateMyProfile(req.user.id, req.body));
});

// PATCH /api/donors/me/availability
export const updateMyAvailability = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Availability updated", await donorLogic.setMyAvailability(req.user.id, req.body));
});

// GET /api/donors/me/history
export const getMyHistory = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Donation history fetched", await donorLogic.getMyHistory(req.user.id));
});

// POST /api/donors/me/history
export const addMyDonation = asyncHandler(async (req, res) => {
  sendSuccess(res, 201, "Donation recorded", await donorLogic.addMyDonation(req.user.id, req.body));
});