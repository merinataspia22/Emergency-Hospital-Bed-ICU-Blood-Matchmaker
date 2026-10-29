import Hospital from "../models/Hospital.js";

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