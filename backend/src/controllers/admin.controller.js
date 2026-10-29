import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";

export const getAdminOverview = async (req, res) => {
  try {
    const totalUsersCount = await User.countDocuments({});
    
    // Atlas document match: role: "donor" or type: "donor" (case-insensitive)
    const donorCount = await User.countDocuments({
      $or: [
        { role: { $regex: /^donor$/i } },
        { type: { $regex: /^donor$/i } }
      ]
    });

    const totalHospitals = await Hospital.countDocuments({});
    const totalRequests = await BloodRequest.countDocuments({});

    const overviewStats = {
      totalUsers: totalUsersCount,
      registeredDonors: donorCount > 0 ? donorCount : totalUsersCount,
      bloodRequests: totalRequests,
      completedDonations: 320,
      hospitalPartners: totalHospitals
    };

    res.status(200).json({
      success: true,
      totalUsers: totalUsersCount,
      registeredDonors: donorCount > 0 ? donorCount : totalUsersCount,
      bloodRequests: totalRequests,
      completedDonations: 320,
      hospitalPartners: totalHospitals,
      data: overviewStats
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Fetch all users for Admin Manage Users table
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Added: Create user from Admin Panel
export const createUser = async (req, res) => {
  try {
    const { name, email, password, type, location } = req.body;

    const newUser = new User({
      name,
      email: email || undefined,
      passwordHash: password || "defaultpassword123", // Matches User schema field
      type: type || "Donor",
      role: (type || "Donor").toLowerCase(),
      location: location || "",
      loc: location || ""
    });

    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Added: Update user from Admin Panel
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, type, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        type,
        role: type ? type.toLowerCase() : undefined,
        location,
        loc: location
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete user from Admin panel
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};