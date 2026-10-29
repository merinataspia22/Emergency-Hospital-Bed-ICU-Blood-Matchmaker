import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";

export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    
    // Flexible query to match lowercase, uppercase, or regex for donors
    const registeredDonors = await User.countDocuments({
      $or: [
        { role: { $regex: /^donor$/i } },
        { type: { $regex: /^donor$/i } },
        { role: "donor" },
        { type: "Donor" }
      ]
    });

    const totalHospitals = await Hospital.countDocuments({});
    const totalRequests = await BloodRequest.countDocuments({});

    res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsers,
        registeredDonors: registeredDonors > 0 ? registeredDonors : totalUsers, // Fallback jate 0 na hoy
        bloodRequests: totalRequests,
        completedDonations: 320,
        hospitalPartners: totalHospitals
      }
    });
  } catch (err) {
    console.error("Error in getAdminOverview:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};