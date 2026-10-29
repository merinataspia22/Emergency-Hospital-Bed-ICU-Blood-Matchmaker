
import BloodStock, {
  MEMBER5_BLOOD_GROUPS as BLOOD_GROUPS,
} from "../models/BloodStock.model.js";
import StaffProfile from "../models/StaffProfile.model.js";
import BloodRequest from "../../../src/models/BloodRequest.js";

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const ok = (res, message, data) =>
  res.status(200).json({
    success: true,
    message,
    data,
  });

// Load the hospital assigned to the logged-in staff from the database.
// The hospital is NEVER taken from the client (query/body), only from StaffProfile.
async function getAssignedHospital(req, res) {
  const profile = await StaffProfile.findOne({
    userId: req.user.id,
  }).lean();

  if (!profile) {
    fail(
      res,
      403,
      "No hospital is assigned to this staff account"
    );
    return null;
  }

  return {
    hospitalName: profile.hospitalName,
    hospitalLocation: profile.hospitalLocation,
  };
}

// GET /api/bloodbank/me/stock
export async function getMyHospitalStock(req, res, next) {
  try {
    const hospital = await getAssignedHospital(req, res);
    if (!hospital) return;

    const { hospitalName, hospitalLocation } = hospital;

    const stock = await BloodStock.find({
      hospitalName,
      hospitalLocation,
    })
      .sort({ bloodGroup: 1 })
      .lean();

    return ok(res, "Hospital blood stock fetched", {
      hospitalName,
      hospitalLocation,
      stock,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/bloodbank/me/stock/:group
export async function updateMyHospitalStock(req, res, next) {
  try {
    const hospital = await getAssignedHospital(req, res);
    if (!hospital) return;

    const { hospitalName, hospitalLocation } = hospital;
    const bloodGroup = String(req.params.group || "").toUpperCase();
    const { unitsAvailable } = req.body || {};

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return fail(res, 400, "Invalid blood group");
    }

    if (
      !Number.isInteger(unitsAvailable) ||
      unitsAvailable < 0
    ) {
      return fail(
        res,
        400,
        "unitsAvailable must be a non-negative integer"
      );
    }

    const stock = await BloodStock.findOneAndUpdate(
      {
        hospitalName,
        hospitalLocation,
        bloodGroup,
      },
      {
        $set: {
          unitsAvailable,
          updatedBy: req.user.id,
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return ok(res, "Hospital blood stock updated", {
      stock,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/bloodbank/me/requests
export async function getMyHospitalRequests(req, res, next) {
  try {
    const hospital = await getAssignedHospital(req, res);
    if (!hospital) return;

    const { hospitalName, hospitalLocation } = hospital;

    const filter = {
      hospitalName,
      hospitalLocation,
    };

    if (req.query.status) {
      const allowedStatuses = [
        "Pending",
        "Matched",
        "Completed",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return fail(res, 400, "Invalid request status");
      }

      filter.status = req.query.status;
    }

    const requests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return ok(res, "Hospital blood requests fetched", {
      hospitalName,
      hospitalLocation,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/bloodbank/me/summary
export async function getMyHospitalSummary(req, res, next) {
  try {
    const hospital = await getAssignedHospital(req, res);
    if (!hospital) return;

    const { hospitalName, hospitalLocation } = hospital;

    const hospitalFilter = {
      hospitalName,
      hospitalLocation,
    };

    const [stockRows, requestRows] = await Promise.all([
      BloodStock.aggregate([
        { $match: hospitalFilter },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: "$unitsAvailable" },
            bloodGroups: { $sum: 1 },
          },
        },
      ]),
      BloodRequest.aggregate([
        { $match: hospitalFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const requestsByStatus = Object.fromEntries(
      requestRows.map((row) => [row._id, row.count])
    );

    return ok(res, "Hospital dashboard summary fetched", {
      hospitalName,
      hospitalLocation,
      inventory: stockRows[0] || {
        totalUnits: 0,
        bloodGroups: 0,
      },
      requests: {
        pending: requestsByStatus.Pending || 0,
        matched: requestsByStatus.Matched || 0,
        completed: requestsByStatus.Completed || 0,
        cancelled: requestsByStatus.Cancelled || 0,
        total: requestRows.reduce(
          (sum, row) => sum + row.count,
          0
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/bloodbank/staff (admin only)
export async function listStaff(_req, res, next) {
  try {
    const profiles = await StaffProfile.find()
      .populate("userId", "name email phone role createdAt")
      .sort({ hospitalName: 1 })
      .lean();

    const staff = profiles
      .filter((p) => p.userId)
      .map((p) => ({
        ...p.userId,
        hospitalName: p.hospitalName,
        hospitalLocation: p.hospitalLocation,
      }));

    return ok(res, "Staff list fetched", { staff });
  } catch (error) {
    next(error);
  }
}
