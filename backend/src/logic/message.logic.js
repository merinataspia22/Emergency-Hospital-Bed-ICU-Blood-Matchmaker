import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";
import ApiError from "../utils/ApiError.js";

const ROLE_LABEL = { donor: "Donor", recipient: "Requester", staff: "Hospital staff", admin: "Support" };

async function requireUser(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid user id");
  const user = await User.findById(id).select("name role");
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export async function listConversations(userId) {
  const me = String(userId);
  const msgs = await Message.find({ $or: [{ fromId: userId }, { toId: userId }] })
    .sort({ createdAt: -1 }).limit(500).lean();

  const byUser = new Map();
  for (const m of msgs) {
    const fromMe = String(m.fromId) === me;
    const other = String(fromMe ? m.toId : m.fromId);
    if (!byUser.has(other)) {
      byUser.set(other, { userId: other, lastMessage: m.text, lastFromMe: fromMe, lastAt: m.createdAt, unread: 0 });
    }
    if (!fromMe && !m.readAt) byUser.get(other).unread += 1;
  }

  const users = await User.find({ _id: { $in: [...byUser.keys()] } }).select("name role").lean();
  const info = new Map(users.map((u) => [String(u._id), u]));

  return {
    conversations: [...byUser.values()]
      .filter((c) => info.has(c.userId))
      .map((c) => ({ ...c, name: info.get(c.userId).name, role: ROLE_LABEL[info.get(c.userId).role] || "User" })),
  };
}

export async function getThread(userId, otherId) {
  await requireUser(otherId);
  const msgs = await Message.find({
    $or: [{ fromId: userId, toId: otherId }, { fromId: otherId, toId: userId }],
  }).sort({ createdAt: 1 }).limit(200).lean();

  await Message.updateMany({ fromId: otherId, toId: userId, readAt: null }, { readAt: new Date() });

  return {
    messages: msgs.map((m) => ({
      id: String(m._id),
      text: m.text,
      mine: String(m.fromId) === String(userId),
      createdAt: m.createdAt,
    })),
  };
}

export async function sendMessage(userId, otherId, body) {
  await requireUser(otherId);
  if (String(userId) === String(otherId)) throw new ApiError(400, "You cannot message yourself");
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1000) throw new ApiError(400, "Message must be 1 to 1000 characters");
  const m = await Message.create({ fromId: userId, toId: otherId, text });
  return { message: { id: String(m._id), text: m.text, mine: true, createdAt: m.createdAt } };
}
