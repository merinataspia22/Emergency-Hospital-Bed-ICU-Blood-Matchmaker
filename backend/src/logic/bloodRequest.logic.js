import BloodRequest, { STATUSES } from "../models/BloodRequest.js";
import ApiError from "../utils/ApiError.js";
import pick from "../utils/pick.js";

export const createRequest = async (userId, body) => {
  const data = pick(body, BloodRequest.EDITABLE_FIELDS);
  return BloodRequest.create({ ...data, requestedBy: userId });
};

export const getMyRequests = async (userId, query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);

  const filter = { requestedBy: userId };
  if (query.status) {
    if (!STATUSES.includes(query.status)) throw new ApiError(400, "Invalid status filter");
    filter.status = query.status;
  }

  const [requests, total, summary] = await Promise.all([
    BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BloodRequest.countDocuments(filter),
    BloodRequest.summaryFor(userId),
  ]);

  return { requests, summary, page, limit, total, pages: Math.ceil(total / limit) };
};

export const updateRequest = async (userId, id, body) => {
  const request = await BloodRequest.findById(id);
  if (!request) throw new ApiError(404, "Blood request not found");
  if (!request.isOwnedBy(userId)) {
    throw new ApiError(403, "You can only update your own requests");
  }

  const { status, ...rest } = body;
  const fields = pick(rest, BloodRequest.EDITABLE_FIELDS);
  const hasFields = Object.keys(fields).length > 0;

  if (!hasFields && status === undefined) throw new ApiError(400, "Nothing to update");

  if (hasFields) {
    if (!request.isEditable()) {
      throw new ApiError(400, `A ${request.status} request cannot be edited`);
    }
    request.set(fields);
  }

  if (status !== undefined) {
    if (!request.canMoveTo(status)) {
      throw new ApiError(400, `Cannot change status from ${request.status} to ${status}`);
    }
    request.status = status;
  }

  return request.save();
};
