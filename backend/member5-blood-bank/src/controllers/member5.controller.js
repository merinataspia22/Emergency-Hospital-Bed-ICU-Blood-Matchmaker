
import BloodStock, {
  BLOOD_GROUPS,
} from "../../../src/models/BloodStock.js";
import User from "../../../src/models/User.js";
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

// Load the hospital assigned to the logged-in user from the database.
async function getAssignedHospital(req, res) {
  const user = await User.findById(req.user.id)
    .select("hospitalName hospitalLocation")
    .lean();

  const hospitalName = String(user?.hospitalName || "").trim();
  const hospitalLocation = String(user?.hospitalLocation || "").trim();

  if (!hospitalName || !hospitalLocation) {
    fail(
      res,
      403,
      "No hospital is assigned to this staff account"
    );
    return null;
  }

  return { hospitalName, hospitalLocation };
}

// GET /api/hospitals/me/stock
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

// PATCH /api/hospitals/me/stock/:group
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

// GET /api/hospitals/me/requests
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

// GET /api/hospitals/me/summary
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

// GET /api/hospitals/staff (admin only)
export async function listStaff(_req, res, next) {
  try {
    const staff = await User.find({ role: "staff" })
      .select(
        "name email phone role hospitalName hospitalLocation createdAt"
      )
      .sort({ name: 1 })
      .lean();

    return ok(res, "Staff list fetched", { staff });
  } catch (error) {
    next(error);
  }
}
