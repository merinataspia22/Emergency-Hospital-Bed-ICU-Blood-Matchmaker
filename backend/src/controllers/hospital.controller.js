
import mongoose from "mongoose";
import BloodStock, { BLOOD_GROUPS } from "../models/BloodStock.js";
import ApiError from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/hospitals/stock
export const getAllBloodStock = asyncHandler(async (_req, res) => {
  const stock = await BloodStock.find()
    .sort({ hospitalName: 1, bloodGroup: 1 })
    .lean();

  return sendSuccess(res, 200, "Blood stock fetched successfully", {
    stock,
  });
});

// GET /api/hospitals/stock/:bloodGroup
export const getBloodStockByGroup = asyncHandler(async (req, res) => {
  const bloodGroup = req.params.bloodGroup.toUpperCase();

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    throw new ApiError(400, "Invalid blood group");
  }

  const stock = await BloodStock.find({ bloodGroup })
    .sort({ hospitalName: 1 })
    .lean();

  return sendSuccess(res, 200, "Blood stock fetched successfully", {
    bloodGroup,
    stock,
  });
});

// POST /api/hospitals/stock
export const createBloodStock = asyncHandler(async (req, res) => {
  const {
    hospitalName,
    hospitalLocation,
    bloodGroup,
    unitsAvailable,
  } = req.body;

  if (!hospitalName?.trim() || !hospitalLocation?.trim()) {
    throw new ApiError(400, "Hospital name and location are required");
  }

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    throw new ApiError(400, "Invalid blood group");
  }

  if (
    unitsAvailable === undefined ||
    !Number.isInteger(unitsAvailable) ||
    unitsAvailable < 0
  ) {
    throw new ApiError(
      400,
      "unitsAvailable must be a non-negative integer"
    );
  }

  const existing = await BloodStock.findOne({
    hospitalName: hospitalName.trim(),
    hospitalLocation: hospitalLocation.trim(),
    bloodGroup,
  });

  if (existing) {
    throw new ApiError(
      409,
      "Stock already exists for this hospital and blood group. Use PATCH to update it."
    );
  }

  const stock = await BloodStock.create({
    hospitalName: hospitalName.trim(),
    hospitalLocation: hospitalLocation.trim(),
    bloodGroup,
    unitsAvailable,
    updatedBy: req.user.id,
  });

  return sendSuccess(res, 201, "Blood stock created successfully", {
    stock,
  });
});

// PATCH /api/hospitals/stock/:id
export const updateBloodStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unitsAvailable } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid stock ID");
  }

  if (
    unitsAvailable === undefined ||
    !Number.isInteger(unitsAvailable) ||
    unitsAvailable < 0
  ) {
    throw new ApiError(
      400,
      "unitsAvailable must be a non-negative integer"
    );
  }

  const stock = await BloodStock.findByIdAndUpdate(
    id,
    {
      $set: {
        unitsAvailable,
        updatedBy: req.user.id,
      },
    },
    { new: true, runValidators: true }
  );

  if (!stock) {
    throw new ApiError(404, "Blood stock record not found");
  }

  return sendSuccess(res, 200, "Blood stock updated successfully", {
    stock,
  });
});
