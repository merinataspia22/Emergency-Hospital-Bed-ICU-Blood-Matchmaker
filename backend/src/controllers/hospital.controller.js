
import BloodStock from "../models/BloodStock.js";
import ApiError from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/hospitals/stock
// Public endpoint: সব hospital-এর blood stock দেখায়
export const getAllBloodStock = asyncHandler(async (_req, res) => {
  const stock = await BloodStock.find()
    .sort({ hospitalName: 1, bloodGroup: 1 })
    .lean();

  return sendSuccess(
    res,
    200,
    "Blood stock fetched successfully",
    { stock }
  );
});

// GET /api/hospitals/stock/:bloodGroup
// নির্দিষ্ট blood group-এর stock দেখায়
export const getBloodStockByGroup = asyncHandler(async (req, res) => {
  const bloodGroup = req.params.bloodGroup.toUpperCase();

  const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (!validGroups.includes(bloodGroup)) {
    throw new ApiError(400, "Invalid blood group");
  }

  const stock = await BloodStock.find({ bloodGroup })
    .sort({ hospitalName: 1 })
    .lean();

  return sendSuccess(
    res,
    200,
    "Blood stock fetched successfully",
    { bloodGroup, stock }
  );
});
