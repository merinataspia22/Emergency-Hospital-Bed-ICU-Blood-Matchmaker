import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import BloodStock, { BLOOD_GROUPS } from "../models/BloodStock.js";
import ApiError from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createHospital = async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    const savedHospital = await newHospital.save();
    res.status(201).json({ message: "Hospital added successfully!", hospital: savedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedHospital) return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital updated successfully", hospital: updatedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!deletedHospital) return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital deleted successfully", deletedHospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= Member 5: blood stock =================
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